"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  const [state, dispatch, isPending] = useActionState(register, undefined);

  if (state === "success") {
    redirect("/login?registered=true");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>
        <form action={dispatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input
              className="w-full border rounded-lg p-2"
              id="name"
              type="text"
              name="name"
              placeholder="Иван Иванов"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full border rounded-lg p-2"
              id="email"
              type="email"
              name="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              className="w-full border rounded-lg p-2"
              id="password"
              type="password"
              name="password"
              required
              minLength={6}
            />
          </div>
          <div className="flex items-center justify-between">
            <Link href="/login" className="text-sm text-[var(--accent)] hover:underline">
              Уже есть аккаунт? Войти
            </Link>
          </div>
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {state && state !== "success" && (
              <p className="text-sm text-red-500">{state}</p>
            )}
          </div>
          <button
            className="w-full bg-[var(--accent)] text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            aria-disabled={isPending}
            type="submit"
          >
            {isPending ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
