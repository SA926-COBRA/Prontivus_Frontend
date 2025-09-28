import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Paperclip,
  Download,
  Settings,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { telemedicineService, TelemedicineSession, TelemedicineMessage } from '@/lib/telemedicineService';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const VideoConsultation: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  // Video/audio state
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Session state
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [messages, setMessages] = useState<TelemedicineMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
      loadMessages();
    }
    
    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await telemedicineService.getSession(sessionId!);
      setSession(sessionData);
      
      if (sessionData.status === 'waiting' || sessionData.status === 'in_progress') {
        await initializeVideoCall();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Erro ao carregar sessão');
      toast.error('Erro ao carregar sessão de telemedicina');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await telemedicineService.getMessages(sessionId!);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const initializeVideoCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      setPeerConnection(pc);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to remote peer
          console.log('ICE candidate:', event.candidate);
        }
      };

    } catch (error) {
      console.error('Error initializing video call:', error);
      toast.error('Erro ao inicializar chamada de vídeo');
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        if (peerConnection && localStream) {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        // Stop screen sharing
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Erro ao compartilhar tela');
    }
  };

  const startRecording = async () => {
    try {
      await telemedicineService.startRecording(sessionId!);
      setIsRecording(true);
      toast.success('Gravação iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erro ao iniciar gravação');
    }
  };

  const stopRecording = async () => {
    try {
      await telemedicineService.stopRecording(sessionId!);
      setIsRecording(false);
      toast.success('Gravação finalizada');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Erro ao finalizar gravação');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await telemedicineService.sendMessage(sessionId!, {
        message_type: 'text',
        content: newMessage.trim()
      });
      
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const endCall = async () => {
    try {
      await telemedicineService.endSession(sessionId!);
      toast.success('Chamada finalizada');
      navigate('/telemedicine');
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Erro ao finalizar chamada');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando sessão...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !session) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error || 'Sessão não encontrada'}</p>
            <Button onClick={() => navigate('/telemedicine')} className="mt-4">
              Voltar para Telemedicina
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-background border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Consulta por Vídeo</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={session.status === 'in_progress' ? 'default' : 'secondary'}>
                  {session.status === 'in_progress' ? 'Em Andamento' : 'Aguardando'}
                </Badge>
                <Clock className="w-4 h-4" />
                <span>Sessão #{session.id.slice(-8)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">2 participantes</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Video Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-black relative">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local Video */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">GRAVANDO</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-background border-t p-4">
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant={isAudioOn ? 'default' : 'destructive'}
                  size="lg"
                  onClick={toggleAudio}
                >
                  {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                <Button
                  variant={isVideoOn ? 'default' : 'destructive'}
                  size="lg"
                  onClick={toggleVideo}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>

                <Button
                  variant={isScreenSharing ? 'default' : 'outline'}
                  size="lg"
                  onClick={toggleScreenShare}
                >
                  {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </Button>

                {session.recording_enabled && (
                  <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? <Square className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 border-l bg-background flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'doctor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        message.sender_type === 'doctor'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button size="sm" onClick={sendMessage}>
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VideoConsultation;
