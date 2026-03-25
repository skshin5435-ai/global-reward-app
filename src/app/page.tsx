'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as Sentry from '@sentry/nextjs';

export default function Home() {
  const router = useRouter();
  const [bloodSugar, setBloodSugar] = useState('');
  const [timeType, setTimeType] = useState('fasting');
  const [allulose, setAllulose] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState(13); // Start at 13 for demo
  const [showPopup, setShowPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          if (sessionStorage.getItem('guestMode') === 'true') {
            setIsLoadingAuth(false);
            return;
          }
          router.replace('/login');
          return;
        }

        const uid = session.user.id;
        
        // Survey completion check
        const { data: surveys, error: surveyError } = await supabase
          .from('user_surveys')
          .select('id')
          .eq('user_id', uid)
          .limit(1);

        if (surveyError) throw surveyError;

        if (!surveys || surveys.length === 0) {
          router.replace('/survey');
          return;
        }

        setUserId(uid);
      } catch (err) {
        console.error('Auth check error:', err);
        Sentry.captureException(err, { tags: { section: 'dashboard_auth_guard' } });
        router.replace('/login');
      } finally {
        setIsLoadingAuth(false);
      }
    };
    initAuth();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchLogs();
    }
  }, [userId]);

  const fetchLogs = async () => {
    // Fetch logs from Supabase
    const { data: logs, error } = await supabase
      .from('glucose_logs')
      .select('recorded_at, blood_sugar, consumed_allulose')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true })
      .limit(30);

    let processedData = [];

    // Pre-fill with some dummy data to show stabilization visually
    const dummyData = [
      { date: 'Day -6', blood_sugar: 154, consumed_allulose: false },
      { date: 'Day -5', blood_sugar: 148, consumed_allulose: false },
      { date: 'Day -4', blood_sugar: 142, consumed_allulose: false },
      { date: 'Day -3', blood_sugar: 110, consumed_allulose: true },
      { date: 'Day -2', blood_sugar: 105, consumed_allulose: true },
      { date: 'Day -1', blood_sugar: 108, consumed_allulose: true },
    ];

    if (logs && logs.length > 0) {
      const realData = logs.map((l: any) => {
        const d = new Date(l.recorded_at);
        return {
          date: `${d.getMonth()+1}/${d.getDate()}`,
          blood_sugar: l.blood_sugar,
          consumed_allulose: l.consumed_allulose
        };
      });
      processedData = [...dummyData, ...realData].slice(-7); // take last 7
    } else {
      processedData = dummyData;
    }

    setChartData(processedData);
  };

  const handleRecord = async () => {
    if (!userId) {
      if (confirm('로그인이 필요한 기능입니다. 회원가입/로그인 페이지로 이동하시겠습니까?')) {
        sessionStorage.removeItem('guestMode');
        router.push('/login');
      }
      return;
    }

    if (!bloodSugar) return;
    const value = parseInt(bloodSugar, 10);
    
    // Input validation (mg/dL valid range check)
    if (isNaN(value) || value <= 0 || value >= 1000) {
      alert('올바른 혈당 수치(1~999 mg/dL)를 입력해 주세요.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('glucose_logs').insert([
        {
          user_id: userId,
          blood_sugar: value,
          type: timeType,
          consumed_allulose: allulose,
        }
      ]);

      if (error) {
        throw error;
      }

      setBloodSugar('');
      const newDays = consecutiveDays + 1;
      setConsecutiveDays(newDays);
      fetchLogs();
      
      // Success Sentry Log
      Sentry.captureMessage('Blood sugar log saved successfully', 'info');
      
      // Trigger Popup on save completion
      setShowPopup(true);
      
    } catch (err) {
      console.error(err);
      Sentry.captureException(err, { extra: { blood_sugar: value, timeType, allulose }});
      alert("데이터 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1b1b1b] p-4 rounded-xl shadow-lg border border-[#20c997]/30">
          <p className="text-[#e2e2e2] font-bold mb-1">{label}</p>
          <p className="text-[#FF7A00] font-black text-2xl">{data.blood_sugar} mg/dL</p>
          {data.consumed_allulose && (
            <span className="inline-block mt-2 bg-[#20c997]/20 text-[#20c997] px-2 py-1 rounded-md text-xs font-bold">
              NX Sweets 알룰로스 적용 🌿
           </span>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#20c997]">
        <div className="animate-spin w-12 h-12 border-4 border-[#20c997] border-t-transparent rounded-full shadow-[0_0_30px_rgba(32,201,151,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans px-4 py-8 md:px-6 md:py-10 selection:bg-[#20c997] selection:text-[#000000] relative">
      
      {/* HEADER */}
      <header className="mb-8 max-w-2xl mx-auto flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#ffffff] tracking-tight mb-2">
            혈당 기록 
            <span className="text-[#20c997] block mt-1">대시보드</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg mt-3">오늘의 혈당 수치를 간편하게 입력하세요.</p>
        </div>
        {userId ? (
          <button 
            onClick={async () => {
              await supabase.from('user_surveys').delete().eq('user_id', userId);
              await supabase.auth.signOut();
              router.replace('/login');
            }}
            className="bg-[#18181b] hover:bg-[#27272a] text-[#FF7A00] px-4 py-2 rounded-lg font-black text-sm transition-all border border-[#FF7A00]/50 shadow-[0_0_15px_rgba(255,122,0,0.1)] active:scale-95"
            title="Sign Out & Reset"
          >
            설문 초기화 + 로그아웃
          </button>
        ) : (
          <button 
            onClick={() => {
              sessionStorage.removeItem('guestMode');
              router.replace('/login');
            }}
            className="bg-[#20c997] hover:bg-[#34d399] text-[#121212] px-4 py-2 rounded-lg font-black text-sm transition-all shadow-[0_0_15px_rgba(32,201,151,0.2)] active:scale-95"
          >
            로그인 / 회원가입
          </button>
        )}
      </header>

      <main className="flex flex-col gap-8 md:gap-10 pb-20 max-w-2xl mx-auto">
        
        {/* CHART SECTION */}
        <section className="bg-[#121212] rounded-[24px] p-6 md:p-8 shadow-lg relative ring-1 ring-[#ffffff10]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#ffffff]">최근 7일 혈당 변화 📈</h2>
              <p className="text-[#a1a1aa] text-sm mt-1">알룰로스 섭취 후 혈당 안정화 추이를 확인하세요.</p>
            </div>
          </div>
          <div className="w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#20c997', strokeWidth: 2 }} />
                <ReferenceLine y={100} stroke="#FF7A00" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: '정상', fill: '#FF7A00', fontSize: 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="blood_sugar" 
                  stroke="#20c997" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#121212', stroke: '#20c997', strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: '#FF7A00', stroke: '#121212', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* REWARD CHALLENGE SECTION */}
        <section className="bg-[#121212] rounded-[24px] p-6 md:p-8 shadow-xl relative overflow-hidden ring-1 ring-[#20c997]/40">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#20c997]"></div>
          <h2 className="text-2xl font-bold text-[#ffffff] mb-2">리워드 챌린지 🏆</h2>
          <p className="text-[#a1a1aa] text-lg mb-6">연속 기록 미션 달성하고NX Sweets 혜택을 받으세요!</p>
          
          <div className="bg-[#18181b] rounded-[16px] p-6 mb-6 ring-1 ring-[#27272a]">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xl font-bold text-[#ffffff]">연속 기록 {consecutiveDays}일차</span>
              <span className="text-[#20c997] font-bold text-lg">{consecutiveDays} / 14 일</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-[#0a0a0a] h-6 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#20c997] to-[#FF7A00] h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((consecutiveDays / 14) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* INPUT FORM SECTION */}
        <section className="bg-[#121212] rounded-[24px] p-6 md:p-8 shadow-lg relative ring-1 ring-[#ffffff10]">
          <h2 className="text-2xl font-bold text-[#ffffff] mb-8">오늘의 기록</h2>
          
          <div className="flex flex-col gap-8">
            {/* Time Selector */}
            <div className="flex flex-col gap-4">
              <label className="text-xl font-semibold text-[#a1a1aa]">측정 시기</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'fasting', label: '식전' },
                  { id: 'post_meal_30', label: '식후 30분' },
                  { id: 'post_meal_60', label: '식후 60분' },
                  { id: 'post_meal_120', label: '식후 120분' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTimeType(t.id)}
                    className={`py-4 px-2 rounded-[16px] text-lg font-bold border-2 transition-all ${
                      timeType === t.id 
                      ? 'bg-[#18181b] border-[#20c997] text-[#ffffff]'
                      : 'bg-[#18181b] border-transparent text-[#71717a] hover:bg-[#27272a]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Sugar Input */}
            <div className="flex flex-col gap-4">
              <label className="text-xl font-semibold text-[#a1a1aa]">혈당 수치 (mg/dL)</label>
              <input
                type="number"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="수치를 입력하세요"
                className="bg-[#18181b] text-[#ffffff] text-5xl font-extrabold p-6 rounded-[16px] w-full text-center border-2 border-transparent focus:border-[#20c997] focus:ring-0 focus:outline-none transition-all placeholder-[#3f3f46]"
              />
            </div>

            {/* Allulose Checkbox */}
            <button 
              onClick={() => setAllulose(!allulose)}
              className={`flex items-center gap-5 p-6 rounded-[16px] mt-2 transition-all duration-300 text-left ${
                allulose ? 'bg-[#132c25] border-2 border-[#20c997]' : 'bg-[#18181b] border-2 border-transparent hover:bg-[#27272a]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-4 flex-shrink-0 transition-colors ${
                allulose ? 'bg-[#20c997] border-[#20c997]' : 'border-[#3f3f46] bg-[#121212]'
              }`}>
                {allulose && (
                  <svg className="w-8 h-8 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold select-none ${allulose ? 'text-[#ffffff]' : 'text-[#d4d4d8]'}`}>
                  NX Sweets 알룰로스 사용
                </span>
                <span className={`text-sm mt-1 transition-colors ${allulose ? 'text-[#20c997]' : 'text-[#71717a]'}`}>
                  혈당 스파이크를 저하시키는 대체감미료
                </span>
              </div>
            </button>

            {/* Submit Button */}
            <button
              onClick={handleRecord}
              disabled={isSaving || !bloodSugar}
              className={`mt-4 w-full py-6 rounded-[20px] text-2xl font-black transition-all duration-300 ${
                !bloodSugar || isSaving
                  ? 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#20c997] to-[#14B8A6] text-[#ffffff] shadow-[0_8px_20px_rgba(32,201,151,0.2)] hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              {isSaving ? '저장 중...' : '기록 저장하기'}
            </button>
          </div>
        </section>

        {/* BRAND STORY PROMO BANNER */}
        <section className="bg-[#18181b] rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] mt-2 border border-[#27272a] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-[#ffffff]">NX Sweets <span className="text-[#20c997]">제조 공정</span> & <span className="text-[#FF7A00]">스토리</span></h2>
              <p className="text-[#a1a1aa] text-lg font-medium">안전한 제조 과정과 25년 당뇨 환자인 대표의 진솔한 이야기를 영상으로 확인하세요.</p>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
              <a 
                href="/brand-story" 
                className="w-full md:w-auto bg-[#20c997] text-[#121212] px-8 py-4 rounded-[16px] font-black text-xl hover:bg-[#34d399] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(32,201,151,0.4)]"
              >
                영상 보러가기 🎬
              </a>
            </div>
          </div>
        </section>

        {/* OFFICIAL SITE PROMO BANNER (Restored Clean Background) */}
        <section className="bg-gradient-to-r from-[#20c997] to-[#14B8A6] rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(32,201,151,0.3)] mt-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <h2 className="text-2xl md:text-3xl font-black text-[#121212] drop-shadow-md">건강한 단맛의 비밀을 만나보세요</h2>
            <p className="text-[#064e3b] text-lg font-bold drop-shadow-sm">NX Sweets 브랜드의 모든 것을 확인하세요</p>
            <a 
              href="https://nxsweets.com" 
              target="_blank" 
              rel="noreferrer"
              className="mt-2 w-full max-w-sm bg-[#121212] text-[#20c997] py-4 md:py-5 rounded-[20px] font-black text-xl hover:bg-[#18181b] hover:text-[#34d399] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#27272a]"
            >
              Visit NX Sweets Official Site 🌿
            </a>
          </div>
        </section>

        {/* AMAZON PROMO BANNER (Media Enriched) */}
        <section className="bg-gradient-to-r from-[#FF7A00] to-[#E66A00] rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(255,122,0,0.4)] mt-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-[#ffffff] drop-shadow-md">당신의 혈당, 완벽하게 관리하세요!</h2>
              <p className="text-[#ffe8d6] text-lg font-medium drop-shadow-sm">Keto Friendly · Zero Net Carbs · Blood Glucose Friendly</p>
              <a 
                href="https://www.amazon.com/NXsweets-Indigestible-Maltodextrin-Sweetener-Certified/dp/B0G8R6V359/?tag=sanggyu-20" 
                target="_blank" 
                rel="noreferrer"
                className="mt-2 w-full max-w-sm bg-[#121212] text-[#FF7A00] py-4 md:py-5 rounded-[20px] font-black text-xl hover:bg-[#18181b] hover:text-[#FFA34D] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#27272a]"
              >
                Buy NX Sweets on Amazon 🛒
              </a>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-center drop-shadow-2xl mt-4 md:mt-0">
              <img 
                src="https://img1.wsimg.com/isteam/ip/2a199dd0-0405-4cd7-aca0-f7699ef1019d/917ffa38-8b06-4d42-bdaf-f812afacfb99.png/:/rs=w:400,h:400,cg:true,m/qt=q:95" 
                alt="NX Sweets Allulose Product" 
                className="max-h-[220px] object-contain hover:scale-110 hover:-rotate-3 transition-transform duration-500 ease-in-out cursor-pointer" 
              />
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="max-w-2xl mx-auto border-t border-[#27272a] pt-10 pb-12 flex flex-col items-center justify-center gap-6">
        <p className="text-[#71717a] text-sm font-medium">© 2026 NX Sweets. All rights reserved.</p>
      </footer>

      {/* REWARD POPUP OVERLAY */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/90 backdrop-blur-md">
          <div className="bg-[#121212] border-2 border-[#20c997] rounded-[32px] p-8 max-w-md w-full shadow-[0_0_80px_rgba(32,201,151,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-[#20c997]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl animate-bounce pt-2">🔒</span>
            </div>
            <h3 className="text-2xl font-black text-center text-[#ffffff] mb-4">
              NX Sweets를 통한 혈당 관리 데이터가 안전하게 암호화 저장되었습니다.
            </h3>
            
            <div className="bg-[#18181b] p-6 rounded-[20px] mb-8 border border-[#27272a]">
              <h4 className="text-[#FF7A00] font-black text-xl mb-2 text-center">지금 바로 NX Sweets로 혈당 관리를 시작하세요!</h4>
              <p className="text-center text-[#a1a1aa] text-sm mb-4 font-bold">Indigestible Maltodextrin Sweetener</p>
              <ul className="text-[#a1a1aa] text-sm mb-6 space-y-2 font-medium">
                <li>✅ Keto friendly & Low Calories</li>
                <li>✅ Boost natural GLP-1 effects</li>
                <li>✅ Suppress Hunger & Zero net carbs</li>
                <li>✅ Blood Glucose Friendly & Plant-Based</li>
              </ul>
              
              <a 
                href="https://www.amazon.com/NXsweets-Indigestible-Maltodextrin-Sweetener-Certified/dp/B0G8R6V359/?tag=sanggyu-20" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#FF7A00] text-[#ffffff] py-4 rounded-xl font-black text-xl hover:brightness-110 active:scale-95 transition-all w-full text-center shadow-[0_4px_20px_rgba(255,122,0,0.3)]"
              >
                Buy NX Sweets on Amazon 🛒
              </a>
            </div>

            <button 
              onClick={() => setShowPopup(false)}
              className="w-full text-[#71717a] font-bold py-3 hover:text-[#ffffff] transition-colors bg-[#18181b] rounded-xl hover:bg-[#27272a]"
            >
              팝업 닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
