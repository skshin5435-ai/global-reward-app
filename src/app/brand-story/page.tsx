'use client';

import React from 'react';
import Link from 'next/link';

export default function BrandStoryPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans px-4 py-8 md:px-6 md:py-10 selection:bg-[#20c997] selection:text-[#000000]">
      
      {/* HEADER */}
      <header className="mb-8 max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#ffffff] tracking-tight mb-2">
            NX Sweets <span className="text-[#20c997]">Story</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg">건강한 단맛의 비밀, 제조 공정과 대표의 이야기를 만나보세요.</p>
        </div>
        <Link 
          href="/" 
          className="bg-[#18181b] hover:bg-[#27272a] text-[#ffffff] px-5 py-3 rounded-xl font-bold transition-all border border-[#27272a] flex-shrink-0"
        >
          돌아가기 🔙
        </Link>
      </header>

      <main className="flex flex-col gap-10 pb-20 max-w-3xl mx-auto">
        
        {/* FACTORY VIDEO SECTION */}
        <section className="bg-[#121212] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(32,201,151,0.2)] ring-1 ring-[#20c997]/30">
          <div className="p-6 md:p-8 bg-[#18181b] border-b border-[#27272a]">
            <h2 className="text-2xl font-black text-[#20c997] mb-2">제조 공정 (Manufacturing Process)</h2>
            <p className="text-[#a1a1aa]">첨단 자동화 설비를 통해 안전하고 깨끗하게 생산되는 프리미엄 알룰로스의 제조 현장을 확인하세요.</p>
          </div>
          <div className="w-full aspect-video bg-[#000]">
            <video 
              controls 
              autoPlay 
              muted 
              loop
              playsInline
              poster="https://img1.wsimg.com/isteam/ip/2a199dd0-0405-4cd7-aca0-f7699ef1019d/thumbnails/thumbnail-0955a721-0429-4800-920d-bd062b4eb007.png"
              className="w-full h-full object-contain"
              src="https://img1.wsimg.com/isteam/ip/2a199dd0-0405-4cd7-aca0-f7699ef1019d/video/NX.mp4"
            />
          </div>
        </section>

        {/* FOUNDER STORY SECTION */}
        <section className="bg-[#121212] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(255,122,0,0.2)] ring-1 ring-[#FF7A00]/30">
          <div className="p-6 md:p-8 bg-[#18181b] border-b border-[#27272a]">
            <h2 className="text-2xl font-black text-[#FF7A00] mb-2">대표 인터뷰 (Young Kim's Story)</h2>
            <p className="text-[#a1a1aa]">25년 이상 제2형 당뇨를 앓으며 깨달은 '건강한 단맛'의 중요성과 NX Sweets의 탄생 배경입니다.</p>
          </div>
          <div className="w-full aspect-video bg-[#000]">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/3-ho4eJ0lfU?rel=0&showinfo=0&autoplay=0" 
              title="Young Kim's Story" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="p-6 md:p-8 text-[#d4d4d8] leading-relaxed space-y-4">
            <h3 className="text-xl font-bold text-[#ffffff] mb-3">Sweetness with Purpose</h3>
            <p>
              <strong className="text-[#20c997]">NX Sweets</strong>는 25년 이상 제2형 당뇨병을 앓아온 <strong className="text-[#ffffff]">영 김(Young Kim)</strong> 대표에 의해 설립되었습니다. 
              당뇨와 함께 살아가는 고통과 식단 조절의 희생을 직접 경험한 그는, 삶을 즐기면서도 건강한 식단을 유지하는 것이 얼마나 어려운지 누구보다 잘 알고 있었습니다.
            </p>
            <p>
              그는 우연히 <strong className="text-[#ffffff]">알룰로스(Allulose)</strong>를 발견하게 되었고, 이 천연 0칼로리 감미료가 세상을 바꿀 수 있다고 확신했습니다. 
              최고 품질의 Non-GMO 원료만을 엄선하여 전 세계 사람들에게 합리적인 가격의 프리미엄 알룰로스를 제공하는 것, 이것이 NX Sweets의 사명입니다.
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="max-w-3xl mx-auto border-t border-[#27272a] pt-10 pb-12 flex flex-col items-center justify-center gap-6">
        <p className="text-[#71717a] text-sm font-medium">© 2026 NX Sweets. All rights reserved.</p>
      </footer>
    </div>
  );
}
