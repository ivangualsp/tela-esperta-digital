
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Modo de desenvolvimento para testes
const isDev = import.meta.env.MODE === 'development';
const useDevFallbackData = isDev;

export const useDeviceActivity = () => {
  // Função para atualizar a atividade do dispositivo
  const updateDeviceActivity = useCallback(async (deviceId: string) => {
    try {
      // No modo de desenvolvimento, simulamos a atualização
      if (useDevFallbackData && isDev && deviceId === 'dev-device-id') {
        console.log('Modo de desenvolvimento: simulando atualização de atividade');
        return;
      }
      
      const { error } = await supabase
        .from('devices')
        .update({ last_active: new Date().toISOString() })
        .eq('id', deviceId);
      
      if (error) {
        console.error('Erro ao atualizar atividade do dispositivo:', error);
      } else {
        console.log('Atividade do dispositivo atualizada com sucesso');
      }
    } catch (error) {
      console.error('Exceção ao atualizar atividade do dispositivo:', error);
    }
  }, []);

  return {
    updateDeviceActivity
  };
};
