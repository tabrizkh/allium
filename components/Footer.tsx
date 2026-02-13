import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--accent-strong)]/60 bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-flex items-center hover:opacity-90 transition">
              <BrandLogo className="h-20 w-28" />
            </Link>
            <p className="text-sm text-[var(--accent)] mt-2">Лаконичные букеты и композиции</p>
            <p className="text-sm text-[var(--accent-strong)] mt-1">Красота без лишнего — доставляем по городу.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Контакты</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--accent)]">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[var(--accent-strong)]" />
                <a href="tel:+994000000000" className="hover:text-[var(--foreground)] transition">+994 000 00 00</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[var(--accent-strong)]" />
                <a href="mailto:hello@allium.az" className="hover:text-[var(--foreground)] transition">hello@allium.az</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[var(--accent-strong)]" />
                <span>Баку, центр города</span>
              </li>
            </ul>
          </div>
          <div className="float-right text-right">
            <h3 className="text-sm font-semibold">Мы на связи</h3>
            <div className="mt-3 flex justify-end gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition"
              >
                <Facebook size={16} />
              </a>
            </div>
            <nav className="mt-4 flex flex-wrap justify-end gap-4 text-sm text-[var(--accent)]">
              <Link href="/" className="hover:text-[var(--foreground)] transition">Главная</Link>
              <Link href="/favorites" className="hover:text-[var(--foreground)] transition">Избранное</Link>
              <Link href="/cart" className="hover:text-[var(--foreground)] transition">Корзина</Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between text-xs text-[var(--accent-strong)]">
          <p>© 2024 allium. Все права защищены.</p>
          <p>Работаем ежедневно: 10:00–20:00</p>
        </div>
      </div>
    </footer>
  );
}
