
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Playlist } from '@/types';
import { Link } from 'react-router-dom';

interface PlaylistCardProps {
  playlist: Playlist;
  onEdit: () => void;
  onDelete: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="h-36 bg-gray-100 rounded flex items-center justify-center mb-3 relative">
          {playlist.mediaItems.length > 0 ? (
            <div className="w-full h-full flex flex-wrap">
              {playlist.mediaItems.slice(0, 4).map((media, i) => (
                <div 
                  key={media.id} 
                  className="w-1/2 h-1/2 p-0.5"
                >
                  {media.type === 'video' && (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  )}
                  {media.type === 'image' && (
                    <img 
                      src={media.content} 
                      alt="" 
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  {media.type === 'news' && (
                    <div className="w-full h-full bg-white border rounded flex items-center justify-center text-xs text-gray-500 p-1 overflow-hidden">
                      Notícia
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Sem mídias</span>
          )}
          <div className="absolute bottom-1 right-1 bg-gray-800/70 text-white text-xs rounded px-1">
            {playlist.mediaItems.length} mídias
          </div>
        </div>
        <h3 className="font-medium text-gray-800">{playlist.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{playlist.description}</p>
      </CardContent>
      <CardFooter className="px-3 py-2 bg-gray-50 border-t flex justify-between">
        <Link to={`/playlists/${playlist.id}`}>
          <Button size="sm" variant="outline">Visualizar</Button>
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>Editar</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>Excluir</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlaylistCard;
