import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация | Allium",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center text-[var(--accent)]">Регистрация</h1>
      <RegisterForm />
    </div>
  );
}
