
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
      <div className="animate-pulse">Carregando...</div>
    </div>
  );
};

export default LoadingState;
