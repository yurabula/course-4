import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Header from '../../components/Header.tsx';
import '../../components/Dashboard.css';
import Sessions from '../../components/Sessions.tsx';
import ProfileSection from '../../components/dashboard/ProfileSection.tsx';
import PlanSection from '../../components/dashboard/PlanSection.tsx';
import StatsSection from '../../components/dashboard/StatsSection.tsx';
import WeightSessionsSection from '../../components/dashboard/WeightSessionsSection.tsx';
import SocialSection from '../../components/dashboard/SocialSection.tsx';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Training {
  id: string;
  name: string;
  img?: string;
}

const dayNames = [
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  'П\'ятниця',
  'Субота',
  'Неділя'
];

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightDate, setWeightDate] = useState<string>(() => new Date().toISOString().slice(0,10));

  const [profile, setProfile] = useState<{ displayName?: string; gender?: string | null; age?: number | null } | null>(null);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'profile' | 'stats' | 'weightsessions' | 'social'>('plan');

  const API_URL = '/api';

  const getAuthToken = useCallback(async () => {
    if (currentUser) return await currentUser.getIdToken();
    return null;
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const token = await getAuthToken();
        if (!token) return;
        const [tRes, sRes, wRes, rRes, meRes] = await Promise.all([
          fetch(`${API_URL}/trainings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/weights`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/rankings/month`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!tRes.ok) throw new Error('Помилка завантаження тренувань');
        const tData = await tRes.json();
        setTrainings(tData || []);

        if (sRes.ok) {
          const sData = await sRes.json();
          setSessions(sData || []);
        } else {
          setSessions([]);
        }

        if (wRes.ok) {
          const wData = await wRes.json();
          setWeights(wData || []);
        } else {
          setWeights([]);
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          setRankings(rData || []);
        } else {
          setRankings([]);
        }
        if (meRes && meRes.ok) {
          try {
            const meData = await meRes.json();
            setProfile({ displayName: meData.user?.displayName, gender: meData.user?.gender || null, age: meData.user?.age || null });
          } catch (e) {
          }
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Помилка');
      } finally {
        setLoading(false);
      }
    })();
  }, [getAuthToken]);

  const saveWeight = async () => {
    if (!weightValue) return;
    const token = await getAuthToken();
    if (!token) {
      setError('Немає токена');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ weight: Number(weightValue), date: new Date(weightDate).toISOString() })
      });
      if (!res.ok) throw new Error('Помилка збереження ваги');
      const list = await (await fetch(`${API_URL}/weights`, { headers: { Authorization: `Bearer ${token}` } })).json();
      setWeights(list || []);
      setWeightValue('');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Помилка');
    }
  };

  const monthStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const labels: string[] = [];
    const counts = new Array<number>(daysInMonth).fill(0);

    for (let d = 1; d <= daysInMonth; d++) labels.push(String(d));

    sessions.forEach((s: any) => {
      const dateStr = s.startTime || s.createdAt;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate();
        counts[day - 1] = (counts[day - 1] || 0) + 1;
      }
    });

    return { labels, counts };
  }, [sessions]);

  const weightMonthStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const labels: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) labels.push(String(d));

    const dayMap = new Map<number, { time: number; weight: number }>();
    weights.forEach((w: any) => {
      const dateStr = w.date || w.createdAt;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate();
        const t = dt.getTime();
        const weightNum = Number(w.weight);
        const prev = dayMap.get(day);
        if (!prev || t > prev.time) {
          dayMap.set(day, { time: t, weight: weightNum });
        }
      }
    });

    const values = labels.map((lbl, i) => {
      const day = i + 1;
      const v = dayMap.get(day);
      return v ? v.weight : null;
    });

    return { labels, values };
  }, [weights]);

  const rankingChart = useMemo(() => {
    const labels = rankings.map(r => r.display || r.userId);
    const data = rankings.map(r => r.count || 0);
    return { labels, data };
  }, [rankings]);

  const saveProfile = async () => {
    if (!currentUser || !profile) return;
    setProfileSaving(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: profile.displayName, gender: profile.gender, age: profile.age })
      });
      if (res.ok) {
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileSaving(false);
    }
  };

  
  const buildWeeklyPlan = () => {
    const plan: Training[][] = [];
    const t = trainings;
    const perDay = 4;

    if (t.length === 0) {
      for (let i = 0; i < 7; i++) plan.push([]);
      return plan;
    }

    const freq = new Map<string, number>();
    sessions.forEach((s: any) => {
      const id = s.trainingId || (s.training && s.training.id) || s.training?.id;
      if (!id) return;
      freq.set(id, (freq.get(id) || 0) + 1);
    });

    const sorted = [...t].sort((a, b) => {
      const fa = freq.get(a.id) || 0;
      const fb = freq.get(b.id) || 0;
      if (fb !== fa) return fb - fa;
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < 7; i++) {
      const dayArr: Training[] = [];
      if ([0, 2, 4].includes(i)) {
        for (let j = 0; j < perDay; j++) {
          const idx = j % sorted.length;
          dayArr.push(sorted[idx]);
        }
      } else {
        const chunk = sorted.slice(perDay, perDay * 2);
        const source = chunk.length > 0 ? chunk.concat(sorted) : sorted;
        for (let j = 0; j < perDay; j++) {
          const idx = j % source.length;
          dayArr.push(source[idx]);
        }
      }
      plan.push(dayArr);
    }

    return plan;
  };

  const weeklyPlan = buildWeeklyPlan();

  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}

        <div className="tabs">
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Профіль</button>
          <button className={`tab ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>План</button>
          <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Статистика</button>
          <button className={`tab ${activeTab === 'weightsessions' ? 'active' : ''}`} onClick={() => setActiveTab('weightsessions')}>Вага & Сесії</button>
          <button className={`tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>Соціальне</button>
        </div>

        <div className="section-container">
          {activeTab === 'profile' && (
            <ProfileSection profile={profile} setProfile={setProfile} saveProfile={saveProfile} profileSaving={profileSaving} />
          )}

          {activeTab === 'plan' && (
            <PlanSection weeklyPlan={weeklyPlan} loading={loading} />
          )}

          {activeTab === 'stats' && (
            <StatsSection monthStats={monthStats} weightMonthStats={weightMonthStats} />
          )}

          {activeTab === 'weightsessions' && (
            <WeightSessionsSection
              weightValue={weightValue}
              setWeightValue={setWeightValue}
              weightDate={weightDate}
              setWeightDate={setWeightDate}
              saveWeight={saveWeight}
              sessions={sessions}
            />
          )}

          {activeTab === 'social' && (
            <SocialSection rankingChart={rankingChart} rankings={rankings} />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
