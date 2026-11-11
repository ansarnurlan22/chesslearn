import { TrainerNav } from '@/components/trainer-nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Панель тренера — ChessCheese',
  description: 'Управление группами учеников и отслеживание шахматного прогресса.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#161512] text-white flex flex-col font-sans antialiased">
      <TrainerNav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {children}
      </main>
    </div>
  );
}
