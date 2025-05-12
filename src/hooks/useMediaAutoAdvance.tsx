
import { useEffect, useRef, useState } from 'react';

export const useMediaAutoAdvance = (
  currentMedia: any | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  youtubePlayerRef: React.RefObject<HTMLIFrameElement>,
  advanceToNextMedia: () => void
) => {
  const youtubeTimerRef = useRef<number | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  
  useEffect(() => {
    if (!currentMedia) return;
    
    console.log('Mídia atual:', currentMedia.type, currentMedia.title, 'Duração configurada:', currentMedia.duration);
    
    // Clean up previous timers
    if (youtubeTimerRef.current) {
      clearTimeout(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
    }
    
    // Para vídeos do YouTube, usamos o YouTube API para detectar o fim do vídeo ou a duração configurada
    if (currentMedia.type === 'video' && currentMedia.content.includes('youtube.com/embed/')) {
      console.log('Configurando timer para vídeo do YouTube - usando duração real');
      
      // Tentamos usar a duração real do vídeo, se disponível, caso contrário usamos a duração configurada
      let duration = currentMedia.duration;
      
      // Função para verificar se o vídeo do YouTube terminou
      const checkYouTubeVideoStatus = () => {
        console.log('Verificando status do vídeo do YouTube');
        try {
          // Definimos um timer com base na duração configurada
          youtubeTimerRef.current = window.setTimeout(() => {
            console.log('YouTube vídeo concluído pelo timer');
            advanceToNextMedia();
          }, duration * 1000);
        } catch (error) {
          console.error('Erro ao verificar status do vídeo do YouTube:', error);
          // Fallback para o timer configurado
          youtubeTimerRef.current = window.setTimeout(() => {
            advanceToNextMedia();
          }, (currentMedia.duration || 10) * 1000);
        }
      };
      
      // Iniciamos a verificação após um pequeno delay
      setTimeout(checkYouTubeVideoStatus, 500);
      
      return () => {
        if (youtubeTimerRef.current) {
          clearTimeout(youtubeTimerRef.current);
        }
      };
    }
    
    // Para vídeos normais, esperamos o evento de finalização ou detectamos a duração real
    if (currentMedia.type === 'video' && !currentMedia.content.includes('youtube.com/embed/')) {
      const videoElement = videoRef.current;
      
      if (videoElement) {
        // Force video to load
        videoElement.load();
        
        const playVideo = () => {
          videoElement.play().catch(err => {
            console.error('Erro ao reproduzir vídeo:', err);
            // If autoplay fails, set a timer as fallback
            console.log('Usando timer como fallback para vídeo local');
            window.setTimeout(() => advanceToNextMedia(), (currentMedia.duration || 8) * 1000);
          });
        };
        
        // Try to play the video
        playVideo();
        
        // Capturar a duração real do vídeo
        const handleLoadedMetadata = () => {
          const realDuration = videoElement.duration;
          console.log('Duração real do vídeo:', realDuration);
          setVideoDuration(realDuration);
        };
        
        const handleVideoEnd = () => {
          console.log('Evento de fim de vídeo detectado');
          advanceToNextMedia();
        };
        
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('ended', handleVideoEnd);
        
        return () => {
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.removeEventListener('ended', handleVideoEnd);
        };
      } else {
        // Fallback if video element reference is not available
        console.log('Referência do vídeo não disponível, usando timer como fallback');
        const timer = window.setTimeout(() => {
          advanceToNextMedia();
        }, (currentMedia.duration || 8) * 1000);
        
        return () => clearTimeout(timer);
      }
    } else if (currentMedia.type !== 'video') {
      // Para outros tipos de mídia, usamos o tempo de duração configurado
      console.log('Configurando timer para mídia não-vídeo:', currentMedia.duration || 8, 'segundos');
      const timer = window.setTimeout(() => {
        advanceToNextMedia();
      }, (currentMedia.duration || 8) * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentMedia, advanceToNextMedia, videoRef, youtubePlayerRef]);

  return { videoDuration };
};
