import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Sun,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Gauge,
  Flame,
  CloudRain,
  Copy,
  Check
} from 'lucide-react';
import { PRESET_GARDEN_SAMPLES, PresetSample } from '../data/presets';
import { DiagnosisResult } from '../types';

interface GreenSpaceDiagnosisProps {
  onAskFollowUp: (prompt: string, contextData: any) => void;
}

// Client-side image compression and resizing utility
function compressAndResizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ base64: '', mimeType: file.type });
    };
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        resolve({ base64: e.target?.result as string, mimeType: file.type });
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64: e.target?.result as string, mimeType: file.type });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        resolve({ base64: compressedBase64, mimeType: 'image/jpeg' });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const GreenSpaceDiagnosis: React.FC<GreenSpaceDiagnosisProps> = ({ onAskFollowUp }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [areaM2, setAreaM2] = useState<number>(30);
  const [weatherCondition, setWeatherCondition] = useState<string>('معتدل ومشمس (26°C)');
  const [userNotes, setUserNotes] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('جاري معالجة الصورة...');
  const [loadingPercent, setLoadingPercent] = useState<number>(15);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick weather presets
  const weatherOptions = [
    { label: 'معتدل ومشمس (26°C)', icon: Sun },
    { label: 'موجة حر وجفاف (40°C+)', icon: Flame },
    { label: 'موسم رطب وماطر', icon: CloudRain },
    { label: 'طقس شتوي بارد (14°C)', icon: Gauge },
  ];

  // Handle image upload from file or camera with instant compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP).');
        return;
      }
      
      try {
        setError(null);
        setSelectedPresetId(null);
        // Fast client-side compression reduces upload size by ~95%
        const { base64, mimeType } = await compressAndResizeImage(file);
        setSelectedImage(base64);
        setSelectedMimeType(mimeType);
      } catch (err) {
        console.error(err);
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle Preset selection
  const selectPreset = (preset: PresetSample) => {
    setSelectedImage(preset.imagePreview);
    setSelectedMimeType('image/svg+xml');
    setSelectedPresetId(preset.id);
    setAreaM2(preset.defaultArea);
    setWeatherCondition(preset.defaultWeather);
    setUserNotes(preset.notes);
    setError(null);
    setResult(null);
  };

  // Run AI diagnosis with active progress stages
  const runDiagnosis = async () => {
    if (!selectedImage) {
      setError('يرجى رفع صورة للمساحة الخضراء أو اختيار إحدى العينات الجاهزة.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingPercent(20);
    setLoadingStep('تحسين ومعالجة أبعاد الصورة...');

    // Progress step timer for ultra-smooth responsiveness
    const timer1 = setTimeout(() => {
      setLoadingPercent(55);
      setLoadingStep('التعرف على نوع النبات وفحص الأنسجة بالذكاء الاصطناعي...');
    }, 600);

    const timer2 = setTimeout(() => {
      setLoadingPercent(85);
      setLoadingStep('حساب معادلات الري وصياغة خطة العمل الطبية...');
    }, 1400);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedMimeType,
          areaM2: Number(areaM2) || 25,
          weatherCondition,
          notes: userNotes,
          presetId: selectedPresetId,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoadingPercent(100);

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'فشل فحص المساحة الخضراء.');
      }

      setResult(resData.data);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء الاتصال بنظام الفحص.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedImage(null);
    setSelectedPresetId(null);
    setResult(null);
    setError(null);
    setUserNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Copy standard summary
  const handleCopySummary = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.standardFormattedSummary || '');
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* Intro Header Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/25">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>القسم الأول: الرؤية الحاسوبية وتشخيص المساحات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              فحص وتطوير المساحة الخضراء الذكي
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              التقط أو ارفع صورة لحديقتك أو مسطحك الأخضر؛ سيتولى الذكاء الاصطناعي تحديد نوع النبات، فحص المشاكل الفطرية والحشرية ونقص العناصر، وحساب كمية الري باللترات للمتر المربع بدقة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(5,150,105,0.25)] transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>التقاط / رفع صورة</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left/Right Column: Image Upload & Parameters */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Image Upload Box */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>صورة المساحة الخضراء أو النبات</span>
                <span className="text-xs font-semibold text-emerald-700">*مطلوب</span>
              </label>
              {selectedImage && (
                <button
                  onClick={handleReset}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>تغيير الصورة</span>
                </button>
              )}
            </div>

            {selectedImage ? (
              <div className="relative group rounded-2xl overflow-hidden border border-emerald-400/40 bg-slate-100 aspect-video flex items-center justify-center shadow-sm">
                <img
                  src={selectedImage}
                  alt="المساحة الخضراء المختارة"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <span className="text-xs text-emerald-800 font-bold animate-pulse">
                      جاري فحص النبات وتحليل الأوراق والري...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-400/50 hover:border-emerald-600 rounded-2xl p-8 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">انقر لرفع صورة أو اسحب وأفلت هنا</p>
                  <p className="text-xs text-slate-500 mt-1">يدعم صور المسطحات، أوراق النباتات، والحدائق المنزلية</p>
                </div>
              </div>
            )}

            {/* Quick Test Samples */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>أو جرّب إحدى عينات الحدائق الجاهزة فوراً:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GARDEN_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => selectPreset(sample)}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-right transition-all cursor-pointer group shadow-2xs"
                  >
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                      {sample.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {sample.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Parameters Box: Area, Weather, Notes */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-emerald-500/20 space-y-5">
            
            {/* Area Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-800">
                  مساحة الحوض أو الحديقة:
                </label>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {areaM2} م²
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>5 م² (حوض صغير)</span>
                <span>100 م² (متوسط)</span>
                <span>250 م² (حديقة كبيرة)</span>
              </div>
            </div>

            {/* Weather Condition */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                حالة الطقس الحالية في منطقتك:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weatherOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = weatherCondition === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setWeatherCondition(opt.label)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Notes */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                ملاحظات إضافية شاهدتها (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثلاً: اصفرار الأوراق السفلية، ظهور بقع بنية، أو تساقط براعم..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full glass-input text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Action Trigger */}
            <button
              onClick={runDiagnosis}
              disabled={isLoading || !selectedImage}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(5,150,105,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحليل واستخراج النتائج...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>بدء الفحص وحساب احتياجات الري</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right/Left Column: Detailed Diagnosis & Output */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isLoading && (
            <div className="h-full min-h-[420px] rounded-3xl glass-panel p-8 border border-emerald-500/15 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <Gauge className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-slate-800">لوحة الفحص بانتظار الصورة</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  قم بتحميل صورة أو اختيار عينة من الحديقة، ثم اضغط على زر &quot;بدء الفحص&quot;. سيظهر التقرير الطبي الزراعي الكامل مع جدول الري باللترات وخطة العلاج.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[420px] rounded-3xl glass-panel p-8 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <Sparkles className="w-8 h-8 text-emerald-600 absolute animate-pulse" />
              </div>
              
              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-800">{loadingStep}</span>
                  <span className="text-emerald-600 font-mono text-sm">{loadingPercent}%</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden p-0.5 border border-emerald-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                    style={{ width: `${loadingPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  معالجة سريعة عالية الدقة للرؤية الحاسوبية وهندسة الري الذكية
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Mandatory Standard Formatted Box as specified in user request */}
              <div className="rounded-3xl bg-white border-2 border-emerald-400 p-5 sm:p-6 shadow-md relative">
                <div className="flex items-center justify-between mb-3 border-b border-emerald-200 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                    <span>🌿 نتيجة فحص المساحة الخضراء</span>
                  </h3>
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'تم النسخ!' : 'نسخ التقرير القياسي'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-sm leading-relaxed text-slate-800">
                  <p>
                    <strong className="text-emerald-700">* النبات المكتشف: </strong>
                    <span className="font-bold text-slate-900">{result.plantIdentification.arabicName}</span>
                    <span className="text-xs text-slate-500 mr-2">({result.plantIdentification.englishScientificName})</span>
                  </p>
                  <p>
                    <strong className="text-emerald-700">* الحالة الصحية: </strong>
                    <span className="font-bold text-slate-900">{result.healthAssessment.overallStatus}</span>
                    <span className="text-xs text-emerald-800 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full mr-2">
                      مؤشر الصحة: {result.healthAssessment.healthScore}%
                    </span>
                  </p>
                  <p>
                    <strong className="text-emerald-700">* جدول الري الموصى به: </strong>
                    <span className="font-bold text-emerald-800 font-mono">
                      {result.irrigationEngine.litersPerM2} لتر لكل متر مربع
                    </span>
                    <span className="mx-2 text-emerald-500">|</span>
                    <span className="font-bold text-slate-900">{result.irrigationEngine.frequencyPerWeek}</span>
                    <span className="text-xs text-emerald-700 mr-2 font-medium">
                      (إجمالي {result.irrigationEngine.totalLitersPerSession || (result.irrigationEngine.litersPerM2 * areaM2).toFixed(1)} لتر للمساحة بالكامل)
                    </span>
                  </p>
                  <div>
                    <strong className="text-emerald-700">* التشخيص والتوصيات:</strong>
                    <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-700 pr-2 font-medium">
                      {result.careActionPlan.map((action, idx) => (
                        <li key={idx}>
                          <span className="font-bold text-slate-900">{action.title}: </span>
                          {action.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Module 1 Deep-Dive: Irrigation Engine Widget */}
              <div className="rounded-3xl glass-panel p-6 border border-emerald-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">محرك الري الذكي وحساب الاستهلاك</h4>
                  </div>
                  <span className="text-xs text-teal-800 font-bold font-mono bg-teal-50 border border-teal-300 px-3 py-1 rounded-full">
                    مساحة الحساب: {areaM2} م²
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block mb-1">المعدل بالمتر المربع</span>
                    <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                      {result.irrigationEngine.litersPerM2}
                    </span>
                    <span className="text-xs text-slate-600 mr-1">لتر / م²</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block mb-1">الكمية لكل دورة ري</span>
                    <span className="text-2xl font-extrabold text-teal-700 font-mono">
                      {result.irrigationEngine.totalLitersPerSession || (result.irrigationEngine.litersPerM2 * areaM2).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-600 mr-1">لتر إجمالي</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-500 block mb-1">تكرار الري الموصى به</span>
                    <span className="text-sm font-bold text-slate-800">
                      {result.irrigationEngine.frequencyPerWeek}
                    </span>
                  </div>
                </div>

                {/* Weather Logic Advice */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Sun className="w-3.5 h-3.5" />
                    <span>تأقلم الري مع الطقس الحالي ({weatherCondition}):</span>
                  </div>
                  <p className="leading-relaxed">
                    {result.irrigationEngine.weatherLogicAdvice}
                  </p>
                  <p className="text-slate-600 text-[11px] pt-1">
                    ⏰ <strong className="text-slate-900">التوقيت الأفضل للري:</strong> {result.irrigationEngine.bestTimeOfDay}
                  </p>
                </div>
              </div>

              {/* Detected Health Issues & Pests */}
              <div className="rounded-3xl glass-panel p-6 border border-emerald-500/25 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">تشخيص الآفات ونقص العناصر</h4>
                </div>

                {result.healthAssessment.detectedIssues && result.healthAssessment.detectedIssues.length > 0 ? (
                  <div className="space-y-3">
                    {result.healthAssessment.detectedIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-amber-300 shadow-2xs space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 text-sm">{issue.issue}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            issue.severity === 'حرج'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            خطورة: {issue.severity}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          <strong className="text-slate-800">الأعراض المشاهدة:</strong> {issue.symptoms}
                        </p>
                        <p className="text-slate-600">
                          <strong className="text-slate-800">السبب المرجح:</strong> {issue.probableCause}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>النبات بحالة صحية ممتازة ولا تظهر أي إصابات حشرية أو فطرية مرئية.</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Care Action Plan */}
              <div className="rounded-3xl glass-panel p-6 border border-emerald-500/25 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">خطة العمل والعناية الفورية</h4>
                </div>

                <div className="space-y-3">
                  {result.careActionPlan.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-300">
                        {action.step || idx + 1}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">{action.title}</h5>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            {action.timing}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{action.action}</p>
                        <p className="text-emerald-700 text-[11px] pt-1 font-semibold">
                          🧪 <strong>المواد المطلوبة:</strong> {action.materials}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Call to Action Prompt */}
              {result.followUpPrompt && (
                <div className="rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-50 to-white border-2 border-emerald-300 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1 text-center sm:text-right">
                    <span className="text-[11px] text-emerald-800 font-bold flex items-center justify-center sm:justify-start gap-1">
                      <Info className="w-3.5 h-3.5 text-emerald-600" />
                      <span>استشارة تفاعلية لاحقة</span>
                    </span>
                    <p className="text-xs text-slate-700 font-medium max-w-lg">
                      {result.followUpPrompt}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAskFollowUp(
                        result.followUpPrompt,
                        {
                          diagnosis: result.plantIdentification.arabicName,
                          status: result.healthAssessment.overallStatus,
                          areaM2,
                          irrigation: result.irrigationEngine,
                        }
                      )
                    }
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>استفسر الآن مع المستشار</span>
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
