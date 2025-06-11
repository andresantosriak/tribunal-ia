
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PetitionData {
  texto: string;
  casoId?: string;
}

export const useNewPetition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();

  const submitPetition = async (petitionData: PetitionData) => {
    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    
    try {
      // Gerar ID único para o caso
      const casoId = petitionData.casoId || `CASO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Enviando petição:', { casoId, userId: userProfile.id });

      // Inserir novo caso
      const { data: newCase, error: caseError } = await supabase
        .from('casos')
        .insert([
          {
            caso_id: casoId,
            texto_original: petitionData.texto,
            usuario_id: userProfile.id,
            status: 'processando',
          }
        ])
        .select()
        .single();

      if (caseError) {
        console.error('Erro ao inserir caso:', caseError);
        throw new Error('Erro ao salvar petição no banco de dados');
      }

      console.log('Caso criado:', newCase);

      // Atualizar contador de petições do usuário
      try {
        const { error: userError } = await supabase
          .from('usuarios')
          .update({ 
            peticoes_usadas: (userProfile.peticoes_usadas || 0) + 1 
          })
          .eq('id', userProfile.id);

        if (userError) {
          console.warn('Erro ao atualizar contador de petições:', userError);
        }
      } catch (updateError) {
        console.warn('Erro ao atualizar usuário:', updateError);
      }

      // Simular envio para webhook (aqui você integraria com n8n)
      try {
        // const webhookUrl = 'YOUR_WEBHOOK_URL';
        // await fetch(webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ 
        //     caso_id: casoId,
        //     texto: petitionData.texto,
        //     user_id: userProfile.id
        //   })
        // });
        console.log('Webhook seria chamado aqui para o caso:', casoId);
      } catch (webhookError) {
        console.warn('Erro no webhook:', webhookError);
      }

      toast({
        title: "Petição enviada com sucesso!",
        description: `Caso ${casoId} está sendo processado`,
      });

      return { success: true, casoId, case: newCase };

    } catch (error: any) {
      console.error('Erro ao enviar petição:', error);
      
      toast({
        title: "Erro ao enviar petição",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitPetition,
    isLoading
  };
};
