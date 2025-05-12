
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SyncDatabase: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [syncStats, setSyncStats] = useState({
    devices: 0,
    playlists: 0,
    media: 0,
    errors: 0
  });
  
  const { mediaItems, playlists, devices } = useApp();

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStats({
      devices: 0,
      playlists: 0,
      media: 0,
      errors: 0
    });
    
    try {
      toast.info('Iniciando sincronização com o banco de dados...');
      
      // Sincronizar mídias
      const mediaResults = await syncMedia();
      
      // Sincronizar playlists
      const playlistResults = await syncPlaylists();
      
      // Sincronizar dispositivos
      const deviceResults = await syncDevices();
      
      // Atualizar estatísticas
      setSyncStats({
        media: mediaResults.success,
        playlists: playlistResults.success,
        devices: deviceResults.success,
        errors: mediaResults.errors + playlistResults.errors + deviceResults.errors
      });
      
      toast.success('Sincronização concluída!');
    } catch (error) {
      console.error('Erro durante a sincronização:', error);
      toast.error('Erro durante a sincronização');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncMedia = async () => {
    let success = 0;
    let errors = 0;
    
    for (const media of mediaItems) {
      try {
        // Verificar se já existe no Supabase
        const { data: existingMedia } = await supabase
          .from('media')
          .select('id')
          .eq('id', media.id)
          .single();
        
        if (existingMedia) {
          // Atualizar
          const { error } = await supabase
            .from('media')
            .update({
              title: media.title,
              type: media.type,
              content: media.content,
              duration: media.duration,
              updated_at: media.updatedAt
            })
            .eq('id', media.id);
          
          if (!error) success++;
          else errors++;
        } else {
          // Inserir
          const { error } = await supabase
            .from('media')
            .insert({
              id: media.id,
              title: media.title,
              type: media.type,
              content: media.content,
              duration: media.duration,
              created_at: media.createdAt,
              updated_at: media.updatedAt
            });
          
          if (!error) success++;
          else errors++;
        }
      } catch (error) {
        console.error('Erro ao sincronizar mídia:', error);
        errors++;
      }
    }
    
    return { success, errors };
  };

  const syncPlaylists = async () => {
    let success = 0;
    let errors = 0;
    
    for (const playlist of playlists) {
      try {
        // Verificar se já existe no Supabase
        const { data: existingPlaylist } = await supabase
          .from('playlists')
          .select('id')
          .eq('id', playlist.id)
          .single();
        
        if (existingPlaylist) {
          // Atualizar a playlist
          const { error } = await supabase
            .from('playlists')
            .update({
              name: playlist.name,
              description: playlist.description,
              updated_at: playlist.updatedAt
            })
            .eq('id', playlist.id);
          
          if (error) {
            errors++;
            continue;
          }
        } else {
          // Inserir playlist
          const { error } = await supabase
            .from('playlists')
            .insert({
              id: playlist.id,
              name: playlist.name,
              description: playlist.description,
              created_at: playlist.createdAt,
              updated_at: playlist.updatedAt
            });
          
          if (error) {
            errors++;
            continue;
          }
        }
        
        // Limpar relações de mídia existentes
        await supabase
          .from('playlist_media')
          .delete()
          .eq('playlist_id', playlist.id);
        
        // Adicionar relações de mídia
        if (playlist.mediaItems.length > 0) {
          const playlistMedia = playlist.mediaItems.map((media, index) => ({
            playlist_id: playlist.id,
            media_id: media.id,
            position: index
          }));
          
          const { error } = await supabase
            .from('playlist_media')
            .insert(playlistMedia);
          
          if (error) errors++;
        }
        
        success++;
      } catch (error) {
        console.error('Erro ao sincronizar playlist:', error);
        errors++;
      }
    }
    
    return { success, errors };
  };

  const syncDevices = async () => {
    let success = 0;
    let errors = 0;
    
    for (const device of devices) {
      try {
        // Verificar se já existe no Supabase
        const { data: existingDevice } = await supabase
          .from('devices')
          .select('id')
          .eq('id', device.id)
          .single();
        
        if (existingDevice) {
          // Atualizar
          const { error } = await supabase
            .from('devices')
            .update({
              name: device.name,
              description: device.description,
              token: device.token,
              playlist_id: device.playlistId,
              last_active: device.lastActive,
              updated_at: device.updatedAt
            })
            .eq('id', device.id);
          
          if (!error) success++;
          else errors++;
        } else {
          // Inserir
          const { error } = await supabase
            .from('devices')
            .insert({
              id: device.id,
              name: device.name,
              description: device.description,
              token: device.token,
              playlist_id: device.playlistId,
              last_active: device.lastActive,
              created_at: device.createdAt,
              updated_at: device.updatedAt
            });
          
          if (!error) success++;
          else errors++;
        }
      } catch (error) {
        console.error('Erro ao sincronizar dispositivo:', error);
        errors++;
      }
    }
    
    return { success, errors };
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={() => setShowConfirmDialog(true)}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Sincronizar Banco de Dados
      </Button>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sincronizar Banco de Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá sincronizar todos os seus dados locais com o banco de dados no servidor.
              Esta ação não pode ser desfeita e pode substituir os dados existentes no servidor.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSync}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {isSyncing && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <p className="font-medium">Sincronizando...</p>
          <p className="text-sm text-muted-foreground">Por favor, aguarde enquanto seus dados são sincronizados.</p>
        </div>
      )}
      
      {!isSyncing && syncStats.devices + syncStats.playlists + syncStats.media > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <p className="font-medium">Sincronização concluída</p>
          <div className="mt-2 text-sm">
            <p>✓ {syncStats.media} mídias sincronizadas</p>
            <p>✓ {syncStats.playlists} playlists sincronizadas</p>
            <p>✓ {syncStats.devices} dispositivos sincronizados</p>
            {syncStats.errors > 0 && (
              <p className="text-destructive">⚠️ {syncStats.errors} erros encontrados</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SyncDatabase;
