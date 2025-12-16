import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-secondary py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">Disbalanced</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-foreground-secondary">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Условия использования
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Контакты
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-foreground-muted">
            © {currentYear} Disbalanced. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
