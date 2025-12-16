"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BarChart3, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

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
          {session && (
            <>
              <Link
                href="/charts"
                className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Графики
              </Link>
              <Link
                href="/profile"
                className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Профиль
              </Link>
            </>
          )}
        </nav>

        {/* User Menu / Auth */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-background-tertiary" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-blue text-xs font-medium text-white">
                    {session.user?.email?.[0].toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline text-sm">
                    {session.user?.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-foreground-muted" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/charts" className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Графики
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-accent-red focus:text-accent-red"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
