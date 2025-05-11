
import React, { useState, useEffect } from 'react';
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
              <Input
                id="content"
                placeholder={`URL ${mediaType === 'video' ? 'do vídeo' : 'da imagem'}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
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
