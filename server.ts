import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to remove markdown block wrappers if present
function parseJsonFromText(rawText: string) {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = rawText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(sub);
    }
    throw err;
  }
}

// -------------------------------------------------------------
// MODULE 1: AI Vision & Green Space Diagnosis (High Speed)
// -------------------------------------------------------------
app.post('/api/diagnose', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      areaM2 = 25,
      weatherCondition = 'معتدل / طبيعي',
      notes = '',
      presetId = null,
    } = req.body;

    // Fast-path: If user clicked a known preset, return instant specialized diagnosis
    if (presetId) {
      const presetResult = getPresetDiagnosis(presetId, Number(areaM2) || 25, weatherCondition);
      if (presetResult) {
        res.json({ success: true, data: presetResult, isFastPreset: true });
        return;
      }
    }

    if (!imageBase64) {
      res.status(400).json({ error: 'صورة المساحة الخضراء مطلوبة للتشخيص.' });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `أنت "عقل الزراعة الذكي" (AgriMind AI). قم بتحليل صورة المساحة الخضراء بسرعة ودقة.
المعطيات: المساحة=${areaM2}م²، الطقس=${weatherCondition}، ملاحظات=${notes || 'لا يوجد'}.
أرجع حصراً كود JSON بهذا المخطط دون أي مقدمات:
{
  "plantIdentification": {
    "arabicName": "اسم النبات بالعربية",
    "englishScientificName": "الاسم العلمي",
    "category": "مسطحات خضراء / خضروات / أشجار / نباتات ظل",
    "description": "وصف دقيق للحالة"
  },
  "healthAssessment": {
    "overallStatus": "سليم ومزدهر" | "إجهاد مائي خفيف" | "نقص عناصر غذائية" | "إصابة فطرية" | "إصابة حشرية" | "إجهاد حراري",
    "healthScore": 85,
    "detectedIssues": [
      {
        "issue": "المشكلة",
        "severity": "منخفض" | "متوسط" | "حرج",
        "symptoms": "الأعراض المشاهدة",
        "probableCause": "السبب المرجح"
      }
    ]
  },
  "irrigationEngine": {
    "frequencyPerWeek": "3 مرات أسبوعياً",
    "litersPerM2": 6.5,
    "totalLitersPerSession": 162.5,
    "bestTimeOfDay": "في الصباح الباكر قبل شروق الشمس",
    "weatherLogicAdvice": "نصيحة الري وفق الطقس",
    "irrigationMethod": "الري بالتنقيط أو الرشاشات"
  },
  "careActionPlan": [
    {
      "step": 1,
      "title": "الخطوة الفورية",
      "action": "شرح عملي دقيق",
      "materials": "المواد والسماد المطلوب",
      "timing": "الوقت المناسب"
    }
  ],
  "sunAndEnvironment": {
    "sunlightNeeds": "شمس مباشرة / ظل جزئي",
    "temperatureTolerance": "نطاق الحرارة",
    "soilAdvice": "نصيحة التربة"
  },
  "standardFormattedSummary": "🌿 نتيجة فحص المساحة الخضراء\\n* النبات المكتشف: [الاسم]\\n* الحالة الصحية: [الحالة]\\n* جدول الري الموصى به: [X لتر/م² | كل Y أيام]\\n* التشخيص والتوصيات: [التوصيات]",
  "followUpPrompt": "سؤال متابعة مفيد"
}`;

    if (process.env.GEMINI_API_KEY) {
      // Use ThinkingLevel.LOW and 7.5s race timeout for blazing-fast response
      const apiCallPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType.includes('svg') ? 'image/png' : mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_FAST_FALLBACK')), 7500)
      );

      try {
        const response: any = await Promise.race([apiCallPromise, timeoutPromise]);
        const responseText = response.text || '';
        const parsedData = parseJsonFromText(responseText);

        if (parsedData.irrigationEngine && parsedData.irrigationEngine.litersPerM2) {
          parsedData.irrigationEngine.totalLitersPerSession = parseFloat(
            (parsedData.irrigationEngine.litersPerM2 * (Number(areaM2) || 20)).toFixed(1)
          );
        }

        res.json({ success: true, data: parsedData });
        return;
      } catch (timeoutOrApiErr: any) {
        console.warn('Gemini API delayed or timed out, activating instant fast fallback:', timeoutOrApiErr.message);
        const fastResult = generateFallbackDiagnosis(Number(areaM2) || 25, weatherCondition, notes);
        res.json({ success: true, data: fastResult, isFastFallback: true });
        return;
      }
    } else {
      const fallbackResult = generateFallbackDiagnosis(Number(areaM2) || 25, weatherCondition, notes);
      res.json({ success: true, data: fallbackResult, isFallback: true });
      return;
    }
  } catch (error: any) {
    console.error('Error diagnosing plant/space:', error);
    const safeFallback = generateFallbackDiagnosis(25, 'معتدل');
    res.json({ success: true, data: safeFallback, isSafeFallback: true });
  }
});

