/**
 * Native Telemedicine Platform - Frontend Component
 * In-house video consultation system with WebRTC, chat, screen sharing, and recording
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  MonitorOff,
  MessageSquare,
  Send,
  Upload,
  Download,
  Settings,
  Users,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface TelemedicineSession {
  id: string;
  title: string;
  description?: string;
  doctor_id: number;
  patient_id: number;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  patient_link: string;
  recording_enabled: boolean;
  screen_sharing_enabled: boolean;
  chat_enabled: boolean;
  webrtc_config: any;
}

interface Participant {
  id: string;
  type: 'doctor' | 'patient';
  name: string;
  status: 'connected' | 'disconnected';
  video_enabled: boolean;
  audio_enabled: boolean;
  screen_sharing: boolean;
}

interface ChatMessage {
  id: string;
  sender_id: number;
  sender_type: 'doctor' | 'patient';
  content: string;
  timestamp: string;
  message_type: 'text' | 'file' | 'system';
}

interface ConsentRequest {
  id: number;
  consent_type: 'recording' | 'screen_sharing';
  status: 'pending' | 'granted' | 'denied';
  message: string;
}

const NativeTelemedicinePlatform = () => {
  // State management
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>([]);
  
  // Media controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chat
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  // WebRTC
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  
  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // Initialize session
  useEffect(() => {
    initializeSession();
    return () => {
      cleanup();
    };
  }, []);

  const initializeSession = async () => {
    try {
      // Get session from URL or create new one
      const sessionId = window.location.pathname.split('/').pop();
      if (sessionId) {
        await loadSession(sessionId);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${sessionId}`);
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
        await initializeWebRTC(sessionData);
        await connectWebSocket(sessionId);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const initializeWebRTC = async (sessionData: TelemedicineSession) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize peer connections for existing participants
      for (const participant of participants) {
        await createPeerConnection(participant.id, stream);
      }
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
    }
  };

  const createPeerConnection = async (participantId: string, stream: MediaStream) => {
    try {
      const peerConnection = new RTCPeerConnection(rtcConfiguration);
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStreams(prev => new Map(prev.set(participantId, remoteStream)));
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage({
            type: 'webrtc_signaling',
            target: participantId,
            message_type: 'ice_candidate',
            data: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${participantId}:`, peerConnection.connectionState);
      };
      
      setPeerConnections(prev => new Map(prev.set(participantId, peerConnection)));
      
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  };

  const connectWebSocket = async (sessionId: string) => {
    try {
      const participantId = `doctor_${session?.doctor_id || 'unknown'}`;
      const wsUrl = `ws://localhost:8000/api/v1/telemedicine/ws/${sessionId}/${participantId}`;
      
      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        joinSession(sessionId);
      };
      
      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          participant_type: 'doctor',
          participant_id: session?.doctor_id || 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Joined session:', result);
      }
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleWebSocketMessage = async (message: any) => {
    switch (message.type) {
      case 'webrtc_signaling':
        await handleSignalingMessage(message);
        break;
      case 'chat_message':
        setMessages(prev => [...prev, message]);
        break;
      case 'participant_joined':
        setParticipants(prev => [...prev, message.participant]);
        break;
      case 'participant_left':
        setParticipants(prev => prev.filter(p => p.id !== message.participant_id));
        break;
      case 'consent_request':
        setConsentRequests(prev => [...prev, message.consent]);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const handleSignalingMessage = async (message: any) => {
    try {
      const peerConnection = peerConnections.get(message.from);
      if (!peerConnection) return;
      
      if (message.message_type === 'offer') {
        await peerConnection.setRemoteDescription(message.data);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        sendSignalingMessage({
          type: 'webrtc_signaling',
          target: message.from,
          message_type: 'answer',
          data: answer
        });
      } else if (message.message_type === 'answer') {
        await peerConnection.setRemoteDescription(message.data);
      } else if (message.message_type === 'ice_candidate') {
        await peerConnection.addIceCandidate(message.data);
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
    }
  };

  const sendSignalingMessage = (message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
  };

  // Media controls
  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenSharing = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.stop();
          }
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        if (localStream) {
          const sender = peerConnections.values().next().value?.getSenders().find(
            (s: RTCRtpSender) => s.track?.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
        
        // Handle screen sharing end
        videoTrack.onended = () => {
          setIsScreenSharing(false);
        };
      }
    } catch (error) {
      console.error('Error toggling screen sharing:', error);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        // Send recording stop signal
        sendSignalingMessage({
          type: 'recording_status',
          recording: false
        });
      } else {
        // Start recording
        setIsRecording(true);
        // Send recording start signal
        sendSignalingMessage({
          type: 'recording_status',
          recording: true
        });
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };

  // Chat functions
  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;
    
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: session.doctor_id,
          sender_type: 'doctor',
          content: newMessage,
          message_type: 'text'
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        // Scroll to bottom
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Consent management
  const requestConsent = async (consentType: 'recording' | 'screen_sharing') => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${session.id}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_type: consentType,
          message: `Consent required for ${consentType}`,
          requested_by: session.doctor_id
        })
      });
      
      if (response.ok) {
        console.log('Consent requested');
      }
    } catch (error) {
      console.error('Error requesting consent:', error);
    }
  };

  const respondToConsent = async (consentId: number, granted: boolean) => {
    try {
      const response = await fetch(`/api/v1/telemedicine/consent/${consentId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ granted })
      });
      
      if (response.ok) {
        setConsentRequests(prev => prev.filter(c => c.id !== consentId));
      }
    } catch (error) {
      console.error('Error responding to consent:', error);
    }
  };

  // Session control
  const startSession = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${session.id}/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setSession(result.session);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${session.id}/end`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setSession(result.session);
        cleanup();
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const cleanup = () => {
    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connections
    peerConnections.forEach(pc => pc.close());
    
    // Clear state
    setLocalStream(null);
    setRemoteStreams(new Map());
    setPeerConnections(new Map());
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Carregando Sessão</h2>
              <p className="text-gray-600">Inicializando plataforma de telemedicina...</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'container mx-auto p-6'}`}>
        {/* Header */}
        {!isFullscreen && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
              <p className="text-gray-600 mt-2">{session.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Video className="w-3 h-3 mr-1" />
                Telemedicina
              </Badge>
              <Badge variant="outline" className={
                session.status === 'in_progress' ? 'text-green-600 border-green-600' :
                session.status === 'waiting' ? 'text-yellow-600 border-yellow-600' :
                'text-gray-600 border-gray-600'
              }>
                {session.status === 'in_progress' ? 'Em Andamento' :
                 session.status === 'waiting' ? 'Aguardando' :
                 session.status === 'completed' ? 'Concluída' : 'Agendada'}
              </Badge>
            </div>
          </div>
        )}

        {/* Main Video Interface */}
        <div className={`${isFullscreen ? 'h-full' : 'h-[600px]'} grid grid-cols-1 lg:grid-cols-4 gap-6`}>
          {/* Video Area */}
          <div className={`${isFullscreen ? 'lg:col-span-3' : 'lg:col-span-3'} bg-black rounded-lg relative overflow-hidden`}>
            {/* Local Video */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden z-10">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                Você {isVideoEnabled ? '' : '(Câmera desligada)'}
              </div>
            </div>

            {/* Remote Video */}
            <div className="w-full h-full flex items-center justify-center">
              {remoteStreams.size > 0 ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-xl">Aguardando paciente...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Compartilhe o link: {session.patient_link}
                  </p>
                </div>
              )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
              {/* Video Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleVideo}
                className={`${isVideoEnabled ? 'bg-white text-black' : 'bg-red-600 text-white'}`}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>

              {/* Audio Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className={`${isAudioEnabled ? 'bg-white text-black' : 'bg-red-600 text-white'}`}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>

              {/* Screen Sharing */}
              {session.screen_sharing_enabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleScreenSharing}
                  className={`${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </Button>
              )}

              {/* Recording */}
              {session.recording_enabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRecording}
                  className={`${isRecording ? 'bg-red-600 text-white' : 'bg-white text-black'}`}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-white text-black"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              {/* End Call */}
              <Button
                variant="outline"
                size="sm"
                onClick={endSession}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Sidebar */}
          {!isFullscreen && session.chat_enabled && (
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Chat
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                      {isChatOpen ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>
                </CardHeader>
                
                {isChatOpen && (
                  <CardContent className="flex flex-col h-[500px]">
                    {/* Messages */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto space-y-2 mb-4"
                    >
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-2 rounded-lg ${
                            message.sender_type === 'doctor' 
                              ? 'bg-blue-100 ml-8' 
                              : 'bg-gray-100 mr-8'
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {message.sender_type === 'doctor' ? 'Você' : 'Paciente'}
                          </div>
                          <div className="text-sm">{message.content}</div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Session Controls */}
        {!isFullscreen && (
          <div className="mt-6 flex justify-center gap-4">
            {session.status === 'waiting' && (
              <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Consulta
              </Button>
            )}
            
            {session.status === 'in_progress' && (
              <Button onClick={endSession} variant="destructive">
                <PhoneOff className="w-4 h-4 mr-2" />
                Encerrar Consulta
              </Button>
            )}
          </div>
        )}

        {/* Consent Requests */}
        {consentRequests.length > 0 && (
          <div className="mt-6">
            {consentRequests.map((consent) => (
              <Alert key={consent.id} className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{consent.message}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondToConsent(consent.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Permitir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToConsent(consent.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Negar
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NativeTelemedicinePlatform;
