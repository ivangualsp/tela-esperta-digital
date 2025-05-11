
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import MediaList from "./pages/MediaList";
import MediaForm from "./pages/MediaForm";
import PlaylistList from "./pages/PlaylistList";
import PlaylistDetail from "./pages/PlaylistDetail";
import DeviceList from "./pages/DeviceList";
import MediaViewer from "./pages/MediaViewer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/media" element={<MediaList />} />
            <Route path="/media/new" element={<MediaForm />} />
            <Route path="/media/:id/edit" element={<MediaForm editMode />} />
            <Route path="/playlists" element={<PlaylistList />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/devices" element={<DeviceList />} />
            <Route path="/viewer/:token" element={<MediaViewer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