// -------------------------------------------------------------
// MODULE 2: Smart Crop & Land Planning Consultant
// -------------------------------------------------------------
app.post('/api/plan-crop', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cropName,
      location = 'الرياض، المملكة العربية السعودية',
      landType = 'حديقة منزلية / أرض زراعية مفتوحة',
      areaM2 = 50,
      farmingExperience = 'مبتدئ إلى متوسط',
    } = req.body;

    if (!cropName || typeof cropName !== 'string' || !cropName.trim()) {
      res.status(400).json({ error: 'يرجى تحديد المحصول أو النبات المطلوب زراعته.' });
      return;
    }

    const prompt = `أنت "عقل الزراعة الذكي" (AgriMind AI). ضع خطة زراعية سريعة ومتقنة لـ ${cropName} في ${location} بمساحة ${areaM2}م² (${landType}).
أرجع حصراً كود JSON وفق المخطط التالي بدون أي مقدمات:
{
  "cropTitle": "${cropName}",
  "location": "${location}",
  "standardFormattedHeader": "🍎 خطة زراعة ${cropName} في ${location}\\n1. مدى التوافق: [التقييم]\\n2. متى تزرع: [المواعيد]\\n3. أين تزرع: [الموقع والتربة]\\n4. كيف تزرع: [خطوات متسلسلة]",
  "feasibility": {
    "suitability": "ممتاز" | "جيد جداً" | "متوسط" | "يتطلب بيت محمي",
    "compatibilityScore": 90,
    "climateEvaluation": "شرح ملاءمة المناخ",
    "expectedYield": "الإنتاجية المتوقعة"
  },
  "plantingCalendar": {
    "sowingMonths": ["أكتوبر", "نوفمبر", "فبراير"],
    "harvestMonths": ["يناير", "فبراير", "مارس"],
    "idealGerminationDays": "7 - 10 أيام",
    "temperatureRange": {
      "germinationOptimal": "20°C - 26°C",
      "growthRange": "18°C - 30°C",
      "frostSensitivity": "حساس للصقيع"
    },
    "seasonalPhases": [
      {
        "phase": "البذر والشتل",
        "months": "أكتوبر - نوفمبر",
        "description": "تهيئة التربة ونثر البذور"
      },
      {
        "phase": "النمو الخضري",
        "months": "ديسمبر",
        "description": "دعم الجذور والتسميد"
      },
      {
        "phase": "الإزهار والعقد",
        "months": "يناير",
        "description": "تنظيم الري وزيادة البوتاسيوم"
      },
      {
        "phase": "الحصاد",
        "months": "فبراير - مارس",
        "description": "جني المحصول عند النضج"
      }
    ]
  },
  "whereToPlant": {
    "sunlightRequirement": "شمس مباشرة 6-8 ساعات",
    "spacePerPlant": "45 سم",
    "spaceBetweenRows": "80 سم",
    "soilTypeAndPH": "تربة طميية رملية جيدة الصرف pH 6.5",
    "indoorVsOutdoor": "أرض مفتوحة أو أصص كبيرة",
    "spaceCapacityEstimate": "تتسع مساحتك لحوالي ${(Number(areaM2) * 2.5).toFixed(0)} نبتة"
  },
  "howToPlant": {
    "soilPreparation": "تقليب التربة وخلط الكمبوست المعقم",
    "seedDepthAndSpacing": "عمق 1 سم ومسافة 45 سم",
    "irrigationSchedule": {
      "seedlingStage": "ري خفيف يومي",
      "vegetativeStage": "ري كل يومين",
      "fruitingStage": "ري منتظم عميق",
      "litersPerM2Weekly": 22
    },
    "fertilizationGuide": [
      { "stage": "عند الزراعة", "fertilizer": "سماد عضوي متحلل + سوبر فوسفات" },
      { "stage": "النمو الخضري", "fertilizer": "سماد متوازن 20-20-20" },
      { "stage": "التزهير والإثمار", "fertilizer": "سماد عالي البوتاسيوم + كالسيوم" }
    ],
    "growthSteps": [
      { "stepNumber": 1, "title": "إعداد التربة", "description": "تقليب وتسميد الأرض" },
      { "stepNumber": 2, "title": "الغرس والشتل", "description": "وضع الشتلات والري الأولي" },
      { "stepNumber": 3, "title": "العناية والدعامات", "description": "تثبيت دعامات خشبية" },
      { "stepNumber": 4, "title": "المكافحة الوقائية", "description": "رش وقائي بزيت النيم" },
      { "stepNumber": 5, "title": "الحصاد الدوري", "description": "قطف الثمار الناضجة صباحاً" }
    ]
  },
  "pestAndDiseaseManagement": [
    {
      "pestOrDisease": "المن وصانعات الأنفاق",
      "prevention": "مصائد صفراء وزيت النيم",
      "organicTreatment": "محلول صابون زراعي خفيف"
    }
  ],
  "followUpPrompt": "هل تود استعراض أصناف هجينة مقاومة للحرارة؟"
}`;

    if (process.env.GEMINI_API_KEY) {
      const apiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_FAST_FALLBACK')), 7000)
      );

      try {
        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        const responseText = response.text || '';
        const parsedData = parseJsonFromText(responseText);
        res.json({ success: true, data: parsedData });
        return;
      } catch (err: any) {
        console.warn('Crop planning fallback triggered:', err.message);
        const fallbackPlan = generateFallbackPlan(cropName, location, Number(areaM2) || 50);
        res.json({ success: true, data: fallbackPlan, isFastFallback: true });
        return;
      }
    } else {
      const fallbackPlan = generateFallbackPlan(cropName, location, Number(areaM2) || 50);
      res.json({ success: true, data: fallbackPlan, isFallback: true });
      return;
    }
  } catch (error: any) {
    console.error('Error planning crop:', error);
    const safeFallback = generateFallbackPlan('طماطم', 'المملكة العربية السعودية', 50);
    res.json({ success: true, data: safeFallback, isSafeFallback: true });
  }
});

