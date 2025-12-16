import Link from "next/link";
import { BarChart3, TrendingUp, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Disbalanced</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Регистрация</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Анализ глубины рынка криптовалют
        </h1>
        <div className="flex items-center justify-center gap-4">
          <Button size="xl" asChild>
            <Link href="/register">Зарегистрироваться</Link>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <Link href="/charts">Демо графики</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
