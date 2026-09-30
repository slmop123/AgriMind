import React, { useMemo } from 'react';

interface FloatingItem {
  id: number;
  emoji: string;
  label: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  opacity: string;
  rotation: string;
}

export const FloatingAgriBackground: React.FC = () => {
  // A rich collection of agricultural machinery, fruits, vegetables, and farming tools
  const floatingElements: FloatingItem[] = useMemo(() => {
    const rawItems = [
      // Agricultural Machinery & Tools
      { emoji: '🚜', label: 'جرار زراعي' },
      { emoji: '🌾', label: 'قمح وسنابل' },
      { emoji: '🪴', label: 'أصيص زراعي' },
      { emoji: '💧', label: 'قطرة ري' },
      { emoji: '✂️', label: 'مقص تقليم' },
      { emoji: '🌻', label: 'دوار الشمس' },
      { emoji: '🐝', label: 'نحلة التلقيح' },
      { emoji: '🧺', label: 'سلة حصاد' },
      { emoji: '🌱', label: 'شتلة وبذرة' },
      { emoji: '🌿', label: 'أوراق شجر' },
      { emoji: '🧤', label: 'قفازات زراعية' },
      { emoji: '🌳', label: 'شجرة مثمرة' },
      // Fruits
      { emoji: '🍎', label: 'تفاح' },
      { emoji: '🍊', label: 'برتقال' },
      { emoji: '🍋', label: 'ليمون' },
      { emoji: '🍓', label: 'فراولة' },
      { emoji: '🍉', label: 'بطيخ' },
      { emoji: '🍇', label: 'عنب' },
      { emoji: '🥑', label: 'أفوكادو' },
      { emoji: '🥭', label: 'مانجو' },
      { emoji: '🍑', label: 'خوخ' },
      { emoji: '🍒', label: 'كرز' },
      { emoji: '🥥', label: 'جوز هند' },
      { emoji: '🍌', label: 'موز' },
      // Vegetables & Crops
      { emoji: '🍅', label: 'طماطم' },
      { emoji: '🥕', label: 'جزر' },
      { emoji: '🌽', label: 'ذرة' },
      { emoji: '🍆', label: 'باذنجان' },
      { emoji: '🥦', label: 'بروكلي' },
      { emoji: '🥬', label: 'خس ورقي' },
      { emoji: '🫑', label: 'فلفل رومي' },
      { emoji: '🥒', label: 'خيار' },
      { emoji: '🥔', label: 'بطاطس' },
      { emoji: '🧅', label: 'بصل' },
      { emoji: '🧄', label: 'ثوم' },
      { emoji: '🫛', label: 'بازلاء' },
    ];

    // Create 45 animated floating particles distributed across the viewport
    return Array.from({ length: 42 }).map((_, index) => {
      const item = rawItems[index % rawItems.length];
      const leftPercent = ((index * 2.38) % 96) + 2; // Evenly distributed from 2% to 98%
      const sizes = ['text-2xl', 'text-3xl', 'text-4xl', 'text-3xl', 'text-5xl'];
      const size = sizes[index % sizes.length];
      const duration = `${16 + ((index * 3) % 18)}s`; // 16s to 34s
      const delay = `-${((index * 2.7) % 24).toFixed(1)}s`; // Staggered start so screen is immediately populated
      const opacity = `${0.65 + ((index % 4) * 0.08)}`; // Clear and visible (0.65 to 0.89)
      const rotation = `${((index * 37) % 60) - 30}deg`;

      return {
        id: index,
        emoji: item.emoji,
        label: item.label,
        left: `${leftPercent}%`,
        size,
        duration,
        delay,
        opacity,
        rotation,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* Soft Ambient Light Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F2F8F2] via-[#F8FAF8] to-[#EBF5ED] opacity-90" />

      {/* Subtle Glowing Emerald Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-lime-300/15 rounded-full blur-3xl" />

      {/* Floating Animated Emojis & Shapes */}
      {floatingElements.map((elem) => (
        <div
          key={elem.id}
          className="absolute animate-float-up transition-transform"
          style={{
            left: elem.left,
            animationDuration: elem.duration,
            animationDelay: elem.delay,
            opacity: elem.opacity,
            transform: `rotate(${elem.rotation})`,
            filter: 'drop-shadow(0 4px 8px rgba(5, 150, 105, 0.12))',
          }}
          title={elem.label}
        >
          <div className={`${elem.size} hover:scale-125 transition-transform duration-300 cursor-default animate-float-bob`}>
            {elem.emoji}
          </div>
        </div>
      ))}

    </div>
  );
};