// -------------------------------------------------------------
// MODULE 3: Interactive Agricultural Consultant Chat
// -------------------------------------------------------------
app.post('/api/chat-consultant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [], contextData = null } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'الرسالة مطلوبة.' });
      return;
    }

    const systemPrompt = `أنت "عقل الزراعة الذكي" (AgriMind AI)، المستشار الزراعي المتخصص.
كن مباشراً، سريعاً، علمياً ومختصراً بأرقام محددة واختم بسؤال متابعة.
${contextData ? `سياق المستخدم: ${JSON.stringify(contextData)}` : ''}`;

    if (process.env.GEMINI_API_KEY) {
      const formattedContents = [];
      formattedContents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      formattedContents.push({ role: 'model', parts: [{ text: 'أهلاً بك! مستشارك الزراعي الذكي جاهز للإجابة السريعة.' }] });

      for (const turn of history.slice(-4)) {
        formattedContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }],
        });
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          temperature: 0.3,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        success: true,
        reply: response.text || 'عذراً، لم أستطع توليد إجابة في الوقت الحالي.',
      });
      return;
    } else {
      res.json({
        success: true,
        reply: `🌿 **نصيحة AgriMind AI السريعة:**
بخصوص "${message}":
1. فحص رطوبة التربة على عمق 3 سم قبل كل رية.
2. استخدام سماد متوازن سريع الذوبان لتفادي إجهاد الجذور.
3. تفادي تبليل الأوراق أثناء سطوع الشمس لتجنب الحروق والفطريات.

هل تود حساب كميات المياه أو الأسمدة الدقيقة؟`,
      });
      return;
    }
  } catch (error: any) {
    console.error('Error in consultant chat:', error);
    res.json({
      success: true,
      reply: '🌿 يُنصح بضبط الري في الصباح الباكر والتأكد من جودة صرف التربة والتسميد الورقي المنتظم. هل لديك سؤال محدد عن نبتة معينة؟',
    });
  }
});

// -------------------------------------------------------------
// MODULE 5: Agricultural Community Forum Database & Endpoints
// -------------------------------------------------------------
const DB_DIR = path.resolve(__dirname, 'data');
const FORUM_DB_PATH = path.resolve(DB_DIR, 'forum-db.json');

function initForumDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(FORUM_DB_PATH)) {
      const initialPosts = [
        {
          id: 'post-1',
          author: 'أبو فهد التميمي',
          location: 'القصيم، السعودية',
          category: 'نصائح وتجارب زراعية',
          title: 'تجربتي مع تغطية تربة النخيل بالقش والكمبوست صيفاً',
          content: 'السلام عليكم يا إخوان، قمت هذا الموسم بتغطية حوض النخلة بطبقة 10 سم من القش المتحلل المخلوط مع كمبوست نباتي معقم. النتيجة كانت مذهلة: وفرنا أكثر من 40% من مياه الري، وحرارة منطقة الجذور انخفضت بمقدار 6 درجات مئوية مقارنة بالأحواض المكشوفة. أنصح الجميع بتجربتها!',
          likes: 24,
          createdAt: 'منذ ساعتين',
          comments: [
            {
              id: 'c-1',
              author: 'المهندس كريم',
              location: 'الرياض',
              content: 'ما شاء الله تبارك الله، تجربة رائدة ومطابقة للممارسات الزراعية العالمية (Mulching).',
              createdAt: 'منذ ساعة',
            }
          ]
        },
        {
          id: 'post-2',
          author: 'عمر الجزائري',
          location: 'وادي سوف، الجزائر',
          category: 'محاصيل وفواكه موسمية',
          title: 'نجاح زراعة الطماطم في التربة الرملية بنظام التنقيط المزدوج',
          content: 'تحية لكل الفلاحين! اعتمدنا خطين تنقيط متوازيين لكل خط شتلات طماطم مع إضافة الهيوميك أسيد كل أسبوعين. الحمد لله المحصول وفير والتشققات صفر بفضل انتظام وضبط الري.',
          likes: 38,
          createdAt: 'اليوم',
          comments: [
            {
              id: 'c-2',
              author: 'فلاح من تونس',
              location: 'القيروان',
              content: 'كم المسافة بين النقاطات عندك أخي عمر؟',
              createdAt: 'منذ 3 ساعات',
            },
            {
              id: 'c-3',
              author: 'عمر الجزائري',
              location: 'وادي سوف',
              content: 'المسافة 30 سم بتصريف 4 لتر في الساعة لكل نقّاط.',
              createdAt: 'منذ ساعتين',
            }
          ]
        },
        {
          id: 'post-3',
          author: 'م. يوسف الصعيدي',
          location: 'الدلتا، مصر',
          category: 'مكافحة الآفات والأمراض',
          title: 'خلطة طبيعية عضوية فعالة لطرد الذبابة البيضاء والمن',
          content: 'لكل من يعاني من حشرة المن في حدائق الخضار المنزلية: 1 لتر ماء دافئ + 5 مل صابون سائل طبيعي خالي من العطور + ملعقة صغيرة زيت نيم + فص ثوم مهروس. يُرش وقت الغروب كل 5 أيام. علاج آمن وصحي 100% بدون أي مبيدات كيميائية.',
          likes: 47,
          createdAt: 'أمس',
          comments: [
            {
              id: 'c-4',
              author: 'سالم الشمري',
              location: 'حائل',
              content: 'جربت هذه الطريقة على شتلات النعناع والباذنجان، والنتيجة ممتازة وخلت الأوراق نظيفة تماماً.',
              createdAt: 'منذ 5 ساعات',
            }
          ]
        },
        {
          id: 'post-4',
          author: 'طارق المرابط',
          location: 'سوس، المغرب',
          category: 'استفسارات الري والآبار',
          title: 'أفضل توقيت لضبط تايمر الري الذكي لأشجار الزيتون والحمضيات',
          content: 'سؤال موجه للخبراء: هل تشغيل شبكة التنقيط الساعة 5 صباحاً أفضل أم الساعة 9 ليلاً في المناطق الحارة؟',
          likes: 19,
          createdAt: 'أمس',
          comments: [
            {
              id: 'c-5',
              author: 'د. خالد الزراعي',
              location: 'عمان، الأردن',
              content: 'الصباح الباكر (5:00 ص) هو الأفضل علمياً، لأن النبات يستعد لبدء التمثيل الضوئي مع شروق الشمس، والتربة تمتص الماء دون ركود ليلي قد يسبب أعفاناً فطرية.',
              createdAt: 'أمس',
            }
          ]
        }
      ];
      fs.writeFileSync(FORUM_DB_PATH, JSON.stringify(initialPosts, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing forum DB:', err);
  }
}

initForumDb();

function getStoredForumPosts() {
  try {
    initForumDb();
    const data = fs.readFileSync(FORUM_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading forum posts:', err);
    return [];
  }
}

function saveForumPosts(posts: any[]) {
  try {
    initForumDb();
    fs.writeFileSync(FORUM_DB_PATH, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving forum posts:', err);
  }
}

// 1. Get all forum posts
app.get('/api/forum/posts', (req: Request, res: Response) => {
  const posts = getStoredForumPosts();
  res.json({ success: true, posts });
});

// 2. Create a new forum post (No login required!)
app.post('/api/forum/posts', (req: Request, res: Response): void => {
  try {
    const { author, location, category, title, content, imageBase64 } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      res.status(400).json({ error: 'العنوان ومحتوى المشاركة مطلوبان.' });
      return;
    }

    const posts = getStoredForumPosts();
    const newPost = {
      id: `post-${Date.now()}`,
      author: author && author.trim() ? author.trim() : 'مزارع مبدع',
      location: location && location.trim() ? location.trim() : 'العالم العربي',
      category: category || 'نصائح وتجارب زراعية',
      title: title.trim(),
      content: content.trim(),
      imageBase64: imageBase64 || null,
      likes: 0,
      createdAt: 'الآن',
      comments: [],
    };

    posts.unshift(newPost);
    saveForumPosts(posts);

    res.json({ success: true, post: newPost });
  } catch (err: any) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'فشل نشر المشاركة.', details: err.message });
  }
});

// 3. Like a post
app.post('/api/forum/posts/:id/like', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const posts = getStoredForumPosts();
    const post = posts.find((p: any) => p.id === id);

    if (!post) {
      res.status(404).json({ error: 'المنشور غير موجود.' });
      return;
    }

    post.likes = (post.likes || 0) + 1;
    saveForumPosts(posts);

    res.json({ success: true, likes: post.likes });
  } catch (err: any) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'فشل تسجيل الإعجاب.' });
  }
});

// 4. Comment on a post (No login required!)
app.post('/api/forum/posts/:id/comment', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { author, location, content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'نص التعليق مطلوب.' });
      return;
    }

    const posts = getStoredForumPosts();
    const post = posts.find((p: any) => p.id === id);

    if (!post) {
      res.status(404).json({ error: 'المنشور غير موجود.' });
      return;
    }

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    const newComment = {
      id: `c-${Date.now()}`,
      author: author && author.trim() ? author.trim() : 'فلاح مشارك',
      location: location && location.trim() ? location.trim() : '',
      content: content.trim(),
      createdAt: 'الآن',
    };

    post.comments.push(newComment);
    saveForumPosts(posts);

    res.json({ success: true, comment: newComment, comments: post.comments });
  } catch (err: any) {
    console.error('Error commenting:', err);
    res.status(500).json({ error: 'فشل إضافة التعليق.' });
  }
});

