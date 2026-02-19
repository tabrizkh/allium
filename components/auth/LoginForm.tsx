"use client";

import { useActionState } from "react";
import { authenticate as login } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input name="email" type="email" required className="w-full border border-gray-300 p-2 rounded-lg bg-white/50 text-black" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Пароль</label>
        <input name="password" type="password" required className="w-full border border-gray-300 p-2 rounded-lg bg-white/50 text-black" />
      </div>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <button disabled={isPending} type="submit" className="w-full bg-[var(--accent)] text-white p-2 rounded-lg hover:opacity-90 transition disabled:opacity-50">
        {isPending ? "Вход..." : "Войти"}
      </button>
      <div className="text-center text-sm">
        Нет аккаунта? <Link href="/auth/register" className="text-[var(--accent)] underline">Зарегистрироваться</Link>
      </div>
    </form>
  );
}
