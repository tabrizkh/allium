"use client";

import { useEffect, useRef, useState } from "react";
import { X, User as UserIcon } from "lucide-react";
import { useShopStore } from "../store/useShopStore";

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function AuthPanel({ topOffset }: { topOffset: number }) {
  const { authPanelOpen, authPanelTab, setAuthPanelTab, closeAuthPanel, login, register, logout, user } = useShopStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Point | null>(null);
  const dragRef = useRef<
    | {
        pointerId: number;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
      }
    | null
  >(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authPanelOpen) return;
    if (typeof window === "undefined") return;
    setPos((prev) => {
      if (prev) return prev;
      const width = panelRef.current?.offsetWidth ?? 420;
      const x = Math.max(12, window.innerWidth - width - 12);
      const y = Math.max(12, topOffset + 12);
      return { x, y };
    });
  }, [authPanelOpen, topOffset]);

  useEffect(() => {
    if (!authPanelOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      closeAuthPanel();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [authPanelOpen, closeAuthPanel]);

  useEffect(() => {
    if (!authPanelOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthPanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [authPanelOpen, closeAuthPanel]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (e.pointerId !== state.pointerId) return;
      if (typeof window === "undefined") return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      const width = panelRef.current?.offsetWidth ?? 420;
      const height = panelRef.current?.offsetHeight ?? 520;

      const minX = 12;
      const minY = Math.max(12, topOffset + 12);
      const maxX = Math.max(minX, window.innerWidth - width - 12);
      const maxY = Math.max(minY, window.innerHeight - height - 12);

      setPos({
        x: clamp(state.originX + dx, minX, maxX),
        y: clamp(state.originY + dy, minY, maxY),
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (e.pointerId !== state.pointerId) return;
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [topOffset]);

  const startDrag = (e: React.PointerEvent) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 640) return;
    const origin = pos ?? { x: 12, y: Math.max(12, topOffset + 12) };
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: origin.x,
      originY: origin.y,
    };
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    if (authPanelTab === "login") login(cleanEmail);
    else register(name.trim() || "Гость", cleanEmail);
    setPassword("");
    closeAuthPanel();
  };

  const style = {
    left: (pos?.x ?? 12) + "px",
    top: (pos?.y ?? Math.max(12, topOffset + 12)) + "px",
  };

  return (
    <div
      ref={panelRef}
      className={[
        "fixed z-40 w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)]",
        "transition duration-200 ease-out",
        authPanelOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-[110%] pointer-events-none",
      ].join(" ")}
      style={style}
    >
      <div className="rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl overflow-hidden">
        <div
          className="flex items-center justify-between px-3 py-2 border-b border-[var(--accent-strong)]/40 select-none touch-none"
          onPointerDown={startDrag}
          style={{ cursor: "move" }}
        >
          <div className="flex items-center gap-2">
            <UserIcon size={18} />
            <h2 className="text-sm font-semibold">{user ? "Аккаунт" : "Вход / регистрация"}</h2>
          </div>
          <button className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition" onClick={closeAuthPanel} aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>

        {user ? (
          <div className="p-4 space-y-3">
            <div className="rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-[var(--accent)] truncate">{user.email}</div>
            </div>
            <button type="button" onClick={logout} className="w-full rounded-xl border border-[var(--accent-strong)]/60 px-4 py-2 text-sm hover:bg-[var(--accent-strong)]/10 transition">
              Выйти
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 pb-0">
              <div className="rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--badge-bg)]/15 p-3 text-xs leading-relaxed text-[var(--foreground)]">
                <span className="font-semibold text-lg text-[var(--white)]">Зарегистрируйтесь, чтобы не потерять товары в корзине и избранном, быстрее оформлять заказы, получать скидки и спецпредложения!</span>
              </div>
            </div>

            <div className="flex px-2 pt-3">
              <button
                type="button"
                onClick={() => setAuthPanelTab("login")}
                className={`flex-1 px-3 py-2 text-sm rounded-xl ${authPanelTab === "login" ? "bg-[var(--accent-strong)]/15" : "hover:bg-[var(--accent-strong)]/10"} transition`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => setAuthPanelTab("register")}
                className={`flex-1 px-3 py-2 text-sm rounded-xl ${authPanelTab === "register" ? "bg-[var(--accent-strong)]/15" : "hover:bg-[var(--accent-strong)]/10"} transition`}
              >
                Регистрация
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-4 space-y-3">
              {authPanelTab === "register" && (
                <div>
                  <label className="block text-sm mb-1">Имя</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] h-10 px-3 text-sm outline-none"
                    type="text"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] h-10 px-3 text-sm outline-none"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Пароль</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] h-10 px-3 text-sm outline-none"
                  type="password"
                  required
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-4 py-2 text-sm">
                {authPanelTab === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