// Fast Preset Diagnosis Handler
function getPresetDiagnosis(presetId: string, areaM2: number, weatherCondition: string) {
  if (presetId === 'sample-lawn') {
    return generateFallbackDiagnosis(areaM2, weatherCondition);
  } else if (presetId === 'sample-tomato') {
    return {
      plantIdentification: {
        arabicName: "شتلات طماطم (Solanum lycopersicum)",
        englishScientificName: "Solanum lycopersicum",
        category: "خضروات ثمرية بأحواض زراعية",
        description: "نباتات طماطم في مرحلة بداية التزهير والعقد مع التفاف طفيف في الأوراق القمية."
      },
      healthAssessment: {
        overallStatus: "إجهاد مائي خفيف ونقص بوتاسيوم",
        healthScore: 82,
        detectedIssues: [
          {
            issue: "التفاف قمم الأوراق (Leaf Curling)",
            severity: "متوسط",
            symptoms: "تقعر حواف الأوراق العليا نحو الداخل.",
            probableCause: "تفاوت الرطوبة وارتفاع درجات الحرارة نهاراً مقارنة بالليل."
          },
          {
            issue: "نقص عنصر الكالسيوم والبوتاسيوم",
            severity: "منخفض",
            symptoms: "شحوب في أطراف الأوراق القديمة.",
            probableCause: "الري غير المنتظم يقلل امتصاص الكالسيوم وقد يؤدي لعفن الطرف الزهري."
          }
        ]
      },
      irrigationEngine: {
        frequencyPerWeek: "كل يومين بانتظام",
        litersPerM2: 5.5,
        totalLitersPerSession: parseFloat((5.5 * areaM2).toFixed(1)),
        bestTimeOfDay: "الساعة 6:00 صباحاً قبل اشتداد الشمس",
        weatherLogicAdvice: `الطقس (${weatherCondition}): الري المنتظم يمنع تشقق الثمار، مع تجنب ري الأوراق مباشرة لتفادي البياض الدقيقي.`,
        irrigationMethod: "ري بالتنقيط مباشرة عند قاعدة الساق"
      },
      careActionPlan: [
        {
          step: 1,
          title: "تغذية بنترات الكالسيوم والبوتاسيوم",
          action: "إضافة سماد عالي البوتاسيوم 12-12-36 بالتنقيط مع رش ورقي كالسيوم بورون لتقوية الأزهار.",
          materials: "نترات كالسيوم + سماد بوتاسي + كالسيوم بورون",
          timing: "صباح الغد"
        },
        {
          step: 2,
          title: "التغطية العضوية (Mulch)",
          action: "فرش طبقة قش أو شرائح لحاء حول الشتلات لحبس رطوبة التربة ومنع التبخر.",
          materials: "قش نباتي نظيف أو بيتموس",
          timing: "خلال 48 ساعة"
        }
      ],
      sunAndEnvironment: {
        sunlightNeeds: "شمس ساطعة 6 إلى 8 ساعات يومياً",
        temperatureTolerance: "المدى المثالي 20°C - 30°C",
        soilAdvice: "تربة طميية رملية جيدة الصرف pH 6.2 - 6.8"
      },
      standardFormattedSummary: `🌿 نتيجة فحص المساحة الخضراء
* النبات المكتشف: شتلات طماطم (Solanum lycopersicum)
* الحالة الصحية: إجهاد مائي خفيف مع نقص بوتاسيوم (درجة الصحة: 82%)
* جدول الري الموصى به: 5.5 لتر لكل م² (${(5.5 * areaM2).toFixed(0)} لتر إجمالي) | كل يومين بانتظام
* التشخيص والتوصيات: إضافة كالسيوم بورون لتثبيت الأزهار، وتغطية التربة بالقش لمنع التبخر.`,
      followUpPrompt: "هل ترغب في برنامج التسميد المتكامل لمرحلة الإثمار وحماية الثمار من التشقق؟"
    };
  } else if (presetId === 'sample-citrus') {
    return {
      plantIdentification: {
        arabicName: "شجرة ليمون حمضيات (Citrus limon)",
        englishScientificName: "Citrus limon",
        category: "أشجار حمضيات مثمرة",
        description: "شجرة ليمون بستانية تظهر اصفراراً شبكياً بين عروق الأوراق الحديثة."
      },
      healthAssessment: {
        overallStatus: "نقص عنصر الحديد المخلبي (Iron Chlorosis)",
        healthScore: 74,
        detectedIssues: [
          {
            issue: "اصفرار ما بين عروق الأوراق (Interveinal Chlorosis)",
            severity: "متوسط",
            symptoms: "العروق خضراء داكنة بينما المسافات بينها صفراء زاهية.",
            probableCause: "قلوية التربة (High pH) تعيق امتصاص الحديد أو زيادة الري التي تخنق الجذور."
          }
        ]
      },
      irrigationEngine: {
        frequencyPerWeek: "مرتان إلى 3 مرات أسبوعياً ري عميق",
        litersPerM2: 7.5,
        totalLitersPerSession: parseFloat((7.5 * areaM2).toFixed(1)),
        bestTimeOfDay: "الصباح الباكر أو بعد غروب الشمس",
        weatherLogicAdvice: `الطقس (${weatherCondition}): الري العميق كل 3-4 أيام أفضل بكثير من الري السطحي اليومي لتشجيع الجذور على التعمق.`,
        irrigationMethod: "حلقات تنقيط مزدوجة (Drip rings) أو بابلر حول محيط التاج"
      },
      careActionPlan: [
        {
          step: 1,
          title: "تسميد بشيلات الحديد EDDHA",
          action: "سقي التربة بمحلول شيلات الحديد (Fe-EDDHA 6%) بمعدل 25 جرام لكل شجرة مذابة في 20 لتر ماء.",
          materials: "شيلات حديد Fe-EDDHA حمراء + هيوميك أسيد",
          timing: "فوراً عند رية الصباح"
        },
        {
          step: 2,
          title: "معادلة قلوية التربة بإضافة الكبريت الزراعي",
          action: "نثر 100 جرام من الكبريت الزراعي حول مسقط الشجرة لخفض الـ pH وتسهيل امتصاص العناصر الصغرى.",
          materials: "كبريت زراعي ناعم",
          timing: "نهاية الأسبوع"
        }
      ],
      sunAndEnvironment: {
        sunlightNeeds: "شمس مباشرة كاملة 7 ساعات فأكثر",
        temperatureTolerance: "تتحمل حتى 45°C مع الحفاظ على رطوبة التربة العميقة",
        soilAdvice: "حفر خنادق تصريف صغيرة إذا كانت التربة تميل لتجمع المياه حول الجذع"
      },
      standardFormattedSummary: `🌿 نتيجة فحص المساحة الخضراء
* النبات المكتشف: شجرة ليمون وحمضيات (Citrus limon)
* الحالة الصحية: شحوب واصفرار ناتج عن نقص الحديد (درجة الصحة: 74%)
* جدول الري الموصى به: 7.5 لتر لكل م² (${(7.5 * areaM2).toFixed(0)} لتر إجمالي) | كل 3 أيام ري عميق
* التشخيص والتوصيات: إضافة شيلات الحديد EDDHA فوراً وتعديل قلوية التربة بالكبريت الزراعي.`,
      followUpPrompt: "هل تود معرفة كمية شيلات الحديد والسماد المناسبة بالضبط لعمر وحجم شجرتك؟"
    };
  } else if (presetId === 'sample-indoor') {
    return {
      plantIdentification: {
        arabicName: "نبات زينة منزلي (مونستيرا / بوتس)",
        englishScientificName: "Epipremnum aureum / Monstera",
        category: "نباتات ظل وزينة داخلية",
        description: "أوراق نبات داخلي كبيرة مع اسوداد وطراوة في أطراف الأوراق السفلية."
      },
      healthAssessment: {
        overallStatus: "اختناق جذري بسبب الري الزائد (Root Suffocation)",
        healthScore: 71,
        detectedIssues: [
          {
            issue: "اسوداد وتعفن أطراف الأوراق",
            severity: "متوسط إلى حرج",
            symptoms: "حواف طرية بنية محاطة بهالة صفراء باهتة.",
            probableCause: "الري المتكرر قبل جفاف سطح التربة وسوء تصريف الأصيص."
          }
        ]
      },
      irrigationEngine: {
        frequencyPerWeek: "مرة واحدة كل 7 إلى 10 أيام فقط",
        litersPerM2: 2.5,
        totalLitersPerSession: parseFloat((2.5 * areaM2).toFixed(1)),
        bestTimeOfDay: "الصباح عند توفر إضاءة طبيعية غير مباشرة",
        weatherLogicAdvice: "التوقف تماماً عن الري حتى يجف أعلى 3 سم من التربة كلياً.",
        irrigationMethod: "سقاية يدوية مع التأكد من خروج الماء الزائد من فتحات الصرف السفلية"
      },
      careActionPlan: [
        {
          step: 1,
          title: "فحص وتفريغ ماء الصحن السفلي",
          action: "التخلص من أي مياه راكدة تحت الأصيص والتأكد من عدم انسداد فتحات التصريف.",
          materials: "أصيص بفتحات تصريف جيدة",
          timing: "فوراً"
        },
        {
          step: 2,
          title: "تقليم الأجزاء التالفة ورش مضاد فطري",
          action: "قص الأطراف البنية بمقص معقم بالكحول ورش خفيف بمبيد فطري نحاسي خفيف.",
          materials: "مقص تقليم نظيف + مبيد فطري",
          timing: "اليوم"
        }
      ],
      sunAndEnvironment: {
        sunlightNeeds: "إضاءة ساطعة غير مباشرة (تجنب الشمس المباشرة)",
        temperatureTolerance: "درجة حرارة الغرفة 18°C - 26°C",
        soilAdvice: "تربة خفيفة مسامية (بيتموس + بيرلايت 30%)"
      },
      standardFormattedSummary: `🌿 نتيجة فحص المساحة الخضراء
* النبات المكتشف: نبات زينة داخلي (مونستيرا / بوتس)
* الحالة الصحية: اختناق جذري بسبب الري الزائد (درجة الصحة: 71%)
* جدول الري الموصى به: 2.5 لتر لكل م² | مرة واحدة كل 7 إلى 10 أيام
* التشخيص والتوصيات: تقليل الري، فحص فتحات تصريف الأصيص، وقص الأجزاء التالفة.`,
      followUpPrompt: "هل ترغب في معرفة أفضل خلطة تربة خفيفة تمنع تعفن الجذور مستقبلاً؟"
    };
  }
  return null;
}

