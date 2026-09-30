import React, { useState } from 'react';
import {
  Wheat,
  Ruler,
  Layers,
  Scale,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Box,
  Percent,
  Sprout,
  Calculator,
  ChevronDown
} from 'lucide-react';

export const SmartSeedCalculator: React.FC = () => {
  // Mode: by volume (m³) or by area (m²)
  const [calculationMode, setCalculationMode] = useState<'volume' | 'area'>('volume');
  
  // User Inputs
  const [targetVolumeM3, setTargetVolumeM3] = useState<number>(500); // 500 m³ as requested
  const [bedDepthCm, setBedDepthCm] = useState<number>(30); // 30 cm depth
  const [targetAreaM2, setTargetAreaM2] = useState<number>(500); // 500 m²
  const [seedsPerM2, setSeedsPerM2] = useState<number>(5); // 5 seeds per m² as requested
  const [germinationRate, setGerminationRate] = useState<number>(85); // 85% germination
  const [selectedCrop, setSelectedCrop] = useState<string>('custom');

  // Pre-configured crops data (seed weight & typical spacing)
  const cropPresets: Record<string, { name: string; icon: string; seedsPerM2: number; thousandSeedWeightGrams: number; depthCm: number }> = {
    custom: { name: 'مخصص (مثال المستخدم: 5 بذور/م²)', icon: '🌱', seedsPerM2: 5, thousandSeedWeightGrams: 4, depthCm: 30 },
    tomato: { name: 'طماطم (أحواض مرتفعة)', icon: '🍅', seedsPerM2: 4, thousandSeedWeightGrams: 3.5, depthCm: 35 },
    cucumber: { name: 'خيار وكوسة', icon: '🥒', seedsPerM2: 5, thousandSeedWeightGrams: 28, depthCm: 25 },
    corn: { name: 'ذرة شامية وصفراء', icon: '🌽', seedsPerM2: 7, thousandSeedWeightGrams: 280, depthCm: 30 },
    wheat: { name: 'قمح وشعير حبوب', icon: '🌾', seedsPerM2: 300, thousandSeedWeightGrams: 40, depthCm: 20 },
    lettuce: { name: 'خس ورقيات', icon: '🥬', seedsPerM2: 12, thousandSeedWeightGrams: 1.2, depthCm: 20 },
    pepper: { name: 'فلفل رومي وحار', icon: '🫑', seedsPerM2: 4, thousandSeedWeightGrams: 6, depthCm: 30 },
  };

  // Switch crop preset
  const handleCropChange = (cropKey: string) => {
    setSelectedCrop(cropKey);
    const preset = cropPresets[cropKey];
    if (preset) {
      setSeedsPerM2(preset.seedsPerM2);
      setBedDepthCm(preset.depthCm);
    }
  };

  // Calculations:
  // Bed depth in meters:
  const bedDepthM = Math.max(0.05, bedDepthCm / 100);

  // If calculation by volume: Area = Volume (m³) / Depth (m)
  // If calculation by area: Area = targetAreaM2, and Volume = Area * Depth
  const effectiveAreaM2 = calculationMode === 'volume' 
    ? Math.round(targetVolumeM3 / bedDepthM) 
    : targetAreaM2;

  const effectiveVolumeM3 = calculationMode === 'volume'
    ? targetVolumeM3
    : parseFloat((targetAreaM2 * bedDepthM).toFixed(1));

  // Raw seeds needed for surface area:
  const rawSeedsCount = effectiveAreaM2 * seedsPerM2;

  // Account for germination rate (e.g. 85% means we add safety margin: Raw / (Rate/100))
  const totalSeedsNeeded = Math.round(rawSeedsCount / (germinationRate / 100));

  // Weight estimation (Grams & Kilograms)
  const currentPreset = cropPresets[selectedCrop] || cropPresets.custom;
  const weightPerSeedGrams = currentPreset.thousandSeedWeightGrams / 1000;
  const totalWeightGrams = parseFloat((totalSeedsNeeded * weightPerSeedGrams).toFixed(1));
  const totalWeightKg = parseFloat((totalWeightGrams / 1000).toFixed(2));

  // Seedling trays capacity (standard 104-cell or 209-cell seedling trays)
  const trays104Cells = Math.ceil(totalSeedsNeeded / 104);

  // Soil mix requirements for the volume (m³)
  const compostShareM3 = parseFloat((effectiveVolumeM3 * 0.25).toFixed(1)); // 25% compost
  const baseSoilShareM3 = parseFloat((effectiveVolumeM3 * 0.65).toFixed(1)); // 65% soil
  const perliteShareM3 = parseFloat((effectiveVolumeM3 * 0.10).toFixed(1)); // 10% perlite / sand

  return (
    <div className="space-y-8 animate-fadeIn text-[#1E293B]">
      
      {/* Intro Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/25">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>حاسبة البذور والمساحات والأحواض الزراعية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              حساب عدد البذور والأحواض الزراعية (متر مربع ومتر مكعب)
            </h1>
            <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
              خاصية تفاعلية دقيقة لحساب كمية البذور المطلوبة لأي مساحة أرض (<span className="font-bold font-mono">م²</span>) أو حجم حوض زراعي (<span className="font-bold font-mono">م³</span>)، مع تقدير الوزن بالكيلوجرام، نسبة الإنبات، وتوزيع التربة.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Educational Answer Box for User's Exact Question */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-400/40 p-6 sm:p-7 shadow-[0_8px_30px_rgba(5,150,105,0.08)] space-y-4">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-base border-b border-emerald-200 pb-3">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>إجابة سؤالك: كيفاش نحسبوا لـ 500 متر مكعب إذا كان المتر المربع يحتاج 5 بذور؟</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Explanation 1: The Volume to Area Formula */}
          <div className="bg-white/90 p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-2">
            <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-600" />
              <span>الحالة 1: الحساب بحجم الحوض والتربة (500 م³)</span>
            </h4>
            <p className="text-slate-600 text-xs">
              المتر المكعب (<span className="font-bold font-mono">م³</span>) هو وحدة <strong>حجم ثلاثي الأبعاد</strong> (طول × عرض × عمق)، بينما البذور تُزرع على <strong>مساحة السطح</strong> (<span className="font-bold font-mono">م²</span>).
            </p>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs">
              <strong>المساحة المزروعة (م²) = الحجم (500 م³) ÷ عمق التربة (متر)</strong>
            </div>
            <ul className="space-y-1 text-xs text-slate-600 pt-1">
              <li>• إذا كان عمق الحوض <strong>30 سم (0.3 م)</strong>: المساحة = 500 ÷ 0.3 = <strong>1,667 م²</strong>.</li>
              <li>• عدد البذور = 1,667 × 5 بذور = <strong className="text-emerald-700 font-bold">8,335 بذرة</strong>.</li>
              <li>• إذا كان عمق الحوض <strong>50 سم (0.5 م)</strong>: المساحة = 1,000 م² = <strong className="text-emerald-700 font-bold">5,000 بذرة</strong>.</li>
              <li>• إذا كان عمق الحوض <strong>1 متر كامل (1.0 م)</strong>: المساحة = 500 م² = <strong className="text-emerald-700 font-bold">2,500 بذرة</strong>.</li>
            </ul>
          </div>

          {/* Explanation 2: Direct Area Formula */}
          <div className="bg-white/90 p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-2">
            <h4 className="font-bold text-teal-800 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-teal-600" />
              <span>الحالة 2: لو كان قصدك مساحة أرض (500 م²)</span>
            </h4>
            <p className="text-slate-600 text-xs">
              إذا كانت المساحة السطحية للأرض أو المزرعة هي 500 متر مربع مباشرة:
            </p>
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-mono text-xs">
              <strong>عدد البذور = المساحة (500 م²) × 5 بذور/م² = 2,500 بذرة</strong>
            </div>
            <p className="text-xs text-slate-600">
              💡 <strong>نصيحة المهندس الزراعي:</strong> نظراً لأن نسبة إنبات البذور في الطبيعة تكون حوالي <strong>85% إلى 90%</strong>، يُنصح دائماً بإضافة نسبة أمان (15%)، فيكون المطلوب الفعلي لحوالي 500 م² هو <strong>2,940 بذرة</strong> لضمان كثافة 5 نباتات سليمة لكل متر مربع.
            </p>
          </div>

        </div>
      </div>

      {/* Interactive Calculator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 space-y-6">
            
            {/* Calculation Mode Switcher */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                اختر طريقة الحساب:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCalculationMode('volume')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    calculationMode === 'volume'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Box className="w-4 h-4" />
                  <span>بالحجم (متر مكعب م³)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode('area')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    calculationMode === 'area'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Ruler className="w-4 h-4" />
                  <span>بالمساحة (متر مربع م²)</span>
                </button>
              </div>
            </div>

            {/* Crop Preset Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                نوع المحصول أو البذرة:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(cropPresets).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCropChange(key)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer text-xs flex items-center gap-2 ${
                      selectedCrop === key
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <span>{val.icon}</span>
                    <span className="truncate">{val.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Input (if Volume mode) */}
            {calculationMode === 'volume' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-bold text-slate-800">
                      الحجم الإجمالي المطلوب:
                    </label>
                    <span className="text-base font-extrabold text-emerald-700 font-mono">
                      {targetVolumeM3} متر مكعب (م³)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={targetVolumeM3}
                    onChange={(e) => setTargetVolumeM3(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>10 م³</span>
                    <span className="font-bold text-emerald-700">500 م³ (المثال)</span>
                    <span>1,000 م³</span>
                  </div>
                </div>

                {/* Soil Bed Depth */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-bold text-slate-800">
                      عمق حوض الزراعة / طبقة التربة:
                    </label>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">
                      {bedDepthCm} سم ({bedDepthM} متر)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={bedDepthCm}
                    onChange={(e) => setBedDepthCm(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>15 سم (ورقيات)</span>
                    <span>30 سم (خضار)</span>
                    <span>100 سم (أشجار)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Area Input (if Area mode) */
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-bold text-slate-800">
                      المساحة السطحية للأرض أو الحديقة:
                    </label>
                    <span className="text-base font-extrabold text-emerald-700 font-mono">
                      {targetAreaM2} متر مربع (م²)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="25"
                    value={targetAreaM2}
                    onChange={(e) => setTargetAreaM2(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>10 م²</span>
                    <span className="font-bold text-emerald-700">500 م²</span>
                    <span>2,000 م²</span>
                  </div>
                </div>

                {/* Soil Depth for Area */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-bold text-slate-800">
                      عمق التربة المطلوبة لتحديد الحجم:
                    </label>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">
                      {bedDepthCm} سم ({bedDepthM} م)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={bedDepthCm}
                    onChange={(e) => setBedDepthCm(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Seeds Per M2 Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-800">
                  عدد البذور المطلوبة لكل متر مربع:
                </label>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {seedsPerM2} بذور / م²
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={seedsPerM2}
                onChange={(e) => setSeedsPerM2(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>1 بذرة</span>
                <span className="font-bold text-emerald-700">5 بذور (مثالك)</span>
                <span>50 بذرة</span>
              </div>
            </div>

            {/* Germination Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>نسبة الإنبات المتوقعة (Germination Rate):</span>
                </label>
                <span className="text-sm font-bold text-slate-700 font-mono">
                  {germinationRate}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                step="5"
                value={germinationRate}
                onChange={(e) => setGerminationRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                تضمن تعويض البذور التي لا تنبت بسبب الظروف الطبيعية.
              </span>
            </div>

          </div>
        </div>

        {/* Real-time Calculation Results Column */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="rounded-3xl glass-panel p-6 sm:p-7 border border-emerald-500/30 space-y-6">
            
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs text-slate-500 block">النتيجة الحسابية الإجمالية:</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {calculationMode === 'volume' 
                    ? `لحجم ${targetVolumeM3} م³ بعمق ${bedDepthCm} سم`
                    : `لمساحة ${targetAreaM2} م² بمعدل ${seedsPerM2} بذور/م²`}
                </h3>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                حساب هندسي معتمد
              </span>
            </div>

            {/* Key Output Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Total Seeds */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1">
                <span className="text-xs text-emerald-800 flex items-center gap-1 font-semibold">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>إجمالي عدد البذور المطلوبة</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono">
                    {totalSeedsNeeded.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-800 font-medium">بذرة</span>
                </div>
                <span className="text-[11px] text-emerald-700 block">
                  شاملة نسبة الأمان والإنبات ({germinationRate}%)
                </span>
              </div>

              {/* Surface Area */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-300 space-y-1">
                <span className="text-xs text-teal-800 flex items-center gap-1 font-semibold">
                  <Ruler className="w-3.5 h-3.5 text-teal-600" />
                  <span>المساحة السطحية المزروعة</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 font-mono">
                    {effectiveAreaM2.toLocaleString()}
                  </span>
                  <span className="text-xs text-teal-800 font-medium">م²</span>
                </div>
                <span className="text-[11px] text-teal-700 block">
                  سطح الأرض أو الأحواض الصافية
                </span>
              </div>

              {/* Seeds Weight */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                  <Scale className="w-3.5 h-3.5 text-slate-500" />
                  <span>الوزن التقديري للبذور</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800 font-mono">
                    {totalWeightKg >= 1 ? `${totalWeightKg} كجم` : `${totalWeightGrams} جم`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  تساعدك عند الشراء من محلات البذور
                </span>
              </div>

              {/* Seedling Trays */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>صواني التشتيل المقدرة</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800 font-mono">
                    {trays104Cells}
                  </span>
                  <span className="text-xs text-slate-600">صينية (104 عين)</span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  إذا تم البذر بصواني مشتل
                </span>
              </div>

            </div>

            {/* Soil Volume & Mix Composition */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-emerald-600" />
                  <span>حجم التربة المطلوب للأحواض ({effectiveVolumeM3} م³ = {(effectiveVolumeM3 * 1000).toLocaleString()} لتر):</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">تربة زراعية طميية (65%)</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{baseSoilShareM3} م³</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-emerald-700 block text-[10px] font-semibold">كمبوست نباتي معقم (25%)</span>
                  <span className="text-sm font-bold text-emerald-800 font-mono">{compostShareM3} م³</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">رمل نهري / بيرلايت (10%)</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{perliteShareM3} م³</span>
                </div>
              </div>
            </div>

            {/* Practical Advice Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 space-y-1.5">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>طريقة الزراعة وتوزيع البذور:</span>
              </span>
              <p className="leading-relaxed">
                لكي تحقق معدل <strong>{seedsPerM2} بذور في المتر المربع</strong> بدقة، قسّم مساحة المتر المربع إلى مسافات متساوية (حوالي <strong>{Math.round(100 / Math.sqrt(seedsPerM2))} سم</strong> بين كل بذرة والأخرى)، مع وضع البذرة على عمق يعادل ضعفي حجمها، وتغطيتها بطبقة رقيقة من التربة الناعمة مع ري رذاذي هادئ.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
