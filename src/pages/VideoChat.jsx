import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createPageUrl } from '@/utils'
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, X } from 'lucide-react'
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
  useRoomContext,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { Track, RoomEvent } from 'livekit-client'
import '@livekit/components-styles'

const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL || 'https://frontdeskadmin.stproperties.com'
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://inbox-ai-meetings-13z562y0.livekit.cloud'

export default function VideoChat() {
  const [guestName, setGuestName] = useState('')
  const [device, setDevice] = useState(null)
  const [callState, setCallState] = useState('idle') // idle | ringing | active
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [roomName, setRoomName] = useState(null)

  const pollRef = useRef(null)
  const ringRef = useRef(null)
  const ringTimeoutRef = useRef(null)
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

  // Auto-populate device
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
      clearTimeout(ringTimeoutRef.current)
      clearInterval(ringRef.current)
      stopGuestTranscription()
    }
  }, [])

  function startGuestTranscription(sid) {
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

    transcriptSyncRef.current = setInterval(async () => {
      if (!guestTranscriptRef.current.trim()) return
      await supabase
        .from('fd_sessions')
        .update({ guest_transcript: guestTranscriptRef.current })
        .eq('id', sid)
    }, 10000)
  }

  function stopGuestTranscription() {
    clearInterval(transcriptSyncRef.current)
    if (recogRef.current) {
      try { recogRef.current.abort() } catch (e) {}
      recogRef.current = null
    }
  }

  const defaultRoom = device?.jitsi_room || 'frontdesk-rockies-main'

  async function startCall() {
    setLoading(true)
    setError(null)
    try {
      const room = defaultRoom
      const { data: session, error: sessionErr } = await supabase
        .from('fd_sessions')
        .insert({
          guest_name: guestName || 'Guest',
          session_type: 'video_chat',
          status: 'ringing',
          jitsi_room: room,
          device_id: device?.id || null,
        })
        .select()
        .single()
      if (sessionErr) throw sessionErr

      setSessionId(session.id)
      setRoomName(room)
      setCallState('ringing')

      // Push notification to admin
      fetch(`${ADMIN_API}/api/push-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          guestName: guestName || 'Guest',
          location: device?.location || null,
          sessionUrl: '/calls',
        }),
      }).catch(() => {})

      playRingTone()
      ringRef.current = setInterval(playRingTone, 3000)

      // Poll for admin answer
      pollRef.current = setInterval(() => pollSessionStatus(session.id, room), 2000)

      // 90-second timeout
      ringTimeoutRef.current = setTimeout(async () => {
        clearInterval(pollRef.current)
        clearInterval(ringRef.current)
        await supabase.from('fd_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', session.id)
        setCallState('idle')
        setSessionId(null)
        setError('No one answered. Please try again or contact staff another way.')
      }, 90000)
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function pollSessionStatus(id, room) {
    try {
      const res = await fetch(`${ADMIN_API}/api/sessions?id=${id}&_=` + Date.now(), { cache: 'no-store' })
      const session = await res.json()
      if (session?.status === 'active') {
        clearInterval(pollRef.current)
        clearInterval(ringRef.current)
        clearTimeout(ringTimeoutRef.current)
        await joinLiveKit(room, id)
      } else if (session?.status === 'ended') {
        clearInterval(pollRef.current)
        clearInterval(ringRef.current)
        clearTimeout(ringTimeoutRef.current)
        setCallState('idle')
        setSessionId(null)
      }
    } catch (e) {}
  }

  async function joinLiveKit(room, sid) {
    try {
      const res = await fetch(`${ADMIN_API}/api/livekit-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, name: guestName || 'Guest', isHost: false }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setToken(data.token)
      setCallState('active')
      startGuestTranscription(sid)
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.')
      setCallState('idle')
    }
  }

  async function cancelCall() {
    clearInterval(pollRef.current)
    clearInterval(ringRef.current)
    clearTimeout(ringTimeoutRef.current)
    stopGuestTranscription()
    if (sessionId) {
      await supabase.from('fd_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId)
    }
    setCallState('idle')
    setSessionId(null)
    setToken(null)
  }

  const endCall = useCallback(async () => {
    clearInterval(pollRef.current)
    clearInterval(ringRef.current)
    clearTimeout(ringTimeoutRef.current)
    stopGuestTranscription()
    // Final transcript sync
    if (sessionId && guestTranscriptRef.current.trim()) {
      await supabase.from('fd_sessions').update({ guest_transcript: guestTranscriptRef.current }).eq('id', sessionId)
    }
    if (sessionId) {
      await supabase.from('fd_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId)
    }
    setCallState('idle')
    setSessionId(null)
    setToken(null)
    guestTranscriptRef.current = ''
  }, [sessionId])

  // ── Ringing screen ──
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
              <div key={i} className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <button onClick={cancelCall}
            className="bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-red-300 hover:text-white font-semibold py-4 px-14 rounded-2xl text-lg transition-all">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Active call (LiveKit) ──
  if (callState === 'active' && token) {
    return (
      <LiveKitRoom
        serverUrl={LIVEKIT_URL}
        token={token}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={endCall}
        style={{ height: '100vh', width: '100vw', position: 'fixed', inset: 0, zIndex: 50, background: '#000' }}
      >
        <RoomAudioRenderer />
        <GuestCallUI guestName={guestName} endCall={endCall} />
      </LiveKitRoom>
    )
  }

  // ── Idle / Start screen ──
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
            <button onClick={startCall} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-xl shadow-blue-500/30">
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

// ── Guest in-call UI with custom toolbar ──
function GuestCallUI({ guestName, endCall }) {
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()
  const [isMuted, setIsMuted] = useState(false)
  const [isCamOff, setIsCamOff] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const room = useRoomContext()

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  // Listen for data messages (chat)
  useEffect(() => {
    if (!room) return
    const onData = (payload, participant) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload))
        if (msg.type === 'chat') {
          setChatMessages(prev => [...prev, { from: participant?.name || 'Staff', text: msg.text, time: Date.now() }])
        }
      } catch (e) {}
    }
    room.on(RoomEvent.DataReceived, onData)
    return () => room.off(RoomEvent.DataReceived, onData)
  }, [room])

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(isMuted)
    setIsMuted(!isMuted)
  }

  const toggleCamera = () => {
    localParticipant.setCameraEnabled(isCamOff)
    setIsCamOff(!isCamOff)
  }

  const sendChat = () => {
    if (!chatInput.trim() || !room) return
    const msg = JSON.stringify({ type: 'chat', text: chatInput.trim() })
    room.localParticipant.publishData(new TextEncoder().encode(msg), { reliable: true })
    setChatMessages(prev => [...prev, { from: guestName || 'You', text: chatInput.trim(), time: Date.now(), self: true }])
    setChatInput('')
  }

  // Find remote camera/screen tracks
  const remoteCameraTrack = tracks.find(t => t.participant?.sid !== localParticipant?.sid && t.source === Track.Source.Camera && t.publication?.track)
  const remoteScreenTrack = tracks.find(t => t.source === Track.Source.ScreenShare && t.publication?.track)
  const localCameraTrack = tracks.find(t => t.participant?.sid === localParticipant?.sid && t.source === Track.Source.Camera && t.publication?.track)

  const staffConnected = remoteParticipants.length > 0

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${staffConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="text-white text-sm font-medium">
            {staffConnected ? 'Connected to The Rockies Lodge Front Desk' : 'Waiting for staff to join...'}
          </span>
        </div>
        {showChat && (
          <span className="text-xs text-blue-400 font-medium">{chatMessages.length} messages</span>
        )}
      </div>

      {/* Video area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Main video — remote (staff) or screen share */}
        {remoteScreenTrack ? (
          <VideoTrack trackRef={remoteScreenTrack} className="w-full h-full object-contain" />
        ) : remoteCameraTrack ? (
          <VideoTrack trackRef={remoteCameraTrack} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-slate-400 text-lg">{staffConnected ? 'Camera off' : 'Waiting for staff...'}</p>
            </div>
          </div>
        )}

        {/* Self-view PiP */}
        {localCameraTrack && !isCamOff && (
          <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-30 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
            <VideoTrack trackRef={localCameraTrack} className="w-full h-full object-cover mirror" />
          </div>
        )}

        {/* Chat overlay */}
        {showChat && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur border-l border-slate-700 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-white text-sm font-semibold">Chat</span>
              <button onClick={() => setShowChat(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((m, i) => (
                <div key={i} className={`text-sm ${m.self ? 'text-right' : ''}`}>
                  <span className={`inline-block px-3 py-1.5 rounded-xl ${m.self ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {!m.self && <span className="text-xs font-semibold text-blue-400 block mb-0.5">{m.from}</span>}
                    {m.text}
                  </span>
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-slate-600 text-xs text-center pt-8">Send a message to the front desk</p>
              )}
            </div>
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
              <button onClick={sendChat} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold">Send</button>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-slate-900/80 backdrop-blur border-t border-slate-800 shrink-0">
        <button onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>
        <button onClick={toggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCamOff ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
          {isCamOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
        </button>
        <button onClick={() => setShowChat(!showChat)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${showChat ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
        <button onClick={endCall}
          className="w-16 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all">
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