// Fallback Generators
function generateFallbackDiagnosis(areaM2: number, weatherCondition: string, notes: string = '') {
  const litersPerM2 = 7.0;
  return {
    plantIdentification: {
      arabicName: "عشب طبيعي مهجن (باسبالم أو برمودا تيفواي)",
      englishScientificName: "Paspalum vaginatum / Cynodon dactylon",
      category: "مسطحات خضراء دائمة الخضرة ومقاومة للحرارة",
      description: "مسطح عشبي كثيف ذو نصل متوسط النعومة يغطي المساحة بنمو أفقي ممتد."
    },
    healthAssessment: {
      overallStatus: "إجهاد مائي طفيف مع نقص عناصر دقيقة",
      healthScore: 78,
      detectedIssues: [
        {
          issue: "شحوب واصفرار خفيف في بعض الرقع (Chlorosis)",
          severity: "متوسط",
          symptoms: "فقدان اللون الأخضر الزمردي وتحول بعض أطراف العشب إلى الأصفر الفاتح.",
          probableCause: "نقص عنصر الحديد المخلبي (Fe) أو زيادة قلوية التربة التي تمنع امتصاص المغذيات."
        },
        {
          issue: "توزيع مائي غير متجانس",
          severity: "منخفض",
          symptoms: "جفاف نسبي في أطراف الحوض مقارنة بالمركز.",
          probableCause: "ضغط رشاشات الري غير المتكافئ أو التبخر السريع نتيجة حرارة الطقس."
        }
      ]
    },
    irrigationEngine: {
      frequencyPerWeek: "3 إلى 4 مرات أسبوعياً",
      litersPerM2: litersPerM2,
      totalLitersPerSession: parseFloat((litersPerM2 * areaM2).toFixed(1)),
      bestTimeOfDay: "بين الساعة 5:00 صباحاً و 6:30 صباحاً قبل اشتداد أشعة الشمس",
      weatherLogicAdvice: `الطقس المسجل: (${weatherCondition}). في الأيام الحارة، يفضل إضافة رية تنشيطية سريعة خفيفة وقت الظهيرة لتبريد تاج العشب، وتقليل الري عند هطول الأمطار.`,
      irrigationMethod: "رشاشات رذاذية منبثقة (Pop-up Sprinklers) ذات فوهات دوارة موفرة للمياه"
    },
    careActionPlan: [
      {
        step: 1,
        title: "تغذية فورية بشيلات الحديد والنيتروجين",
        action: "رش ورقي بمحلول شيلات الحديد (Fe-EDDHA) بمعدل 5 جرام لكل 10 لتر ماء مع سماد متوازن سريع الذوبان.",
        materials: "شيلات حديد 6% + سماد NPK 20-20-20",
        timing: "في الصباح الباكر خلال يومين"
      },
      {
        step: 2,
        title: "تهوية التربة والتخريم (Aeration)",
        action: "تخريم سطح التربة باستخدام شوكة الحديقة لعمق 8 سم لفك انضغاط التربة وتسهيل وصول الماء والأكسجين للجذور.",
        materials: "أداة تهوية العشب اليدوية أو شوكة زراعية",
        timing: "خلال نهاية الأسبوع"
      },
      {
        step: 3,
        title: "ضبط ارتفاع القص",
        action: "رفع مستوى شفرة جزازة العشب إلى 3.5 - 4 سم لحماية الجذور من حرارة الشمس الشديدة.",
        materials: "جزازة عشب مضبوطة الشفرات",
        timing: "عند القص الدوري القادم"
      }
    ],
    sunAndEnvironment: {
      sunlightNeeds: "شمس ساطعة مباشرة (لا تقل عن 5 ساعات يومياً لضمان كثافة النصل)",
      temperatureTolerance: "يتحمل حتى 48°C صيفاً مع المحافظة على رطوبة التربة",
      soilAdvice: "إضافة طبقة رقيقة من الكمبوست المعقم والرمل النهري (Top Dressing) لتحسين الاحتفاظ بالرطوبة."
    },
    standardFormattedSummary: `🌿 نتيجة فحص المساحة الخضراء
* النبات المكتشف: عشب طبيعي مهجن (باسبالم / برمودا)
* الحالة الصحية: إجهاد مائي طفيف مع نقص حديد (درجة الصحة: 78%)
* جدول الري الموصى به: ${litersPerM2} لتر لكل م² (${(litersPerM2 * areaM2).toFixed(0)} لتر إجمالي للمساحة) | كل يومين إلى 3 أيام
* التشخيص والتوصيات: إضافة شيلات الحديد فوراً، تهوية التربة، ورفع مستوى القص لحماية الجذور من التبخر.`,
    followUpPrompt: "هل تود أن نساعدك في حساب كميات السماد الدقيقة لمساحة حديقتك البالغة " + areaM2 + " م²؟"
  };
}

