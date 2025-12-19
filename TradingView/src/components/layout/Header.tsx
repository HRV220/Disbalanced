"use client";

import Link from "next/link";
// import { useSession, signOut } from "next-auth/react"; // TODO: настроить next-auth
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  // TODO: вернуть авторизацию после настройки next-auth
  // const { data: session, status } = useSession();
  // const isLoading = status === "loading";

  return (
    <header className="h-14 border-b border-border bg-background-secondary">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">Disbalanced</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/charts"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Графики
          </Link>
        </nav>

        {/* Auth buttons - TODO: вернуть после настройки next-auth */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Войти</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Регистрация</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
