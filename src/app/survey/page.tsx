'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

export default function SurveyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [diabetesType, setDiabetesType] = useState('');
  const [channel, setChannel] = useState('');
  const [pastSweetener, setPastSweetener] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Verify authentication
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/login');
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        // Check if survey already exists
        const { data: surveys, error: surveyError } = await supabase
          .from('user_surveys')
          .select('id')
          .eq('user_id', uid)
          .limit(1);
        
        if (surveyError) throw surveyError;

        if (surveys && surveys.length > 0) {
          // Already have survey, go to dashboard
          router.replace('/');
          return;
        }

        // Ready to display survey
        setLoading(false);

      } catch (error) {
        console.error('Session error:', error);
        Sentry.captureException(error, { tags: { section: 'survey_auth_check' } });
        router.replace('/login');
      }
    };

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diabetesType || !channel || !pastSweetener) {
      setErrorMsg('모든 항목을 선택해 주세요.');
      return;
    }
    if (!consent) {
      setErrorMsg('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const responses = {
        diabetes_type: diabetesType,
        discovery_channel: channel,
        past_sweeteners: pastSweetener,
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_surveys')
        .insert([{ user_id: userId, responses }]);

      if (error) throw error;

      // Survey created, go to dashboard
      router.replace('/');

    } catch (error) {
      console.error('Survey submission error:', error);
      Sentry.captureException(error, { 
        tags: { section: 'survey_submission' },
        extra: { responses: { diabetes_type: diabetesType, channel, pastSweetener } }
      });
      setErrorMsg('네트워크 상태를 확인해 주세요. 설문 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#20c997]">
        <div className="animate-spin w-10 h-10 border-4 border-[#20c997] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans px-4 py-8 md:px-6 md:py-10 flex justify-center selection:bg-[#FF7A00] selection:text-[#000000]">
      <div className="w-full max-w-lg bg-[#18181b] rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(255,122,0,0.15)] border border-[#27272a]">
        <h1 className="text-2xl md:text-3xl font-black text-[#FF7A00] mb-2 tracking-tight">건강 프로필 등록</h1>
        <p className="text-[#a1a1aa] mb-8 font-medium text-sm">개인 맞춤형 혈당 관리와 리워드 제공을 위해 정확히 선택해 주세요.</p>

        {errorMsg && (
          <div className="bg-red-500/10 text-red-400 text-sm font-bold p-4 rounded-xl mb-6 border border-red-500/20">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Question 1: Diabetes Type */}
          <fieldset className="space-y-3">
            <legend className="text-[#ffffff] font-bold text-lg mb-3">1. 현재 건강 목표 및 당뇨 유형은 무엇인가요?</legend>
            {['제1형 당뇨', '제2형 당뇨', '전단계 (위험군)', '다이어트 및 체중 관리 목적', '단순 건강 관리'].map(op => (
              <label key={op} className={`block p-4 rounded-xl border cursor-pointer transition-all ${diabetesType === op ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00]' : 'bg-[#121212] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'}`}>
                <input type="radio" className="hidden" name="diabetesType" value={op} onChange={(e) => setDiabetesType(e.target.value)} />
                <span className="font-bold">{op}</span>
              </label>
            ))}
          </fieldset>

          <hr className="border-[#27272a]" />

          {/* Question 2: Channel */}
          <fieldset className="space-y-3">
            <legend className="text-[#ffffff] font-bold text-lg mb-3">2. NX Sweets 알룰로스를 어떻게 알게 되셨나요?</legend>
            {['아마존(Amazon) 추천', '인스타그램/소셜 미디어', '지인 추천', '의사/전문가 권유', '검색', '기타'].map(op => (
              <label key={op} className={`block p-4 rounded-xl border cursor-pointer transition-all ${channel === op ? 'bg-[#20c997]/20 border-[#20c997] text-[#20c997]' : 'bg-[#121212] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'}`}>
                <input type="radio" className="hidden" name="channel" value={op} onChange={(e) => setChannel(e.target.value)} />
                <span className="font-bold">{op}</span>
              </label>
            ))}
          </fieldset>

          <hr className="border-[#27272a]" />

          {/* Question 3: Past Sweeteners */}
          <fieldset className="space-y-3">
            <legend className="text-[#ffffff] font-bold text-lg mb-3">3. 기존에 주로 사용하시던 감미료는 무엇인가요?</legend>
            {['설탕 (정제당)', '스테비아 (Stevia)', '에리스리톨 (Erythritol)', '꿀/올리고당', '사용하지 않음'].map(op => (
              <label key={op} className={`block p-4 rounded-xl border cursor-pointer transition-all ${pastSweetener === op ? 'bg-[#20c997]/20 border-[#20c997] text-[#20c997]' : 'bg-[#121212] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'}`}>
                <input type="radio" className="hidden" name="pastSweetener" value={op} onChange={(e) => setPastSweetener(e.target.value)} />
                <span className="font-bold">{op}</span>
              </label>
            ))}
          </fieldset>

          <hr className="border-[#27272a]" />

          {/* Question 4: Privacy Consent */}
          <div className="bg-[#121212] border border-[#27272a] p-5 rounded-2xl flex gap-4 items-start focus-within:border-[#20c997] transition-all">
            <input 
              type="checkbox" 
              id="privacyConsent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-[#3f3f46] text-[#20c997] focus:ring-[#20c997] bg-[#18181b] cursor-pointer"
            />
            <label htmlFor="privacyConsent" className="text-[#a1a1aa] text-sm leading-relaxed cursor-pointer">
              <strong className="text-[#ffffff] block mb-1 text-base">개인정보 수집 및 이용 동의 (필수)</strong>
              제공해주신 건강 프로필 데이터는 NX Sweets의 개인 맞춤형 리워드 지급 및 통계적 분석 목적으로만 안전하게 <strong>암호화</strong>되어 활용됩니다. 해당 정보는 언제든지 삭제 요청할 수 있습니다.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="mt-8 w-full flex items-center justify-center bg-[#FF7A00] text-[#121212] font-black text-xl py-5 rounded-2xl hover:bg-[#FFA34D] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(255,122,0,0.5)]"
          >
            {submitting ? '저장 중...' : '프로필 완성하고 대시보드 입장하기 🚀'}
          </button>
        </form>

      </div>
    </div>
  );
}
