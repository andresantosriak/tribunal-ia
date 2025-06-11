
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Send, FileText } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import ActionButton from '@/components/ActionButtons';

const NewPetition = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { insertItem: insertCase } = useSupabaseData({
    table: 'casos',
    autoLoad: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitError) {
      setSubmitError(null);
    }
  };

  const getFormProgress = () => {
    let completed = 0;
    if (formData.titulo.trim()) completed++;
    if (formData.categoria) completed++;
    if (formData.descricao.trim()) completed++;
    return (completed / 3) * 100;
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      setSubmitError('Título é obrigatório');
      return false;
    }
    if (formData.titulo.length < 5) {
      setSubmitError('Título deve ter pelo menos 5 caracteres');
      return false;
    }
    if (!formData.categoria) {
      setSubmitError('Categoria é obrigatória');
      return false;
    }
    if (!formData.descricao.trim()) {
      setSubmitError('Descrição é obrigatória');
      return false;
    }
    if (formData.descricao.length < 20) {
      setSubmitError('Descrição deve ter pelo menos 20 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      setSubmitError('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Gerar ID único para o caso
      const casoId = `CASO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Preparar dados do caso
      const casoData = {
        caso_id: casoId,
        texto_original: `${formData.titulo}\n\nCategoria: ${formData.categoria}\n\n${formData.descricao}`,
        usuario_id: user.id,
        status: 'processando'
      };

      // Inserir caso
      const result = await insertCase(casoData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao salvar caso');
      }

      console.log('Caso criado com sucesso:', result.data);

      // Sucesso
      setSubmitSuccess(true);
      setFormData({ titulo: '', descricao: '', categoria: '' });
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error('Erro no envio:', error);
      setSubmitError(error.message || 'Erro inesperado ao enviar petição');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.titulo.trim() && 
                     formData.descricao.trim() && 
                     formData.categoria;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Nova Petição</CardTitle>
            <CardDescription>
              Envie sua petição para análise jurídica com IA
            </CardDescription>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progresso do formulário</span>
            <span>{Math.round(getFormProgress())}%</span>
          </div>
          <Progress value={getFormProgress()} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título da Petição *
              <span className="text-xs text-muted-foreground ml-2">
                ({formData.titulo.length}/100)
              </span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ex: Revisão de contrato de aluguel"
              disabled={isSubmitting}
              maxLength={100}
              className={submitError && !formData.titulo.trim() ? 'border-red-500' : ''}
            />
            {formData.titulo.length > 0 && formData.titulo.length < 5 && (
              <p className="text-xs text-orange-600">
                Título muito curto. Mínimo 5 caracteres.
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => handleInputChange('categoria', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={submitError && !formData.categoria ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="civil">Direito Civil</SelectItem>
                <SelectItem value="trabalhista">Direito Trabalhista</SelectItem>
                <SelectItem value="penal">Direito Penal</SelectItem>
                <SelectItem value="consumidor">Direito do Consumidor</SelectItem>
                <SelectItem value="familia">Direito de Família</SelectItem>
                <SelectItem value="tributario">Direito Tributário</SelectItem>
                <SelectItem value="administrativo">Direito Administrativo</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição do Caso *
              <span className="text-xs text-muted-foreground ml-2">
                ({formData.descricao.length}/2000)
              </span>
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva detalhadamente sua situação jurídica. Inclua fatos relevantes, datas importantes, documentos envolvidos e o que você espera como resultado..."
              rows={8}
              disabled={isSubmitting}
              maxLength={2000}
              className={`resize-none ${submitError && !formData.descricao.trim() ? 'border-red-500' : ''}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {formData.descricao.length < 20 ? 
                  `Mínimo 20 caracteres (faltam ${20 - formData.descricao.length})` : 
                  'Descrição adequada ✓'
                }
              </span>
              <span>
                Recomendado: 50-500 caracteres
              </span>
            </div>
          </div>

          {/* Mensagens de Status */}
          {submitError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Erro ao enviar petição</p>
                <p className="text-sm">{submitError}</p>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Petição enviada com sucesso!</p>
                <p className="text-sm">
                  Sua petição foi recebida e será analisada em breve. 
                  Você pode acompanhar o progresso na aba "Histórico de Casos".
                </p>
              </div>
            </div>
          )}

          {/* Botão Submit */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p>* Campos obrigatórios</p>
              <p>Tempo estimado de análise: 2-4 horas</p>
            </div>
            
            <ActionButton
              action="send"
              onClick={handleSubmit}
              disabled={!isFormValid}
              isLoading={isSubmitting}
              className="w-full sm:w-auto min-w-[160px]"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar para Análise'}
            </ActionButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewPetition;
