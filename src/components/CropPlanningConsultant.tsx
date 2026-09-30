import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Sun,
  Droplets,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check,
  CheckCircle,
  HelpCircle,
  Thermometer,
  Sprout,
  TreeDeciduous,
  Wheat,
  Ruler
} from 'lucide-react';
import { POPULAR_CROPS, POPULAR_LOCATIONS } from '../data/presets';
import { CropPlanResult } from '../types';

interface CropPlanningConsultantProps {
  onAskFollowUp: (prompt: string, contextData: any) => void;
}

export const CropPlanningConsultant: React.FC<CropPlanningConsultantProps> = ({ onAskFollowUp }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('طماطم');
  const [customCrop, setCustomCrop] = useState<string>('');
  const [location, setLocation] = useState<string>('الرياض، المملكة العربية السعودية');
  const [landType, setLandType] = useState<string>('حديقة منزلية / أحواض مرتفعة');
  const [areaM2, setAreaM2] = useState<number>(40);
  const [experience, setExperience] = useState<string>('متوسط');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<CropPlanResult | null>(null);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  const landTypes = [
    { label: 'حديقة منزلية / أحواض مرتفعة', desc: 'أحواض وأصص كبيرة أو حوش منزلي' },
    { label: 'أرض زراعية مفتوحة', desc: 'مزرعة أو بستان بتربة طبيعية' },
    { label: 'بيوت محمية / شبك تظليل', desc: 'حماية من حرارة الصيف الشديدة' },
    { label: 'زراعة مائية (Hydroponics)', desc: 'أنابيب مائية بدون تربة تقليدية' },
  ];

  const allMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // Submit Planning Request
  const handleGeneratePlan = async () => {
    const cropToUse = customCrop.trim() ? customCrop.trim() : selectedCrop;
    if (!cropToUse) {
      setError('يرجى تحديد أو كتابة اسم المحصول.');
      return;
    }

    if (!location.trim()) {
      setError('يرجى كتابة أو اختيار موقعك الجغرافي.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plan-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: cropToUse,
          location,
          landType,
          areaM2: Number(areaM2) || 40,
          farmingExperience: experience,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'تعذر توليد خطة الزراعة.');
      }

      setPlanResult(resData.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إعداد الخطة الزراعية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPlan = () => {
    if (!planResult) return;
    const textToCopy = `${planResult.standardFormattedHeader}\n\n1. مدى التوافق والملائمة: ${planResult.feasibility.suitability}\n${planResult.feasibility.climateEvaluation}\n\n2. متى تزرع؟ (التقويم الزراعي):\nأشهر البذر: ${planResult.plantingCalendar.sowingMonths.join('، ')}\nأشهر الحصاد: ${planResult.plantingCalendar.harvestMonths.join('، ')}\n\n3. أين تزرع؟:\nالشمس: ${planResult.whereToPlant.sunlightRequirement}\nالمسافات: ${planResult.whereToPlant.spacePerPlant}\nالتربة: ${planResult.whereToPlant.soilTypeAndPH}\n\n4. كيف تزرع؟:\n${planResult.howToPlant.growthSteps.map(s => `${s.stepNumber}. ${s.title}: ${s.description}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* Intro Header Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/25">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              <span>القسم الثاني: مستشار التخطيط الزراعي الذكي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              مخطط زراعة المحاصيل والحدائق
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              اختر أي محصول، خضار، أو فاكهة وحدد مدينتك أو مناخك؛ ليقوم المستشار الزراعي بفحص الملاءمة المناخية، وحساب التقويم الزراعي الدقيق (متى، أين، وكيف تزرع)، وجدولة الري والتسميد خطوة بخطوة.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Parameters Column */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-emerald-500/20 space-y-6">
            
            {/* Target Crop Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                اختر المحصول أو اكتب ما ترغب بزراعته:
              </label>
              
              {/* Popular quick chips */}
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-44 overflow-y-auto pr-1">
                {POPULAR_CROPS.map((crop) => {
                  const isSelected = selectedCrop === crop.name && !customCrop.trim();
                  return (
                    <button
                      key={crop.name}
                      type="button"
                      onClick={() => {
                        setSelectedCrop(crop.name);
                        setCustomCrop('');
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300'
                      }`}
                    >
                      <span>{crop.icon}</span>
                      <span>{crop.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Crop Input */}
              <input
                type="text"
                placeholder="أو اكتب محصولاً آخر (مثال: أفوكادو، زعفران، ذرة حلوة، يقطين...)"
                value={customCrop}
                onChange={(e) => setCustomCrop(e.target.value)}
                className="w-full glass-input text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Location & Climate */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>الموقع والمدينة (لدراسة درجات الحرارة والمناخ):</span>
              </label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full glass-input text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none mb-2"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-white text-slate-900">
                    {loc}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="أو اكتب اسم مدينتك / دولتك يدوياً..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full glass-input text-slate-900 text-xs px-3.5 py-2 rounded-xl focus:outline-none"
              />
            </div>

            {/* Land Type */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>نوع البيئة أو الأرض المستهدفة:</span>
              </label>
              <div className="space-y-1.5">
                {landTypes.map((type) => {
                  const isSelected = landType === type.label;
                  return (
                    <button
                      key={type.label}
                      type="button"
                      onClick={() => setLandType(type.label)}
                      className={`w-full p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{type.label}</div>
                      <div className="text-[10px] text-slate-500">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-emerald-600" />
                  <span>المساحة المخصصة:</span>
                </label>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {areaM2} م²
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>10 م²</span>
                <span>200 م²</span>
                <span>500 م²</span>
              </div>
            </div>

            {/* Farming Experience */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                مستوى خبرتك الزراعية:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['مبتدئ (هاوٍ جديد)', 'متوسط', 'مزارع متقدم'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperience(lvl)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      experience === lvl
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleGeneratePlan}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(5,150,105,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري دراسة المناخ وتوليد الخطة الزراعية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد خطة زراعة المحصول الذكية</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

          </div>

        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {!planResult && !isLoading && (
            <div className="h-full min-h-[420px] rounded-3xl glass-panel p-8 border border-emerald-500/15 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-slate-800">ابدأ بتخطيط محصولك القادم</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  حدد المحصول ومدينتك ثم اضغط &quot;توليد خطة زراعة المحصول&quot;. سيقوم المستشار بتفصيل الجدوى المناخية، والتقويم الشهري، وتحديد أين وكيف تزرع مع خطوات التسميد والري.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[420px] rounded-3xl glass-panel p-8 border border-emerald-500/20 flex flex-col items-center justify-center text-center space-y-5 animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <div className="space-y-2">
                <h3 className="text-base font-bold text-emerald-800">جاري إعداد الخطة الزراعية المتكاملة...</h3>
                <p className="text-xs text-slate-500">
                  فحص التوافق المناخي لموقعك · بناء التقويم الموسمي · تفصيل إرشادات الري والتربة
                </p>
              </div>
            </div>
          )}

          {planResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Standard Formatted Response as required */}
              <div className="rounded-3xl bg-white border-2 border-emerald-400 p-5 sm:p-6 shadow-md relative">
                <div className="flex items-center justify-between mb-4 border-b border-emerald-200 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                    <span>🍎 خطة زراعة {planResult.cropTitle} في {planResult.location}</span>
                  </h3>
                  <button
                    onClick={handleCopyPlan}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                  >
                    {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPlan ? 'تم النسخ!' : 'نسخ الخطة'}</span>
                  </button>
                </div>

                <div className="space-y-4 text-sm leading-relaxed text-slate-800">
                  
                  {/* Point 1: Feasibility */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
                      <strong className="text-slate-900 text-base">مدى التوافق والملائمة:</strong>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                        {planResult.feasibility.suitability}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 pr-7">
                      {planResult.feasibility.climateEvaluation}
                    </p>
                    <p className="text-xs text-emerald-700 pr-7 font-bold">
                      🌾 <strong className="text-slate-800">الإنتاجية المتوقعة:</strong> {planResult.feasibility.expectedYield}
                    </p>
                  </div>

                  {/* Point 2: When to plant (Calendar) */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
                      <strong className="text-slate-900 text-base">متى تزرع؟ (التقويم الزراعي):</strong>
                    </div>
                    <div className="pr-7 text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-500">أشهر البذر / التشتيل:</span>
                        {planResult.plantingCalendar.sowingMonths.map((m, i) => (
                          <span key={i} className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                            {m}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-500">أشهر الحصاد المتوقعة:</span>
                        {planResult.plantingCalendar.harvestMonths.map((m, i) => (
                          <span key={i} className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                            {m}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        🌱 مدة الإنبات: <span className="text-slate-900 font-bold">{planResult.plantingCalendar.idealGerminationDays}</span> | الحرارة المثالية: <span className="text-slate-900 font-bold">{planResult.plantingCalendar.temperatureRange.germinationOptimal}</span>
                      </p>
                    </div>
                  </div>

                  {/* Point 3: Where to plant */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">3</span>
                      <strong className="text-slate-900 text-base">أين تزرع؟:</strong>
                    </div>
                    <ul className="list-disc list-inside pr-7 text-xs text-slate-700 space-y-1 font-medium">
                      <li><strong className="text-slate-900">احتياج الشمس:</strong> {planResult.whereToPlant.sunlightRequirement}</li>
                      <li><strong className="text-slate-900">المسافات:</strong> {planResult.whereToPlant.spacePerPlant} (بين النباتات) | {planResult.whereToPlant.spaceBetweenRows} (بين الخطوط)</li>
                      <li><strong className="text-slate-900">نوع التربة وحموضتها:</strong> {planResult.whereToPlant.soilTypeAndPH}</li>
                      <li><strong className="text-slate-900">الاستيعاب التقديري لمساحتك ({areaM2} م²):</strong> {planResult.whereToPlant.spaceCapacityEstimate}</li>
                    </ul>
                  </div>

                  {/* Point 4: How to plant */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">4</span>
                      <strong className="text-slate-900 text-base">كيف تزرع؟ (خطوات متسلسلة):</strong>
                    </div>
                    <div className="pr-7 space-y-2">
                      {planResult.howToPlant.growthSteps.map((step) => (
                        <div key={step.stepNumber} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-emerald-800">الخطوة {step.stepNumber} ({step.title}): </span>
                          <span className="text-slate-600">{step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Visual 12-Month Agricultural Calendar Bar */}
              <div className="rounded-3xl glass-panel p-6 border border-emerald-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">التقويم الزراعي السنوي لموقعك</h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                      <span>بذر / تشتيل</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                      <span>موسم حصاد</span>
                    </span>
                  </div>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {allMonths.map((m) => {
                    const isSowing = planResult.plantingCalendar.sowingMonths.some(sm => sm.includes(m) || m.includes(sm));
                    const isHarvest = planResult.plantingCalendar.harvestMonths.some(hm => hm.includes(m) || m.includes(hm));

                    let badgeColor = 'bg-white text-slate-400 border-slate-200';
                    if (isSowing && isHarvest) {
                      badgeColor = 'bg-gradient-to-b from-emerald-100 to-amber-100 text-slate-900 border-emerald-400 font-bold shadow-xs';
                    } else if (isSowing) {
                      badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-xs';
                    } else if (isHarvest) {
                      badgeColor = 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-xs';
                    }

                    return (
                      <div
                        key={m}
                        className={`p-2 rounded-xl border text-center text-xs transition-all ${badgeColor}`}
                      >
                        <div className="text-[11px] font-bold truncate">{m}</div>
                        <div className="text-[9px] mt-0.5 truncate font-medium">
                          {isSowing && isHarvest ? 'بذر وحصاد' : isSowing ? 'زراعة' : isHarvest ? 'حصاد' : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Irrigation & Fertilization Schedules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Irrigation Breakdown */}
                <div className="rounded-3xl glass-panel p-5 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                    <Droplets className="w-4 h-4 text-teal-600" />
                    <span>جدول الري حسب مراحل النمو</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">مرحلة الشتلات والإنبات:</span>
                      <span className="text-slate-900 font-bold">{planResult.howToPlant.irrigationSchedule.seedlingStage}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">مرحلة النمو الخضري:</span>
                      <span className="text-slate-900 font-bold">{planResult.howToPlant.irrigationSchedule.vegetativeStage}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">مرحلة الإثمار والنضج:</span>
                      <span className="text-slate-900 font-bold">{planResult.howToPlant.irrigationSchedule.fruitingStage}</span>
                    </div>
                  </div>
                </div>

                {/* Fertilization Program */}
                <div className="rounded-3xl glass-panel p-5 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>برنامج التسميد الموصى به</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {planResult.howToPlant.fertilizationGuide.map((fert, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-emerald-700 block text-[10px] font-bold">{fert.stage}:</span>
                        <span className="text-slate-900 font-medium">{fert.fertilizer}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Organic Pest and Risk Protection */}
              {planResult.pestAndDiseaseManagement && planResult.pestAndDiseaseManagement.length > 0 && (
                <div className="rounded-3xl glass-panel p-6 border border-emerald-500/25 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">الوقاية والمكافحة العضوية المتكاملة (IPM)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {planResult.pestAndDiseaseManagement.map((pest, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white border border-amber-300 shadow-2xs text-xs space-y-1">
                        <span className="font-bold text-amber-900 block">{pest.pestOrDisease}</span>
                        <p className="text-slate-600 text-[11px]">
                          <strong className="text-slate-800">الوقاية:</strong> {pest.prevention}
                        </p>
                        <p className="text-emerald-800 text-[11px]">
                          🌿 <strong className="text-emerald-700">العلاج العضوي:</strong> {pest.organicTreatment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to action follow-up */}
              {planResult.followUpPrompt && (
                <div className="rounded-3xl bg-gradient-to-r from-teal-100 via-emerald-50 to-white border-2 border-teal-300 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1 text-center sm:text-right">
                    <span className="text-[11px] text-teal-800 font-bold">متابعة التخطيط مع المستشار</span>
                    <p className="text-xs text-slate-700 font-medium max-w-lg">
                      {planResult.followUpPrompt}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAskFollowUp(
                        planResult.followUpPrompt,
                        {
                          crop: planResult.cropTitle,
                          location: planResult.location,
                          areaM2,
                          suitability: planResult.feasibility.suitability,
                        }
                      )
                    }
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>اسأل عن التفاصيل الآن</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
