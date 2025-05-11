
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import DeviceCard from '@/components/DeviceCard';
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

const DeviceList: React.FC = () => {
  const { devices, playlists, addDevice, updateDevice, deleteDevice, assignPlaylistToDevice } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');

  const openAddDialog = () => {
    setName('');
    setDescription('');
    setSelectedPlaylist('');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (deviceId: string) => {
    const device = devices.find(item => item.id === deviceId);
    if (device) {
      setName(device.name);
      setDescription(device.description);
      setSelectedPlaylist(device.playlistId || '');
      setCurrentDevice(deviceId);
      setIsEditDialogOpen(true);
    }
  };

  const openDeleteDialog = (deviceId: string) => {
    setCurrentDevice(deviceId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddDevice = () => {
    if (name.trim()) {
      const deviceId = addDevice(name, description);
      if (selectedPlaylist) {
        assignPlaylistToDevice(deviceId, selectedPlaylist);
      }
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateDevice = () => {
    if (currentDevice && name.trim()) {
      updateDevice(currentDevice, {
        name,
        description,
      });
      
      if (selectedPlaylist) {
        assignPlaylistToDevice(currentDevice, selectedPlaylist);
      } else {
        // If no playlist is selected, update with null
        updateDevice(currentDevice, { playlistId: null });
      }
      
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteDevice = () => {
    if (currentDevice) {
      deleteDevice(currentDevice);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dispositivos</h1>
        <Button onClick={openAddDialog}>Adicionar Dispositivo</Button>
      </div>

      {devices.length === 0 ? (
        <EmptyState
          title="Nenhum dispositivo encontrado"
          description="Adicione dispositivos para exibir suas playlists."
          actionLabel="Adicionar Dispositivo"
          onAction={openAddDialog}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onEdit={() => openEditDialog(device.id)}
              onDelete={() => openDeleteDialog(device.id)}
            />
          ))}
        </div>
      )}

      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Dispositivo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome do dispositivo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do dispositivo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="playlist">Playlist (opcional)</Label>
              <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                <SelectTrigger id="playlist">
                  <SelectValue placeholder="Selecione uma playlist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {playlists.map(playlist => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddDevice}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Dispositivo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                placeholder="Nome do dispositivo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descrição do dispositivo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-playlist">Playlist</Label>
              <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                <SelectTrigger id="edit-playlist">
                  <SelectValue placeholder="Selecione uma playlist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {playlists.map(playlist => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleUpdateDevice}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Dispositivo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza de que deseja excluir este dispositivo? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteDevice}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DeviceList;
