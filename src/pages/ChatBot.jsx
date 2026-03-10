import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { ArrowLeft, Send, Bot, User } from 'lucide-react'

const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL || 'https://frontdesk-rockies-admin.vercel.app'

const QUICK_QUESTIONS = [
  "What's the WiFi password?",
  "What time is checkout?",
  "Is the hot tub available?",
  "How do I book an amenity?",
  "What's nearby to eat?",
  "Where can I ski?",
]

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm the Rockies Lodge AI concierge 🏔️ I can answer questions about the hotel, local area, and amenities. What can I help you with?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', text: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.text }))
      const res = await fetch(`${ADMIN_API}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Sorry, I had trouble with that. Please try again.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect right now. Please try again or call the front desk at Dial 0." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <Link to={createPageUrl('GuestInterface')}>
          <button className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">AI Concierge</h1>
            <p className="text-blue-300/70 text-xs">The Rockies Lodge · Ask me anything</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white/10 text-white/90 rounded-bl-sm'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-white/40 text-xs mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="bg-white/10 hover:bg-white/20 text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 text-sm disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
