
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Modo de desenvolvimento para testes
const isDev = import.meta.env.MODE === 'development';
const useDevFallbackData = isDev;

export const usePlaylist = () => {
  // Função para buscar playlist pelo ID
  const fetchPlaylistById = useCallback(async (playlistId: string) => {
    try {
      console.log('Buscando playlist pelo ID:', playlistId);
      
      // Modo de desenvolvimento - criar playlist de teste
      if (useDevFallbackData && isDev && playlistId === 'dev-playlist-id') {
        console.log('Modo de desenvolvimento: criando playlist de teste');
        return {
          id: 'dev-playlist-id',
          name: 'Playlist de Teste',
          description: 'Criada automaticamente para desenvolvimento',
          mediaItems: [
            {
              id: 'dev-media-1',
              title: 'Imagem de Teste',
              type: 'image',
              content: 'https://picsum.photos/800/600',
              duration: 5
            },
            {
              id: 'dev-media-2',
              title: 'Notícia de Teste',
              type: 'news',
              content: '<h1>Notícia de Teste</h1><p>Este é um exemplo de conteúdo para testes durante o desenvolvimento.</p>',
              duration: 10
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      // Primeiro buscamos os detalhes da playlist
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();
      
      if (playlistError || !playlistData) {
        console.error('Erro ao buscar playlist:', playlistError);
        return null;
      }
      
      // Depois buscamos os itens da playlist com seus respectivos dados de mídia
      const { data: playlistMediaItems, error: mediaItemsError } = await supabase
        .from('playlist_media')
        .select(`
          id, 
          position,
          media:media_id (
            id, 
            title, 
            type, 
            content, 
            duration
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });
      
      if (mediaItemsError) {
        console.error('Erro ao buscar itens da playlist:', mediaItemsError);
        return null;
      }
      
      // Transformamos os dados para o formato esperado pelo componente
      const mediaItems = playlistMediaItems
        .filter(item => item.media) // Filtra itens sem mídia
        .map(item => item.media);
      
      console.log('Playlist encontrada:', { ...playlistData, mediaItems });
      
      return {
        ...playlistData,
        mediaItems
      };
    } catch (error) {
      console.error('Exceção ao buscar playlist:', error);
      return null;
    }
  }, []);

  return {
    fetchPlaylistById
  };
};
