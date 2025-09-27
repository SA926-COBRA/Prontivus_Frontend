import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Upload, 
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { voiceApiService, VoiceSession, VoiceProcessingStatus } from '@/lib/voiceApi';

const VoiceRecording: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await voiceApiService.getSessions();
      setSessions(data);
    } catch (err) {
      setError('Erro ao carregar sessões');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Erro ao acessar microfone');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    try {
      setIsProcessing(true);
      const session = await voiceApiService.uploadRecording(audioBlob);
      setCurrentSession(session);
      setSessions(prev => [session, ...prev]);
    } catch (err) {
      setError('Erro ao fazer upload da gravação');
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeSession = async (sessionId: number) => {
    try {
      setIsProcessing(true);
      const result = await voiceApiService.transcribeSession(sessionId);
      setTranscription(result.transcription);
    } catch (err) {
      setError('Erro ao transcrever sessão');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: VoiceProcessingStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gravação de Voz</h1>
            <p className="text-gray-600 mt-1">Sistema de gravação e transcrição de notas clínicas</p>
          </div>
          <div className="flex items-center space-x-2">
            {currentSession && (
              <Button
                variant="destructive"
                onClick={() => setCurrentSession(null)}
                disabled={isProcessing}
              >
                <Square className="h-4 w-4 mr-2" />
                Finalizar Sessão
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controles de Gravação</CardTitle>
              <CardDescription>Grave áudio para transcrição automática</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recording Status */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100">
                  {isRecording ? (
                    <Mic className="w-8 h-8 text-blue-600 animate-pulse" />
                  ) : (
                    <MicOff className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {isRecording ? (isPaused ? 'Pausado' : 'Gravando') : 'Pronto para Gravar'}
                </p>
                <p className="text-2xl font-mono text-blue-600 mt-2">
                  {formatTime(recordingTime)}
                </p>
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <Button onClick={startRecording} size="lg" className="bg-red-600 hover:bg-red-700">
                    <Mic className="w-5 h-5 mr-2" />
                    Iniciar Gravação
                  </Button>
                ) : (
                  <>
                    {isPaused ? (
                      <Button onClick={resumeRecording} size="lg" variant="outline">
                        <Play className="w-5 h-5 mr-2" />
                        Retomar
                      </Button>
                    ) : (
                      <Button onClick={pauseRecording} size="lg" variant="outline">
                        <Pause className="w-5 h-5 mr-2" />
                        Pausar
                      </Button>
                    )}
                    <Button onClick={stopRecording} size="lg" variant="destructive">
                      <Square className="w-5 h-5 mr-2" />
                      Parar
                    </Button>
                  </>
                )}
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-2">
                    {isPlaying ? (
                      <Button onClick={pauseAudio} variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button onClick={playAudio} variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Reproduzir
                      </Button>
                    )}
                    <Button onClick={uploadRecording} disabled={isProcessing}>
                      <Upload className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Enviando...' : 'Enviar Gravação'}
                    </Button>
                  </div>
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões de Gravação</CardTitle>
              <CardDescription>Histórico de gravações e transcrições</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando sessões...</p>
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Sessão {session.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(session.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => transcribeSession(session.id)}
                          disabled={isProcessing || session.status === 'processing'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Transcrever
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma sessão encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transcription Results */}
        {transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcrição</CardTitle>
              <CardDescription>Resultado da transcrição automática</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default VoiceRecording;