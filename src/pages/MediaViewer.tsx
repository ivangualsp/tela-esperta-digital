
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Media } from '@/types';
import { toast } from 'sonner';

const MediaViewer: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { getDeviceByToken, getPlaylistById, updateDeviceActivity } = useApp();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [playlist, setPlaylist] = useState<any>(null);
  const [device, setDevice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transitionActive, setTransitionActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const refreshIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeTimerRef = useRef<number | null>(null);
  const youtubePlayerRef = useRef<HTMLIFrameElement | null>(null);
  
  // Função para atualizar o conteúdo do visualizador
  const refreshContent = useCallback(() => {
    if (!token) return;
    
    const deviceInfo = getDeviceByToken(token);
    if (!deviceInfo) {
      toast.error('Dispositivo não encontrado');
      return;
    }
    
    updateDeviceActivity(deviceInfo.id);
    setDevice(deviceInfo);
    
    if (deviceInfo.playlistId) {
      const playlistInfo = getPlaylistById(deviceInfo.playlistId);
      
      // Se a playlist mudou ou foi atualizada, reiniciamos a exibição
      if (playlistInfo && (!playlist || 
          playlist.updatedAt !== playlistInfo.updatedAt || 
          playlist.mediaItems.length !== playlistInfo.mediaItems.length)) {
        
        setPlaylist(playlistInfo);
        // Reinicia para o primeiro item da playlist quando houver alteração
        setCurrentMediaIndex(0);
        toast.success('Conteúdo atualizado');
      }
    }
    
    setLastUpdated(Date.now());
  }, [token, getDeviceByToken, getPlaylistById, updateDeviceActivity, playlist]);
  
  const advanceToNextMedia = useCallback(() => {
    // Clear any existing YouTube timer
    if (youtubeTimerRef.current) {
      clearTimeout(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
    }
    
    setTransitionActive(true);
    setTimeout(() => {
      setCurrentMediaIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= (playlist?.mediaItems.length || 0) ? 0 : prevIndex + 1;
        return nextIndex;
      });
      setTransitionActive(false);
    }, 500);
  }, [playlist]);
  
  // Efeito inicial para carregar o dispositivo e playlist
  useEffect(() => {
    if (token) {
      try {
        const deviceInfo = getDeviceByToken(token);
        if (deviceInfo) {
          setDevice(deviceInfo);
          updateDeviceActivity(deviceInfo.id);
          
          if (deviceInfo.playlistId) {
            const playlistInfo = getPlaylistById(deviceInfo.playlistId);
            if (playlistInfo && playlistInfo.mediaItems.length > 0) {
              setPlaylist(playlistInfo);
            }
          }
        } else {
          toast.error('Dispositivo não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar dispositivo:', error);
        toast.error('Erro ao carregar dispositivo');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
    // Configura o intervalo de atualização a cada 30 segundos
    refreshIntervalRef.current = window.setInterval(() => {
      refreshContent();
    }, 30000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (youtubeTimerRef.current) {
        clearTimeout(youtubeTimerRef.current);
      }
    };
  }, [token, getDeviceByToken, getPlaylistById, updateDeviceActivity, refreshContent]);
  
  // Função para renderizar o conteúdo da mídia atual
  const renderMedia = () => {
    if (!currentMedia) return null;
    
    switch (currentMedia.type) {
      case 'video':
        if (currentMedia.content.includes('youtube.com/embed/')) {
          // For YouTube videos
          return (
            <div className="w-full h-full flex items-center justify-center">
              <iframe 
                ref={youtubePlayerRef}
                src={`${currentMedia.content}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentMedia.title}
              />
            </div>
          );
        } else {
          // For local videos
          return (
            <video 
              key={currentMedia.id}
              ref={videoRef}
              src={currentMedia.content} 
              className="w-full h-full object-contain"
              autoPlay 
              loop={false}
              playsInline
              controls={false}
              onEnded={() => advanceToNextMedia()}
              onError={(e) => {
                console.error('Video error:', e);
                // Advance to next media if there's an error playing this video
                setTimeout(advanceToNextMedia, 1000);
              }}
            />
          );
        }
      case 'image':
        return (
          <img 
            src={currentMedia.content} 
            alt={currentMedia.title} 
            className="w-full h-full object-contain"
            onError={() => {
              console.error('Image failed to load:', currentMedia.content);
              setTimeout(advanceToNextMedia, 1000);
            }}
          />
        );
      case 'news':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8 overflow-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentMedia.title}</h2>
            <div 
              className="text-gray-700 text-xl max-w-4xl"
              dangerouslySetInnerHTML={{ __html: currentMedia.content }} 
            />
          </div>
        );
      default:
        return <div>Tipo de mídia não suportado</div>;
    }
  };
  
  // Efeito para avançar automaticamente para o próximo item da playlist
  useEffect(() => {
    if (!playlist || !playlist.mediaItems.length || currentMediaIndex >= playlist.mediaItems.length) {
      return;
    }
    
    const currentMedia = playlist.mediaItems[currentMediaIndex];
    if (!currentMedia) return;
    
    // Clean up previous timers
    if (youtubeTimerRef.current) {
      clearTimeout(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
    }
    
    // Para vídeos do YouTube, usamos um timer já que não temos acesso diretamente ao evento de fim
    if (currentMedia.type === 'video' && currentMedia.content.includes('youtube.com/embed/')) {
      youtubeTimerRef.current = window.setTimeout(() => {
        advanceToNextMedia();
      }, (currentMedia.duration || 8) * 1000); // Usamos a duração configurada ou 8 segundos como fallback
      
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
            console.error('Error playing video:', err);
            // If autoplay fails, set a timer as fallback
            window.setTimeout(() => advanceToNextMedia(), (currentMedia.duration || 5) * 1000);
          });
        };
        
        // Try to play the video
        playVideo();
        
        const handleVideoEnd = () => {
          advanceToNextMedia();
        };
        
        videoElement.addEventListener('ended', handleVideoEnd);
        return () => {
          videoElement.removeEventListener('ended', handleVideoEnd);
        };
      } else {
        // Fallback if video element reference is not available
        const timer = window.setTimeout(() => {
          advanceToNextMedia();
        }, (currentMedia.duration || 5) * 1000);
        
        return () => clearTimeout(timer);
      }
    } else if (currentMedia.type !== 'video') {
      // Para outros tipos de mídia, usamos o tempo de duração configurado
      const timer = window.setTimeout(() => {
        advanceToNextMedia();
      }, (currentMedia.duration || 5) * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentMediaIndex, playlist, advanceToNextMedia]);

  // Função para atualizar manualmente o conteúdo
  const handleManualRefresh = () => {
    refreshContent();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">Dispositivo não encontrado</h1>
        <p className="text-center px-4">O token fornecido não corresponde a nenhum dispositivo registrado ou houve um erro de comunicação.</p>
        <button 
          onClick={handleManualRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
        <p className="mt-4 text-sm text-gray-400">Token: {token || 'Não fornecido'}</p>
      </div>
    );
  }

  if (!playlist || playlist.mediaItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">Sem conteúdo para exibir</h1>
        <p>Este dispositivo não possui uma playlist configurada ou a playlist está vazia.</p>
        <div className="mt-4 text-gray-400 text-sm">
          Dispositivo: {device.name}
        </div>
        <button 
          onClick={handleManualRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Atualizar conteúdo
        </button>
      </div>
    );
  }

  const currentMedia: Media = playlist.mediaItems[currentMediaIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          transitionActive ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {renderMedia()}
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <button
          onClick={handleManualRefresh}
          className="bg-black/50 text-white text-xs px-2 py-1 rounded-full hover:bg-black/70 transition-colors"
          title="Atualizar conteúdo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
        </button>
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentMediaIndex + 1} / {playlist.mediaItems.length}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
