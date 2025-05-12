
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Modo de desenvolvimento para testes
const isDev = import.meta.env.MODE === 'development';
const useDevFallbackData = isDev;

export const useDevice = () => {
  // Função para buscar dispositivo pelo token
  const fetchDeviceByToken = useCallback(async (tokenValue: string) => {
    try {
      console.log('Buscando dispositivo pelo token:', tokenValue);
      
      if (!tokenValue || tokenValue.trim() === '') {
        console.error('Token inválido ou vazio');
        return null;
      }

      // Imprimindo informações detalhadas para debug
      console.log('URL base Supabase:', supabase.getUrl());
      
      // Usando a consulta correta para o Supabase
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('token', tokenValue.trim())
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar dispositivo:', error);
        toast.error('Erro ao buscar dispositivo');
        return null;
      }
      
      // Log detalhado para depuração
      console.log('Resposta da consulta:', data);
      
      // Verificar se encontramos um resultado
      if (!data) {
        console.log('Nenhum dispositivo encontrado para o token:', tokenValue);
        
        // Em modo de desenvolvimento, criar um dispositivo de teste se necessário
        if (useDevFallbackData && isDev) {
          console.log('Modo de desenvolvimento: criando dispositivo de teste');
          const devDevice = {
            id: 'dev-device-id',
            name: 'Dispositivo de Teste',
            description: 'Criado automaticamente para desenvolvimento',
            token: tokenValue,
            playlist_id: 'dev-playlist-id',
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Em produção, aqui criaríamos o dispositivo no Supabase
          // Por enquanto, apenas retornamos o dispositivo simulado
          return devDevice;
        }
        
        return null;
      }
      
      // Retornar o dispositivo encontrado
      console.log('Dispositivo encontrado:', data);
      return data;
    } catch (error) {
      console.error('Exceção ao buscar dispositivo:', error);
      toast.error('Erro ao conectar com o servidor');
      return null;
    }
  }, []);

  return {
    fetchDeviceByToken
  };
};
