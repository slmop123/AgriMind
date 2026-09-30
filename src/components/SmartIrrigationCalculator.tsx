import React, { useState } from 'react';
import {
  Droplets,
  Gauge,
  Sun,
  Timer,
  Sliders,
  DollarSign,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export const SmartIrrigationCalculator: React.FC = () => {
  const [areaM2, setAreaM2] = useState<number>(50);
  const [plantType, setPlantType] = useState<string>('lawn'); // lawn, fruit_trees, vegetables, shrubs
  const [soilType, setSoilType] = useState<string>('loam'); // sandy, loam, clay
  const [irrigationSystem, setIrrigationSystem] = useState<string>('drip'); // drip, sprinkler, bubbler
  const [temperature, setTemperature] = useState<number>(32); // degrees C
  const [isShaded, setIsShaded] = useState<boolean>(false);

  // Agricultural evapotranspiration coefficients (Kc)
  const plantFactors: Record<string, { name: string; kc: number; baseLitersPerM2: number }> = {
    lawn: { name: 'عشب ومسطحات خضراء (برمودا/باسبالم)', kc: 0.85, baseLitersPerM2: 7.0 },
    fruit_trees: { name: 'أشجار مثمرة وحمضيات ونخيل', kc: 0.70, baseLitersPerM2: 6.0 },
    vegetables: { name: 'خضروات ثمرية ومحاصيل حديقة', kc: 0.80, baseLitersPerM2: 5.5 },
    shrubs: { name: 'شجيرات زينة ونباتات بيئة محلية', kc: 0.50, baseLitersPerM2: 3.5 },
  };

  // Soil retention factor
  const soilFactors: Record<string, { name: string; retention: number; freqAdvice: string }> = {
    sandy: { name: 'رملية سريعة الصرف (تحتاج ري متقارب)', retention: 1.15, freqAdvice: 'يومياً أو كل يومين بكميات أقل لتفادي تسرب المياه بعيداً عن الجذور' },
    loam: { name: 'طميية متوازنة خصبة (مثالية)', retention: 1.0, freqAdvice: '3 مرات أسبوعياً بمعدل ري مشبع' },
    clay: { name: 'طينية ثقيلة (تحتفظ بالماء طويلاً)', retention: 0.85, freqAdvice: 'مرتين أسبوعياً لمنع تعفن الجذور واختناقها' },
  };

  // Irrigation system efficiency
  const systemFactors: Record<string, { name: string; efficiency: number; runRateLitersPerMin: number }> = {
    drip: { name: 'ري بالتنقيط (Drip Irrigation)', efficiency: 0.90, runRateLitersPerMin: 4 }, // 90% efficiency
    sprinkler: { name: 'رشاشات رذاذية منبثقة (Sprinklers)', efficiency: 0.75, runRateLitersPerMin: 12 }, // 75% efficiency
    bubbler: { name: 'نظام البابلر حول جذوع الأشجار (Bubbler)', efficiency: 0.85, runRateLitersPerMin: 8 },
  };

  // Temperature multiplier (higher temperature = more evapotranspiration)
  const tempMultiplier = temperature > 38 ? 1.4 : temperature > 30 ? 1.2 : temperature > 22 ? 1.0 : 0.75;
  const shadeMultiplier = isShaded ? 0.75 : 1.0;

  const currentPlant = plantFactors[plantType] || plantFactors.lawn;
  const currentSoil = soilFactors[soilType] || soilFactors.loam;
  const currentSystem = systemFactors[irrigationSystem] || systemFactors.drip;

  // Calculation in Liters per m² per cycle
  const rawLitersPerM2 = currentPlant.baseLitersPerM2 * (currentPlant.kc / 0.8) * currentSoil.retention * tempMultiplier * shadeMultiplier;
  const effectiveLitersPerM2 = parseFloat((rawLitersPerM2 / currentSystem.efficiency).toFixed(1));

  // Total session volume
  const totalSessionLiters = parseFloat((effectiveLitersPerM2 * areaM2).toFixed(1));
  const totalSessionM3 = parseFloat((totalSessionLiters / 1000).toFixed(2));

  // Weekly cycles based on temp & soil
  const cyclesPerWeek = temperature > 38 ? (soilType === 'sandy' ? 5 : 4) : temperature > 28 ? 3 : 2;
  const weeklyLiters = parseFloat((totalSessionLiters * cyclesPerWeek).toFixed(0));
  const monthlyLiters = parseFloat((weeklyLiters * 4.3).toFixed(0));
  const monthlyM3 = (monthlyLiters / 1000).toFixed(1);

  // Runtime minutes per session
  const runtimeMinutes = Math.max(10, Math.round((totalSessionLiters / currentSystem.runRateLitersPerMin) / Math.max(1, areaM2 / 20)));

  // Water savings vs traditional flood irrigation
  const floodLiters = (totalSessionLiters / currentSystem.efficiency) * 1.6;
  const waterSavedPercent = Math.round(((floodLiters - totalSessionLiters) / floodLiters) * 100);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* Intro Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/25">
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
            <Droplets className="w-3.5 h-3.5 text-emerald-600" />
            <span>محرك هيدروليك الري والترشيد الذكي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            حاسبة هندسة الري وتقدير الاستهلاك المائي
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            احسب كمية المياه الدقيقة باللتر وبالمتر المكعب لحديقتك أو مزرعتك بناءً على معاملات البخر نتح (Evapotranspiration)، نوع التربة، درجة الحرارة، وكفاءة شبكة الري.
          </p>
        </div>
      </div>

      {/* Grid Inputs & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 space-y-5">
            
            {/* Area */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-800">
                  مساحة المسطح أو الحديقة:
                </label>
                <span className="text-lg font-extrabold text-emerald-700 font-mono">
                  {areaM2} م²
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>5 م²</span>
                <span>250 م²</span>
                <span>500 م²</span>
              </div>
            </div>

            {/* Plant Type */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                نوع النبات أو الغطاء الأخضر:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(plantFactors).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlantType(key)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      plantType === key
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{val.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">معامل النتح: {val.kc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                طبيعة التربة:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(soilFactors).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSoilType(key)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      soilType === key
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-xs truncate">{val.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Irrigation System */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                شبكة ونظام الري المستخدم:
              </label>
              <div className="space-y-1.5">
                {Object.entries(systemFactors).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIrrigationSystem(key)}
                    className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      irrigationSystem === key
                        ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                    }`}
                  >
                    <span className="text-xs">{val.name}</span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      كفاءة {(val.efficiency * 100).toFixed(0)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider & Shade Toggle */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>درجة حرارة الطقس المتوقعة:</span>
                </label>
                <span className="text-sm font-extrabold text-amber-600 font-mono">
                  {temperature}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="48"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700">هل المساحة مظللة جزئياً بشبك تظليل أو أشجار؟</span>
                <button
                  type="button"
                  onClick={() => setIsShaded(!isShaded)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isShaded ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isShaded ? 'نعم (مظللة)' : 'لا (شمس كاملة)'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Live Metrics & Calculator Dashboard */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Key Highlights Box */}
          <div className="rounded-3xl glass-panel p-6 border border-emerald-500/30 space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500">حساب الاستهلاك الفعلي لمساحة</span>
                <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{areaM2} م²</span>
                  <span className="text-xs text-emerald-700 font-normal">({currentPlant.name})</span>
                </div>
              </div>

              <div className="text-left">
                <span className="text-[11px] text-slate-500 block">التكرار الموصى به</span>
                <span className="text-sm font-bold text-emerald-700">{cyclesPerWeek} مرات أسبوعياً</span>
              </div>
            </div>

            {/* Big Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="text-xs text-emerald-800 flex items-center gap-1 font-semibold">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المعدل الموصى به</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-emerald-700 font-mono tracking-tight">
                    {effectiveLitersPerM2}
                  </span>
                  <span className="text-xs text-emerald-800">لتر / م²</span>
                </div>
                <span className="text-[10px] text-slate-500 block">لكل دورة ري واحدة</span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-1">
                <span className="text-xs text-teal-800 flex items-center gap-1 font-semibold">
                  <Gauge className="w-3.5 h-3.5 text-teal-600" />
                  <span>إجمالي الدورة الواحدة</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-teal-700 font-mono tracking-tight">
                    {totalSessionLiters}
                  </span>
                  <span className="text-xs text-teal-800">لتر</span>
                </div>
                <span className="text-[10px] text-teal-700 font-mono block">يعادل {totalSessionM3} متر مكعب</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                  <Timer className="w-3.5 h-3.5 text-amber-500" />
                  <span>مدة تشغيل المحبس</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-amber-600 font-mono">
                    {runtimeMinutes}
                  </span>
                  <span className="text-xs text-slate-600">دقيقة</span>
                </div>
                <span className="text-[10px] text-slate-500 block">لضمان وصول الماء للجذور</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>نسبة وفر المياه</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                    {waterSavedPercent}%
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 block font-medium">مقارنة بطرق الري التقليدية</span>
              </div>

            </div>

            {/* Monthly Projection */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">الاستهلاك الشهري التقديري:</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {monthlyLiters.toLocaleString()} لتر ({monthlyM3} م³)
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full font-bold">
                  تحت إدارة ذكية
                </span>
              </div>
            </div>

            {/* Smart Advice Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>إرشادات التوقيت وتفادي التبخر:</span>
              </div>
              <p className="leading-relaxed">
                • <strong>التوقيت الأمثل:</strong> اضبط المؤقت ليبدأ بين الساعة <strong>5:00 ص و 6:30 ص</strong> (أو بعد الساعة 6:30 مساءً). الري في هذه الساعات يقلل الفاقد بالتبخر بنسبة تفوق 30%.
              </p>
              <p className="leading-relaxed">
                • <strong>طبيعة التربة ({currentSoil.name}):</strong> {currentSoil.freqAdvice}.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
