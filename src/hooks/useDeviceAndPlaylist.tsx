
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type DevicePlaylistHookResult = {
  device: any | null;
  playlist: any | null;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
  fetchDeviceByToken: (token: string) => Promise<any | null>;
  fetchPlaylistById: (playlistId: string) => Promise<any | null>;
  updateDeviceActivity: (deviceId: string) => Promise<void>;
  handleManualRefresh: () => void;
};

// Modo de desenvolvimento para testes
const isDev = import.meta.env.MODE === 'development';
const useDevFallbackData = isDev;

export const useDeviceAndPlaylist = (token: string | undefined): DevicePlaylistHookResult => {
  const [device, setDevice] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Função para buscar dispositivo pelo token
  const fetchDeviceByToken = useCallback(async (tokenValue: string) => {
    try {
      console.log('Buscando dispositivo pelo token:', tokenValue);
      
      if (!tokenValue || tokenValue.trim() === '') {
        console.error('Token inválido ou vazio');
        return null;
      }

      // Imprimindo a URL completa da consulta para debugging
      const url = `${supabase.supabaseUrl}/rest/v1/devices?select=*&token=eq.${encodeURIComponent(tokenValue.trim())}`;
      console.log('URL da consulta:', url);
      
      // Usando a consulta correta para o Supabase
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('token', tokenValue.trim());
      
      if (error) {
        console.error('Erro ao buscar dispositivo:', error);
        toast.error('Erro ao buscar dispositivo');
        return null;
      }
      
      // Log detalhado para depuração
      console.log('Resposta da consulta:', data);
      
      // Verificar se temos pelo menos um resultado
      if (!data || data.length === 0) {
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
      
      // Pegar o primeiro dispositivo encontrado
      const deviceFound = data[0];
      console.log('Dispositivo encontrado:', deviceFound);
      return deviceFound;
    } catch (error) {
      console.error('Exceção ao buscar dispositivo:', error);
      toast.error('Erro ao conectar com o servidor');
      return null;
    }
  }, []);
  
  // Função para buscar playlist pelo ID
  const fetchPlaylistById = useCallback(async (playlistId: string) => {
    try {
      console.log('Buscando playlist pelo ID:', playlistId);
      
      // Modo de desenvolvimento - criar playlist de teste
      if (useDevFallbackData && isDev && playlistId === 'dev-playlist-id') {
        console.log('Modo de desenvolvimento: criando playlist de teste');
        return {
          id: 'dev-playlist-id',
          name: 'Playlist de Teste',
          description: 'Criada automaticamente para desenvolvimento',
          mediaItems: [
            {
              id: 'dev-media-1',
              title: 'Imagem de Teste',
              type: 'image',
              content: 'https://picsum.photos/800/600',
              duration: 5
            },
            {
              id: 'dev-media-2',
              title: 'Notícia de Teste',
              type: 'news',
              content: '<h1>Notícia de Teste</h1><p>Este é um exemplo de conteúdo para testes durante o desenvolvimento.</p>',
              duration: 10
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      // Primeiro buscamos os detalhes da playlist
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();
      
      if (playlistError || !playlistData) {
        console.error('Erro ao buscar playlist:', playlistError);
        return null;
      }
      
      // Depois buscamos os itens da playlist com seus respectivos dados de mídia
      const { data: playlistMediaItems, error: mediaItemsError } = await supabase
        .from('playlist_media')
        .select(`
          id, 
          position,
          media:media_id (
            id, 
            title, 
            type, 
            content, 
            duration
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });
      
      if (mediaItemsError) {
        console.error('Erro ao buscar itens da playlist:', mediaItemsError);
        return null;
      }
      
      // Transformamos os dados para o formato esperado pelo componente
      const mediaItems = playlistMediaItems
        .filter(item => item.media) // Filtra itens sem mídia
        .map(item => item.media);
      
      console.log('Playlist encontrada:', { ...playlistData, mediaItems });
      
      return {
        ...playlistData,
        mediaItems
      };
    } catch (error) {
      console.error('Exceção ao buscar playlist:', error);
      return null;
    }
  }, []);
  
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
      }
    } catch (error) {
      console.error('Exceção ao atualizar atividade do dispositivo:', error);
    }
  }, []);
  
  // Função para atualizar o conteúdo do visualizador
  const refreshContent = useCallback(async () => {
    if (!token) {
      console.log('Token não fornecido');
      setIsLoading(false);
      return;
    }
    
    console.log('Atualizando conteúdo para o token:', token);
    setIsLoading(true);
    
    try {
      const deviceInfo = await fetchDeviceByToken(token);
      if (!deviceInfo) {
        console.log('Dispositivo não encontrado pelo token:', token);
        setDevice(null);
        setPlaylist(null);
        setIsLoading(false);
        return;
      }
      
      await updateDeviceActivity(deviceInfo.id);
      setDevice(deviceInfo);
      
      if (deviceInfo.playlist_id) {
        const playlistInfo = await fetchPlaylistById(deviceInfo.playlist_id);
        
        if (playlistInfo && (!playlist || 
            playlist.updated_at !== playlistInfo.updated_at || 
            playlist.mediaItems?.length !== playlistInfo.mediaItems.length)) {
          
          setPlaylist(playlistInfo);
          toast.success('Conteúdo atualizado');
        } else if (!playlistInfo) {
          console.log('Playlist não encontrada ou vazia');
          setPlaylist(null);
        }
      } else {
        console.log('Dispositivo não tem playlist associada');
        setPlaylist(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      toast.error('Erro ao atualizar conteúdo');
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchDeviceByToken, fetchPlaylistById, updateDeviceActivity, playlist]);

  // Função para atualizar manualmente o conteúdo
  const handleManualRefresh = useCallback(() => {
    toast.info('Atualizando conteúdo...');
    refreshContent();
  }, [refreshContent]);

  // Efeito inicial para carregar o dispositivo e playlist
  useEffect(() => {
    if (token) {
      console.log('Inicializando com token:', token);
      refreshContent();
    } else {
      console.log('Nenhum token fornecido na inicialização');
      setIsLoading(false);
    }
  }, [token, refreshContent]);

  return {
    device,
    playlist,
    isLoading,
    refreshContent,
    fetchDeviceByToken,
    fetchPlaylistById,
    updateDeviceActivity,
    handleManualRefresh
  };
};
