import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, TestTube, Shield, Video, Mic, Monitor } from 'lucide-react';
import { telemedicineService, TelemedicineConfiguration } from '@/lib/telemedicineService';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const TelemedicineConfiguration: React.FC = () => {
  const [config, setConfig] = useState<TelemedicineConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const configData = await telemedicineService.getConfiguration();
      setConfig(configData);
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      await telemedicineService.updateConfiguration(config);
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (config) {
      loadConfiguration();
      toast.info('Configurações restauradas');
    }
  };

  const updateConfig = (updates: Partial<TelemedicineConfiguration>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const updateQualitySettings = (updates: Partial<TelemedicineConfiguration['quality_settings']>) => {
    if (config) {
      setConfig({
        ...config,
        quality_settings: { ...config.quality_settings, ...updates }
      });
    }
  };

  const updateSecuritySettings = (updates: Partial<TelemedicineConfiguration['security_settings']>) => {
    if (config) {
      setConfig({
        ...config,
        security_settings: { ...config.security_settings, ...updates }
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando configurações...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!config) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Erro ao carregar configurações</p>
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
            <h1 className="text-3xl font-bold">Configurações de Telemedicina</h1>
            <p className="text-muted-foreground">
              Configure as opções de vídeo, áudio e segurança
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas das sessões de telemedicina
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-duration">Duração Máxima da Sessão (minutos)</Label>
                <Input
                  id="max-duration"
                  type="number"
                  value={config.max_session_duration}
                  onChange={(e) => updateConfig({ max_session_duration: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-end">Auto-finalizar após (minutos)</Label>
                <Input
                  id="auto-end"
                  type="number"
                  value={config.auto_end_after_minutes}
                  onChange={(e) => updateConfig({ auto_end_after_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-participants">Máximo de Participantes</Label>
                <Input
                  id="max-participants"
                  type="number"
                  value={config.max_participants}
                  onChange={(e) => updateConfig({ max_participants: parseInt(e.target.value) || 2 })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Gravação Habilitada</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir gravação das sessões
                  </p>
                </div>
                <Switch
                  checked={config.recording_enabled}
                  onCheckedChange={(checked) => updateConfig({ recording_enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-days">Retenção de Gravações (dias)</Label>
                <Input
                  id="retention-days"
                  type="number"
                  value={config.recording_retention_days}
                  onChange={(e) => updateConfig({ recording_retention_days: parseInt(e.target.value) || 30 })}
                  disabled={!config.recording_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consentimento Obrigatório</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir consentimento antes de iniciar
                  </p>
                </div>
                <Switch
                  checked={config.require_consent}
                  onCheckedChange={(checked) => updateConfig({ require_consent: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Qualidade de Vídeo e Áudio
              </CardTitle>
              <CardDescription>
                Configure a qualidade da transmissão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-resolution">Resolução de Vídeo</Label>
                <Select
                  value={config.quality_settings.video_resolution}
                  onValueChange={(value: '720p' | '1080p' | 'auto') => 
                    updateQualitySettings({ video_resolution: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio-quality">Qualidade de Áudio</Label>
                <Select
                  value={config.quality_settings.audio_quality}
                  onValueChange={(value: 'standard' | 'high') => 
                    updateQualitySettings({ audio_quality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="high">Alta Qualidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bandwidth-limit">Limite de Largura de Banda (Mbps)</Label>
                <Input
                  id="bandwidth-limit"
                  type="number"
                  value={config.quality_settings.bandwidth_limit}
                  onChange={(e) => updateQualitySettings({ bandwidth_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure as opções de segurança e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação Obrigatória</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir login para participar
                  </p>
                </div>
                <Switch
                  checked={config.security_settings.require_authentication}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ require_authentication: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartilhamento de Tela</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir compartilhamento de tela
                  </p>
                </div>
                <Switch
                  checked={config.security_settings.allow_screen_sharing}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ allow_screen_sharing: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartilhamento de Arquivos</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir envio de arquivos no chat
                  </p>
                </div>
                <Switch
                  checked={config.security_settings.allow_file_sharing}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ allow_file_sharing: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Criptografar Gravações</Label>
                  <p className="text-sm text-muted-foreground">
                    Criptografar arquivos de gravação
                  </p>
                </div>
                <Switch
                  checked={config.security_settings.encrypt_recordings}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ encrypt_recordings: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Teste de Conexão
              </CardTitle>
              <CardDescription>
                Teste a qualidade da conexão de vídeo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Teste sua conexão de vídeo e áudio antes de iniciar uma consulta.
                </p>
                
                <Button className="w-full" variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Iniciar Teste de Conexão
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>• Verifique sua câmera e microfone</p>
                  <p>• Teste a qualidade de vídeo</p>
                  <p>• Confirme a estabilidade da conexão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TelemedicineConfiguration;
