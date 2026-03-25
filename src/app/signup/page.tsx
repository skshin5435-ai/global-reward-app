'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!email || !password || !fullName || !phoneNumber) {
        throw new Error('모든 항목을 입력해 주세요.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
          },
          emailRedirectTo: `${window.location.origin}/survey`,
        },
      });

      if (error) throw error;

      if (data.user) {
        alert('회원가입이 완료되었습니다! 이메일 인증 후 로그인해 주세요.');
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Signup Error:', error);
      Sentry.captureException(error, { tags: { section: 'auth_signup' } });
      setErrorMsg(error.message || '회원가입 도중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/survey`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error(error);
      setErrorMsg(`오류: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-3xl shadow-[0_10px_40px_rgba(32,201,151,0.15)] border border-[#27272a] p-8 md:p-10 relative overflow-hidden">
        
        {/* Mint Flare overlay */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#20c997] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#ffffff] mb-2 tracking-tight">NX Sweets</h1>
          <p className="text-[#a1a1aa] font-medium">새로운 시작, 건강한 내일을 기록하세요</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 text-red-400 text-sm font-bold p-4 rounded-xl mb-6 border border-red-500/20">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#71717a] ml-1">이름</label>
            <input 
              type="text" 
              placeholder="홍길동"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder-[#3f3f46] focus:border-[#20c997] focus:ring-1 focus:ring-[#20c997] transition-all outline-none text-base"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#71717a] ml-1">연락처</label>
            <input 
              type="tel" 
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder-[#3f3f46] focus:border-[#20c997] focus:ring-1 focus:ring-[#20c997] transition-all outline-none text-base"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#71717a] ml-1">이메일 (아이디)</label>
            <input 
              type="email" 
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder-[#3f3f46] focus:border-[#20c997] focus:ring-1 focus:ring-[#20c997] transition-all outline-none text-base"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#71717a] ml-1">비밀번호</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder-[#3f3f46] focus:border-[#20c997] focus:ring-1 focus:ring-[#20c997] transition-all outline-none text-base"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#20c997] text-[#003827] font-black text-lg py-4 rounded-2xl hover:bg-[#2ee0ab] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(32,201,151,0.3)]"
          >
            {loading ? '처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272a]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#18181b] px-2 text-[#52525b]">또는</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#121212] font-black text-md py-3 rounded-2xl hover:bg-[#e4e4e7] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          구글 계정으로 가입하기
        </button>

        <p className="mt-8 text-center text-sm text-[#71717a]">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-[#20c997] font-bold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
