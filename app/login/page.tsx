"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  );
  
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Вход в систему</h1>
      
      {registered && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          Регистрация успешна! Теперь вы можете войти.
        </div>
      )}
      
      <form action={dispatch} className="space-y-4">
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
          <Link href="/register" className="text-sm text-[var(--accent)] hover:underline">
            Нет аккаунта? Зарегистрироваться
          </Link>
        </div>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
        <button
          className="w-full bg-[var(--accent)] text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          aria-disabled={isPending}
          type="submit"
        >
          {isPending ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="text-center">Загрузка...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
