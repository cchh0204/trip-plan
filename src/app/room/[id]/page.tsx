'use client';

import { useState, use, useEffect } from 'react';
import { Map as MapIcon, Users, Sparkles, ListTodo, Wallet, Search, MapPin, Trash2, Share2, Check, CheckCircle2, Undo2 } from 'lucide-react';
import { analyzePlace } from '@/app/actions/gemini';
import { supabase } from '@/lib/supabaseClient';

interface Location {
  id: string;
  name: string;
  originalName: string;
  address: string;
  description: string;
  category: string;
  status: 'wishlist' | 'confirmed';
}

export default function RoomWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [roomId] = useState(resolvedParams.id);
  const [leftPanel, setLeftPanel] = useState<'wishlist' | 'confirmed'>('wishlist');
  const [rightPanel, setRightPanel] = useState<'ai' | 'ledger'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [roomTitle, setRoomTitle] = useState('...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchRoomInfo();
  }, [roomId]);

  const fetchRoomInfo = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('title')
      .eq('id', roomId)
      .single();
    if (data) setRoomTitle(data.title);
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('room_id', roomId);
    if (data && !error) {
      setLocations(data);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAnalyzing(true);
    try {
      const placeInfo = await analyzePlace(searchQuery);
      // AI가 분석한 결과를 바탕으로 DB에 저장
      const { data: userSession } = await supabase.auth.getSession();
      const userId = userSession.session?.user.id;

      const { data, error } = await supabase
        .from('locations')
        .insert({
          room_id: roomId,
          place_id: placeInfo.originalName || placeInfo.name,
          name: placeInfo.name,
          address: placeInfo.address,
          description: placeInfo.description,
          category: placeInfo.category,
          lat: placeInfo.lat || 0,
          lng: placeInfo.lng || 0,
          added_by: userId,
          status: 'wishlist'
        })
        .select()
        .single();

      if (data && !error) {
        setLocations([...locations, data]);
        setSearchQuery('');
      }
    } catch (error) {
      console.error(error);
      alert('장소를 찾는 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteLocation = async (id: string) => {
    const { error } = await supabase.from('locations').delete().match({ id });
    if (!error) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const toggleStatus = async (id: string, newStatus: 'wishlist' | 'confirmed') => {
    const { error } = await supabase
      .from('locations')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) {
      setLocations(locations.map(loc => loc.id === id ? { ...loc, status: newStatus } : loc));
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      
      {/* BASE LAYER: Styled Background (No Google Maps) */}
      <div className="absolute inset-0 bg-surface-dim z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-outline-variant/20 flex flex-col items-center gap-4">
             <MapIcon size={120} strokeWidth={1} />
             <div className="text-xl font-bold tracking-tighter uppercase opacity-50">Virtual Workspace</div>
          </div>
        </div>
      </div>

      {/* OVERLAY: Top Header (Glassmorphism) */}
      <header className="absolute top-0 left-0 right-0 h-14 glass-panel border-b-0 m-4 rounded-xl flex items-center justify-between px-5 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center p-1.5 hover:bg-surface-lowest rounded-lg transition-colors text-on-surface-variant hover:text-on-surface"
            title="홈으로 가기"
          >
            <MapIcon size={18} />
          </button>
          <div className="w-px h-4 bg-outline-variant/50"></div>
          <div className="font-bold text-[15px] text-on-surface">{roomTitle}</div>
          <div className="text-[11px] font-mono bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md">
            ID: {roomId.substring(0, 8)}...
          </div>
        </div>
        
        {/* 공유 버튼 및 멤버 */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? '복사 완료!' : '링크 공유'}
          </button>
          <div className="w-px h-4 bg-outline-variant/50"></div>
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-red-400 border-2 border-surface-lowest shadow-sm"></div>
            <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-surface-lowest shadow-sm -ml-2"></div>
            <button className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container hover:bg-surface-high transition-colors -ml-2 z-10 border-2 border-surface-lowest text-on-surface-variant">
              <Users size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY: Left Sidebar (Floating Panel) */}
      <aside className="absolute top-20 bottom-20 left-4 w-72 glass-panel rounded-xl flex flex-col z-10 transition-transform duration-300">
        {/* Tab Navigation */}
        <div className="flex items-center p-2 border-b border-outline-variant/30 gap-1">
          <TabButton 
            active={leftPanel === 'wishlist'} 
            onClick={() => setLeftPanel('wishlist')} 
            icon={<MapIcon size={16} />} 
            label="위시리스트" 
          />
          <TabButton 
            active={leftPanel === 'confirmed'} 
            onClick={() => setLeftPanel('confirmed')} 
            icon={<ListTodo size={16} />} 
            label="확정 일정" 
          />
        </div>

        {/* Panel Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {leftPanel === 'wishlist' && (
            <div className="space-y-4 animate-in fade-in h-full flex flex-col">
              <h3 className="text-sm font-semibold text-on-surface mb-2">장소 추가 (AI 분석)</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="예: 시부야 스카이, 도쿄역 근처 맛집..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isAnalyzing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/70 disabled:opacity-30"
                >
                  {isAnalyzing ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <Search size={18} />}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto mt-4 space-y-2">
                {locations.filter(l => l.status === 'wishlist').length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <MapPin size={32} className="mx-auto mb-2" />
                    <p className="text-xs">위시리스트가 비어 있습니다.</p>
                  </div>
                ) : (
                  locations.filter(l => l.status === 'wishlist').map((loc) => (
                    <div key={loc.id} className="bg-surface-lowest border border-outline-variant/20 p-3 rounded-lg group">
                       <div className="flex items-start justify-between">
                         <div className="flex-1 min-w-0">
                           <div className="font-medium text-sm text-on-surface">{loc.name}</div>
                           <div className="text-[11px] text-on-surface-variant line-clamp-1">{loc.address || '정보를 불러오는 중...'}</div>
                           {loc.category && <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{loc.category}</span>}
                         </div>
                         <button 
                           onClick={() => deleteLocation(loc.id)}
                           className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                       <button
                         onClick={() => toggleStatus(loc.id, 'confirmed')}
                         className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] font-medium text-primary bg-primary/5 hover:bg-primary/15 py-1 rounded-md transition-colors"
                       >
                         <CheckCircle2 size={12} />
                         확정 일정에 추가
                       </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {leftPanel === 'confirmed' && (
            <div className="space-y-4 animate-in fade-in h-full flex flex-col">
              <h3 className="text-sm font-semibold text-on-surface mb-2">확정된 일정</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {locations.filter(l => l.status === 'confirmed').length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <ListTodo size={32} className="mx-auto mb-2" />
                    <p className="text-xs">확정된 장소가 없습니다.</p>
                    <p className="text-[10px] mt-1">위시리스트에서 장소를 확정해보세요.</p>
                  </div>
                ) : (
                  locations.filter(l => l.status === 'confirmed').map((loc, idx) => (
                    <div key={loc.id} className="bg-primary/5 border border-primary/20 p-3 rounded-lg group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                          <div>
                            <div className="font-medium text-sm text-on-surface">{loc.name}</div>
                            <div className="text-[11px] text-on-surface-variant line-clamp-1">{loc.address || ''}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleStatus(loc.id, 'wishlist')}
                          className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                          title="위시리스트로 되돌리기"
                        >
                          <Undo2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* OVERLAY: Right Sidebar (AI & Ledger) */}
      <aside className="absolute top-20 bottom-20 right-4 w-72 glass-panel rounded-xl flex flex-col z-10">
         <div className="flex items-center p-2 border-b border-outline-variant/30 gap-1">
          <TabButton 
            active={rightPanel === 'ai'} 
            onClick={() => setRightPanel('ai')} 
            icon={<Sparkles size={16} />} 
            label="AI 추천" 
          />
          <TabButton 
            active={rightPanel === 'ledger'} 
            onClick={() => setRightPanel('ledger')} 
            icon={<Wallet size={16} />} 
            label="가계부" 
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {rightPanel === 'ai' && (
            <div className="space-y-4 animate-in fade-in flex flex-col h-full">
               <div className="flex-1">
                 <h3 className="text-sm font-semibold text-on-surface mb-2">Gemini 여행 어시스턴트</h3>
                 <p className="text-xs text-on-surface-variant">확정된 장소들을 바탕으로 최적의 동선이나 꿀팁을 물어보세요.</p>
               </div>
               {/* Prompt Input Box mimicking AI Studio */}
               <div className="relative mt-auto">
                 <textarea 
                   placeholder="어떤 정보가 필요하신가요?" 
                   className="w-full bg-surface-lowest border border-outline-variant/50 rounded-xl pl-3 pr-9 py-2 text-[13px] focus:outline-none focus:border-primary resize-none h-16"
                 ></textarea>
                 <button className="absolute bottom-2 right-2 p-1.5 bg-primary text-on-primary rounded-lg hover:bg-primary/90">
                   <Sparkles size={14} />
                 </button>
               </div>
            </div>
          )}
          {rightPanel === 'ledger' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-semibold text-on-surface mb-2">스마트 정산 (JPY)</h3>
              <div className="mt-6 text-sm text-on-surface-variant">지출 내역이 없습니다.</div>
            </div>
          )}
        </div>
      </aside>

      {/* OVERLAY: Bottom Control Bar (Toggles & Presence) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel rounded-full px-6 py-3 flex items-center gap-6 z-10">
         <div className="flex items-center gap-3">
           <span className="text-xs font-medium text-on-surface-variant">참여자 핀 표시:</span>
           <div className="flex items-center gap-1">
             <button className="w-6 h-6 rounded-full bg-red-400 ring-2 ring-primary ring-offset-1 ring-offset-surface"></button>
             <button className="w-6 h-6 rounded-full bg-blue-400 opacity-50 hover:opacity-100 transition-opacity"></button>
           </div>
         </div>
      </div>

    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[13px] font-medium transition-all ${
        active 
          ? 'bg-surface-lowest text-on-surface shadow-sm' 
          : 'text-on-surface-variant hover:bg-surface-lowest/50 hover:text-on-surface'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
