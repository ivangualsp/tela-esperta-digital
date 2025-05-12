
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const refreshIntervalRef = useRef<number | null>(null);
  const [directVideoUrl, setDirectVideoUrl] = useState<string | null>(null);

  // Extrair o parâmetro video da URL, se presente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const videoUrl = params.get('video');
    if (videoUrl) {
      console.log('URL de vídeo direto detectada:', videoUrl);
      setDirectVideoUrl(videoUrl);
    }
  }, [location.search]);

  const {
    device,
    playlist,
    isLoading,
    refreshContent,
    handleManualRefresh
  } = useDeviceAndPlaylist(token);

  // Se temos um URL de vídeo direto, criamos uma playlist temporária com apenas esse vídeo
  const effectivePlaylist = React.useMemo(() => {
    if (directVideoUrl && (!playlist || !playlist.mediaItems || playlist.mediaItems.length === 0)) {
      // Criar uma playlist temporária com apenas o vídeo direto
      const tempMedia: Media = {
        id: 'direct-video',
        title: 'Vídeo Direto',
        type: 'video',
        content: directVideoUrl,
        duration: 0, // Usaremos a duração real do vídeo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        id: 'direct-video-playlist',
        name: 'Vídeo Direto',
        description: 'Reprodução direta de vídeo',
        mediaItems: [tempMedia],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return playlist;
  }, [directVideoUrl, playlist]);

  const {
    currentMediaIndex,
    transitionActive,
    videoRef,
    youtubePlayerRef,
    advanceToNextMedia,
    renderMedia
  } = useMediaPlayback(effectivePlaylist);

  const currentMedia: Media | null = effectivePlaylist?.mediaItems?.[currentMediaIndex] || null;
  
  // Use o hook de avanço automático de mídia
  useMediaAutoAdvance(currentMedia, videoRef, youtubePlayerRef, advanceToNextMedia);

  // Efeito inicial para configurar o intervalo de atualização
  useEffect(() => {
    // Se estivermos no modo de vídeo direto, não precisamos de atualização
    if (directVideoUrl) {
      console.log('Modo de vídeo direto: ignorando configuração de intervalo de atualização');
      return;
    }

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
  }, [refreshContent, directVideoUrl]);

  // Se estamos no modo de vídeo direto e o vídeo está pronto
  if (directVideoUrl) {
    return (
      <MediaViewerContent
        transitionActive={transitionActive}
        renderMedia={() => renderMedia(currentMedia)}
        currentMediaIndex={0}
        totalMediaItems={1}
        onRefresh={() => {}}
        isDirectVideoMode={true}
      />
    );
  }

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

  if (!effectivePlaylist || !effectivePlaylist.mediaItems || effectivePlaylist.mediaItems.length === 0) {
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
      totalMediaItems={effectivePlaylist.mediaItems.length}
      onRefresh={handleManualRefresh}
      isDirectVideoMode={false}
    />
  );
};

export default MediaViewer;
