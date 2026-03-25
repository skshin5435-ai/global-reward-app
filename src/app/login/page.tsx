'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/');
    } catch (error: any) {
      setErrorMsg(error.message || '로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    sessionStorage.setItem('guestMode', 'true');
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-[#0e1511] text-[#dde4de] flex flex-col items-center justify-center p-6 relative overflow-hidden font-[family-name:var(--font-lexend)]">
      
      {/* Premium Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#20c997] rounded-full blur-[120px] opacity-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF7A00] rounded-full blur-[120px] opacity-10"></div>
      
      {/* Hero Section */}
      <div className="w-full max-w-lg z-10 text-center flex flex-col items-center">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-block px-4 py-1.5 bg-[#20c997]/10 border border-[#20c997]/20 rounded-full text-[#20c997] text-sm font-black mb-6">
            PREMIUM HEALTHCARE
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter leading-none bg-gradient-to-b from-white to-[#bbcac1] bg-clip-text text-transparent">
            건강한 단맛의 혁명
          </h1>
          <p className="text-xl md:text-2xl text-[#bbcac1] font-medium leading-relaxed">
            혈당 관리와 리워드를 한 번에,<br /> 
            <span className="text-white font-black">NX Sweets</span>와 시작하세요.
          </p>
        </div>

        {/* Action Area */}
        <div className="w-full flex flex-col gap-4 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {!showLoginForm ? (
            <>
              <Link 
                href="/signup"
                className="w-full bg-gradient-to-r from-[#20c997] to-[#1cb689] text-[#003827] font-black text-xl py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(32,201,151,0.3)] flex items-center justify-center"
              >
                새로 시작하기 (회원가입)
              </Link>

              <button 
                onClick={() => setShowLoginForm(true)}
                className="w-full bg-[#1a211d] border border-[#2f3632] text-white font-bold text-lg py-4 rounded-2xl hover:bg-[#242c28] hover:border-[#20c997]/40 transition-all flex items-center justify-center"
              >
                기존 계정으로 로그인
              </button>

              <button 
                onClick={handleGuestEntry}
                className="mt-4 text-[#bbcac1] font-bold text-md hover:text-white hover:underline transition-all underline-offset-4"
              >
                비회원으로 둘러보기
              </button>
            </>
          ) : (
            <div className="bg-[#1a211d]/80 backdrop-blur-xl border border-[#2f3632] p-8 rounded-3xl w-full text-left shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">로그인</h2>
                <button onClick={() => setShowLoginForm(false)} className="text-[#bbcac1] hover:text-white text-sm font-bold">뒤로가기</button>
              </div>

              {errorMsg && <p className="text-red-400 text-sm font-bold mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{errorMsg}</p>}

              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                <input 
                  type="email" 
                  placeholder="이메일" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0e1511] border border-[#2f3632] rounded-xl px-4 py-4 text-white focus:border-[#20c997] outline-none transition-all"
                  required
                />
                <input 
                  type="password" 
                  placeholder="비밀번호" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0e1511] border border-[#2f3632] rounded-xl px-4 py-4 text-white focus:border-[#20c997] outline-none transition-all"
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#20c997] text-[#003827] font-black text-lg py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? '로그인 중...' : '확인'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Signature Branding */}
        <div className="mt-20 opacity-40 grayscale contrast-125">
           <span className="text-xs font-black tracking-[0.4em] uppercase text-[#bbcac1]">AUTHENTIC FLAVOR • SCIENTIFIC CARE</span>
        </div>
      </div>
    </div>
  );
}
