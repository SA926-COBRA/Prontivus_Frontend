/**
 * AI Integration Dashboard - Frontend Component
 * Audio-based pre-consultation with transcription and analysis
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Square, 
  Brain, 
  FileText, 
  Stethoscope, 
  Pill, 
  Microscope,
  Code,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Upload,
  RefreshCw,
  Plus,
  Activity,
  BarChart3,
  Shield
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface AIAnalysisSession {
  id: string;
  session_id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_duration_seconds?: number;
  transcription_confidence?: number;
  recording_consent_given: boolean;
  created_at: string;
}

const AIIntegrationDashboard = () => {
  const [sessions, setSessions] = useState<AIAnalysisSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AIAnalysisSession | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/ai-integration/sessions');
      if (response.ok) {
        const sessionsData = await response.json();
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Erro ao carregar sessões de análise');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/v1/ai-integration/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nova Análise de Consulta',
          description: 'Análise de consulta médica com IA',
          recording_enabled: true,
          transcription_provider: 'openai',
          analysis_provider: 'openai'
        })
      });
      
      if (response.ok) {
        const newSession = await response.json();
        setSessions(prev => [newSession, ...prev]);
        setSelectedSession(newSession);
        setSuccess('Nova sessão de análise criada com sucesso!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Erro ao criar nova sessão');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setIsRecording(true);
      setSuccess('Gravação iniciada com sucesso!');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Erro ao iniciar gravação. Verifique as permissões do microfone.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setSuccess('Gravação finalizada com sucesso!');
  };

  const performFullAnalysis = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/ai-integration/sessions/${selectedSession.session_id}/full-analysis`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setSuccess('Análise completa concluída com sucesso!');
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      setError('Erro ao realizar análise');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Concluída</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processando</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Pendente</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IA Médica - Análise de Consultas</h1>
            <p className="text-gray-600 mt-2">
              Gravação de áudio, transcrição e análise inteligente de consultas médicas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              <Brain className="w-3 h-3 mr-1" />
              IA Médica
            </Badge>
            <Button onClick={createNewSession} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Análise
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="recording">Gravação</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {sessions.filter(s => s.status === 'completed').length} concluídas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.filter(s => s.status === 'processing').length}</div>
                  <p className="text-xs text-muted-foreground">Análises em andamento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessions.length > 0 
                      ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Análises bem-sucedidas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessions.length > 0 
                      ? Math.round(sessions.reduce((acc, s) => acc + (s.audio_duration_seconds || 0), 0) / sessions.length / 60)
                      : 0}min
                  </div>
                  <p className="text-xs text-muted-foreground">Duração média das gravações</p>
                </CardContent>
              </Card>
            </div>

            {/* Sessions List */}
            <Card>
              <CardHeader>
                <CardTitle>Sessões de Análise</CardTitle>
                <CardDescription>Histórico de análises de consultas com IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Criado: {new Date(session.created_at).toLocaleString()}</span>
                            {session.audio_duration_seconds && (
                              <span>Duração: {formatTime(session.audio_duration_seconds)}</span>
                            )}
                            {session.transcription_confidence && (
                              <span>Confiança: {Math.round(session.transcription_confidence * 100)}%</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(session.status)}
                          {session.recording_consent_given && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Shield className="w-3 h-3 mr-1" />
                              Consentimento
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recording Tab */}
          <TabsContent value="recording" className="space-y-6">
            {selectedSession ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Controles de Gravação
                  </CardTitle>
                  <CardDescription>
                    Grave o áudio da consulta para análise com IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recording Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className="font-medium">
                        {isRecording ? 'Gravando...' : 'Parado'}
                      </span>
                      {isRecording && (
                        <span className="text-lg font-mono">
                          {formatTime(recordingTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                          <Mic className="w-4 h-4 mr-2" />
                          Iniciar Gravação
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} variant="outline">
                          <Square className="w-4 h-4 mr-2" />
                          Parar Gravação
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Consent Management */}
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Consentimento para Gravação</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      É necessário o consentimento do paciente para gravar a consulta.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedSession(prev => prev ? {
                            ...prev,
                            recording_consent_given: true
                          } : null);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Consentimento Dado
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedSession(prev => prev ? {
                            ...prev,
                            recording_consent_given: false
                          } : null);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Consentimento Negado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-bold mb-2">Selecione uma Sessão</h2>
                  <p className="text-gray-600">Escolha uma sessão de análise para iniciar a gravação</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {selectedSession ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Análise com IA
                  </CardTitle>
                  <CardDescription>
                    Execute transcrição e análise inteligente do áudio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Analysis Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      disabled={loading}
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <FileText className="w-6 h-6" />
                      <span>Transcrever Áudio</span>
                    </Button>

                    <Button 
                      onClick={performFullAnalysis} 
                      disabled={loading}
                      className="h-20 flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="w-6 h-6" />
                      <span>Análise Completa</span>
                    </Button>
                  </div>

                  {/* Analysis Types */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="text-center p-2 border rounded">
                      <Stethoscope className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <span className="text-xs">Resumo Clínico</span>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <Microscope className="w-6 h-6 mx-auto mb-1 text-green-600" />
                      <span className="text-xs">Diagnósticos</span>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <Activity className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                      <span className="text-xs">Exames</span>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <Pill className="w-6 h-6 mx-auto mb-1 text-red-600" />
                      <span className="text-xs">Tratamentos</span>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <Code className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                      <span className="text-xs">CID-10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-bold mb-2">Selecione uma Sessão</h2>
                  <p className="text-gray-600">Escolha uma sessão de análise para executar a IA</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {selectedSession ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-bold mb-2">Resultados da Análise</h2>
                  <p className="text-gray-600">Os resultados da análise com IA aparecerão aqui após o processamento</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-bold mb-2">Selecione uma Sessão</h2>
                  <p className="text-gray-600">Escolha uma sessão de análise para visualizar os resultados</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AIIntegrationDashboard;