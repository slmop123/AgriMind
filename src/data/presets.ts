export interface PresetSample {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imagePreview: string; // Base64 or Data URL
  defaultArea: number;
  defaultWeather: string;
  notes: string;
}

// Crisp inline SVG data URLs representing real agricultural scenarios for immediate instant testing
export const PRESET_GARDEN_SAMPLES: PresetSample[] = [
  {
    id: 'sample-lawn',
    title: 'مسطح عشب طبيعي مجهد',
    subtitle: 'حديقة فيلا - اصفرار بقعي وتيبس أطراف',
    category: 'مسطحات خضراء',
    defaultArea: 60,
    defaultWeather: 'حار صيفي (38°C)',
    notes: 'نلاحظ اصفراراً في بعض الرقع وضعف امتصاص الماء عند الأطراف.',
    imagePreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a381b"/><stop offset="50%" stop-color="%232d5a27"/><stop offset="100%" stop-color="%236e7826"/></linearGradient><radialGradient id="sun" cx="70%" cy="30%" r="50%"><stop offset="0%" stop-color="%23b8a339" stop-opacity="0.6"/><stop offset="100%" stop-color="%230f2411" stop-opacity="0"/></radialGradient></defs><rect width="600" height="400" fill="url(%23g1)"/><circle cx="420" cy="120" r="160" fill="url(%23sun)"/><path d="M 0 240 Q 150 200 300 250 T 600 230 L 600 400 L 0 400 Z" fill="%2322421d"/><path d="M 50 320 Q 200 280 350 340 T 600 300 L 600 400 L 0 400 Z" fill="%233a5924" opacity="0.8"/><circle cx="200" cy="270" r="45" fill="%23857b29" opacity="0.55"/><circle cx="380" cy="290" r="60" fill="%239e8a2a" opacity="0.6"/><text x="30" y="50" fill="%23a7f3d0" font-family="sans-serif" font-size="18" font-weight="bold">🌿 عينة فحص: مسطح عشب برمودا مجهد حرارياً</text><text x="30" y="80" fill="%23e2e8f0" font-family="sans-serif" font-size="14">تحليل الذكاء الاصطناعي لاحتياجات الري والتغذية</text></svg>`,
  },
  {
    id: 'sample-tomato',
    title: 'شتلات طماطم وخضروات',
    subtitle: 'أحواض منزلية - إجهاد مائي ونقص عناصر',
    category: 'خضروات وفاكهة',
    defaultArea: 25,
    defaultWeather: 'معتدل دافئ (28°C)',
    notes: 'التفاف خفيف في قمم الأوراق مع بداية تزهير.',
    imagePreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="gt" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e3d23"/><stop offset="100%" stop-color="%230d1a10"/></linearGradient></defs><rect width="600" height="400" fill="url(%23gt)"/><rect x="80" y="240" width="440" height="130" rx="16" fill="%233d2a1c"/><line x1="160" y1="240" x2="160" y2="100" stroke="%23855832" stroke-width="6"/><line x1="300" y1="240" x2="300" y2="90" stroke="%23855832" stroke-width="6"/><line x1="440" y1="240" x2="440" y2="110" stroke="%23855832" stroke-width="6"/><circle cx="160" cy="140" r="38" fill="%232e7d32"/><circle cx="180" cy="165" r="14" fill="%23ef4444"/><circle cx="300" cy="130" r="42" fill="%23388e3c"/><circle cx="285" cy="155" r="16" fill="%23eab308"/><circle cx="440" cy="145" r="36" fill="%232e7d32"/><circle cx="455" cy="168" r="15" fill="%23ef4444"/><text x="30" y="50" fill="%23a7f3d0" font-family="sans-serif" font-size="18" font-weight="bold">🍅 عينة فحص: شتلات طماطم بأحواض مرتفعة</text><text x="30" y="80" fill="%23e2e8f0" font-family="sans-serif" font-size="14">تحليل احتساب الري والتسميد البوتاسي</text></svg>`,
  },
  {
    id: 'sample-citrus',
    title: 'أشجار ليمون وحمضيات',
    subtitle: 'حديقة خلفية - اصفرار عروق الأوراق (شحوب حديد)',
    category: 'أشجار مثمرة',
    defaultArea: 40,
    defaultWeather: 'جاف ومشمس (34°C)',
    notes: 'اصفرار واضح بين عروق الأوراق مع بطء خروج النموات الحديثة.',
    imagePreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="gc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23132616"/><stop offset="100%" stop-color="%2308120a"/></linearGradient></defs><rect width="600" height="400" fill="url(%23gc)"/><path d="M 285 380 L 315 380 L 305 220 L 295 220 Z" fill="%23543d2b"/><circle cx="300" cy="160" r="110" fill="%232b5329"/><circle cx="250" cy="180" r="18" fill="%23eab308"/><circle cx="340" cy="140" r="16" fill="%23facc15"/><circle cx="320" cy="200" r="19" fill="%23eab308"/><circle cx="270" cy="120" r="15" fill="%23ca8a04"/><text x="30" y="50" fill="%23a7f3d0" font-family="sans-serif" font-size="18" font-weight="bold">🍋 عينة فحص: شجرة حمضيات تعاني نقص عناصر</text><text x="30" y="80" fill="%23e2e8f0" font-family="sans-serif" font-size="14">كشف أعراض نقص مخلب الحديد وتعديل حموضة التربة</text></svg>`,
  },
  {
    id: 'sample-indoor',
    title: 'نباتات ظل وزينة داخلية',
    subtitle: 'صالة منزلية - ري زائد وتعفن أطراف',
    category: 'نباتات داخلية',
    defaultArea: 10,
    defaultWeather: 'داخلي مكيف (23°C)',
    notes: 'تحول أطراف الأوراق إلى بني رطب مع ثقل في التربة.',
    imagePreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="gi" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23171f19"/><stop offset="100%" stop-color="%230c120d"/></linearGradient></defs><rect width="600" height="400" fill="url(%23gi)"/><polygon points="260,370 340,370 355,270 245,270" fill="%23d97706"/><ellipse cx="300" cy="270" rx="55" ry="12" fill="%2378350f"/><path d="M 300 270 Q 230 180 200 130 Q 250 170 300 250" fill="%2315803d"/><path d="M 300 270 Q 370 170 410 120 Q 360 170 300 250" fill="%23166534"/><circle cx="200" cy="130" r="12" fill="%23854d0e"/><text x="30" y="50" fill="%23a7f3d0" font-family="sans-serif" font-size="18" font-weight="bold">🪴 عينة فحص: نبات زينة داخلي (مونستيرا/بوتس)</text><text x="30" y="80" fill="%23e2e8f0" font-family="sans-serif" font-size="14">تشخيص أعراض الاختناق الجذري وتصريف الأصص</text></svg>`,
  }
];

