
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Media } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MediaCardProps {
  media: Media;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onEdit, onDelete, showActions = true }) => {
  const getMediaPreview = () => {
    switch (media.type) {
      case 'video':
        // Check if it's a YouTube embed URL
        if (media.content.includes('youtube.com/embed/')) {
          return (
            <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
              <iframe 
                src={media.content} 
                className="w-full h-full"
                title={media.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
            <video 
              src={media.content} 
              className="w-full h-full object-cover" 
              controls={false}
              muted
            >
              Seu navegador não suporta vídeos.
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
            <img 
              src={media.content} 
              alt={media.title} 
              className="w-full h-full object-cover"
            />
          </div>
        );
      case 'news':
        return (
          <div className="aspect-video bg-white rounded-md border p-4 overflow-hidden">
            <div className="text-sm font-medium line-clamp-3 mb-2">
              {media.title}
            </div>
            <div 
              className="text-xs text-gray-600 line-clamp-5"
              dangerouslySetInnerHTML={{ __html: media.content }} 
            />
          </div>
        );
      default:
        return <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">Tipo de mídia desconhecido</div>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        {getMediaPreview()}
        <div className="mt-3">
          <h3 className="font-medium text-gray-800 line-clamp-1">{media.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 capitalize">{media.type}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(media.updatedAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="px-3 py-2 bg-gray-50 border-t flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>Editar</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>Excluir</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MediaCard;
