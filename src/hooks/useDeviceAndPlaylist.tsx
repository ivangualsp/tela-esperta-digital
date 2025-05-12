
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

export const useDeviceAndPlaylist = (token: string | undefined): DevicePlaylistHookResult => {
  const [device, setDevice] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Função para buscar dispositivo pelo token
  const fetchDeviceByToken = useCallback(async (tokenValue: string) => {
    try {
      console.log('Buscando dispositivo pelo token:', tokenValue);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('token', tokenValue)
        .single();
      
      if (error) {
        console.error('Erro ao buscar dispositivo:', error);
        return null;
      }
      
      console.log('Dispositivo encontrado:', data);
      return data;
    } catch (error) {
      console.error('Exceção ao buscar dispositivo:', error);
      return null;
    }
  }, []);
  
  // Função para buscar playlist pelo ID
  const fetchPlaylistById = useCallback(async (playlistId: string) => {
    try {
      console.log('Buscando playlist pelo ID:', playlistId);
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
    if (!token) return;
    
    console.log('Atualizando conteúdo para o token:', token);
    setIsLoading(true);
    
    try {
      const deviceInfo = await fetchDeviceByToken(token);
      if (!deviceInfo) {
        console.error('Dispositivo não encontrado pelo token:', token);
        setDevice(null);
        setPlaylist(null);
        return;
      }
      
      await updateDeviceActivity(deviceInfo.id);
      setDevice(deviceInfo);
      
      if (deviceInfo.playlist_id) {
        const playlistInfo = await fetchPlaylistById(deviceInfo.playlist_id);
        
        if (playlistInfo && (!playlist || 
            playlist.updated_at !== playlistInfo.updated_at || 
            playlist.mediaItems.length !== playlistInfo.mediaItems.length)) {
          
          setPlaylist(playlistInfo);
          toast.success('Conteúdo atualizado');
        }
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
      refreshContent();
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
