"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium">Имя</label>
        <input name="name" type="text" required className="w-full border border-gray-300 p-2 rounded-lg bg-white/50 text-black" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input name="email" type="email" required className="w-full border border-gray-300 p-2 rounded-lg bg-white/50 text-black" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Пароль</label>
        <input name="password" type="password" required className="w-full border border-gray-300 p-2 rounded-lg bg-white/50 text-black" />
      </div>
      {state && state !== "success" && <p className="text-red-500 text-sm">{state}</p>}
      {state === "success" && <p className="text-green-500 text-sm">Регистрация успешна! <Link href="/auth/login" className="underline font-bold">Войти</Link></p>}
      <button disabled={isPending} type="submit" className="w-full bg-[var(--accent)] text-white p-2 rounded-lg hover:opacity-90 transition disabled:opacity-50">
        {isPending ? "Регистрация..." : "Зарегистрироваться"}
      </button>
      <div className="text-center text-sm">
        Уже есть аккаунт? <Link href="/auth/login" className="text-[var(--accent)] underline">Войти</Link>
      </div>
    </form>
  );
}
