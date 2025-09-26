import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Stop, 
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
import { ModernLayout, ModernSidebar, ModernPageHeader } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, LoadingSpinner, ProgressRing } from '@/components/ui/ModernComponents';
import { voiceApiService, VoiceSession, VoiceProcessingStatus } from '@/lib/voiceApi';

const VoiceRecording: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [processingStatus, setProcessingStatus] = useState<VoiceProcessingStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const [patientId, setPatientId] = useState<string>('');
  const [clinicalContext, setClinicalContext] = useState<string>('');
  const [medicalSpecialty, setMedicalSpecialty] = useState<string>('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [stream, audioUrl]);

  const startRecording = async () => {
    try {
      const recorder = await voiceApiService.startAudioRecording();
      const mediaStream = recorder.stream;
      
      setMediaRecorder(recorder);
      setStream(mediaStream);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start recording
      recorder.start();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Erro ao iniciar gravação. Verifique as permissões do microfone.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && isRecording) {
      try {
        const blob = await voiceApiService.stopAudioRecording(mediaRecorder);
        setAudioBlob(blob);
        
        // Create audio URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Stop all tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsRecording(false);
        setIsPaused(false);
        
      } catch (error) {
        console.error('Error stopping recording:', error);
        alert('Erro ao parar gravação.');
      }
    }
  };

  const startVoiceSession = async () => {
    if (!patientId) {
      alert('Por favor, informe o ID do paciente.');
      return;
    }
    
    try {
      const response = await voiceApiService.quickStartSession(
        parseInt(patientId),
        1, // Mock doctor ID - in real app, get from user context
        clinicalContext
      );
      
      setCurrentSession({
        id: 0,
        session_id: response.session_id,
        patient_id: parseInt(patientId),
        doctor_id: 1,
        status: 'active',
        start_time: new Date().toISOString(),
        duration_seconds: 0,
        audio_format: 'webm',
        sample_rate: 16000,
        channels: 1,
        transcription_status: 'pending',
        transcription_language: 'pt-BR',
        session_type: 'consultation',
        created_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error starting voice session:', error);
      alert('Erro ao iniciar sessão de voz.');
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob || !currentSession) {
      alert('Nenhum áudio gravado ou sessão não iniciada.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Convert blob to file
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      await voiceApiService.uploadAudioToSession(currentSession.session_id, audioFile);
      
      alert('Áudio enviado com sucesso!');
      
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Erro ao enviar áudio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async () => {
    if (!currentSession) {
      alert('Nenhuma sessão ativa.');
      return;
    }
    
    try {
      setIsTranscribing(true);
      
      const response = await voiceApiService.quickTranscribe(currentSession.session_id);
      
      if (response.success) {
        // Wait for transcription to complete
        const session = await voiceApiService.waitForTranscriptionCompletion(currentSession.session_id);
        setTranscriptionText(session.transcription_text || '');
        setCurrentSession(session);
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Erro ao transcrever áudio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateClinicalNote = async () => {
    if (!currentSession) {
      alert('Nenhuma sessão ativa.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const response = await voiceApiService.quickGenerateNote(currentSession.session_id);
      
      if (response.success) {
        alert('Nota clínica gerada com sucesso!');
      }
      
    } catch (error) {
      console.error('Error generating clinical note:', error);
      alert('Erro ao gerar nota clínica.');
    } finally {
      setIsProcessing(false);
    }
  };

  const endSession = async () => {
    if (!currentSession) {
      alert('Nenhuma sessão ativa.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const response = await voiceApiService.quickEndSession(
        currentSession.session_id,
        true, // auto transcribe
        false // auto generate note
      );
      
      if (response.success) {
        alert('Sessão finalizada com sucesso!');
        setCurrentSession(null);
        setTranscriptionText('');
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
      }
      
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Erro ao finalizar sessão.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sidebarItems = [
    {
      id: 'recording',
      label: 'Gravação',
      icon: <Mic className="h-4 w-4" />,
      href: '/voice/recording'
    },
    {
      id: 'sessions',
      label: 'Sessões',
      icon: <Activity className="h-4 w-4" />,
      href: '/voice/sessions'
    },
    {
      id: 'transcriptions',
      label: 'Transcrições',
      icon: <FileText className="h-4 w-4" />,
      href: '/voice/transcriptions'
    },
    {
      id: 'notes',
      label: 'Notas Clínicas',
      icon: <Edit className="h-4 w-4" />,
      href: '/voice/notes'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/voice/analytics'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
      href: '/voice/settings'
    }
  ];

  return (
    <ModernLayout
      title="Gravação de Voz"
      subtitle="Sistema de gravação e transcrição de notas clínicas"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem="recording"
          onItemClick={() => {}}
        />
      }
    >
      <ModernPageHeader
        title="Gravação de Voz"
        subtitle="Grave e transcreva notas clínicas automaticamente"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Voz', href: '/voice' },
          { label: 'Gravação' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            {currentSession && (
              <GradientButton
                variant="danger"
                onClick={endSession}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Stop className="h-4 w-4 mr-2" />
                )}
                Finalizar Sessão
              </GradientButton>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recording Controls */}
        <ModernCard variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Controles de Gravação</h3>
          
          {/* Session Setup */}
          {!currentSession && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Paciente *
                </label>
                <input
                  type="number"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o ID do paciente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexto Clínico
                </label>
                <textarea
                  value={clinicalContext}
                  onChange={(e) => setClinicalContext(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva o contexto clínico da consulta"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade Médica
                </label>
                <select
                  value={medicalSpecialty}
                  onChange={(e) => setMedicalSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma especialidade</option>
                  <option value="cardiologia">Cardiologia</option>
                  <option value="ortopedia">Ortopedia</option>
                  <option value="neurologia">Neurologia</option>
                  <option value="oftalmologia">Oftalmologia</option>
                  <option value="dermatologia">Dermatologia</option>
                  <option value="ginecologia">Ginecologia</option>
                  <option value="urologia">Urologia</option>
                  <option value="pediatria">Pediatria</option>
                  <option value="cirurgia_geral">Cirurgia Geral</option>
                  <option value="plastica">Cirurgia Plástica</option>
                </select>
              </div>
              
              <GradientButton
                variant="primary"
                onClick={startVoiceSession}
                disabled={!patientId}
                className="w-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                Iniciar Sessão de Voz
              </GradientButton>
            </div>
          )}
          
          {/* Recording Status */}
          {currentSession && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Sessão Ativa</h4>
                  <p className="text-sm text-gray-500">ID: {currentSession.session_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{formatTime(recordingTime)}</p>
                  <p className="text-sm text-gray-500">Tempo de gravação</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                {!isRecording ? (
                  <GradientButton
                    variant="primary"
                    onClick={startRecording}
                    size="lg"
                  >
                    <Mic className="h-6 w-6 mr-2" />
                    Iniciar Gravação
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton
                      variant="secondary"
                      onClick={pauseRecording}
                      size="lg"
                    >
                      {isPaused ? (
                        <Play className="h-6 w-6 mr-2" />
                      ) : (
                        <Pause className="h-6 w-6 mr-2" />
                      )}
                      {isPaused ? 'Retomar' : 'Pausar'}
                    </GradientButton>
                    
                    <GradientButton
                      variant="danger"
                      onClick={stopRecording}
                      size="lg"
                    >
                      <Stop className="h-6 w-6 mr-2" />
                      Parar
                    </GradientButton>
                  </>
                )}
              </div>
              
              {isRecording && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-red-600">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="font-medium">Gravando...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Audio Playback */}
          {audioUrl && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Reprodução do Áudio</h4>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
              />
            </div>
          )}
          
          {/* Action Buttons */}
          {audioBlob && currentSession && (
            <div className="space-y-3">
              <GradientButton
                variant="outline"
                onClick={uploadAudio}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Enviar Áudio
              </GradientButton>
              
              <GradientButton
                variant="primary"
                onClick={transcribeAudio}
                disabled={isTranscribing}
                className="w-full"
              >
                {isTranscribing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Transcrever Áudio
              </GradientButton>
              
              <GradientButton
                variant="secondary"
                onClick={generateClinicalNote}
                disabled={isProcessing || !transcriptionText}
                className="w-full"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                Gerar Nota Clínica
              </GradientButton>
            </div>
          )}
        </ModernCard>

        {/* Transcription Results */}
        <ModernCard variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resultado da Transcrição</h3>
          
          {isTranscribing ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500">Transcrevendo áudio...</p>
            </div>
          ) : transcriptionText ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Texto Transcrito:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{transcriptionText}</p>
              </div>
              
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Transcrição concluída</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transcrição disponível</p>
              <p className="text-sm">Grave um áudio e clique em "Transcrever"</p>
            </div>
          )}
        </ModernCard>
      </div>

      {/* Processing Status */}
      {processingStatus && (
        <div className="mt-8">
          <ModernCard variant="elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Processamento</h3>
            
            <div className="flex items-center space-x-4">
              <ProgressRing
                progress={processingStatus.progress_percentage}
                size={60}
                color="#3b82f6"
              />
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {processingStatus.current_step}
                </p>
                <p className="text-sm text-gray-500">
                  {processingStatus.progress_percentage}% concluído
                </p>
                {processingStatus.estimated_completion_time && (
                  <p className="text-xs text-gray-400">
                    Tempo estimado: {processingStatus.estimated_completion_time}s
                  </p>
                )}
              </div>
              
              {processingStatus.error_message && (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">{processingStatus.error_message}</span>
                </div>
              )}
            </div>
          </ModernCard>
        </div>
      )}
    </ModernLayout>
  );
};

export default VoiceRecording;
