
export type MediaType = 'video' | 'image' | 'news';

export interface Media {
  id: string;
  title: string;
  type: MediaType;
  content: string; // URL for videos/images, HTML content for news
  duration: number; // in seconds, only applicable for auto-advancing media
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  mediaItems: Media[];
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  description: string;
  token: string; // Unique identifier for the device to access the viewer
  playlistId: string | null;
  createdAt: string;
  updatedAt: string;
  lastActive: string | null;
}
