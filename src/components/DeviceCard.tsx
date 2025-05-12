
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Device } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onDelete: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onEdit, onDelete }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const deviceUrl = `${window.location.origin}/view/${device.token}`;
  
  const handleShowQrCode = async () => {
    try {
      const qrUrl = await QRCode.toDataURL(deviceUrl);
      setQrCode(qrUrl);
      setIsQrDialogOpen(true);
    } catch (err) {
      console.error("Erro ao gerar QR code:", err);
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-4 flex-grow">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-medium mb-1">{device.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{device.description}</p>
          
          <div className="mt-2 text-xs space-y-2 text-gray-500 flex-grow">
            {device.playlistId ? (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Playlist atribuída
              </div>
            ) : (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Sem playlist
              </div>
            )}
            
            <div className="pt-2">
              <div className="text-xs font-medium text-gray-500 mb-1">URL do Dispositivo:</div>
              <div className="bg-gray-100 p-2 rounded break-all text-xs overflow-hidden">
                {deviceUrl}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-xs"
                onClick={handleShowQrCode}
              >
                Ver QR Code
              </Button>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Criado:</span>
                  <div className="text-xs">
                    {formatDistanceToNow(new Date(device.createdAt), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500">Última atividade:</span>
                  <div className="text-xs">
                    {device.lastActive 
                      ? formatDistanceToNow(new Date(device.lastActive), { addSuffix: true, locale: ptBR })
                      : 'Nunca'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onEdit}>Editar</Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>Excluir</Button>
        </div>
      </CardFooter>
      
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code do Dispositivo</DialogTitle>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center">
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            )}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Use este QR Code para acessar facilmente seu dispositivo.</p>
              <p className="mt-1 break-all">{deviceUrl}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsQrDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DeviceCard;
