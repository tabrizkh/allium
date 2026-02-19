import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход | Allium",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center text-[var(--accent)]">Вход</h1>
      <LoginForm />
    </div>
  );
}
