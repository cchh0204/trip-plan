'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Map, Plus, Calendar, ArrowRight, LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function LandingPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 내 여행 목록
  interface Room {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  }
  const [myRooms, setMyRooms] = useState<Room[]>([]);

  // 세션 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 로그인된 유저의 여행 목록 불러오기
  useEffect(() => {
    if (!user) { setMyRooms([]); return; }
    const fetchMyRooms = async () => {
      const { data: memberRows } = await supabase
        .from('members')
        .select('room_id')
        .eq('user_id', user.id);
      if (!memberRows || memberRows.length === 0) return;

      const roomIds = memberRows.map((m: { room_id: string }) => m.room_id);
      const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .in('id', roomIds)
        .order('created_at', { ascending: false });
      if (rooms) setMyRooms(rooms);
    };
    fetchMyRooms();
  }, [user]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsCreating(false);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate || !user) return;
    setIsSubmitting(true);

    try {
      // 1. 방 생성
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          title,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id
        })
        .select()
        .single();

      if (roomError || !room) throw roomError;

      // 2. 방장을 멤버로 추가 (기본 랜덤 컬러 발급 로직은 추후 고도화 가능, 지금은 임시 고정값)
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const { error: memberError } = await supabase
        .from('members')
        .insert({
          room_id: room.id,
          user_id: user.id,
          color_code: randomColor,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // 3. 해당 방으로 이동
      router.push(`/room/${room.id}`);
    } catch (error) {
      console.error('방 생성 오류:', error);
      alert('방 생성에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Map Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Tokyo&zoom=10&size=1000x1000&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:landscape|color:0xf0edee&style=feature:water|color:0xe4e2e3&key=PLACEHOLDER')] bg-cover bg-center" />

      {/* Main Glass Panel */}
      <div className="glass-panel w-full max-w-sm rounded-xl p-6 z-10 flex flex-col gap-6 relative">
        {/* Header */}
        <div className="text-center relative">
          {user && (
            <button 
              onClick={handleLogout}
              className="absolute right-0 top-0 p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut size={16} />
            </button>
          )}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-on-primary mb-4 shadow-md">
            <Map size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">J-Planner</h1>
          <p className="text-on-surface-variant mt-1.5 text-xs">
            {user ? `${user.user_metadata.full_name || '사용자'}님의 여행 플래너` : 'AI 기반 실시간 협업 일본 여행 플래너'}
          </p>
        </div>

        {/* Action Buttons / Form */}
        {!user ? (
          // 비로그인 상태: 구글 로그인 버튼
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-low p-4 rounded-lg text-center mb-2">
              <p className="text-[13px] text-on-surface-variant">플래너를 시작하려면 먼저 로그인해주세요.</p>
            </div>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-surface-lowest border border-outline-variant hover:bg-surface-container flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors shadow-sm text-[13px] text-on-surface"
            >
              <LogIn size={16} />
              Google 계정으로 시작하기
            </button>
          </div>
        ) : !isCreating ? (
          // 로그인 상태 (메인 뷰): 내 여행 방 목록 및 생성 버튼
          <div className="flex flex-col gap-4">
            {/* 참여 중인 방 목록 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">내 여행 목록</h3>
              {myRooms.length === 0 ? (
                <div className="text-center py-6 bg-surface-container-low rounded-lg border border-outline-variant/30">
                  <p className="text-[12px] text-on-surface-variant">아직 참여 중인 여행이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {myRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => router.push(`/room/${room.id}`)}
                      className="w-full text-left bg-surface-lowest border border-outline-variant/30 hover:border-primary/40 p-3 rounded-lg transition-colors group"
                    >
                      <div className="font-medium text-[13px] text-on-surface group-hover:text-primary transition-colors">{room.title}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {room.start_date} ~ {room.end_date}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant/50"></div>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full bg-primary text-on-primary hover:bg-primary/90 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-colors shadow-sm text-[13px]"
            >
              <Plus size={16} />
              새로운 여행 방 만들기
            </button>
          </div>
        ) : (
          // 방 생성 폼
          <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 duration-300">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-on-surface">여행 제목</label>
              <input 
                type="text" 
                placeholder="도쿄 먹방 투어" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-on-surface">시작일</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" size={14} />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg pl-8 pr-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-on-surface">종료일</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" size={14} />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg pl-8 pr-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-[13px] font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                뒤로
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-on-primary hover:bg-primary/90 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? '생성 중...' : '여행 시작하기'}
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-outline font-mono">
        v3.0.0-alpha • Supabase Auth
      </div>
    </main>
  );
}
