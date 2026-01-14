import { useState, useEffect } from 'react';
import { extractSeries, processNextEpisode, getEpisodeStatus, updateThumbnail } from '../services/codewords-api';

export default function Admin() {
  const [seriesUrl, setSeriesUrl] = useState('');
  const [animeTitle, setAnimeTitle] = useState('');
  const [language, setLanguage] = useState<'Sub' | 'Dub'>('Sub');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [statusData, setStatusData] = useState<any>(null);
  const [selectedAnime, setSelectedAnime] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const data = await getEpisodeStatus();
      setStatusData(data);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleExtract = async () => {
    if (!seriesUrl || !animeTitle) {
      setMessage('❌ Enter URL and title');
      return;
    }
    setLoading(true);
    setMessage('⏳ Extracting + fetching MAL thumbnail...');
    try {
      const result = await extractSeries({ series_url: seriesUrl, anime_title: animeTitle, language });
      setMessage(`✅ ${result.episodes_extracted} episodes + MAL thumbnail imported!`);
      setSeriesUrl('');
      setAnimeTitle('');
      await loadStatus();
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setMessage('⏳ Processing: Resolve (30s) → Download (3min) → Upload (5min)...');
    try {
      const result = await processNextEpisode();
      setMessage(result.success ? `✅ Uploaded! ${result.download_url}` : `❌ ${result.error}`);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setProcessing(false);
      await loadStatus();
    }
  };

  const handleUpdateThumbnail = async () => {
    if (!selectedAnime || !newThumbnailUrl) return;
    setMessage('⏳ Updating...');
    try {
      await updateThumbnail(selectedAnime, newThumbnailUrl);
      setMessage(`✅ Thumbnail updated!`);
      setNewThumbnailUrl('');
      await loadStatus();
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  const uniqueAnime = Array.from(new Set(statusData?.episodes.map((ep: any) => ep.anime_title) || []));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🎬 Admin</h1>
          <a href="/" className="px-4 py-2 bg-purple-600 rounded-lg">← Home</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Extract */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/30">
            <h2 className="text-xl font-semibold mb-4">📥 Extract</h2>
            <input type="text" placeholder="Series URL" value={seriesUrl} onChange={(e) => setSeriesUrl(e.target.value)} className="w-full p-3 mb-3 bg-gray-700 rounded text-white" />
            <input type="text" placeholder="Anime Title" value={animeTitle} onChange={(e) => setAnimeTitle(e.target.value)} className="w-full p-3 mb-3 bg-gray-700 rounded text-white" />
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full p-3 mb-4 bg-gray-700 rounded text-white">
              <option value="Sub">Sub</option>
              <option value="Dub">Dub</option>
            </select>
            <button onClick={handleExtract} disabled={loading} className="w-full bg-blue-600 p-3 rounded font-semibold disabled:opacity-50">
              {loading ? '⏳ Extracting...' : '🚀 Extract'}
            </button>
          </div>

          {/* Process */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-green-500/30">
            <h2 className="text-xl font-semibold mb-4">⚡ Process</h2>
            <div className="bg-gray-700/30 p-3 rounded mb-4 text-sm">
              <p>⏳ Pending: {statusData?.status_counts?.pending || 0}</p>
              <p>✅ Done: {statusData?.status_counts?.completed || 0}</p>
            </div>
            <button onClick={handleProcess} disabled={processing} className="w-full bg-green-600 p-3 rounded font-semibold mb-3 disabled:opacity-50">
              {processing ? '⏳ Processing...' : '⚡ Process Next'}
            </button>
            <button onClick={loadStatus} className="w-full bg-gray-600 p-3 rounded font-semibold">🔄 Refresh</button>
          </div>

          {/* Thumbnail */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-orange-500/30">
            <h2 className="text-xl font-semibold mb-4">🖼️ Thumbnail</h2>
            <select value={selectedAnime} onChange={(e) => setSelectedAnime(e.target.value)} className="w-full p-3 mb-3 bg-gray-700 rounded text-white">
              <option value="">Select...</option>
              {uniqueAnime.map((title: string) => <option key={title} value={title}>{title}</option>)}
            </select>
            {selectedAnime && statusData?.series_info[selectedAnime] && (
              <img src={statusData.series_info[selectedAnime].thumbnail_url} className="w-full h-48 object-cover rounded mb-3" />
            )}
            <input type="url" placeholder="New URL" value={newThumbnailUrl} onChange={(e) => setNewThumbnailUrl(e.target.value)} className="w-full p-3 mb-3 bg-gray-700 rounded text-white" />
            <button onClick={handleUpdateThumbnail} disabled={!selectedAnime || !newThumbnailUrl} className="w-full bg-orange-600 p-3 rounded font-semibold disabled:opacity-50">Update</button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded mb-6 ${message.includes('✅') ? 'bg-green-900/50' : message.includes('⏳') ? 'bg-blue-900/50' : 'bg-red-900/50'}`}>
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {statusData && (
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">📊 Episodes ({statusData.total})</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {statusData.episodes.slice(0, 100).map((ep: any) => (
                <div key={ep._id} className="bg-gray-700/30 p-3 rounded flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {statusData.series_info[ep.anime_title]?.thumbnail_url && (
                      <img src={statusData.series_info[ep.anime_title].thumbnail_url} className="w-12 h-16 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-medium">{ep.anime_title} - EP {ep.episode_number}</p>
                      <p className="text-xs text-gray-400">{ep.source_type.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs ${
                    ep.status === 'completed' ? 'bg-green-900' :
                    ep.status === 'pending' ? 'bg-yellow-900' :
                    ep.status === 'failed' ? 'bg-red-900' : 'bg-blue-900'
                  }`}>{ep.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
