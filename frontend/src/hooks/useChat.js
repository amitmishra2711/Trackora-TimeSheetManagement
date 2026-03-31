import { useEffect, useRef, useState, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'

export function useChat() {
  const connectionRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])

  const connect = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token || connectionRef.current) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('ReceiveDirectMessage', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'direct' }])
    })

    connection.on('ReceiveTeamMessage', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'team' }])
    })

    try {
      await connection.start()
      setConnected(true)
      connectionRef.current = connection
    } catch (err) {
      console.error('SignalR connection failed:', err)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop()
      connectionRef.current = null
      setConnected(false)
    }
  }, [])

  const sendDirect = useCallback(async (receiverId, text) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected)
      await connectionRef.current.invoke('SendDirectMessage', receiverId, text)
  }, [])

  const sendTeam = useCallback(async (teamId, text) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected)
      await connectionRef.current.invoke('SendTeamMessage', teamId, text)
  }, [])

  const joinTeam = useCallback(async (teamId) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected)
      await connectionRef.current.invoke('JoinTeam', teamId)
  }, [])

  const clearMessages = useCallback(() => setMessages([]), [])

  useEffect(() => () => { disconnect() }, [disconnect])

  return { connected, messages, connect, disconnect, sendDirect, sendTeam, joinTeam, clearMessages }
}
