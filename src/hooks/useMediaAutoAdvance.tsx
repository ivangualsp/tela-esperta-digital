
import { useEffect, useRef } from 'react';

export const useMediaAutoAdvance = (
  currentMedia: any | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  advanceToNextMedia: () => void
) => {
  const youtubeTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!currentMedia) return;
    
    console.log('Mídia atual:', currentMedia.type, currentMedia.title, 'Duração:', currentMedia.duration);
    
    // Clean up previous timers
    if (youtubeTimerRef.current) {
      clearTimeout(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
    }
    
    // Para vídeos do YouTube, usamos um timer já que não temos acesso diretamente ao evento de fim
    if (currentMedia.type === 'video' && currentMedia.content.includes('youtube.com/embed/')) {
      console.log('Configurando timer para vídeo do YouTube:', currentMedia.duration || 10, 'segundos');
      youtubeTimerRef.current = window.setTimeout(() => {
        advanceToNextMedia();
      }, (currentMedia.duration || 10) * 1000); // Usamos a duração configurada ou 10 segundos como fallback
      
      return () => {
        if (youtubeTimerRef.current) {
          clearTimeout(youtubeTimerRef.current);
        }
      };
    }
    
    // Para vídeos normais, esperamos o evento de finalização em vez de usar um timer
    if (currentMedia.type === 'video' && !currentMedia.content.includes('youtube.com/embed/')) {
      const videoElement = videoRef.current;
      
      if (videoElement) {
        // Force video to load and play
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
        
        const handleVideoEnd = () => {
          console.log('Evento de fim de vídeo detectado');
          advanceToNextMedia();
        };
        
        videoElement.addEventListener('ended', handleVideoEnd);
        return () => {
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
  }, [currentMedia, advanceToNextMedia, videoRef]);
};
