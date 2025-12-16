// src/app/(dashboard)/layout.tsx
import { Header } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-screen w-screen = занимаем ровно 100% экрана
    // overflow-hidden = запрещаем скролл всей страницы
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background-primary">
      {/* Хедер всегда сверху */}
      <Header />

      {/* main занимает все оставшееся место (flex-1) */}
      {/* relative нужен для позиционирования внутренних элементов */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
