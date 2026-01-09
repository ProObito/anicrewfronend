import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Film, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminDashboard: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/stats/dashboard`);
        const data = await res.json();
        setStats(data.stats);
        setRecent(data.recent);
      } catch (e) {}
    }, 3000);
    return () => clearInterval(poll);
  }, []);

  const handleExtract = async () => {
    await fetch(`${API_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput })
    });
    setUrlInput('');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Basic Sidebar */}
      <aside className="w-64 border-r p-6 space-y-4">
        <h2 className="font-bold text-xl">AniCrew Admin</h2>
        <Button variant="ghost" className="w-full justify-start gap-2"><LayoutDashboard size={18}/> Overview</Button>
        <Button variant="ghost" className="w-full justify-start gap-2"><Film size={18}/> Content</Button>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Anime URL..." className="w-80" />
            <Button onClick={handleExtract}>Extract</Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm">Series</p><p className="text-2xl font-bold">{stats?.series || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-yellow-500">Processing</p><p className="text-2xl font-bold">{stats?.episodes.processing || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-green-500">Ready</p><p className="text-2xl font-bold">{stats?.episodes.ready || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-red-500">Failed</p><p className="text-2xl font-bold">{stats?.episodes.failed || 0}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Live Activity (Remote Uploads)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {recent.map((task: any) => (
              <div key={task._id} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2 font-medium">
                  <span>{task.title} (Ep {task.episodeNumber})</span>
                  <span className="text-xs uppercase">{task.status}</span>
                </div>
                {task.status === 'processing' ? (
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="h-2" />
                    <span className="text-xs">{task.progress}%</span>
                  </div>
                ) : task.status === 'ready' ? (
                  <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Link Generated</p>
                ) : (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Failed</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default AdminDashboard;
