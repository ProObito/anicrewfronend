import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Film,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// 🔥 CODEWORDS API
import {
  extractSeries,
  processNextEpisode,
  getEpisodeStatus,
  updateThumbnail,
} from '../services/codewords-api';

/* ================= OWNER ================= */
const OWNER_EMAIL = 'uffobitoxe@gmail.com';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminDashboard: React.FC = () => {
  /* ───────── OWNER CHECK ───────── */
  const userEmail =
    localStorage.getItem('userEmail')?.toLowerCase().trim();

  if (userEmail !== OWNER_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            🚫 Access Denied
          </h1>
          <p className="text-muted-foreground">
            Admin access restricted
          </p>
        </div>
      </div>
    );
  }

  /* ───────── DASHBOARD STATE ───────── */
  const [urlInput, setUrlInput] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  /* ───────── CODEWORDS STATE ───────── */
  const [seriesUrl, setSeriesUrl] = useState('');
  const [animeTitle, setAnimeTitle] = useState('');
  const [language, setLanguage] =
    useState<'Sub' | 'Dub'>('Sub');

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const [statusData, setStatusData] = useState<any>(null);
  const [selectedAnime, setSelectedAnime] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] =
    useState('');

  /* ───────── DASHBOARD POLL ───────── */
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_URL}/stats/dashboard`
        );
        const data = await res.json();
        setStats(data.stats);
        setRecent(data.recent);
      } catch {}
    }, 3000);

    return () => clearInterval(poll);
  }, []);

  /* ───────── CODEWORDS STATUS ───────── */
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getEpisodeStatus();
      setStatusData(data);
    } catch {}
  };

  /* ───────── QUICK EXTRACT ───────── */
  const handleQuickExtract = async () => {
    await fetch(`${API_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput }),
    });
    setUrlInput('');
  };

  /* ───────── FULL EXTRACT ───────── */
  const handleExtract = async () => {
    if (!seriesUrl || !animeTitle) {
      setMessage('❌ Enter URL and title');
      return;
    }

    setLoading(true);
    setMessage('⏳ Extracting + thumbnail...');

    try {
      const result = await extractSeries({
        series_url: seriesUrl,
        anime_title: animeTitle,
        language,
      });

      setMessage(
        `✅ ${result.episodes_extracted} episodes imported`
      );
      setSeriesUrl('');
      setAnimeTitle('');
      await loadStatus();
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ───────── PROCESS NEXT ───────── */
  const handleProcess = async () => {
    setProcessing(true);
    setMessage(
      '⏳ Resolve → Download → Upload'
    );

    try {
      const result = await processNextEpisode();
      setMessage(
        result.success
          ? `✅ Uploaded: ${result.download_url}`
          : `❌ ${result.error}`
      );
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setProcessing(false);
      await loadStatus();
    }
  };

  /* ───────── UPDATE THUMBNAIL ───────── */
  const handleUpdateThumbnail = async () => {
    if (!selectedAnime || !newThumbnailUrl) return;

    setMessage('⏳ Updating thumbnail...');
    try {
      await updateThumbnail(
        selectedAnime,
        newThumbnailUrl
      );
      setMessage('✅ Thumbnail updated');
      setNewThumbnailUrl('');
      await loadStatus();
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    }
  };

  const uniqueAnime = Array.from(
    new Set(
      statusData?.episodes.map(
        (ep: any) => ep.anime_title
      ) || []
    )
  );

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-background flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r p-6 space-y-4">
        <h2 className="font-bold text-xl">
          AniCrew Admin
        </h2>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Film size={18} />
          Content
        </Button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={e =>
                setUrlInput(e.target.value)
              }
              placeholder="Quick extract URL..."
              className="w-80"
            />
            <Button onClick={handleQuickExtract}>
              Extract
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-sm">Series</p>
            <p className="text-2xl font-bold">
              {stats?.series || 0}
            </p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p className="text-sm text-yellow-500">
              Processing
            </p>
            <p className="text-2xl font-bold">
              {stats?.episodes.processing || 0}
            </p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p className="text-sm text-green-500">
              Ready
            </p>
            <p className="text-2xl font-bold">
              {stats?.episodes.ready || 0}
            </p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p className="text-sm text-red-500">
              Failed
            </p>
            <p className="text-2xl font-bold">
              {stats?.episodes.failed || 0}
            </p>
          </CardContent></Card>
        </div>

        {/* बाकी UI same */}
      </main>
    </div>
  );
};

export default AdminDashboard;
