
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import MediaCard from '@/components/MediaCard';
import PlaylistCard from '@/components/PlaylistCard';
import DeviceCard from '@/components/DeviceCard';

const Dashboard: React.FC = () => {
  const { mediaItems, playlists, devices } = useApp();
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Mídias</span>
              <span className="bg-brand-blue/10 text-brand-blue text-sm py-1 px-2 rounded-full">
                {mediaItems.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Gerencie seus vídeos, imagens e notícias.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/media">Ver Todas</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Playlists</span>
              <span className="bg-brand-blue/10 text-brand-blue text-sm py-1 px-2 rounded-full">
                {playlists.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Organize suas mídias em playlists para exibição.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/playlists">Ver Todas</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Dispositivos</span>
              <span className="bg-brand-blue/10 text-brand-blue text-sm py-1 px-2 rounded-full">
                {devices.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Gerencie os dispositivos que exibem suas mídias.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/devices">Ver Todos</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Mídias Recentes</h2>
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.slice(0, 4).map(media => (
              <MediaCard 
                key={media.id}
                media={media}
                onEdit={() => {}}
                onDelete={() => {}}
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-4">Nenhuma mídia encontrada</p>
              <Button asChild>
                <Link to="/media/new">Adicionar Mídia</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {mediaItems.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <Link to="/media">Ver Todas as Mídias</Link>
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Playlists</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.slice(0, 3).map(playlist => (
              <PlaylistCard 
                key={playlist.id}
                playlist={playlist}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-4">Nenhuma playlist encontrada</p>
              <Button asChild>
                <Link to="/playlists/new">Criar Playlist</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dispositivos</h2>
        {devices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {devices.slice(0, 3).map(device => (
              <DeviceCard 
                key={device.id}
                device={device}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-4">Nenhum dispositivo encontrado</p>
              <Button asChild>
                <Link to="/devices/new">Adicionar Dispositivo</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
