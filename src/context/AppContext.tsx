
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Media, Playlist, Device, MediaType } from '../types';
import { toast } from 'sonner';

interface AppContextType {
  mediaItems: Media[];
  playlists: Playlist[];
  devices: Device[];
  addMedia: (title: string, type: MediaType, content: string, duration: number) => void;
  updateMedia: (id: string, updates: Partial<Omit<Media, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteMedia: (id: string) => void;
  addPlaylist: (name: string, description: string) => string;
  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deletePlaylist: (id: string) => void;
  addMediaToPlaylist: (playlistId: string, mediaId: string) => void;
  removeMediaFromPlaylist: (playlistId: string, mediaId: string) => void;
  updatePlaylistMediaOrder: (playlistId: string, mediaIds: string[]) => void;
  addDevice: (name: string, description: string) => string;
  updateDevice: (id: string, updates: Partial<Omit<Device, 'id' | 'token' | 'createdAt' | 'updatedAt'>>) => void;
  deleteDevice: (id: string) => void;
  assignPlaylistToDevice: (deviceId: string, playlistId: string) => void;
  getDeviceByToken: (token: string) => Device | undefined;
  getPlaylistById: (id: string) => Playlist | undefined;
  updateDeviceActivity: (deviceId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'mediaIndoorSystem';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { mediaItems: savedMedia, playlists: savedPlaylists, devices: savedDevices } = JSON.parse(savedData);
        setMediaItems(savedMedia || []);
        setPlaylists(savedPlaylists || []);
        setDevices(savedDevices || []);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mediaItems,
        playlists,
        devices,
      })
    );
  }, [mediaItems, playlists, devices]);

  // Media management
  const addMedia = (title: string, type: MediaType, content: string, duration: number) => {
    const newMedia: Media = {
      id: uuidv4(),
      title,
      type,
      content,
      duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMediaItems((prev) => [...prev, newMedia]);
    toast.success('Mídia adicionada com sucesso');
    return newMedia.id;
  };

  const updateMedia = (id: string, updates: Partial<Omit<Media, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    toast.success('Mídia atualizada com sucesso');
  };

  const deleteMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    
    // Also remove this media from any playlists
    setPlaylists((prev) =>
      prev.map((playlist) => ({
        ...playlist,
        mediaItems: playlist.mediaItems.filter((item) => item.id !== id),
        updatedAt: new Date().toISOString(),
      }))
    );
    
    toast.success('Mídia excluída com sucesso');
  };

  // Playlist management
  const addPlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: uuidv4(),
      name,
      description,
      mediaItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    toast.success('Playlist criada com sucesso');
    return newPlaylist.id;
  };

  const updatePlaylist = (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === id
          ? {
              ...playlist,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : playlist
      )
    );
    toast.success('Playlist atualizada com sucesso');
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id));
    
    // Update devices that were using this playlist
    setDevices((prev) =>
      prev.map((device) =>
        device.playlistId === id
          ? { ...device, playlistId: null, updatedAt: new Date().toISOString() }
          : device
      )
    );
    
    toast.success('Playlist excluída com sucesso');
  };

  const addMediaToPlaylist = (playlistId: string, mediaId: string) => {
    const mediaItem = mediaItems.find((item) => item.id === mediaId);
    if (!mediaItem) {
      toast.error('Mídia não encontrada');
      return;
    }

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              mediaItems: [...playlist.mediaItems, mediaItem],
              updatedAt: new Date().toISOString(),
            }
          : playlist
      )
    );
    toast.success('Mídia adicionada à playlist');
  };

  const removeMediaFromPlaylist = (playlistId: string, mediaId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              mediaItems: playlist.mediaItems.filter((item) => item.id !== mediaId),
              updatedAt: new Date().toISOString(),
            }
          : playlist
      )
    );
    toast.success('Mídia removida da playlist');
  };

  const updatePlaylistMediaOrder = (playlistId: string, mediaIds: string[]) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          const orderedMediaItems = mediaIds
            .map((id) => playlist.mediaItems.find((item) => item.id === id))
            .filter((item): item is Media => !!item);
          
          return {
            ...playlist,
            mediaItems: orderedMediaItems,
            updatedAt: new Date().toISOString(),
          };
        }
        return playlist;
      })
    );
    toast.success('Ordem da playlist atualizada');
  };

  // Device management
  const addDevice = (name: string, description: string) => {
    const newDevice: Device = {
      id: uuidv4(),
      name,
      description,
      token: uuidv4(),  // Garante token único
      playlistId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: null,
    };
    setDevices((prev) => [...prev, newDevice]);
    toast.success('Dispositivo adicionado com sucesso');
    return newDevice.id;
  };

  const updateDevice = (id: string, updates: Partial<Omit<Device, 'id' | 'token' | 'createdAt' | 'updatedAt'>>) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === id
          ? {
              ...device,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : device
      )
    );
    toast.success('Dispositivo atualizado com sucesso');
  };

  const deleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== id));
    toast.success('Dispositivo excluído com sucesso');
  };

  const assignPlaylistToDevice = (deviceId: string, playlistId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              playlistId,
              updatedAt: new Date().toISOString(),
            }
          : device
      )
    );
    toast.success('Playlist atribuída ao dispositivo');
  };

  const getDeviceByToken = (token: string) => {
    if (!token) return undefined;
    
    // Garantimos que a comparação é case-sensitive e exata
    return devices.find((device) => device.token === token);
  };

  const getPlaylistById = (id: string) => {
    return playlists.find((playlist) => playlist.id === id);
  };

  const updateDeviceActivity = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              lastActive: new Date().toISOString(),
            }
          : device
      )
    );
  };

  const contextValue: AppContextType = {
    mediaItems,
    playlists,
    devices,
    addMedia,
    updateMedia,
    deleteMedia,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    addMediaToPlaylist,
    removeMediaFromPlaylist,
    updatePlaylistMediaOrder,
    addDevice,
    updateDevice,
    deleteDevice,
    assignPlaylistToDevice,
    getDeviceByToken,
    getPlaylistById,
    updateDeviceActivity,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
