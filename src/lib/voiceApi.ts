import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Voice Processing Module
export interface VoiceSession {
  id: number;
  session_id: string;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'error';
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  audio_file_path?: string;
  audio_file_size?: number;
  audio_format: string;
  sample_rate: number;
  channels: number;
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_text?: string;
  transcription_confidence?: number;
  transcription_language: string;
  clinical_context?: string;
  medical_specialty?: string;
  session_type: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_errors?: Record<string, any>;
  audio_quality_score?: number;
  background_noise_level?: number;
  speech_clarity_score?: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface VoiceTranscription {
  id: number;
  session_id: number;
  segment_number: number;
  start_time_seconds: number;
  end_time_seconds: number;
  duration_seconds: number;
  original_text: string;
  corrected_text?: string;
  confidence_score?: number;
  transcription_engine: string;
  language_detected?: string;
  processing_time_seconds?: number;
  medical_terms_detected?: string[];
  drug_names_detected?: string[];
  anatomical_terms_detected?: string[];
  audio_quality_segment?: number;
  speech_clarity_segment?: number;
  created_at: string;
  updated_at?: string;
}

export interface ClinicalVoiceNote {
  id: number;
  session_id: number;
  note_type: string;
  title: string;
  content: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  physical_examination?: string;
  assessment_and_plan?: string;
  medications?: string[];
  diagnoses?: string[];
  ai_processed: boolean;
  ai_confidence_score?: number;
  ai_suggestions?: Record<string, any>;
  medical_entities_extracted?: Record<string, any>;
  reviewed_by_doctor: boolean;
  reviewed_at?: string;
  approved_by_doctor: boolean;
  approved_at?: string;
  doctor_notes?: string;
  integrated_to_medical_record: boolean;
  medical_record_id?: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface VoiceProcessingJob {
  id: number;
  job_id: string;
  session_id: number;
  job_type: string;
  status: string;
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  parameters?: Record<string, any>;
  result_data?: Record<string, any>;
  error_message?: string;
  processing_engine?: string;
  processing_time_seconds?: number;
  resource_usage?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface VoiceSessionStartRequest {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  clinical_context?: string;
  medical_specialty?: string;
  session_type: string;
  transcription_language: string;
}

export interface VoiceSessionStartResponse {
  session_id: string;
  status: string;
  message: string;
}

export interface VoiceTranscriptionRequest {
  session_id: string;
  transcription_engine: string;
  language?: string;
  enable_medical_terminology: boolean;
  enable_drug_detection: boolean;
  enable_anatomical_detection: boolean;
}

export interface VoiceTranscriptionResponse {
  success: boolean;
  message: string;
  transcription_id?: string;
  estimated_processing_time?: number;
}

export interface VoiceNoteGenerationRequest {
  session_id: string;
  note_type: string;
  include_ai_analysis: boolean;
  auto_extract_entities: boolean;
  generate_suggestions: boolean;
}

export interface VoiceNoteGenerationResponse {
  success: boolean;
  message: string;
  note_id?: number;
  estimated_processing_time?: number;
}

export interface VoiceSessionEndRequest {
  session_id: string;
  auto_transcribe: boolean;
  auto_generate_note: boolean;
}

export interface VoiceSessionEndResponse {
  success: boolean;
  message: string;
  session_duration?: number;
  transcription_job_id?: string;
  note_generation_job_id?: string;
}

export interface VoiceProcessingStatus {
  session_id: string;
  status: string;
  progress_percentage: number;
  current_step: string;
  estimated_completion_time?: number;
  error_message?: string;
}

export interface VoiceDashboardStats {
  active_sessions: number;
  total_sessions_today: number;
  total_duration_today_minutes: number;
  average_session_duration_minutes: number;
  transcription_success_rate: number;
  average_audio_quality: number;
  pending_transcriptions: number;
  completed_notes_today: number;
  most_active_doctors: Array<{
    doctor_id: number;
    doctor_name: string;
    session_count: number;
  }>;
  recent_sessions: Array<{
    session_id: string;
    patient_id: number;
    status: string;
    created_at: string;
  }>;
}

export interface VoiceAnalyticsSummary {
  total_sessions: number;
  total_duration_hours: number;
  total_transcriptions: number;
  total_notes_generated: number;
  average_audio_quality: number;
  average_transcription_confidence: number;
  error_rate: number;
  most_used_specialties: Array<{
    specialty: string;
    count: number;
  }>;
  usage_trends: Array<{
    date: string;
    sessions: number;
    duration: number;
  }>;
  quality_metrics: Record<string, any>;
}

// Voice API Service
class VoiceApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 120000, // Increased timeout for voice processing
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

  // Voice Session Management
  async startVoiceSession(request: VoiceSessionStartRequest): Promise<VoiceSessionStartResponse> {
    const response = await this.api.post('/api/v1/voice/sessions/start', request);
    return response.data;
  }

  async uploadAudioToSession(sessionId: string, audioFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    const response = await this.api.post(`/api/v1/voice/sessions/${sessionId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async transcribeSessionAudio(sessionId: string, request: VoiceTranscriptionRequest): Promise<VoiceTranscriptionResponse> {
    const response = await this.api.post(`/api/v1/voice/sessions/${sessionId}/transcribe`, request);
    return response.data;
  }

  async generateClinicalNote(sessionId: string, request: VoiceNoteGenerationRequest): Promise<VoiceNoteGenerationResponse> {
    const response = await this.api.post(`/api/v1/voice/sessions/${sessionId}/generate-note`, request);
    return response.data;
  }

  async endVoiceSession(sessionId: string, request: VoiceSessionEndRequest): Promise<VoiceSessionEndResponse> {
    const response = await this.api.post(`/api/v1/voice/sessions/${sessionId}/end`, request);
    return response.data;
  }

  async getVoiceSessions(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    patient_id?: number;
  }): Promise<VoiceSession[]> {
    const response = await this.api.get('/api/v1/voice/sessions', { params });
    return response.data;
  }

  async getVoiceSession(sessionId: string): Promise<VoiceSession> {
    const response = await this.api.get(`/api/v1/voice/sessions/${sessionId}`);
    return response.data;
  }

  async getVoiceSessionStatus(sessionId: string): Promise<VoiceProcessingStatus> {
    const response = await this.api.get(`/api/v1/voice/sessions/${sessionId}/status`);
    return response.data;
  }

  // Voice Transcription Management
  async getVoiceTranscriptions(params?: {
    skip?: number;
    limit?: number;
    session_id?: string;
  }): Promise<VoiceTranscription[]> {
    const response = await this.api.get('/api/v1/voice/transcriptions', { params });
    return response.data;
  }

  async getVoiceTranscription(transcriptionId: number): Promise<VoiceTranscription> {
    const response = await this.api.get(`/api/v1/voice/transcriptions/${transcriptionId}`);
    return response.data;
  }

  // Clinical Voice Note Management
  async getClinicalVoiceNotes(params?: {
    skip?: number;
    limit?: number;
    session_id?: string;
    note_type?: string;
  }): Promise<ClinicalVoiceNote[]> {
    const response = await this.api.get('/api/v1/voice/notes', { params });
    return response.data;
  }

  async getClinicalVoiceNote(noteId: number): Promise<ClinicalVoiceNote> {
    const response = await this.api.get(`/api/v1/voice/notes/${noteId}`);
    return response.data;
  }

  async reviewClinicalVoiceNote(noteId: number, approved: boolean, doctorNotes?: string): Promise<ClinicalVoiceNote> {
    const response = await this.api.put(`/api/v1/voice/notes/${noteId}/review`, {
      approved,
      doctor_notes: doctorNotes
    });
    return response.data;
  }

  // Voice Processing Job Management
  async getVoiceProcessingJobs(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    job_type?: string;
  }): Promise<VoiceProcessingJob[]> {
    const response = await this.api.get('/api/v1/voice/jobs', { params });
    return response.data;
  }

  async getVoiceProcessingJob(jobId: string): Promise<VoiceProcessingJob> {
    const response = await this.api.get(`/api/v1/voice/jobs/${jobId}`);
    return response.data;
  }

  // Analytics and Dashboard
  async getVoiceDashboard(): Promise<VoiceDashboardStats> {
    const response = await this.api.get('/api/v1/voice/dashboard');
    return response.data;
  }

  async getVoiceAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<VoiceAnalyticsSummary> {
    const response = await this.api.get('/api/v1/voice/analytics', { params });
    return response.data;
  }

  // Utility methods
  async waitForTranscriptionCompletion(sessionId: string, maxWaitTime: number = 300000): Promise<VoiceSession> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const session = await this.getVoiceSession(sessionId);
      
      if (session.transcription_status === 'completed') {
        return session;
      } else if (session.transcription_status === 'failed') {
        throw new Error('Transcription failed');
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Transcription timeout');
  }

  async waitForNoteGenerationCompletion(noteId: number, maxWaitTime: number = 300000): Promise<ClinicalVoiceNote> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const note = await this.getClinicalVoiceNote(noteId);
      
      if (note.ai_processed) {
        return note;
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Note generation timeout');
  }

  // Audio recording utilities
  async startAudioRecording(): Promise<MediaRecorder> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      return mediaRecorder;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw new Error('Failed to start audio recording. Please check microphone permissions.');
    }
  }

  async stopAudioRecording(mediaRecorder: MediaRecorder): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        resolve(blob);
      };
      
      mediaRecorder.onerror = (error) => {
        reject(error);
      };
      
      mediaRecorder.stop();
    });
  }

  async convertAudioToWav(audioBlob: Blob): Promise<Blob> {
    // This is a simplified conversion - in production, you'd use a proper audio conversion library
    // For now, we'll return the original blob
    return audioBlob;
  }

  // Quick start methods for common workflows
  async quickStartSession(patientId: number, doctorId: number, clinicalContext?: string): Promise<VoiceSessionStartResponse> {
    const request: VoiceSessionStartRequest = {
      patient_id: patientId,
      doctor_id: doctorId,
      clinical_context: clinicalContext,
      session_type: 'consultation',
      transcription_language: 'pt-BR'
    };
    
    return this.startVoiceSession(request);
  }

  async quickTranscribe(sessionId: string): Promise<VoiceTranscriptionResponse> {
    const request: VoiceTranscriptionRequest = {
      session_id: sessionId,
      transcription_engine: 'whisper',
      language: 'pt-BR',
      enable_medical_terminology: true,
      enable_drug_detection: true,
      enable_anatomical_detection: true
    };
    
    return this.transcribeSessionAudio(sessionId, request);
  }

  async quickGenerateNote(sessionId: string): Promise<VoiceNoteGenerationResponse> {
    const request: VoiceNoteGenerationRequest = {
      session_id: sessionId,
      note_type: 'progress_note',
      include_ai_analysis: true,
      auto_extract_entities: true,
      generate_suggestions: true
    };
    
    return this.generateClinicalNote(sessionId, request);
  }

  async quickEndSession(sessionId: string, autoTranscribe: boolean = true, autoGenerateNote: boolean = false): Promise<VoiceSessionEndResponse> {
    const request: VoiceSessionEndRequest = {
      session_id: sessionId,
      auto_transcribe: autoTranscribe,
      auto_generate_note: autoGenerateNote
    };
    
    return this.endVoiceSession(sessionId, request);
  }
}

// Export singleton instance
export const voiceApiService = new VoiceApiService();
export default voiceApiService;
