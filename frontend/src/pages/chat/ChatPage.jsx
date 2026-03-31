import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../hooks/useChat'
import { messagesApi, teamsApi, usersApi } from '../../api'
import { Spinner } from '../../components/common'
import { Send, Users, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { user } = useAuth()
  const { connected, messages: liveMessages, connect, sendDirect, sendTeam, joinTeam } = useChat()
  const [mode, setMode] = useState('direct') // 'direct' | 'team'
  const [users, setUsers] = useState([])
  const [team, setTeam] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [history, setHistory] = useState([])
  const [allMessages, setAllMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { connect() }, [connect])

  // Load users and team
  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, leaderRes] = await Promise.all([usersApi.getEmployees(), usersApi.getLeaders()])
        setUsers([...(empRes.data || []), ...(leaderRes.data || [])].filter(u => u.id !== user?.id))
        const teamRes = await teamsApi.getMyTeam().catch(() => ({ data: null }))
        if (teamRes.data) {
          setTeam(teamRes.data)
          joinTeam(teamRes.data.id)
        }
      } catch {}
    }
    load()
  }, [user])

  // Load message history when selection changes
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        if (mode === 'direct' && selectedUser) {
          const res = await messagesApi.getDirect(selectedUser.id)
          setHistory(res.data || [])
        } else if (mode === 'team' && team) {
          const res = await messagesApi.getTeam(team.id)
          setHistory(res.data || [])
        }
      } catch {} finally { setLoading(false) }
    }
    loadHistory()
  }, [mode, selectedUser, team])

  // Merge history + live messages
  useEffect(() => {
    const relevant = liveMessages.filter(m => {
      if (mode === 'team') return m.type === 'team' && m.teamId === team?.id
      return m.type === 'direct' && (m.senderId === selectedUser?.id || m.receiverId === selectedUser?.id)
    })
    const ids = new Set(history.map(m => m.id))
    setAllMessages([...history, ...relevant.filter(m => !ids.has(m.id))])
  }, [history, liveMessages, mode, selectedUser, team])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [allMessages])

  const send = async () => {
    if (!text.trim()) return
    try {
      if (mode === 'direct' && selectedUser) await sendDirect(selectedUser.id, text)
      else if (mode === 'team' && team) await sendTeam(team.id, text)
      setText('')
    } catch { toast.error('Failed to send') }
  }

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col card">
        <div className="p-3 border-b border-gray-100">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button onClick={() => setMode('direct')} className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1 ${mode === 'direct' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <MessageCircle size={13} /> Direct
            </button>
            <button onClick={() => setMode('team')} className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1 ${mode === 'team' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Users size={13} /> Team
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {mode === 'direct' ? (
            users.length === 0 ? <p className="text-xs text-gray-400 text-center py-6">No users</p>
              : users.map(u => (
                <button key={u.id} onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left mb-0.5 ${selectedUser?.id === u.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-400">{u.role}</p>
                  </div>
                </button>
              ))
          ) : (
            team ? (
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-gray-900">{team.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{team.members?.length || 0} members</p>
              </div>
            ) : <p className="text-xs text-gray-400 text-center py-6">No team found</p>
          )}
        </div>

        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center gap-1.5 text-xs ${connected ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col card min-w-0">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
          {mode === 'direct' && selectedUser ? (
            <>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-xs text-gray-400">{selectedUser.role}</p>
              </div>
            </>
          ) : mode === 'team' && team ? (
            <>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><Users size={15} className="text-purple-600" /></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{team.name}</p>
                <p className="text-xs text-gray-400">Team chat</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Select a conversation</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? <div className="flex justify-center py-10"><Spinner /></div>
            : !(selectedUser || (mode === 'team' && team))
              ? <div className="flex flex-col items-center justify-center h-full text-gray-400"><MessageCircle size={40} className="mb-2 opacity-30" /><p className="text-sm">Select a chat to start messaging</p></div>
              : allMessages.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-400"><p className="text-sm">No messages yet. Say hello!</p></div>
                : allMessages.map((m, i) => {
                  const isMe = m.senderId === user?.id
                  return (
                    <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && <p className="text-xs text-gray-400 mb-1 px-1">{m.senderName}</p>}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                          {m.messageText}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 px-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )
                })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            disabled={!(selectedUser || (mode === 'team' && team))}
          />
          <button onClick={send} disabled={!text.trim() || !(selectedUser || (mode === 'team' && team))}
            className="btn-primary px-3">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
