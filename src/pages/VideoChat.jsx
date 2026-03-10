import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createPageUrl } from '@/utils'
import { ArrowLeft } from 'lucide-react'

const APP_ID = import.meta.env.VITE_JAAS_APP_ID || 'vpaas-magic-cookie-e866a734fd5742ea83b9df9d3fab8807'
const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL || 'https://frontdesk-rockies-admin.vercel.app'

export default function VideoChat() {
  const [guestName, setGuestName] = useState('')
  const [device, setDevice] = useState(null)
  const [inCall, setInCall] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const jitsiRef = useRef(null)
  const apiRef = useRef(null)

  // Auto-populate room and device — try online first, fall back to any device
  useEffect(() => {
    supabase
      .from('fd_devices')
      .select('id, jitsi_room, device_name, location')
      .eq('status', 'online')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setDevice(data); return }
        // Fall back to any registered device
        supabase.from('fd_devices').select('id, jitsi_room, device_name, location').limit(1).maybeSingle()
          .then(({ data: any }) => { if (any) setDevice(any) })
      })
  }, [])

  const roomName = device?.jitsi_room || 'frontdesk-rockies-main'

  async function startCall() {
    if (!roomName.trim()) { setError('No room configured'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${ADMIN_API}/api/jaas-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName.trim(), name: guestName || 'Guest', isModerator: true }),
      })
      const { jwt, roomName: fullRoom, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      // Register active session so admin sees the call
      const { data: session } = await supabase
        .from('fd_sessions')
        .insert({
          guest_name: guestName || 'Guest',
          session_type: 'video_chat',
          status: 'active',
          jitsi_room: roomName.trim(),
          device_id: device?.id || null,
        })
        .select().single()
      setSessionId(session?.id)

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
            disableDeepLinking: true,
            toolbarButtons: ['microphone', 'camera', 'hangup', 'chat', 'tileview'],
          },
          interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, TOOLBAR_ALWAYS_VISIBLE: true },
          userInfo: { displayName: guestName || 'Guest' },
        })
        apiRef.current.addEventListeners({ readyToClose: endCall, videoConferenceLeft: endCall })
      }
      document.head.appendChild(script)
      setInCall(true)
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function endCall() {
    if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null }
    if (sessionId) {
      await supabase.from('fd_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId)
    }
    setInCall(false); setSessionId(null)
  }

  if (inCall) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
      {/* Top nav */}
      <div className="px-6 pt-6">
        <Link to={createPageUrl("GuestInterface")}>
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
            {device && (
              <p className="text-blue-300/60 text-sm mt-1">📍 {device.location}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1.5 font-medium">Your Name or Room Number (optional)</label>
              <input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startCall()}
                placeholder="e.g. Room 204 — Sarah"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 text-lg"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm text-center">{error}</div>
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
