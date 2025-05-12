
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Media } from '@/types';
import { useDeviceAndPlaylist } from '@/hooks/useDeviceAndPlaylist';
import { useMediaPlayback } from '@/hooks/useMediaPlayback';
import { useMediaAutoAdvance } from '@/hooks/useMediaAutoAdvance';
import MediaViewerContent from '@/components/MediaViewerContent';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// Verificar se estamos em modo de desenvolvimento
const isDev = import.meta.env.MODE === 'development';

const MediaViewer: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const refreshIntervalRef = useRef<number | null>(null);

  const {
    device,
    playlist,
    isLoading,
    refreshContent,
    handleManualRefresh
  } = useDeviceAndPlaylist(token);

  const {
    currentMediaIndex,
    transitionActive,
    videoRef,
    youtubePlayerRef,
    advanceToNextMedia,
    renderMedia
  } = useMediaPlayback(playlist);

  const currentMedia: Media | null = playlist?.mediaItems?.[currentMediaIndex] || null;
  
  // Use o hook de avanço automático de mídia
  useMediaAutoAdvance(currentMedia, videoRef, youtubePlayerRef, advanceToNextMedia);

  // Efeito inicial para configurar o intervalo de atualização
  useEffect(() => {
    console.log('Configurando intervalo de atualização');
    
    // Limpa qualquer intervalo existente antes de criar um novo
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Configura o intervalo de atualização a cada 30 segundos
    refreshIntervalRef.current = window.setInterval(() => {
      console.log('Executando atualização programada');
      refreshContent();
    }, 30000);
    
    return () => {
      console.log('Limpando intervalo de atualização');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshContent]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!device) {
    return (
      <ErrorState
        message="Dispositivo não encontrado"
        subMessage={isDev 
          ? "Em modo de desenvolvimento: você pode criar um dispositivo no painel administrativo ou verificar se está utilizando um token válido."
          : "O token fornecido não corresponde a nenhum dispositivo registrado ou houve um erro de comunicação."}
        token={token || 'Não fornecido'}
        onRetry={handleManualRefresh}
      />
    );
  }

  if (!playlist || !playlist.mediaItems || playlist.mediaItems.length === 0) {
    return (
      <ErrorState
        message="Sem conteúdo para exibir"
        subMessage="Este dispositivo não possui uma playlist configurada ou a playlist está vazia."
        deviceName={device.name}
        onRetry={handleManualRefresh}
      />
    );
  }

  return (
    <MediaViewerContent
      transitionActive={transitionActive}
      renderMedia={() => renderMedia(currentMedia)}
      currentMediaIndex={currentMediaIndex}
      totalMediaItems={playlist.mediaItems.length}
      onRefresh={handleManualRefresh}
    />
  );
};

export default MediaViewer;
