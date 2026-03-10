import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createPageUrl } from '@/utils'
import { ArrowLeft } from 'lucide-react'

const APP_ID = import.meta.env.VITE_JAAS_APP_ID || 'vpaas-magic-cookie-e866a734fd5742ea83b9df9d3fab8807'
const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL || 'https://frontdesk-admin-production.up.railway.app'

export default function VideoChat() {
  const [guestName, setGuestName] = useState('')
  const [device, setDevice] = useState(null)
  const [callState, setCallState] = useState('idle') // idle | ringing | active
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const jitsiRef = useRef(null)
  const apiRef = useRef(null)
  const pollRef = useRef(null)
  const roomRef = useRef(null)
  const ringRef = useRef(null)
  const recogRef = useRef(null)
  const guestTranscriptRef = useRef('')
  const transcriptSyncRef = useRef(null)

  function playRingTone() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const createTone = (freq, start, dur) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq; osc.type = 'sine'
        gain.gain.setValueAtTime(0.25, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.25, ctx.currentTime + start + dur - 0.05)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur)
        osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur)
      }
      createTone(400, 0, 0.4); createTone(480, 0, 0.4)
      createTone(400, 0.6, 0.4); createTone(480, 0.6, 0.4)
      setTimeout(() => ctx.close(), 2000)
    } catch (e) {}
  }

  // Auto-populate device — try online first, fall back to any
  useEffect(() => {
    supabase
      .from('fd_devices')
      .select('id, jitsi_room, device_name, location')
      .eq('status', 'online')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setDevice(data); return }
        supabase.from('fd_devices').select('id, jitsi_room, device_name, location').limit(1).maybeSingle()
          .then(({ data: any }) => { if (any) setDevice(any) })
      })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(pollRef.current)
      clearInterval(transcriptSyncRef.current)
      stopGuestTranscription()
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null }
    }
  }, [])

  function startGuestTranscription(sessionId) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = false
    r.lang = 'en-US'
    r.onresult = (event) => {
      let newText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) newText += event.results[i][0].transcript + ' '
      }
      if (newText.trim()) guestTranscriptRef.current += newText
    }
    r.onerror = () => {}
    r.onend = () => { try { r.start() } catch (e) {} }
    try { r.start() } catch (e) {}
    recogRef.current = r

    // Sync guest transcript to Supabase every 10 seconds
    transcriptSyncRef.current = setInterval(async () => {
      if (!guestTranscriptRef.current.trim()) return
      await supabase
        .from('fd_sessions')
        .update({ guest_transcript: guestTranscriptRef.current })
        .eq('id', sessionId)
    }, 10000)
  }

  function stopGuestTranscription() {
    clearInterval(transcriptSyncRef.current)
    if (recogRef.current) {
      try { recogRef.current.abort() } catch (e) {}
      recogRef.current = null
    }
  }

  const roomName = device?.jitsi_room || 'frontdesk-rockies-main'

  async function startCall() {
    setLoading(true)
    setError(null)
    try {
      // Insert session as 'ringing' — admin will see this and answer
      const { data: session, error: sessionErr } = await supabase
        .from('fd_sessions')
        .insert({
          guest_name: guestName || 'Guest',
          session_type: 'video_chat',
          status: 'ringing',
          jitsi_room: roomName,
          device_id: device?.id || null,
        })
        .select()
        .single()
      if (sessionErr) throw sessionErr

      setSessionId(session.id)
      roomRef.current = roomName
      setCallState('ringing')

      // Start ringing audio on guest side
      playRingTone()
      ringRef.current = setInterval(playRingTone, 3000)

      // Poll admin API every 2s to detect when admin answers
      pollRef.current = setInterval(() => pollSessionStatus(session.id), 2000)
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function pollSessionStatus(id) {
    try {
      const res = await fetch(`${ADMIN_API}/api/sessions?id=${id}&_=` + Date.now(), { cache: 'no-store' })
      const session = await res.json()
      if (session?.status === 'active') {
        clearInterval(pollRef.current)
        await joinJitsi(roomRef.current, session.id)
      } else if (session?.status === 'ended') {
        clearInterval(pollRef.current)
        setCallState('idle')
        setSessionId(null)
      }
    } catch (e) {}
  }

  async function joinJitsi(room, sessionId) {
    clearInterval(ringRef.current)
    try {
      const res = await fetch(`${ADMIN_API}/api/jaas-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: room.trim(), name: guestName || 'Guest', isModerator: true }),
      })
      const { jwt, roomName: fullRoom, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      const script = document.createElement('script')
      script.src = `https://8x8.vc/${APP_ID}/external_api.js`
      script.async = true
      script.onload = () => {
        if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null }
        apiRef.current = new window.JitsiMeetExternalAPI('8x8.vc', {
          roomName: fullRoom,
          jwt,
          parentNode: jitsiRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            disableDeepLinking: true,
            toolbarButtons: ['microphone', 'camera', 'hangup', 'chat', 'tileview'],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
          },
          userInfo: { displayName: guestName || 'Guest' },
        })
        apiRef.current.addEventListeners({ readyToClose: endCall, videoConferenceLeft: endCall })
        startGuestTranscription(sessionId)
      }
      document.head.appendChild(script)
      setCallState('active')
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.')
      setCallState('idle')
    }
  }

  async function cancelCall() {
    clearInterval(pollRef.current)
    clearInterval(ringRef.current)
    stopGuestTranscription()
    if (sessionId) {
      await supabase
        .from('fd_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId)
    }
    setCallState('idle')
    setSessionId(null)
  }

  async function endCall() {
    clearInterval(pollRef.current)
    clearInterval(ringRef.current)
    stopGuestTranscription()
    if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null }
    if (sessionId) {
      await supabase
        .from('fd_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId)
    }
    setCallState('idle')
    setSessionId(null)
  }

  // ── Waiting room (ringing) ──
  if (callState === 'ringing') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col items-center justify-center">
        <div className="text-center px-8">
          <div className="relative w-36 h-36 mx-auto mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-4 bg-blue-500/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-7xl">📞</div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">Calling Front Desk...</h2>
          <p className="text-blue-300 text-lg mb-1">Waiting for staff to answer</p>
          <p className="text-blue-400/50 text-sm mb-10">Available 24 hours · 7 days a week</p>

          <div className="flex justify-center gap-3 mb-12">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          <button
            onClick={cancelCall}
            className="bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-red-300 hover:text-white font-semibold py-4 px-14 rounded-2xl text-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Active call ──
  if (callState === 'active') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-sm font-medium">Connected to The Rockies Lodge Front Desk</span>
          </div>
          <button onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold">
            End Call
          </button>
        </div>
        <div ref={jitsiRef} className="flex-1" />
      </div>
    )
  }

  // ── Idle / Call screen ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
      <div className="px-6 pt-6">
        <Link to={createPageUrl('GuestInterface')}>
          <button className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-white">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-blue-400/30">
              <span className="text-5xl">📹</span>
            </div>
            <h1 className="text-3xl font-bold">Speak with Staff</h1>
            <p className="text-blue-200/80 mt-2">The Rockies Lodge · Front Desk</p>
            {device && <p className="text-blue-300/60 text-sm mt-1">📍 {device.location}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1.5 font-medium">
                Your Name or Room Number (optional)
              </label>
              <input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startCall()}
                placeholder="e.g. Room 204 — Sarah"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 text-lg"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={startCall}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-xl shadow-blue-500/30"
            >
              {loading ? '⏳ Connecting...' : '📞 Call Front Desk'}
            </button>

            <p className="text-center text-blue-300/50 text-sm pt-2">
              Available 24 hours · 7 days a week
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
