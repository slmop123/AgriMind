import React from 'react';
import { Sprout, Compass, Droplet, MessageSquareText, ShieldCheck, Printer, Wheat, Users } from 'lucide-react';

export type ActiveTabType = 'diagnosis' | 'planning' | 'seeds' | 'calculator' | 'forum' | 'chat';

interface HeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onPrint }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 border-b border-emerald-500/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_4px_20px_rgba(5,150,105,0.3)]">
              <Sprout className="w-7 h-7 animate-pulse text-white" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800">
                  AgriMind AI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  مستشار زراعي ذكي
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden xs:block font-medium">
                فحص المساحات الخضراء، حساب البذور والمياه، وهندسة التخطيط الزراعي
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            {onPrint && (
              <button
                onClick={onPrint}
                title="طباعة التقرير الزراعي أو حفظه كـ PDF"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>حفظ التقرير PDF</span>
              </button>
            )}
            
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full text-xs text-emerald-800 font-bold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-mono text-[11px] tracking-wide">النموذج جاهز</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Light Mode, Mobile-First, Touch-Friendly) */}
        <div className="pb-3 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-2 space-x-reverse min-w-max p-1 bg-slate-100/90 border border-slate-200 rounded-2xl shadow-inner">
            
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'diagnosis'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>فحص وتطوير المساحة الخضراء</span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'planning'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>مستشار التخطيط الزراعي</span>
            </button>

            <button
              onClick={() => setActiveTab('seeds')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'seeds'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white'
              }`}
            >
              <Wheat className="w-4 h-4" />
              <span>حاسبة البذور والمساحات (م² و م³)</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white'
              }`}
            >
              <Droplet className="w-4 h-4" />
              <span>حاسبة هندسة الري</span>
            </button>

            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'forum'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>منتدى المزارعين (مفتوح للجميع)</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>استشارة الخبير المباشر</span>
            </button>

          </nav>
        </div>

      </div>
    </header>
  );
};
