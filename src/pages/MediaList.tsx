
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import MediaCard from '@/components/MediaCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

const MediaList: React.FC = () => {
  const { mediaItems, addMedia, updateMedia, deleteMedia } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'news'>('image');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('5');

  const openAddDialog = () => {
    setTitle('');
    setMediaType('image');
    setContent('');
    setDuration('5');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (mediaId: string) => {
    const media = mediaItems.find(item => item.id === mediaId);
    if (media) {
      setTitle(media.title);
      setMediaType(media.type);
      setContent(media.content);
      setDuration(media.duration.toString());
      setCurrentMedia(mediaId);
      setIsEditDialogOpen(true);
    }
  };

  const openDeleteDialog = (mediaId: string) => {
    setCurrentMedia(mediaId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddMedia = () => {
    if (title.trim() && content.trim() && !isNaN(Number(duration))) {
      addMedia(title, mediaType, content, Number(duration));
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateMedia = () => {
    if (currentMedia && title.trim() && content.trim() && !isNaN(Number(duration))) {
      updateMedia(currentMedia, {
        title,
        type: mediaType,
        content,
        duration: Number(duration)
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteMedia = () => {
    if (currentMedia) {
      deleteMedia(currentMedia);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mídias</h1>
        <Button onClick={openAddDialog}>Adicionar Mídia</Button>
      </div>

      {mediaItems.length === 0 ? (
        <EmptyState
          title="Nenhuma mídia encontrada"
          description="Adicione vídeos, imagens ou notícias para exibição nos dispositivos."
          actionLabel="Adicionar Mídia"
          onAction={openAddDialog}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map(media => (
            <MediaCard
              key={media.id}
              media={media}
              onEdit={() => openEditDialog(media.id)}
              onDelete={() => openDeleteDialog(media.id)}
            />
          ))}
        </div>
      )}

      {/* Add Media Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título da mídia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={mediaType} onValueChange={(value: any) => setMediaType(value)}>
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
                />
              ) : (
                <Input
                  id="content"
                  placeholder={`URL ${mediaType === 'video' ? 'do vídeo' : 'da imagem'}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddMedia}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Mídia</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                placeholder="Título da mídia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select value={mediaType} onValueChange={(value: any) => setMediaType(value)}>
                <SelectTrigger id="edit-type">
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
              <Label htmlFor="edit-content">
                {mediaType === 'news' ? 'Conteúdo HTML' : 'URL do conteúdo'}
              </Label>
              {mediaType === 'news' ? (
                <Textarea
                  id="edit-content"
                  placeholder="Conteúdo HTML da notícia"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                />
              ) : (
                <Input
                  id="edit-content"
                  placeholder={`URL ${mediaType === 'video' ? 'do vídeo' : 'da imagem'}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-duration">Duração (segundos)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleUpdateMedia}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Media Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Mídia</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza de que deseja excluir esta mídia? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteMedia}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MediaList;
