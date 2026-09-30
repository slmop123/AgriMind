import React, { useState } from 'react';
import { Header, ActiveTabType } from './components/Header';
import { GreenSpaceDiagnosis } from './components/GreenSpaceDiagnosis';
import { CropPlanningConsultant } from './components/CropPlanningConsultant';
import { SmartSeedCalculator } from './components/SmartSeedCalculator';
import { SmartIrrigationCalculator } from './components/SmartIrrigationCalculator';
import { AgriculturalForum } from './components/AgriculturalForum';
import { AgriculturalChat } from './components/AgriculturalChat';
import { FloatingAgriBackground } from './components/FloatingAgriBackground';
import { Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('forum'); // Land directly on the newly added Forum
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [chatContextData, setChatContextData] = useState<any>(null);

  // Transition from Diagnosis or Crop Planner to Chat Consultant
  const handleAskFollowUp = (prompt: string, context: any) => {
    setChatInitialPrompt(prompt);
    setChatContextData(context);
    setActiveTab('chat');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F4F8F4] text-slate-800 flex flex-col font-['Cairo'] selection:bg-emerald-500/20 selection:text-emerald-900 relative">
      
      {/* Plentiful Floating Agricultural Background Elements (Machinery, Fruits, Vegetables, Seeds) */}
      <FloatingAgriBackground />

      {/* App Header (Light Glassmorphic) */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onPrint={handlePrint} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        
        {activeTab === 'diagnosis' && (
          <GreenSpaceDiagnosis onAskFollowUp={handleAskFollowUp} />
        )}

        {activeTab === 'planning' && (
          <CropPlanningConsultant onAskFollowUp={handleAskFollowUp} />
        )}

        {activeTab === 'seeds' && (
          <SmartSeedCalculator />
        )}

        {activeTab === 'calculator' && (
          <SmartIrrigationCalculator />
        )}

        {activeTab === 'forum' && (
          <AgriculturalForum />
        )}

        {activeTab === 'chat' && (
          <AgriculturalChat
            initialPrompt={chatInitialPrompt}
            contextData={chatContextData}
            onClearInitialPrompt={() => setChatInitialPrompt(null)}
          />
        )}

      </main>

      {/* Clean Glassmorphic Light Footer */}
      <footer className="w-full border-t border-emerald-500/20 bg-white/90 backdrop-blur-lg py-8 relative z-10 mt-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">AgriMind AI</span>
            <span className="text-slate-500">· مستشار تقنيات الزراعة، البذور وهندسة الري الذكي</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('forum')}
              className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors cursor-pointer"
            >
              منتدى المزارعين
            </button>
            <button
              onClick={() => setActiveTab('seeds')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              حاسبة البذور والمساحات
            </button>
            <button
              onClick={() => setActiveTab('diagnosis')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              فحص المسطحات الخضراء
            </button>
            <button
              onClick={() => setActiveTab('planning')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              تخطيط المحاصيل
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              حاسبة الري
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              الاستشارة المباشرة
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            تطوير مبني على أحدث نماذج الرؤية والذكاء الاصطناعي الزراعي بخط القاهرة © 2026
          </div>

        </div>
      </footer>

    </div>
  );
}
