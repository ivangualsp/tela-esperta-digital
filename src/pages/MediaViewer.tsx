
import React, { useState, useEffect, useCallback } from 'react';
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
  
  const advanceToNextMedia = useCallback(() => {
    setTransitionActive(true);
    setTimeout(() => {
      setCurrentMediaIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= playlist.mediaItems.length ? 0 : prevIndex + 1;
        return nextIndex;
      });
      setTransitionActive(false);
    }, 500);
  }, [playlist]);
  
  useEffect(() => {
    if (token) {
      const deviceInfo = getDeviceByToken(token);
      if (deviceInfo) {
        setDevice(deviceInfo);
        updateDeviceActivity(deviceInfo.id);
        
        if (deviceInfo.playlistId) {
          const playlistInfo = getPlaylistById(deviceInfo.playlistId);
          if (playlistInfo && playlistInfo.mediaItems.length > 0) {
            setPlaylist(playlistInfo);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        toast.error('Dispositivo não encontrado');
      }
    }
  }, [token, getDeviceByToken, getPlaylistById, updateDeviceActivity]);
  
  useEffect(() => {
    if (playlist && playlist.mediaItems.length > 0) {
      const currentMedia = playlist.mediaItems[currentMediaIndex];
      const timer = setTimeout(() => {
        advanceToNextMedia();
      }, currentMedia.duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentMediaIndex, playlist, advanceToNextMedia]);

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
        <p>O token fornecido não corresponde a nenhum dispositivo registrado.</p>
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
      </div>
    );
  }

  const currentMedia: Media = playlist.mediaItems[currentMediaIndex];

  const renderMedia = () => {
    switch (currentMedia.type) {
      case 'video':
        return (
          <video 
            key={currentMedia.id}
            src={currentMedia.content} 
            className="w-full h-full object-contain"
            autoPlay 
            muted
          />
        );
      case 'image':
        return (
          <img 
            src={currentMedia.content} 
            alt={currentMedia.title} 
            className="w-full h-full object-contain"
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

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          transitionActive ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {renderMedia()}
      </div>
      
      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentMediaIndex + 1} / {playlist.mediaItems.length}
      </div>
    </div>
  );
};

export default MediaViewer;
