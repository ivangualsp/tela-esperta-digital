
import React from 'react';

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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl mb-4">{message}</h1>
      {subMessage && <p className="text-center px-4">{subMessage}</p>}
      {deviceName && (
        <div className="mt-4 text-gray-400 text-sm">
          Dispositivo: {deviceName}
        </div>
      )}
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Tentar novamente
      </button>
      {token && <p className="mt-4 text-sm text-gray-400">Token: {token}</p>}
    </div>
  );
};

export default ErrorState;
