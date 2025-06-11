
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, FileText } from 'lucide-react';
import { useNewPetition } from '@/hooks/useNewPetition';
import { useAuth } from '@/contexts/AuthContext';

const NewPetition = () => {
  const [petitionText, setPetitionText] = useState('');
  const { submitPetition, isLoading } = useNewPetition();
  const { userProfile } = useAuth();

  const maxPeticoes = 5;
  const peticionesUsadas = userProfile?.peticoes_usadas || 0;
  const peticionesRestantes = maxPeticoes - peticionesUsadas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!petitionText.trim()) {
      return;
    }

    if (peticionesRestantes <= 0) {
      return;
    }

    const result = await submitPetition({
      texto: petitionText
    });

    if (result.success) {
      setPetitionText('');
      // Refresh page data here if needed
    }
  };

  return (
    <Card className="card-legal">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Nova Petição</span>
        </CardTitle>
        <CardDescription>
          Descreva o caso que deseja submeter ao Tribunal de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Descreva o caso jurídico que deseja analisar. Inclua fatos relevantes, evidências e questões legais envolvidas..."
            value={petitionText}
            onChange={(e) => setPetitionText(e.target.value)}
            rows={8}
            className="resize-none"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span>{petitionText.length} caracteres</span>
              <span className="ml-4">
                {peticionesRestantes} petições restantes de {maxPeticoes}
              </span>
            </div>
            
            <Button 
              type="submit" 
              className="btn-legal"
              disabled={isLoading || peticionesRestantes <= 0 || !petitionText.trim()}
            >
              {isLoading ? 'Enviando...' : 'Enviar para Análise'}
            </Button>
          </div>

          {peticionesRestantes === 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <p className="font-medium">Limite de petições atingido</p>
              <p>Entre em contato com o suporte para aumentar seu limite.</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default NewPetition;
