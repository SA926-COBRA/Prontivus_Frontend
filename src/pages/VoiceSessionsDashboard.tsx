import React, { useState, useEffect } from 'react';
import { 
  Mic, 
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
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing, LoadingSpinner } from '@/components/ui/ModernComponents';
import { voiceApiService, VoiceSession, VoiceDashboardStats } from '@/lib/voiceApi';

const VoiceSessionsDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [dashboardStats, setDashboardStats] = useState<VoiceDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('sessions');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [patientFilter, setPatientFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [sessionsData, stats] = await Promise.all([
        voiceApiService.getVoiceSessions({ limit: 50 }),
        voiceApiService.getVoiceDashboard()
      ]);

      setSessions(sessionsData);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading voice sessions dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTranscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTranscriptionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpecialtyLabel = (specialty: string) => {
    const specialties: Record<string, string> = {
      'cardiologia': 'Cardiologia',
      'ortopedia': 'Ortopedia',
      'neurologia': 'Neurologia',
      'oftalmologia': 'Oftalmologia',
      'dermatologia': 'Dermatologia',
      'ginecologia': 'Ginecologia',
      'urologia': 'Urologia',
      'pediatria': 'Pediatria',
      'cirurgia_geral': 'Cirurgia Geral',
      'plastica': 'Cirurgia Plástica'
    };
    return specialties[specialty] || specialty;
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

  const mainStats = [
    {
      title: 'Sessões Ativas',
      value: <AnimatedCounter value={dashboardStats?.active_sessions || 0} />,
      change: 2,
      changeType: 'positive' as const,
      icon: <Activity className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Sessões Hoje',
      value: <AnimatedCounter value={dashboardStats?.total_sessions_today || 0} />,
      change: 15,
      changeType: 'positive' as const,
      icon: <Calendar className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Duração Total',
      value: <AnimatedCounter value={Math.round(dashboardStats?.total_duration_today_minutes || 0)} />,
      change: 8,
      changeType: 'positive' as const,
      icon: <Clock className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Taxa de Sucesso',
      value: <AnimatedCounter value={Math.round((dashboardStats?.transcription_success_rate || 0) * 100)} />,
      change: 5,
      changeType: 'positive' as const,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green' as const
    }
  ];

  if (loading) {
    return (
      <ModernLayout title="Sessões de Voz">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout
      title="Sessões de Voz"
      subtitle="Gestão de sessões de gravação e transcrição"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Sessões de Voz"
        subtitle="Visualize e gerencie suas sessões de gravação"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Voz', href: '/voice' },
          { label: 'Sessões' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <GradientButton variant="primary">
              <Mic className="h-4 w-4 mr-2" />
              Nova Gravação
            </GradientButton>
            <GradientButton variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </GradientButton>
          </div>
        }
      />

      {/* Main Stats Grid */}
      <ModernStatsGrid stats={mainStats} className="mb-8" />

      {/* Filters */}
      <ModernCard variant="elevated" className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID da sessão ou paciente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="paused">Pausado</option>
            <option value="cancelled">Cancelado</option>
            <option value="error">Erro</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </ModernCard>

      {/* Sessions List */}
      <ModernCard variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sessões de Voz</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {sessions.length} sessões encontradas
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{session.session_id}</h4>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">Paciente {session.patient_id}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(session.start_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDuration(session.duration_seconds)}
                          </span>
                        </div>
                        
                        {session.medical_specialty && (
                          <div className="flex items-center space-x-1">
                            <Stethoscope className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {getSpecialtyLabel(session.medical_specialty)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Transcription Status */}
                    <div className={`px-2 py-1 rounded-full text-xs ${getTranscriptionStatusColor(session.transcription_status)}`}>
                      <div className="flex items-center space-x-1">
                        {getTranscriptionStatusIcon(session.transcription_status)}
                        <span>{session.transcription_status}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <GradientButton
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View session details */}}
                      >
                        <Eye className="h-4 w-4" />
                      </GradientButton>
                      
                      {session.transcription_text && (
                        <GradientButton
                          variant="outline"
                          size="sm"
                          onClick={() => {/* View transcription */}}
                        >
                          <FileText className="h-4 w-4" />
                        </GradientButton>
                      )}
                      
                      {session.audio_file_path && (
                        <GradientButton
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Download audio */}}
                        >
                          <Download className="h-4 w-4" />
                        </GradientButton>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Session Details */}
                {session.clinical_context && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Contexto:</span> {session.clinical_context}
                    </p>
                  </div>
                )}
                
                {/* Quality Metrics */}
                {(session.audio_quality_score || session.speech_clarity_score) && (
                  <div className="mt-3 flex items-center space-x-4">
                    {session.audio_quality_score && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Qualidade do Áudio:</span>
                        <ProgressRing
                          progress={Math.round(session.audio_quality_score * 100)}
                          size={20}
                          color="#10b981"
                        />
                        <span className="text-xs text-gray-500">
                          {Math.round(session.audio_quality_score * 100)}%
                        </span>
                      </div>
                    )}
                    
                    {session.speech_clarity_score && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Clareza da Fala:</span>
                        <ProgressRing
                          progress={Math.round(session.speech_clarity_score * 100)}
                          size={20}
                          color="#3b82f6"
                        />
                        <span className="text-xs text-gray-500">
                          {Math.round(session.speech_clarity_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão encontrada</h3>
              <p>Comece uma nova gravação para ver suas sessões aqui</p>
            </div>
          )}
        </div>
      </ModernCard>
    </ModernLayout>
  );
};

export default VoiceSessionsDashboard;
