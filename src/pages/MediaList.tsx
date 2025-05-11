
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Plus } from 'lucide-react';

const MediaList: React.FC = () => {
  const navigate = useNavigate();
  const { mediaItems, deleteMedia } = useApp();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<string | null>(null);

  const openDeleteDialog = (mediaId: string) => {
    setCurrentMedia(mediaId);
    setIsDeleteDialogOpen(true);
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
        <Button onClick={() => navigate('/media/new')}>
          <Plus className="mr-1" size={18} />
          Adicionar Mídia
        </Button>
      </div>

      {mediaItems.length === 0 ? (
        <EmptyState
          title="Nenhuma mídia encontrada"
          description="Adicione vídeos, imagens ou notícias para exibição nos dispositivos."
          actionLabel="Adicionar Mídia"
          onAction={() => navigate('/media/new')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map(media => (
            <MediaCard
              key={media.id}
              media={media}
              onEdit={() => navigate(`/media/${media.id}/edit`)}
              onDelete={() => openDeleteDialog(media.id)}
            />
          ))}
        </div>
      )}

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
