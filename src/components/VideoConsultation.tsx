'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface VideoConsultationProps {
  roomUrl: string
  token: string
  userName: string
  isArtisan: boolean
  bookingId: string
  scheduledTime?: Date
  onLeave?: () => void
}

interface ParticipantState {
  id: string
  name: string
  audio: boolean
  video: boolean
  isLocal: boolean
  isScreenShare: boolean
}

export default function VideoConsultation({
  roomUrl,
  token,
  userName,
  isArtisan,
  bookingId,
  scheduledTime,
  onLeave,
}: VideoConsultationProps) {
  const [callState, setCallState] = useState<'loading' | 'ready' | 'joined' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [participants, setParticipants] = useState<ParticipantState[]>([])
  const [callDuration, setCallDuration] = useState(0)

  const callFrameRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Daily.co
  useEffect(() => {
    const initDaily = async () => {
      try {
        // Dynamically import Daily.co SDK
        const DailyIframe = (await import('@daily-co/daily-js')).default

        if (callFrameRef.current) return

        const callFrame = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '12px',
          },
          showLeaveButton: false,
          showFullscreenButton: false,
          showLocalVideo: true,
          showParticipantsBar: false,
        })

        // Event handlers
        callFrame.on('loaded', () => {
          setCallState('ready')
        })

        callFrame.on('joined-meeting', () => {
          setCallState('joined')
          // Start duration timer
          durationIntervalRef.current = setInterval(() => {
            setCallDuration((d) => d + 1)
          }, 1000)
        })

        callFrame.on('left-meeting', () => {
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
          }
          onLeave?.()
        })

        callFrame.on('participant-joined', (event: any) => {
          updateParticipants(callFrame)
        })

        callFrame.on('participant-left', (event: any) => {
          updateParticipants(callFrame)
        })

        callFrame.on('participant-updated', (event: any) => {
          updateParticipants(callFrame)
        })

        callFrame.on('error', (event: any) => {
          console.error('Daily error:', event)
          setError(event.errorMsg || 'Erreur de connexion vidéo')
          setCallState('error')
        })

        callFrameRef.current = callFrame

        // Join with token
        await callFrame.join({
          url: roomUrl,
          token: token,
          userName: userName,
        })
      } catch (err) {
        console.error('Failed to initialize video call:', err)
        setError('Impossible de démarrer la consultation vidéo')
        setCallState('error')
      }
    }

    initDaily()

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy()
        callFrameRef.current = null
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [roomUrl, token, userName, onLeave])

  const updateParticipants = (callFrame: any) => {
    const participantsObj = callFrame.participants()
    const participantsList: ParticipantState[] = Object.values(participantsObj).map(
      (p: any) => ({
        id: p.session_id,
        name: p.user_name || 'Participant',
        audio: !p.audio?.muted,
        video: !p.video?.muted,
        isLocal: p.local,
        isScreenShare: p.screen,
      })
    )
    setParticipants(participantsList)
  }

  const toggleMute = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isMuted)
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleVideo = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }, [isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (callFrameRef.current) {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare()
      } else {
        await callFrameRef.current.startScreenShare()
      }
      setIsScreenSharing(!isScreenSharing)
    }
  }, [isScreenSharing])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const leaveCall = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.leave()
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Waiting room / Loading state
  if (callState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-900 rounded-xl">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">Connexion en cours...</p>
        <p className="text-gray-400 text-sm mt-2">
          Préparation de votre consultation vidéo
        </p>
      </div>
    )
  }

  // Error state
  if (callState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-900 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white text-lg">Erreur de connexion</p>
        <p className="text-gray-400 text-sm mt-2 max-w-md text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 rounded-xl overflow-hidden"
      style={{ height: isFullscreen ? '100vh' : '600px' }}
    >
      {/* Video container */}
      <div className="absolute inset-0" id="daily-video-container" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>EN DIRECT</span>
            </div>
            {callState === 'joined' && (
              <div className="flex items-center gap-2 text-white text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              {participants.length} participant{participants.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-10">
        <div className="flex items-center justify-center gap-3">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="w-6 h-6 text-white" />
            ) : (
              <ScreenShare className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-colors ${
              showChat
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>

          {/* Participants */}
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-4 rounded-full transition-colors ${
              showParticipants
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Participants"
          >
            <Users className="w-6 h-6 text-white" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6 text-white" />
            ) : (
              <Maximize className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Leave call */}
          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors ml-4"
            title="Quitter"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Participants sidebar */}
      {showParticipants && (
        <div className="absolute top-16 right-4 bottom-20 w-64 bg-gray-800 rounded-xl p-4 z-20 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">
            Participants ({participants.length})
          </h3>
          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-700"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">
                    {p.name} {p.isLocal && '(Vous)'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {p.audio ? (
                    <Mic className="w-4 h-4 text-green-500" />
                  ) : (
                    <MicOff className="w-4 h-4 text-red-500" />
                  )}
                  {p.video ? (
                    <Video className="w-4 h-4 text-green-500" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
