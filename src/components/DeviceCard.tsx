
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Device } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onDelete: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onEdit, onDelete }) => {
  const { playlists, getPlaylistById } = useApp();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  
  const assignedPlaylist = device.playlistId ? getPlaylistById(device.playlistId) : null;
  const viewerUrl = `${window.location.origin}/viewer/${device.token}`;
  
  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-monitor">
                <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                <line x1="8" x2="16" y1="21" y2="21"></line>
                <line x1="12" x2="12" y1="17" y2="21"></line>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-800">{device.name}</h3>
              <p className="text-xs text-gray-500">
                {device.lastActive 
                  ? `Ativo ${formatDistanceToNow(new Date(device.lastActive), { addSuffix: true, locale: ptBR })}`
                  : 'Nunca ativo'}
              </p>
            </div>
            <div className={`ml-auto w-3 h-3 rounded-full ${device.lastActive && new Date(device.lastActive).getTime() > Date.now() - 3600000 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
          
          <div className="text-sm mb-2">
            <div className="flex justify-between text-gray-500 mb-1">
              <span>Playlist:</span> 
              <span className="font-medium text-gray-700">{assignedPlaylist?.name || 'Nenhuma'}</span>
            </div>
            <div className="text-xs text-gray-500">{device.description}</div>
          </div>
        </CardContent>
        <CardFooter className="px-3 py-2 bg-gray-50 border-t flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setLinkModalOpen(true)}>Ver Link</Button>
          <Button size="sm" variant="outline" onClick={onEdit}>Editar</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>Excluir</Button>
        </CardFooter>
      </Card>
      
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link do Dispositivo</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              Use o link abaixo para acessar a visualização do dispositivo {device.name}:
            </p>
            <div className="flex w-full items-center space-x-2">
              <Input 
                value={viewerUrl} 
                readOnly 
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(viewerUrl);
                  toast.success('Link copiado para a área de transferência');
                }}
              >
                Copiar
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Abra este link no dispositivo que será usado para exibir as mídias.
            </p>
            <div className="mt-4">
              <Button
                className="w-full"
                variant="outline"
                asChild
              >
                <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
                  Abrir Visualizador
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceCard;
