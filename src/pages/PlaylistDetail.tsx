
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, mediaItems, getPlaylistById, addMediaToPlaylist, removeMediaFromPlaylist, updatePlaylistMediaOrder } = useApp();
  const [playlist, setPlaylist] = useState<any>(null);
  const [isAddMediaDialogOpen, setIsAddMediaDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const foundPlaylist = getPlaylistById(id);
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
      } else {
        navigate('/playlists');
      }
    }
  }, [id, playlists, getPlaylistById, navigate]);

  const availableMedia = mediaItems.filter(
    (media) => !playlist?.mediaItems.find((item: any) => item.id === media.id)
  );

  const handleAddMedia = (mediaId: string) => {
    if (id) {
      addMediaToPlaylist(id, mediaId);
      setIsAddMediaDialogOpen(false);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    if (id) {
      removeMediaFromPlaylist(id, mediaId);
    }
  };

  const handleDragEnd = (result: any) => {
    // Ignorar se o item foi solto fora da lista
    if (!result.destination) {
      return;
    }

    // Ignorar se o item foi solto na mesma posição
    if (result.destination.index === result.source.index) {
      return;
    }

    // Criar uma cópia dos itens da playlist
    const items = Array.from(playlist.mediaItems);
    
    // Remover o item arrastado da lista
    const [reorderedItem] = items.splice(result.source.index, 1);
    
    // Adicionar o item na nova posição
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Atualizar a ordem no contexto da aplicação
    if (id) {
      const newOrder = items.map(item => item.id);
      updatePlaylistMediaOrder(id, newOrder);
      toast.success('Ordem da playlist atualizada');
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!id || !playlist) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Verificar se o novo índice está dentro dos limites da lista
    if (newIndex < 0 || newIndex >= playlist.mediaItems.length) {
      return;
    }
    
    const items = Array.from(playlist.mediaItems);
    const item = items[index];
    
    // Remover o item da posição atual
    items.splice(index, 1);
    
    // Inserir o item na nova posição
    items.splice(newIndex, 0, item);
    
    // Atualizar a ordem
    const newOrder = items.map(item => item.id);
    updatePlaylistMediaOrder(id, newOrder);
  };

  if (!playlist) {
    return null;
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/playlists')} className="mb-4">
          &larr; Voltar para Playlists
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{playlist.name}</h1>
            <p className="text-gray-500">{playlist.description}</p>
          </div>
          <Button onClick={() => setIsAddMediaDialogOpen(true)}>Adicionar Mídia</Button>
        </div>
      </div>

      {playlist.mediaItems.length === 0 ? (
        <EmptyState
          title="Nenhuma mídia nesta playlist"
          description="Adicione mídias para criar sua sequência de reprodução."
          actionLabel="Adicionar Mídia"
          onAction={() => setIsAddMediaDialogOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-700 mb-2">Sequência de Reprodução</h3>
              <p className="text-sm text-gray-500 mb-4">
                As mídias serão exibidas na ordem abaixo. Você pode arrastar para reordenar ou usar os botões de setas.
              </p>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="mediaItems">
                  {(provided) => (
                    <div 
                      className="space-y-3"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {playlist.mediaItems.map((media: any, index: number) => (
                        <Draggable key={media.id} draggableId={media.id} index={index}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center bg-white border rounded-md p-3 relative"
                            >
                              <div className="flex items-center flex-1">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium mr-3">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{media.title}</h4>
                                  <p className="text-xs text-gray-500 capitalize">{media.type} • {media.duration}s</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 mr-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0" 
                                    onClick={() => moveItem(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0" 
                                    onClick={() => moveItem(index, 'down')}
                                    disabled={index === playlist.mediaItems.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      ⋮
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleRemoveMedia(media.id)}>
                                      Remover da playlist
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Media Dialog */}
      <Dialog open={isAddMediaDialogOpen} onOpenChange={setIsAddMediaDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Mídia à Playlist</DialogTitle>
          </DialogHeader>
          {availableMedia.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">Não há mídias disponíveis para adicionar.</p>
              <Button asChild>
                <a href="/media">Criar Nova Mídia</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[400px] overflow-y-auto">
              {availableMedia.map(media => (
                <Card key={media.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="mb-3">
                      <h3 className="font-medium">{media.title}</h3>
                      <p className="text-xs text-gray-500 capitalize">{media.type} • {media.duration}s</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddMedia(media.id)}
                    >
                      Adicionar à Playlist
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddMediaDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PlaylistDetail;
