
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaType } from '@/types';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface MediaFormProps {
  editMode?: boolean;
}

const MediaForm: React.FC<MediaFormProps> = ({ editMode = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mediaItems, addMedia, updateMedia } = useApp();
  
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('5');
  const [isPreviewingVideo, setIsPreviewingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (editMode && id) {
      const existingMedia = mediaItems.find(item => item.id === id);
      if (existingMedia) {
        setTitle(existingMedia.title);
        setMediaType(existingMedia.type);
        setContent(existingMedia.content);
        setDuration(existingMedia.duration.toString());
      } else {
        // If media not found, redirect back to media list
        navigate('/media');
      }
    }
  }, [editMode, id, mediaItems, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || isNaN(Number(duration))) {
      toast.error('Por favor, preencha todos os campos corretamente');
      return;
    }
    
    if (editMode && id) {
      updateMedia(id, {
        title,
        type: mediaType,
        content,
        duration: Number(duration)
      });
    } else {
      addMedia(title, mediaType, content, Number(duration));
    }
    
    navigate('/media');
  };

  const handlePreviewVideo = () => {
    if (!content) {
      toast.error('Informe a URL do vídeo para visualizá-lo');
      return;
    }

    setIsPreviewingVideo(true);
  };

  const handleVideoError = () => {
    if (isPreviewingVideo) {
      toast.error('Não foi possível carregar o vídeo. Verifique a URL.');
      setIsPreviewingVideo(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editMode ? 'Editar Mídia' : 'Adicionar Mídia'}
        </h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título da mídia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={mediaType} onValueChange={(value: MediaType) => setMediaType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo de mídia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="news">Notícia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="content">
              {mediaType === 'news' ? 'Conteúdo HTML' : 'URL do conteúdo'}
            </Label>
            {mediaType === 'news' ? (
              <Textarea
                id="content"
                placeholder="Conteúdo HTML da notícia"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
              />
            ) : (
              <div className="space-y-2">
                <Input
                  id="content"
                  placeholder={`URL ${mediaType === 'video' ? 'do vídeo' : 'da imagem'}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                
                {mediaType === 'video' && (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviewVideo}
                      className="mb-2"
                      disabled={!content}
                    >
                      Visualizar Vídeo
                    </Button>
                    
                    {isPreviewingVideo && (
                      <Card className="mt-2 p-2">
                        <div className="aspect-video bg-black rounded-md overflow-hidden">
                          <video
                            ref={videoRef}
                            src={content}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                            onError={handleVideoError}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          Pré-visualização do vídeo
                        </div>
                      </Card>
                    )}
                  </div>
                )}
                
                {mediaType === 'image' && content && (
                  <Card className="mt-2 p-2">
                    <div className="aspect-video bg-black rounded-md overflow-hidden">
                      <img
                        src={content}
                        alt="Pré-visualização"
                        className="w-full h-full object-contain"
                        onError={() => {
                          toast.error('Não foi possível carregar a imagem. Verifique a URL.');
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      Pré-visualização da imagem
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="duration">Duração (segundos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/media')}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editMode ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MediaForm;
