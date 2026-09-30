import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  HelpCircle,
  Sprout,
  ArrowDown
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AgriculturalChatProps {
  initialPrompt?: string | null;
  contextData?: any;
  onClearInitialPrompt?: () => void;
}

export const AgriculturalChat: React.FC<AgriculturalChatProps> = ({
  initialPrompt,
  contextData,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `أهلاً بك! أنا "عقل الزراعة الذكي" (AgriMind AI)، مستشارك الزراعي الرقمي المتخصص في هندسة الري، صحة النباتات، وتخطيط المحاصيل.

يسعدني الرد على كافة استفساراتك حول:
🌿 تشخيص أعراض ونقص عناصر النباتات.
💧 حساب كميات وتوقيت الري المثالي لحديقتك.
🍎 مواعيد وأسرار زراعة الخضروات والفواكه حسب مناخ منطقتك.
🧪 برامج التسميد والمكافحة العضوية الآمنة.

كيف يمكنني مساعدتك في حديقتك أو مزرعتك اليوم؟`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestion chips
  const suggestedQuestions = [
    'كيف أعالج اصفرار أوراق الحمضيات بسرعة؟',
    'ما هي أفضل مواعيد تشغيل شبكة الري بالتنقيط صيفاً؟',
    'كيف أحمي شتلات الطماطم من الذبابة البيضاء عضوياً؟',
    'كيف أحسب كمية سماد NPK المناسبة لحديقتي؟',
  ];

  // Auto-fill or send when initialPrompt changes
  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          contextData: contextData || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل استلام الرد من المستشار.');
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 2),
        role: 'model',
        content: `عذراً، حدث خطأ أثناء الاتصال بمستشار AgriMind AI: ${err.message || 'يرجى المحاولة مجدداً.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: 'تم بدء جلسة استشارة جديدة مع AgriMind AI. تفضل بطرح سؤالك الزراعي!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn text-slate-800">
      
      {/* Intro Header */}
      <div className="rounded-3xl glass-panel p-6 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              استشارة خبير AgriMind AI المباشرة
            </h2>
            <p className="text-xs text-slate-500">
              حوار تفاعلي للإجابة عن أسئلة التسميد، حل مشاكل التربة، وتخطيط الحديقة
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بدء محادثة جديدة</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl glass-panel p-4 sm:p-6 border border-emerald-500/20 min-h-[480px] max-h-[620px] flex flex-col justify-between">
        
        {/* Scrollable Messages Area */}
        <div className="overflow-y-auto space-y-4 pr-1 sm:pr-2 flex-1 scrollbar-thin">
          {messages.map((msg) => {
            const isBot = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                    <Sprout className="w-4 h-4 text-emerald-700" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 leading-relaxed ${
                    isBot
                      ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1">
                    {msg.content}
                  </div>
                  <div className={`text-[10px] mt-2 ${isBot ? 'text-slate-400' : 'text-emerald-100 text-left font-mono'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-emerald-300 rounded-2xl p-4 text-emerald-800 flex items-center gap-2 font-medium shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>AgriMind AI يفكر ويصيغ التوصية الزراعية...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>أسئلة شائعة يمكنك النقر عليها مباشرة:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[11px] text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer truncate max-w-full text-right shadow-2xs font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="pt-3 flex gap-2 items-center">
          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب استفسارك الزراعي هنا (اضغط Enter للإرسال)..."
            className="flex-1 glass-input text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-2xl resize-none focus:outline-none max-h-32 border-slate-300"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>

      </div>

    </div>
  );
};
