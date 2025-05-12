
import { useState, useCallback, useRef, useEffect } from 'react';

type MediaPlaybackHookResult = {
  currentMediaIndex: number;
  transitionActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  youtubePlayerRef: React.RefObject<HTMLIFrameElement>;
  advanceToNextMedia: () => void;
  renderMedia: (currentMedia: any) => JSX.Element | null;
};

export const useMediaPlayback = (playlist: any | null): MediaPlaybackHookResult => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [transitionActive, setTransitionActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeTimerRef = useRef<number | null>(null);
  const youtubePlayerRef = useRef<HTMLIFrameElement | null>(null);

  const advanceToNextMedia = useCallback(() => {
    // Clear any existing YouTube timer
    if (youtubeTimerRef.current) {
      clearTimeout(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
    }
    
    setTransitionActive(true);
    setTimeout(() => {
      setCurrentMediaIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= (playlist?.mediaItems?.length || 0) ? 0 : prevIndex + 1;
        return nextIndex;
      });
      setTransitionActive(false);
    }, 500);
  }, [playlist]);

  // Função para renderizar o conteúdo da mídia atual
  const renderMedia = useCallback((currentMedia: any) => {
    if (!currentMedia) {
      console.log('Nenhuma mídia atual para renderizar');
      return null;
    }
    
    console.log('Renderizando mídia:', currentMedia.type, currentMedia.content);
    
    switch (currentMedia.type) {
      case 'video':
        if (currentMedia.content.includes('youtube.com/embed/')) {
          // For YouTube videos
          console.log('Renderizando vídeo do YouTube');
          return (
            <div className="w-full h-full flex items-center justify-center">
              <iframe 
                ref={youtubePlayerRef}
                src={`${currentMedia.content}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentMedia.title}
              />
            </div>
          );
        } else {
          // For local videos
          console.log('Renderizando vídeo local');
          return (
            <video 
              key={`video-${currentMedia.id}-${Date.now()}`}
              ref={videoRef}
              src={currentMedia.content} 
              className="w-full h-full object-contain"
              autoPlay
              muted={false}
              loop={false}
              playsInline
              controls={false}
              onLoadedData={() => console.log('Vídeo carregado')}
              onPlay={() => console.log('Vídeo iniciou reprodução')}
              onEnded={() => {
                console.log('Vídeo terminou');
                advanceToNextMedia();
              }}
              onError={(e) => {
                console.error('Erro no vídeo:', e);
                setTimeout(advanceToNextMedia, 1000);
              }}
            />
          );
        }
      case 'image':
        console.log('Renderizando imagem');
        return (
          <img 
            key={`img-${currentMedia.id}`}
            src={currentMedia.content} 
            alt={currentMedia.title} 
            className="w-full h-full object-contain"
            onLoad={() => console.log('Imagem carregada')}
            onError={() => {
              console.error('Falha ao carregar imagem:', currentMedia.content);
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
  }, [advanceToNextMedia]);

  return {
    currentMediaIndex,
    transitionActive,
    videoRef,
    youtubePlayerRef,
    advanceToNextMedia,
    renderMedia
  };
};
