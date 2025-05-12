
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface ErrorStateProps {
  message: string;
  subMessage?: string;
  deviceName?: string;
  token?: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  subMessage,
  deviceName,
  token,
  onRetry
}) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-black/50 p-6 rounded-lg">
        <Alert variant="destructive" className="bg-red-900/30 border-red-800 mb-4">
          <AlertTitle className="text-xl font-bold text-white">{message}</AlertTitle>
          {subMessage && <AlertDescription className="text-gray-200">{subMessage}</AlertDescription>}
        </Alert>
        
        {deviceName && (
          <div className="mt-4 text-gray-400 text-sm">
            Dispositivo: {deviceName}
          </div>
        )}
        
        <div className="mt-6 flex flex-col gap-2">
          <button 
            onClick={onRetry}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
          
          {token && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Token do dispositivo:</p>
              <code className="text-xs text-gray-300 font-mono break-all select-all">
                {token}
              </code>
            </div>
          )}
          
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Certifique-se de que o dispositivo esteja registrado no sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
