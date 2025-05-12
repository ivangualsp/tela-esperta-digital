
import React from 'react';

interface MediaViewerContentProps {
  transitionActive: boolean;
  renderMedia: () => JSX.Element | null;
  currentMediaIndex: number;
  totalMediaItems: number;
  onRefresh: () => void;
  isDirectVideoMode?: boolean;
}

const MediaViewerContent: React.FC<MediaViewerContentProps> = ({
  transitionActive,
  renderMedia,
  currentMediaIndex,
  totalMediaItems,
  onRefresh,
  isDirectVideoMode = false
}) => {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          transitionActive ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {renderMedia()}
      </div>
      
      {!isDirectVideoMode && (
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="bg-black/50 text-white text-xs px-2 py-1 rounded-full hover:bg-black/70 transition-colors"
            title="Atualizar conteúdo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
          </button>
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentMediaIndex + 1} / {totalMediaItems}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewerContent;