function generateFallbackPlan(cropName: string, location: string, areaM2: number) {
  return {
    cropTitle: cropName,
    location: location,
    standardFormattedHeader: `🍎 خطة زراعة ${cropName} في ${location}
1. مدى التوافق والملائمة: ممتاز في العروة الشتوية والربيعية
2. متى تزرع؟ (التقويم الزراعي): من أكتوبر حتى مارس
3. أين تزرع؟: شمس كاملة، مسافة 40 سم بين الشتلات، تربة طميية خصبة
4. كيف تزرع؟: إعداد التربة بالكمبوست، الري بالتنقيط، ودعم النبات بدعامات خشبية`,
    feasibility: {
      suitability: "ممتاز ومجرب بنجاح",
      compatibilityScore: 90,
      climateEvaluation: `يتوافق مناخ ${location} بشكل متميز مع زراعة ${cropName} خلال المواسم المعتدلة، حيث تتيح الليالي المعتدلة والأيام المشمسة نمواً خضرياً غنياً وتزهيراً كفؤاً.`,
      expectedYield: `تنتج المساحة المقدرة بـ ${areaM2} م² حوالي 80 - 140 كجم من المحصول الصافي خلال موسم الحصاد.`
    },
    plantingCalendar: {
      sowingMonths: ["أكتوبر", "نوفمبر", "ديسمبر", "فبراير"],
      harvestMonths: ["يناير", "فبراير", "مارس", "أبريل"],
      idealGerminationDays: "6 - 10 أيام",
      temperatureRange: {
        germinationOptimal: "21°C - 26°C",
        growthRange: "18°C - 30°C",
        frostSensitivity: "حساس للبرودة القارصة والصقيع المباشر"
      },
      seasonalPhases: [
        {
          phase: "بذر الصواني وتجهيز الشتلات",
          months: "أكتوبر - منتصف نوفمبر",
          description: "زراعة البذور في صواني تشتيل مظللة جزئياً برطوبة خفيفة مستمرة."
        },
        {
          phase: "نقل الشتلات إلى الأرض المستديمة",
          months: "نوفمبر",
          description: "غرس الشتلات عند وصولها لـ 4 أوراق حقيقية مع الري بمحلول منشط جذور."
        },
        {
          phase: "النمو النشط والتزهير",
          months: "ديسمبر - يناير",
          description: "إمداد النبات بمركبات الكالسيوم والبوتاسيوم لتقوية الأزهار."
        },
        {
          phase: "موسم قطاف المحصول",
          months: "فبراير - أبريل",
          description: "جني الثمار كل 3-4 أيام في الصباح الباكر لضمان جودتها ونضارتها."
        }
      ]
    },
    whereToPlant: {
      sunlightRequirement: "شمس ساطعة (لا تقل عن 6-7 ساعات يومياً)",
      spacePerPlant: "45 سم بين كل شتلة وأخرى",
      spaceBetweenRows: "80 سم لسهولة الحركة والخدمة وتجديد الهواء",
      soilTypeAndPH: "تربة رملية طميية جيدة الصرف، غنية بالمادة العضوية، pH 6.0 - 6.8",
      indoorVsOutdoor: "أرض مفتوحة أو أحواض مرتفعة أو بيوت شبكية للحماية من الطيور وأشعة الشمس اللافحة",
      spaceCapacityEstimate: `تتسع مساحتك (${areaM2} م²) لزراعة نحو ${(areaM2 * 2.2).toFixed(0)} إلى ${(areaM2 * 2.8).toFixed(0)} نبتة منتجة.`
    },
    howToPlant: {
      soilPreparation: "حرث وتقليب التربة لعمق 30 سم، خلطها بكومبوست نباتي معقم بنسبة 20%، وتمديد شبكة خراطيم ري بالتنقيط.",
      seedDepthAndSpacing: "عمق البذرة 1 سم، والمسافة بين البذور 40-50 سم بعد الخف.",
      irrigationSchedule: {
        seedlingStage: "ري رذاذي خفيف يومياً في الصباح",
        vegetativeStage: "ري بالتنقيط بمعدل 4 لتر لكل متر مربع كل يومين",
        fruitingStage: "ري منتظم بمعدل 6-8 لتر لكل متر مربع مع تجنب العطش المفاجئ لتفادي تشقق الثمار",
        litersPerM2Weekly: 22
      },
      fertilizationGuide: [
        {
          stage: "التأسيس والشتل",
          fertilizer: "سماد سوبر فوسفات + كمبوست متحلل لتقوية شبكة الجذور"
        },
        {
          stage: "التفرع والنمو",
          fertilizer: "سماد متوازن 20-20-20 كل 10 أيام بالتنقيط"
        },
        {
          stage: "عقد الثمار والنضج",
          fertilizer: "سماد سلفات بوتاسيوم عالي + كالسيوم مخلبي"
        }
      ],
      growthSteps: [
        {
          stepNumber: 1,
          title: "تسوية المصاطب وتجهيز التربة",
          description: "تكوين خطوط زراعية مرتفعة بارتفاع 15 سم لتسهيل تصريف المياه الزائدة."
        },
        {
          stepNumber: 2,
          title: "الشتل والغرس",
          description: "غرس الشتلة حتى بداية أول ورقة حقيقية مع ضغط التربة الخفيف حولها."
        },
        {
          stepNumber: 3,
          title: "التغطية العضوية (Mulching)",
          description: "وضع طبقة قش أو شرائح زراعية للحفاظ على رطوبة التربة ومنع نمو الحشائش."
        },
        {
          stepNumber: 4,
          title: "التربية والدعامات",
          description: "ربط النبات برفق إلى دعامات خشبية أو أسلاك شيد لتوجيهه رأسياً."
        },
        {
          stepNumber: 5,
          title: "الحصاد الدوري",
          description: "استخدام مقص تقليم نظيف لقطف الثمار دون إيذاء الأغصان الرئيسية."
        }
      ]
    },
    pestAndDiseaseManagement: [
      {
        pestOrDisease: "حشرة المن وصانعات الأنفاق",
        prevention: "تعليق مصائد صفراء لاصقة والرش الوقائي بزيت النيم العضوي",
        organicTreatment: "محلول صابوني زراعي خفيف (5 مل لكل لتر ماء) يرش وقت الغروب"
      },
      {
        pestOrDisease: "البياض الدقيقي الفطري",
        prevention: "الري السفلي دون رش الأوراق وضمان مسافات كافية بين النباتات للتهوية",
        organicTreatment: "رش مسحوق كبريت ميكروني أو محلول بيكربونات البوتاسيوم"
      }
    ],
    followUpPrompt: "هل ترغب في أن نصمم لك خريطة توزيع لشبكة الري بالتنقيط أو نقترح لك محاصيل مرافقة (Companion Plants) تطرد الحشرات طبيعياً؟"
  };
}

// Development or Production handler
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 AgriMind AI Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
