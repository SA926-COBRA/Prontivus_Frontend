import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for AI Integration Module
export interface AIConfiguration {
  id: number;
  configuration_name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
  api_endpoint?: string;
  api_key?: string;
  model_name: string;
  model_version?: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  task_type: 'pre_consultation_summary' | 'medical_transcription' | 'clinical_notes' | 'diagnosis_suggestion' | 'treatment_recommendation' | 'drug_interaction_check' | 'medical_qa' | 'document_analysis';
  prompt_template: string;
  system_prompt?: string;
  timeout_seconds: number;
  retry_count: number;
  batch_size: number;
  cost_per_token?: number;
  is_active: boolean;
  last_used?: string;
  usage_count: number;
  success_count: number;
  failure_count: number;
  average_response_time?: number;
  total_cost: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface AIProcessingJob {
  id: number;
  job_id: string;
  configuration_id: number;
  task_type: 'pre_consultation_summary' | 'medical_transcription' | 'clinical_notes' | 'diagnosis_suggestion' | 'treatment_recommendation' | 'drug_interaction_check' | 'medical_qa' | 'document_analysis';
  input_data: Record<string, any>;
  input_text?: string;
  input_metadata?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  processing_time_seconds?: number;
  output_data?: Record<string, any>;
  output_text?: string;
  confidence_score?: number;
  error_message?: string;
  tokens_used?: number;
  cost?: number;
  patient_id?: number;
  doctor_id?: number;
  appointment_id?: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface PreConsultationSummary {
  id: number;
  summary_id: string;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  processing_job_id?: number;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  medications?: string;
  allergies?: string;
  social_history?: string;
  family_history?: string;
  review_of_systems?: string;
  risk_factors?: Record<string, any>;
  potential_diagnoses?: Record<string, any>;
  recommended_tests?: Record<string, any>;
  clinical_notes?: string;
  confidence_score?: number;
  status: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface MedicalTranscription {
  id: number;
  transcription_id: string;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  processing_job_id?: number;
  audio_file_path?: string;
  audio_duration_seconds?: number;
  audio_quality?: string;
  raw_transcription?: string;
  cleaned_transcription?: string;
  structured_transcription?: Record<string, any>;
  speaker_identification?: Record<string, any>;
  medical_terms?: Record<string, any>;
  key_phrases?: Record<string, any>;
  sentiment_analysis?: Record<string, any>;
  confidence_score?: number;
  status: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ClinicalNotes {
  id: number;
  notes_id: string;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  processing_job_id?: number;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis_suggestions?: Record<string, any>;
  treatment_recommendations?: Record<string, any>;
  follow_up_notes?: string;
  risk_assessment?: Record<string, any>;
  confidence_score?: number;
  status: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface AIUsageLog {
  id: number;
  configuration_id: number;
  processing_job_id?: number;
  user_id?: number;
  task_type: 'pre_consultation_summary' | 'medical_transcription' | 'clinical_notes' | 'diagnosis_suggestion' | 'treatment_recommendation' | 'drug_interaction_check' | 'medical_qa' | 'document_analysis';
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  cost?: number;
  cost_per_token?: number;
  metadata?: Record<string, any>;
  request_timestamp: string;
}

export interface AIModel {
  id: number;
  model_name: string;
  model_version?: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
  model_type: string;
  model_size?: string;
  capabilities?: Record<string, any>;
  accuracy_score?: number;
  response_time_ms?: number;
  cost_per_token?: number;
  max_tokens?: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time?: number;
  is_active: boolean;
  is_deprecated: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AIFeedback {
  id: number;
  processing_job_id: number;
  user_id: number;
  feedback_type: string;
  rating?: number;
  feedback_text?: string;
  suggestions?: string;
  content_quality?: string;
  accuracy_rating?: number;
  relevance_rating?: number;
  completeness_rating?: number;
  created_at: string;
  updated_at?: string;
}

// Request/Response types
export interface AIProcessingRequest {
  configuration_id: number;
  task_type: 'pre_consultation_summary' | 'medical_transcription' | 'clinical_notes' | 'diagnosis_suggestion' | 'treatment_recommendation' | 'drug_interaction_check' | 'medical_qa' | 'document_analysis';
  input_data: Record<string, any>;
  input_text?: string;
  input_metadata?: Record<string, any>;
  patient_id?: number;
  doctor_id?: number;
  appointment_id?: number;
}

export interface PreConsultationSummaryRequest {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  patient_data: Record<string, any>;
  medical_history?: Record<string, any>;
  current_symptoms?: Record<string, any>;
}

export interface MedicalTranscriptionRequest {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  audio_file_path: string;
  audio_metadata?: Record<string, any>;
}

export interface ClinicalNotesRequest {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  consultation_data: Record<string, any>;
  patient_interview?: Record<string, any>;
}

export interface AIUsageSearchRequest {
  configuration_id?: number;
  user_id?: number;
  task_type?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface AISummary {
  total_configurations: number;
  active_configurations: number;
  total_processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  total_usage: number;
  total_cost: number;
  average_response_time: number;
  success_rate: number;
}

export interface AIAnalytics {
  total_configurations: number;
  active_configurations: number;
  configurations_by_provider: Record<string, number>;
  configurations_by_task_type: Record<string, number>;
  processing_job_statistics: Record<string, number>;
  usage_statistics: Record<string, number>;
  cost_statistics: Record<string, number>;
  performance_metrics: Record<string, number>;
  model_performance: Record<string, number>;
  user_feedback: Record<string, number>;
}

// AI Integration API Service
class AIIntegrationApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 120000, // Increased timeout for AI processing
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // AI Configuration methods
  async getAIConfigurations(params?: {
    skip?: number;
    limit?: number;
    provider?: string;
    task_type?: string;
    is_active?: boolean;
  }): Promise<AIConfiguration[]> {
    const response = await this.api.get('/api/v1/ai-integration/configurations', { params });
    return response.data;
  }

  async getAIConfiguration(id: number): Promise<AIConfiguration> {
    const response = await this.api.get(`/api/v1/ai-integration/configurations/${id}`);
    return response.data;
  }

  async createAIConfiguration(configuration: Partial<AIConfiguration>): Promise<AIConfiguration> {
    const response = await this.api.post('/api/v1/ai-integration/configurations', configuration);
    return response.data;
  }

  async updateAIConfiguration(id: number, configuration: Partial<AIConfiguration>): Promise<AIConfiguration> {
    const response = await this.api.put(`/api/v1/ai-integration/configurations/${id}`, configuration);
    return response.data;
  }

  // AI Processing Job methods
  async getAIProcessingJobs(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    task_type?: string;
    patient_id?: number;
    doctor_id?: number;
  }): Promise<AIProcessingJob[]> {
    const response = await this.api.get('/api/v1/ai-integration/processing-jobs', { params });
    return response.data;
  }

  async getAIProcessingJob(id: number): Promise<AIProcessingJob> {
    const response = await this.api.get(`/api/v1/ai-integration/processing-jobs/${id}`);
    return response.data;
  }

  async createAIProcessingJob(request: AIProcessingRequest): Promise<AIProcessingJob> {
    const response = await this.api.post('/api/v1/ai-integration/processing-jobs', request);
    return response.data;
  }

  // Pre-Consultation Summary methods
  async getPreConsultationSummaries(params?: {
    skip?: number;
    limit?: number;
    patient_id?: number;
    doctor_id?: number;
    status?: string;
  }): Promise<PreConsultationSummary[]> {
    const response = await this.api.get('/api/v1/ai-integration/pre-consultation-summaries', { params });
    return response.data;
  }

  async getPreConsultationSummary(id: number): Promise<PreConsultationSummary> {
    const response = await this.api.get(`/api/v1/ai-integration/pre-consultation-summaries/${id}`);
    return response.data;
  }

  async generatePreConsultationSummary(request: PreConsultationSummaryRequest): Promise<PreConsultationSummary> {
    const response = await this.api.post('/api/v1/ai-integration/pre-consultation-summaries', request);
    return response.data;
  }

  async updatePreConsultationSummary(id: number, summary: Partial<PreConsultationSummary>): Promise<PreConsultationSummary> {
    const response = await this.api.put(`/api/v1/ai-integration/pre-consultation-summaries/${id}`, summary);
    return response.data;
  }

  // Medical Transcription methods
  async getMedicalTranscriptions(params?: {
    skip?: number;
    limit?: number;
    patient_id?: number;
    doctor_id?: number;
    status?: string;
  }): Promise<MedicalTranscription[]> {
    const response = await this.api.get('/api/v1/ai-integration/medical-transcriptions', { params });
    return response.data;
  }

  async getMedicalTranscription(id: number): Promise<MedicalTranscription> {
    const response = await this.api.get(`/api/v1/ai-integration/medical-transcriptions/${id}`);
    return response.data;
  }

  async processMedicalTranscription(request: MedicalTranscriptionRequest): Promise<MedicalTranscription> {
    const response = await this.api.post('/api/v1/ai-integration/medical-transcriptions', request);
    return response.data;
  }

  async updateMedicalTranscription(id: number, transcription: Partial<MedicalTranscription>): Promise<MedicalTranscription> {
    const response = await this.api.put(`/api/v1/ai-integration/medical-transcriptions/${id}`, transcription);
    return response.data;
  }

  // Clinical Notes methods
  async getClinicalNotes(params?: {
    skip?: number;
    limit?: number;
    patient_id?: number;
    doctor_id?: number;
    status?: string;
  }): Promise<ClinicalNotes[]> {
    const response = await this.api.get('/api/v1/ai-integration/clinical-notes', { params });
    return response.data;
  }

  async getClinicalNotesById(id: number): Promise<ClinicalNotes> {
    const response = await this.api.get(`/api/v1/ai-integration/clinical-notes/${id}`);
    return response.data;
  }

  async generateClinicalNotes(request: ClinicalNotesRequest): Promise<ClinicalNotes> {
    const response = await this.api.post('/api/v1/ai-integration/clinical-notes', request);
    return response.data;
  }

  async updateClinicalNotes(id: number, notes: Partial<ClinicalNotes>): Promise<ClinicalNotes> {
    const response = await this.api.put(`/api/v1/ai-integration/clinical-notes/${id}`, notes);
    return response.data;
  }

  // AI Usage Log methods
  async getAIUsageLogs(params?: AIUsageSearchRequest): Promise<AIUsageLog[]> {
    const response = await this.api.get('/api/v1/ai-integration/usage-logs', { params });
    return response.data;
  }

  // Summary and Analytics methods
  async getAISummary(): Promise<AISummary> {
    const response = await this.api.get('/api/v1/ai-integration/summary');
    return response.data;
  }

  async getAIAnalytics(): Promise<AIAnalytics> {
    const response = await this.api.get('/api/v1/ai-integration/analytics');
    return response.data;
  }

  // Utility methods
  async getActiveConfigurations(): Promise<AIConfiguration[]> {
    return this.getAIConfigurations({ is_active: true, limit: 100 });
  }

  async getConfigurationsByProvider(provider: string): Promise<AIConfiguration[]> {
    return this.getAIConfigurations({ provider, limit: 100 });
  }

  async getConfigurationsByTaskType(taskType: string): Promise<AIConfiguration[]> {
    return this.getAIConfigurations({ task_type: taskType, limit: 100 });
  }

  async getProcessingJobsByStatus(status: string): Promise<AIProcessingJob[]> {
    return this.getAIProcessingJobs({ status, limit: 100 });
  }

  async getProcessingJobsByTaskType(taskType: string): Promise<AIProcessingJob[]> {
    return this.getAIProcessingJobs({ task_type: taskType, limit: 100 });
  }

  async getPreConsultationSummariesByPatient(patientId: number): Promise<PreConsultationSummary[]> {
    return this.getPreConsultationSummaries({ patient_id: patientId, limit: 100 });
  }

  async getPreConsultationSummariesByDoctor(doctorId: number): Promise<PreConsultationSummary[]> {
    return this.getPreConsultationSummaries({ doctor_id: doctorId, limit: 100 });
  }

  async getMedicalTranscriptionsByPatient(patientId: number): Promise<MedicalTranscription[]> {
    return this.getMedicalTranscriptions({ patient_id: patientId, limit: 100 });
  }

  async getMedicalTranscriptionsByDoctor(doctorId: number): Promise<MedicalTranscription[]> {
    return this.getMedicalTranscriptions({ doctor_id: doctorId, limit: 100 });
  }

  async getClinicalNotesByPatient(patientId: number): Promise<ClinicalNotes[]> {
    return this.getClinicalNotes({ patient_id: patientId, limit: 100 });
  }

  async getClinicalNotesByDoctor(doctorId: number): Promise<ClinicalNotes[]> {
    return this.getClinicalNotes({ doctor_id: doctorId, limit: 100 });
  }

  // Quick access methods for common operations
  async getConfigurationByName(configurationName: string): Promise<AIConfiguration | null> {
    try {
      const configurations = await this.getAIConfigurations({ limit: 1 });
      return configurations.find(c => c.configuration_name === configurationName) || null;
    } catch (error) {
      return null;
    }
  }

  async getProcessingJobByJobId(jobId: string): Promise<AIProcessingJob | null> {
    try {
      const jobs = await this.getAIProcessingJobs({ limit: 1 });
      return jobs.find(j => j.job_id === jobId) || null;
    } catch (error) {
      return null;
    }
  }

  async getPreConsultationSummaryBySummaryId(summaryId: string): Promise<PreConsultationSummary | null> {
    try {
      const summaries = await this.getPreConsultationSummaries({ limit: 1 });
      return summaries.find(s => s.summary_id === summaryId) || null;
    } catch (error) {
      return null;
    }
  }

  async getMedicalTranscriptionByTranscriptionId(transcriptionId: string): Promise<MedicalTranscription | null> {
    try {
      const transcriptions = await this.getMedicalTranscriptions({ limit: 1 });
      return transcriptions.find(t => t.transcription_id === transcriptionId) || null;
    } catch (error) {
      return null;
    }
  }

  async getClinicalNotesByNotesId(notesId: string): Promise<ClinicalNotes | null> {
    try {
      const notes = await this.getClinicalNotes({ limit: 1 });
      return notes.find(n => n.notes_id === notesId) || null;
    } catch (error) {
      return null;
    }
  }

  // Validation methods
  async validateAIConfiguration(configuration: AIConfiguration): Promise<boolean> {
    try {
      // Check if configuration has required fields
      if (!configuration.configuration_name || !configuration.provider || !configuration.model_name) {
        return false;
      }

      // Check task type
      if (!configuration.task_type) {
        return false;
      }

      // Check prompt template
      if (!configuration.prompt_template) {
        return false;
      }

      // Check numeric values
      if (configuration.max_tokens < 1 || configuration.max_tokens > 100000) {
        return false;
      }

      if (configuration.temperature < 0 || configuration.temperature > 2) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validatePreConsultationSummaryRequest(request: PreConsultationSummaryRequest): Promise<boolean> {
    try {
      // Check if request has required fields
      if (!request.patient_id || !request.doctor_id) {
        return false;
      }

      // Check patient data
      if (!request.patient_data || typeof request.patient_data !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateMedicalTranscriptionRequest(request: MedicalTranscriptionRequest): Promise<boolean> {
    try {
      // Check if request has required fields
      if (!request.patient_id || !request.doctor_id || !request.audio_file_path) {
        return false;
      }

      // Check audio file path
      if (typeof request.audio_file_path !== 'string' || request.audio_file_path.trim() === '') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateClinicalNotesRequest(request: ClinicalNotesRequest): Promise<boolean> {
    try {
      // Check if request has required fields
      if (!request.patient_id || !request.doctor_id) {
        return false;
      }

      // Check consultation data
      if (!request.consultation_data || typeof request.consultation_data !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const aiIntegrationApiService = new AIIntegrationApiService();
export default aiIntegrationApiService;