export const POPULAR_CROPS = [
  { name: 'طماطم', icon: '🍅', category: 'خضروات ثمرية', season: 'شتوي / ربيعي' },
  { name: 'خيار', icon: '🥒', category: 'خضروات ثمرية', season: 'ربيعي / خريفي' },
  { name: 'فلفل رومي وحار', icon: '🫑', category: 'خضروات ثمرية', season: 'طوال الموسم المعتدل' },
  { name: 'باذنجان', icon: '🍆', category: 'خضروات ثمرية', season: 'ربيعي / صيفي معتدل' },
  { name: 'كوسة', icon: '🥬', category: 'خضروات سريعة', season: 'خريفي / ربيعي' },
  { name: 'فراولة', icon: '🍓', category: 'فاكهة', season: 'شتوي' },
  { name: 'نعناع وريحان', icon: '🌿', category: 'أعشاب عطرية', season: 'دائم مع تظليل' },
  { name: 'خس هيدروبونيك', icon: '🥗', category: 'ورقيات', season: 'شتوي' },
  { name: 'ليمون شهري', icon: '🍋', category: 'حمضيات', season: 'طوال العام' },
  { name: 'تين', icon: '🌱', category: 'أشجار مثمرة', season: 'ربيعي / صيفي' },
  { name: 'رمان', icon: '🍇', category: 'أشجار مثمرة', season: 'ربيعي' },
  { name: 'بطيخ وشمام', icon: '🍉', category: 'محاصيل صيفية', season: 'أواخر الربيع' },
  { name: 'نخيل مجدول وخلاص', icon: '🌴', category: 'نخيل', season: 'دائم ومتحمل' },
  { name: 'جزر وفجل', icon: '🥕', category: 'جذريات', season: 'شتوي' }
];

export const POPULAR_LOCATIONS = [
  'الرياض، المملكة العربية السعودية',
  'جدة والمنطقة الغربية، السعودية',
  'القصيم، المملكة العربية السعودية',
  'القاهرة والدلتا، مصر',
  'دبي وأبوظبي، الإمارات العربية المتحدة',
  'الدار البيضاء والرباط، المغرب',
  'عمان، الأردن',
  'بغداد، العراق',
  'مسقط، سلطنة عمان',
  'الدوحة، قطر',
  'الكويت، دولة الكويت',
  'تونس العاصمة، تونس',
  'الجزائر العاصمة، الجزائر',
  'بيروت، لبنان'
];
