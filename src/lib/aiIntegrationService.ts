import apiService from './api';

export interface AIAnalysisSession {
  id: string;
  consultation_id?: string;
  doctor_id: string;
  patient_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_file_url?: string;
  transcription?: string;
  analysis_results?: {
    clinical_summary: string;
    diagnostic_hypotheses: Array<{
      diagnosis: string;
      confidence: number;
      icd_code?: string;
    }>;
    exam_suggestions: Array<{
      exam: string;
      reason: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    treatment_suggestions: Array<{
      treatment: string;
      dosage?: string;
      duration?: string;
      notes?: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  id: string;
  session_id: string;
  analysis_type: 'transcription' | 'clinical_summary' | 'diagnosis' | 'treatment';
  input_text: string;
  output_text: string;
  confidence_score?: number;
  processing_time: number;
  model_used: string;
  created_at: string;
}

export interface AIConfiguration {
  id: string;
  tenant_id: string;
  provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  api_key: string;
  model_transcription: string;
  model_analysis: string;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  analysis_style: 'clinical' | 'detailed' | 'concise';
  features_enabled: {
    transcription: boolean;
    clinical_summary: boolean;
    diagnosis_suggestions: boolean;
    exam_suggestions: boolean;
    treatment_suggestions: boolean;
  };
  quality_settings: {
    max_audio_duration: number;
    audio_format: 'wav' | 'mp3' | 'm4a';
    transcription_accuracy: 'standard' | 'high';
  };
  privacy_settings: {
    auto_delete_audio: boolean;
    audio_retention_hours: number;
    encrypt_transcriptions: boolean;
    anonymize_data: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AIUsageAnalytics {
  total_sessions: number;
  successful_analyses: number;
  failed_analyses: number;
  average_processing_time: number;
  total_processing_time: number;
  cost_breakdown: {
    transcription_cost: number;
    analysis_cost: number;
    total_cost: number;
  };
  usage_by_feature: {
    transcription: number;
    clinical_summary: number;
    diagnosis_suggestions: number;
    exam_suggestions: number;
    treatment_suggestions: number;
  };
  monthly_stats: Array<{
    month: string;
    sessions: number;
    cost: number;
    processing_time: number;
  }>;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'transcription' | 'analysis' | 'diagnosis' | 'treatment';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class AIIntegrationService {
  // Analysis Sessions
  async getAnalysisSessions(params?: {
    doctor_id?: string;
    patient_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: AIAnalysisSession[]; total: number }> {
    const response = await apiService.api.get('/api/v1/ai-integration/sessions', { params });
    return response.data;
  }

  async getAnalysisSession(sessionId: string): Promise<AIAnalysisSession> {
    const response = await apiService.api.get(`/api/v1/ai-integration/sessions/${sessionId}`);
    return response.data;
  }

  async createAnalysisSession(data: {
    consultation_id?: string;
    doctor_id: string;
    patient_id: string;
  }): Promise<AIAnalysisSession> {
    const response = await apiService.api.post('/api/v1/ai-integration/sessions', data);
    return response.data;
  }

  async updateAnalysisSession(sessionId: string, data: Partial<AIAnalysisSession>): Promise<AIAnalysisSession> {
    const response = await apiService.api.put(`/api/v1/ai-integration/sessions/${sessionId}`, data);
    return response.data;
  }

  async deleteAnalysisSession(sessionId: string): Promise<void> {
    await apiService.api.delete(`/api/v1/ai-integration/sessions/${sessionId}`);
  }

  // Analysis Actions
  async startAnalysis(sessionId: string, audioFile: File): Promise<AIAnalysisSession> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    const response = await apiService.api.post(`/api/v1/ai-integration/sessions/${sessionId}/start`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAnalysisProgress(sessionId: string): Promise<{
    status: string;
    progress: number;
    current_step: string;
    estimated_completion?: string;
  }> {
    const response = await apiService.api.get(`/api/v1/ai-integration/sessions/${sessionId}/progress`);
    return response.data;
  }

  async getAnalysisResults(sessionId: string): Promise<AIAnalysisSession> {
    const response = await apiService.api.get(`/api/v1/ai-integration/sessions/${sessionId}/results`);
    return response.data;
  }

  // Individual Analyses
  async getAnalyses(sessionId: string): Promise<AIAnalysis[]> {
    const response = await apiService.api.get(`/api/v1/ai-integration/sessions/${sessionId}/analyses`);
    return response.data;
  }

  async getAnalysis(analysisId: string): Promise<AIAnalysis> {
    const response = await apiService.api.get(`/api/v1/ai-integration/analyses/${analysisId}`);
    return response.data;
  }

  // Configuration
  async getConfiguration(): Promise<AIConfiguration> {
    const response = await apiService.api.get('/api/v1/ai-integration/configuration');
    return response.data;
  }

  async updateConfiguration(data: Partial<AIConfiguration>): Promise<AIConfiguration> {
    const response = await apiService.api.put('/api/v1/ai-integration/configuration', data);
    return response.data;
  }

  async testConfiguration(): Promise<{
    success: boolean;
    message: string;
    test_results?: {
      transcription_test: boolean;
      analysis_test: boolean;
      api_connectivity: boolean;
    };
  }> {
    const response = await apiService.api.post('/api/v1/ai-integration/configuration/test');
    return response.data;
  }

  // Analytics
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    doctor_id?: string;
  }): Promise<AIUsageAnalytics> {
    const response = await apiService.api.get('/api/v1/ai-integration/analytics', { params });
    return response.data;
  }

  // Prompt Templates
  async getPromptTemplates(category?: string): Promise<AIPromptTemplate[]> {
    const params = category ? { category } : {};
    const response = await apiService.api.get('/api/v1/ai-integration/prompt-templates', { params });
    return response.data;
  }

  async getPromptTemplate(templateId: string): Promise<AIPromptTemplate> {
    const response = await apiService.api.get(`/api/v1/ai-integration/prompt-templates/${templateId}`);
    return response.data;
  }

  async createPromptTemplate(data: Omit<AIPromptTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AIPromptTemplate> {
    const response = await apiService.api.post('/api/v1/ai-integration/prompt-templates', data);
    return response.data;
  }

  async updatePromptTemplate(templateId: string, data: Partial<AIPromptTemplate>): Promise<AIPromptTemplate> {
    const response = await apiService.api.put(`/api/v1/ai-integration/prompt-templates/${templateId}`, data);
    return response.data;
  }

  async deletePromptTemplate(templateId: string): Promise<void> {
    await apiService.api.delete(`/api/v1/ai-integration/prompt-templates/${templateId}`);
  }

  // Utility Methods
  async validateAudioFile(file: File): Promise<{
    valid: boolean;
    message?: string;
    duration?: number;
    format?: string;
  }> {
    const formData = new FormData();
    formData.append('audio_file', file);

    const response = await apiService.api.post('/api/v1/ai-integration/validate-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getSupportedFormats(): Promise<{
    audio_formats: string[];
    max_file_size: number;
    max_duration: number;
  }> {
    const response = await apiService.api.get('/api/v1/ai-integration/supported-formats');
    return response.data;
  }

  // Real-time Analysis (WebSocket-like polling)
  async pollAnalysisStatus(sessionId: string): Promise<AIAnalysisSession> {
    const response = await apiService.api.get(`/api/v1/ai-integration/sessions/${sessionId}/status`);
    return response.data;
  }

  // Export/Import
  async exportAnalysisData(sessionId: string): Promise<Blob> {
    const response = await apiService.api.get(`/api/v1/ai-integration/sessions/${sessionId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importAnalysisData(file: File): Promise<{
    imported_sessions: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.api.post('/api/v1/ai-integration/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const aiIntegrationService = new AIIntegrationService();
export default aiIntegrationService;
