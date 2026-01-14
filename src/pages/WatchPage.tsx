import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoPlayer from '@/components/player/VideoPlayer';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Download,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Share2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Crown,
} from 'lucide-react';

import { useWatchProgress } from '@/hooks/useWatchProgress';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useUserProfile } from '@/hooks/useUserProfile';

import { trendingAnime } from '@/data/mockAnime';
import { getEpisodesForAnime } from '@/data/mockEpisodes';
import { mockComments } from '@/data/mockComments';

import { toast } from 'sonner';

// 🔥 BACKEND SERVICES (MERGED)
import {
  getEpisode,
  getDownloadUrl,
} from '@/services/anime';
import {
  fetchAnimeById,
  fetchEpisodeById,
} from '@/services/anime';

interface DisplayComment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: Date;
  likes: number;
}

const WatchPage: React.FC = () => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const navigate = useNavigate();

  const { profile } = useUserProfile();
  const { saveProgress } = useWatchProgress();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [animeData, setAnimeData] = useState<any>(null);
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<DisplayComment[]>(
    mockComments.map(c => ({
      id: c.id,
      username: c.username,
      avatar: c.avatar,
      content: c.content,
      createdAt: c.createdAt,
      likes: c.likes,
    }))
  );

  const [isLiked, setIsLiked] = useState(false);

  // 🔹 FALLBACK MOCK DATA
  const anime =
    animeData || trendingAnime.find(a => a.id === animeId);

  const episodes = animeId ? getEpisodesForAnime(animeId) : [];
  const currentEpNum = parseInt(episodeId || '1');
  const currentEpisode =
    episodes.find(e => e.number === currentEpNum) || episodes[0];

  const prevEpisode = currentEpNum > 1 ? currentEpNum - 1 : null;
  const nextEpisode =
    currentEpNum < episodes.length ? currentEpNum + 1 : null;

  // 🔥 BACKEND FETCH (MERGED)
  useEffect(() => {
    const loadData = async () => {
      if (!animeId || !episodeId) return;

      try {
        setLoading(true);

        const animeRes = await fetchAnimeById(animeId);
        const episodeRes = await fetchEpisodeById(
          animeId,
          parseInt(episodeId)
        );

        setAnimeData(animeRes);
        setEpisodeData(episodeRes);
      } catch (err) {
        console.log('Backend failed, using mock data');
        try {
          const fallback = await getEpisode(animeId, currentEpNum);
          setEpisodeData(fallback);
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [animeId, episodeId, currentEpNum]);

  // 🔹 SAVE WATCH PROGRESS
  useEffect(() => {
    if (animeId && episodeId) {
      saveProgress(animeId, episodeId, 0, 1440);
    }
  }, [animeId, episodeId, saveProgress]);

  // 🔹 ADD COMMENT
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setComments([
      {
        id: Date.now().toString(),
        username: profile.username,
        avatar: profile.avatar,
        content: newComment,
        createdAt: new Date(),
        likes: 0,
      },
      ...comments,
    ]);

    setNewComment('');
    toast.success('Comment posted!');
  };

  // 🔹 DOWNLOAD (PREMIUM + DOOD)
  const handleDownload = async () => {
    if (!profile.isPremium) {
      toast.error('Premium required');
      navigate('/premium');
      return;
    }

    try {
      setIsDownloading(true);

      if (animeId) {
        const url = await getDownloadUrl(animeId, currentEpNum, '720p');
        if (url) {
          window.open(url, '_blank');
          return;
        }
      }

      if (episodeData?.doodUrl || episodeData?.downloadUrl) {
        window.open(
          episodeData.doodUrl || episodeData.downloadUrl,
          '_blank'
        );
      } else {
        toast.error('Download not available');
      }
    } catch {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  // 🔹 LOADING STATE
  if (loading || !anime || !currentEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading episode...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4 text-muted-foreground">
            <Link to="/anime">Anime</Link>
            <span>/</span>
            <Link to={`/anime/${animeId}`}>{anime.title}</Link>
            <span>/</span>
            <span className="text-foreground">
              Episode {currentEpNum}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MAIN */}
            <div className="lg:col-span-2 space-y-6">
              {/* 🔥 VIDEO PLAYER (DOOD + HLS AUTO) */}
              <VideoPlayer
                title={anime.title}
                episodeTitle={
                  episodeData?.title || currentEpisode.title
                }
                episodeNumber={currentEpNum}
                animeId={animeId}
                thumbnail={anime.image}
                streams={
                  episodeData?.doodUrl
                    ? [
                        {
                          quality: 'Auto',
                          url: episodeData.doodUrl,
                          type: 'iframe',
                        },
                      ]
                    : episodeData?.streams
                }
                subtitles={episodeData?.subtitles}
                audioTracks={episodeData?.audioTracks}
                downloadUrl={
                  episodeData?.doodUrl ||
                  episodeData?.downloadUrl
                }
                hasPrev={!!prevEpisode}
                hasNext={!!nextEpisode}
                onPrev={() =>
                  prevEpisode &&
                  navigate(`/watch/${animeId}/${prevEpisode}`)
                }
                onNext={() =>
                  nextEpisode &&
                  navigate(`/watch/${animeId}/${nextEpisode}`)
                }
              />

              {/* CONTROLS */}
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!prevEpisode}
                    onClick={() =>
                      navigate(`/watch/${animeId}/${prevEpisode}`)
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!nextEpisode}
                    onClick={() =>
                      navigate(`/watch/${animeId}/${nextEpisode}`)
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={
                      isInWatchlist(animeId || '')
                        ? 'secondary'
                        : 'outline'
                    }
                    onClick={() => toggleWatchlist(animeId || '')}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    Watchlist
                  </Button>

                  <Button
                    variant={isLiked ? 'secondary' : 'outline'}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Like
                  </Button>

                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={
                      profile.isPremium
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : ''
                    }
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                    {!profile.isPremium && (
                      <Badge className="ml-2 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* COMMENTS */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    Comments ({comments.length})
                  </h3>

                  <Textarea
                    value={newComment}
                    onChange={e =>
                      setNewComment(e.target.value)
                    }
                    placeholder="Write a comment..."
                  />
                  <Button
                    className="mt-2"
                    onClick={handleAddComment}
                  >
                    Post Comment
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">
                    Episodes
                  </h3>
                  {episodes.map(ep => (
                    <Link
                      key={ep.id}
                      to={`/watch/${animeId}/${ep.number}`}
                      className={`flex gap-3 p-2 rounded-lg ${
                        ep.number === currentEpNum
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <img
                        src={ep.thumbnail}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          EP {ep.number}
                        </p>
                        <p className="text-xs opacity-70">
                          {ep.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WatchPage;
