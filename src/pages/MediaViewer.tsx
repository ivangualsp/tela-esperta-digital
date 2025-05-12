
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Media } from '@/types';
import { useDeviceAndPlaylist } from '@/hooks/useDeviceAndPlaylist';
import { useMediaPlayback } from '@/hooks/useMediaPlayback';
import { useMediaAutoAdvance } from '@/hooks/useMediaAutoAdvance';
import MediaViewerContent from '@/components/MediaViewerContent';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

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
    advanceToNextMedia,
    renderMedia
  } = useMediaPlayback(playlist);

  const currentMedia: Media | null = playlist?.mediaItems?.[currentMediaIndex] || null;
  
  // Use o hook de avanço automático de mídia
  useMediaAutoAdvance(currentMedia, videoRef, advanceToNextMedia);

  // Efeito inicial para carregar o dispositivo e playlist
  useEffect(() => {
    let isMounted = true;
    
    const initializeViewer = async () => {
      if (isLoading && token) {
        await refreshContent();
      }
    };
    
    initializeViewer();
    
    // Configura o intervalo de atualização a cada 30 segundos
    refreshIntervalRef.current = window.setInterval(() => {
      refreshContent();
    }, 30000);
    
    return () => {
      isMounted = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token, refreshContent, isLoading]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!device) {
    return (
      <ErrorState
        message="Dispositivo não encontrado"
        subMessage="O token fornecido não corresponde a nenhum dispositivo registrado ou houve um erro de comunicação."
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
