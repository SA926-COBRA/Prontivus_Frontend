/**
 * Patient Telemedicine Interface - Frontend Component
 * Patient-side interface for joining telemedicine sessions
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
  Minimize,
  User,
  Calendar,
  MapPin
} from 'lucide-react';

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

const PatientTelemedicineInterface = () => {
  // State management
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Media controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
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

  // Get session token from URL
  const getSessionToken = () => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
  };

  // Initialize session
  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      loadSessionByToken(token);
    } else {
      setError('Token de sessão não encontrado');
      setIsLoading(false);
    }
    
    return () => {
      cleanup();
    };
  }, []);

  const loadSessionByToken = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/telemedicine/sessions/patient-link/${token}`);
      
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
        await initializeWebRTC(sessionData);
        await connectWebSocket(sessionData.id);
      } else {
        setError('Sessão não encontrada ou expirada');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Erro ao carregar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebRTC = async (sessionData: TelemedicineSession) => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('WebRTC initialized successfully');
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setError('Erro ao acessar câmera e microfone. Verifique as permissões.');
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
      const participantId = `patient_${session?.patient_id || 'unknown'}`;
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
          participant_type: 'patient',
          participant_id: session?.patient_id || 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Joined session:', result);
        setIsJoined(true);
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

  // Chat functions
  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;
    
    try {
      const response = await fetch(`/api/v1/telemedicine/sessions/${session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: session.patient_id,
          sender_type: 'patient',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Conectando...</h2>
            <p className="text-gray-600">Inicializando consulta de telemedicina</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Erro</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Sessão Não Encontrada</h2>
            <p className="text-gray-600">A sessão de telemedicina não foi encontrada ou expirou.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                <p className="text-gray-600 mt-1">{session.description}</p>
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
          </div>
        </div>
      )}

      {/* Main Video Interface */}
      <div className={`${isFullscreen ? 'h-full' : 'h-[calc(100vh-80px)]'} container mx-auto p-6`}>
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
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-xl">Aguardando médico...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Sua consulta será iniciada em breve
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

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-white text-black"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              {/* Leave Call */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.close()}
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
                            message.sender_type === 'patient' 
                              ? 'bg-blue-100 ml-8' 
                              : 'bg-gray-100 mr-8'
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {message.sender_type === 'patient' ? 'Você' : 'Médico'}
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
      </div>

      {/* Consent Requests */}
      {consentRequests.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
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
  );
};

export default PatientTelemedicineInterface;
