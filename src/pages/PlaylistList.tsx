
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import PlaylistCard from '@/components/PlaylistCard';
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

const PlaylistList: React.FC = () => {
  const { playlists, addPlaylist, updatePlaylist, deletePlaylist } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openAddDialog = () => {
    setName('');
    setDescription('');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (playlistId: string) => {
    const playlist = playlists.find(item => item.id === playlistId);
    if (playlist) {
      setName(playlist.name);
      setDescription(playlist.description);
      setCurrentPlaylist(playlistId);
      setIsEditDialogOpen(true);
    }
  };

  const openDeleteDialog = (playlistId: string) => {
    setCurrentPlaylist(playlistId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddPlaylist = () => {
    if (name.trim()) {
      addPlaylist(name, description);
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdatePlaylist = () => {
    if (currentPlaylist && name.trim()) {
      updatePlaylist(currentPlaylist, {
        name,
        description
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeletePlaylist = () => {
    if (currentPlaylist) {
      deletePlaylist(currentPlaylist);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Playlists</h1>
        <Button onClick={openAddDialog}>Nova Playlist</Button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          title="Nenhuma playlist encontrada"
          description="Crie playlists para organizar e exibir suas mídias nos dispositivos."
          actionLabel="Criar Playlist"
          onAction={openAddDialog}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onEdit={() => openEditDialog(playlist.id)}
              onDelete={() => openDeleteDialog(playlist.id)}
            />
          ))}
        </div>
      )}

      {/* Add Playlist Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome da playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição da playlist"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddPlaylist}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                placeholder="Nome da playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descrição da playlist"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleUpdatePlaylist}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Playlist Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza de que deseja excluir esta playlist? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeletePlaylist}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PlaylistList;
