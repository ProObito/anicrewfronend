import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Star, Calendar, Film, Share2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Series, Episode } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AnimeDetail: React.FC = () => {
  const { id } = useParams();
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/series/${id}`).then(res => res.json()).then(data => {
      setSeries(data.series);
      setEpisodes(data.episodes);
      if (data.episodes.length > 0) setCurrentEp(data.episodes[0]);
    });
  }, [id]);

  if (!series) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative h-[40vh]">
        <img src={series.banner || series.cover} className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background" />
      </div>
      
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-border shadow-2xl">
              {currentEp ? (
                <iframe src={currentEp.streamtapeUrl.replace('/v/', '/e/')} className="w-full h-full" allowFullScreen scrolling="no" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">Processing Episode...</div>
              )}
            </div>
            <div className="p-4 bg-card border rounded-xl flex justify-between items-center">
              <h1 className="text-2xl font-bold">{series.title} - Ep {currentEp?.episodeNumber}</h1>
              <Button variant="outline" size="icon"><Share2 size={18}/></Button>
            </div>
          </div>

          <div className="bg-card border rounded-xl h-[600px] flex flex-col">
            <div className="p-4 border-b font-bold">Episodes</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {episodes.map(ep => (
                <button 
                  key={ep._id} 
                  onClick={() => setCurrentEp(ep)}
                  className={`w-full p-3 rounded-lg flex justify-between items-center ${currentEp?._id === ep._id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'}`}
                >
                  <span>Episode {ep.episodeNumber}</span>
                  <Play size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default AnimeDetail;
