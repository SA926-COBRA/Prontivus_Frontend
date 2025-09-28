import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Mic, 
  MicOff, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  FileText, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Zap,
  Stethoscope,
  Pill,
  Microscope
} from 'lucide-react';
import { aiIntegrationService, AIAnalysisSession } from '@/lib/aiIntegrationService';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const AIAnalysisSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  // Session state
  const [session, setSession] = useState<AIAnalysisSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Analysis state
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
    
    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await aiIntegrationService.getAnalysisSession(sessionId!);
      setSession(sessionData);
      
      if (sessionData.status === 'processing') {
        startProgressPolling();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Erro ao carregar sessão');
      toast.error('Erro ao carregar sessão de análise');
    } finally {
      setLoading(false);
    }
  };

  const startProgressPolling = () => {
    setIsAnalyzing(true);
    intervalRef.current = setInterval(async () => {
      try {
        const progress = await aiIntegrationService.getAnalysisProgress(sessionId!);
        setAnalysisProgress(progress.progress);
        setCurrentStep(progress.current_step);
        
        if (progress.status === 'completed') {
          setIsAnalyzing(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          loadSession(); // Reload to get results
          toast.success('Análise concluída com sucesso');
        } else if (progress.status === 'failed') {
          setIsAnalyzing(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          toast.error('Análise falhou');
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    }, 2000);
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast.success('Gravação iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erro ao iniciar gravação');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      toast.success('Gravação finalizada');
    }
  };

  const uploadAudioFile = async (file: File) => {
    try {
      // Validate file first
      const validation = await aiIntegrationService.validateAudioFile(file);
      if (!validation.valid) {
        toast.error(validation.message || 'Arquivo de áudio inválido');
        return;
      }
      
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      toast.success('Arquivo de áudio carregado');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Erro ao carregar arquivo de áudio');
    }
  };

  const startAnalysis = async () => {
    if (!audioBlob) {
      toast.error('Nenhum áudio disponível para análise');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      await aiIntegrationService.startAnalysis(sessionId!, audioBlob as File);
      toast.success('Análise iniciada');
      startProgressPolling();
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Erro ao iniciar análise');
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pendente', icon: Clock },
      processing: { variant: 'default' as const, label: 'Processando', icon: Activity },
      completed: { variant: 'default' as const, label: 'Concluída', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Falhou', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
            <Button onClick={() => navigate('/ai-integration')} className="mt-4">
              Voltar para IA Integration
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Análise de IA</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted-foreground">Sessão #{session.id.slice(-8)}</span>
              {getStatusBadge(session.status)}
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/ai-integration')}>
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Recording/Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Gravação de Áudio
              </CardTitle>
              <CardDescription>
                Grave ou faça upload do áudio da consulta para análise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!audioBlob ? (
                <div className="space-y-4">
                  {/* Recording Controls */}
                  <div className="text-center space-y-4">
                    <div className="text-6xl">
                      {isRecording ? (
                        <div className="animate-pulse text-red-500">
                          <Mic className="w-16 h-16 mx-auto" />
                        </div>
                      ) : (
                        <Mic className="w-16 h-16 mx-auto text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isRecording ? 'Gravando...' : 'Clique para iniciar a gravação'}
                      </p>
                      {isRecording && (
                        <p className="text-lg font-mono">
                          {formatDuration(recordingDuration)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      {!isRecording ? (
                        <Button onClick={startRecording} size="lg">
                          <Mic className="w-4 h-4 mr-2" />
                          Iniciar Gravação
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} variant="destructive" size="lg">
                          <Square className="w-4 h-4 mr-2" />
                          Parar Gravação
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="audio-upload">Ou faça upload de um arquivo</Label>
                    <Input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadAudioFile(file);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Audio Player */}
                  <div className="space-y-2">
                    <Label>Áudio Carregado</Label>
                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        controls
                        src={audioUrl}
                        className="w-full"
                      />
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      if (audioUrl) {
                        URL.revokeObjectURL(audioUrl);
                      }
                    }} variant="outline">
                      Remover Áudio
                    </Button>
                    
                    {session.status === 'pending' && (
                      <Button onClick={startAnalysis} disabled={isAnalyzing}>
                        <Brain className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {(isAnalyzing || session.status === 'processing') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Progresso da Análise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep || 'Processando...'}</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="w-full" />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>• Transcrição do áudio</p>
                  <p>• Análise clínica</p>
                  <p>• Sugestões de diagnóstico</p>
                  <p>• Recomendações de tratamento</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {session.status === 'completed' && session.analysis_results && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Resultados da Análise
                </CardTitle>
                <CardDescription>
                  Análise concluída com sucesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Resumo</TabsTrigger>
                    <TabsTrigger value="diagnosis">Diagnósticos</TabsTrigger>
                    <TabsTrigger value="exams">Exames</TabsTrigger>
                    <TabsTrigger value="treatment">Tratamento</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Resumo Clínico</Label>
                      <Textarea
                        value={session.analysis_results.clinical_summary}
                        readOnly
                        className="min-h-32"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="diagnosis" className="space-y-4">
                    <div className="space-y-3">
                      {session.analysis_results.diagnostic_hypotheses.map((hypothesis, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{hypothesis.diagnosis}</h4>
                            <Badge variant="outline">
                              {Math.round(hypothesis.confidence * 100)}% confiança
                            </Badge>
                          </div>
                          {hypothesis.icd_code && (
                            <p className="text-sm text-muted-foreground">
                              CID: {hypothesis.icd_code}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="exams" className="space-y-4">
                    <div className="space-y-3">
                      {session.analysis_results.exam_suggestions.map((exam, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{exam.exam}</h4>
                            <Badge variant={
                              exam.priority === 'high' ? 'destructive' :
                              exam.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {exam.priority === 'high' ? 'Alta' :
                               exam.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{exam.reason}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="treatment" className="space-y-4">
                    <div className="space-y-3">
                      {session.analysis_results.treatment_suggestions.map((treatment, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{treatment.treatment}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {treatment.dosage && (
                              <div>
                                <span className="font-medium">Dosagem:</span> {treatment.dosage}
                              </div>
                            )}
                            {treatment.duration && (
                              <div>
                                <span className="font-medium">Duração:</span> {treatment.duration}
                              </div>
                            )}
                          </div>
                          {treatment.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{treatment.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      aiIntegrationService.exportAnalysisData(session.id)
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `analise-${session.id.slice(-8)}.json`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        })
                        .catch(error => {
                          console.error('Error exporting data:', error);
                          toast.error('Erro ao exportar dados');
                        });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Resultados
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transcription */}
          {session.transcription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Transcrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <p className="text-sm whitespace-pre-wrap">{session.transcription}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAnalysisSession;
