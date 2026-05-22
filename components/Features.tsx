"use client";
import { BadgeCheck, Leaf, Palette, Smile, Clock, Gift, Sparkles, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const featureSets = [
    [
      { icon: <BadgeCheck size={18} />, titleKey: "features.quality.title", descKey: "features.quality.desc", defTitle: "Качество и сервис", defDesc: "Флористы собирают вручную и с любовью." },
      { icon: <Leaf size={18} />, titleKey: "features.eco.title", descKey: "features.eco.desc", defTitle: "Осознанный подход", defDesc: "Экологичная упаковка и устойчивые практики." },
      { icon: <Palette size={18} />, titleKey: "features.style.title", descKey: "features.style.desc", defTitle: "Стиль и индивидуальность", defDesc: "Создаём букеты, отражающие ваш вкус." },
      { icon: <Smile size={18} />, titleKey: "features.convenience.title", descKey: "features.convenience.desc", defTitle: "Удобная покупка", defDesc: "Быстрый и приятный процесс." },
    ],
    [
      { icon: <Clock size={18} />, titleKey: "features.delivery.title", descKey: "features.delivery.desc", defTitle: "Доставка в день заказа", defDesc: "Радость не ждёт." },
      { icon: <Gift size={18} />, titleKey: "features.cards.title", descKey: "features.cards.desc", defTitle: "Персональные открытки", defDesc: "Добавим тёплое послание." },
      { icon: <Sparkles size={18} />, titleKey: "features.packaging.title", descKey: "features.packaging.desc", defTitle: "Премиальная упаковка", defDesc: "Эстетика и аккуратная подача." },
      { icon: <ShieldCheck size={18} />, titleKey: "features.guarantee.title", descKey: "features.guarantee.desc", defTitle: "Гарантия качества", defDesc: "Решаем вопросы быстро и заботливо." },
    ],
  ];

  const [setIndex, setSetIndex] = useState(0);
  const visible = featureSets[setIndex];
  return (
    <section className="mx-auto max-w-6xl px-4 mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{mounted ? t('features.title') : "Почему allium"}</h2>
        <div className="inline-flex gap-2">
          <button onClick={() => setSetIndex(0)} className={`rounded-full px-3 py-1 text-xs border ${setIndex===0?"bg-[var(--accent-strong)]/20":""}`}>1</button>
          <button onClick={() => setSetIndex(1)} className={`rounded-full px-3 py-1 text-xs border ${setIndex===1?"bg-[var(--accent-strong)]/20":""}`}>2</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map((f, i) => (
          <div key={i} className="group rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-4 shadow-sm transition hover:bg-[var(--accent-strong)]/15">
            <div className="inline-flex items-center gap-2 text-[var(--accent-strong)]">
              {f.icon}
              <span className="text-sm font-semibold">{mounted ? t(f.titleKey) : f.defTitle}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--accent)]">{mounted ? t(f.descKey) : f.defDesc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}