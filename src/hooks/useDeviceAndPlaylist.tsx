
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDevice } from './useDevice';
import { usePlaylist } from './usePlaylist';
import { useDeviceActivity } from './useDeviceActivity';

type DevicePlaylistHookResult = {
  device: any | null;
  playlist: any | null;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
  handleManualRefresh: () => void;
};

export const useDeviceAndPlaylist = (token: string | undefined): DevicePlaylistHookResult => {
  const [device, setDevice] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { fetchDeviceByToken } = useDevice();
  const { fetchPlaylistById } = usePlaylist();
  const { updateDeviceActivity } = useDeviceActivity();
  
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
    handleManualRefresh
  };
};
