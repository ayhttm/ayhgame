import React from 'react';
import { Volume2, VolumeX, BookOpen, Layers, Users, Home, Trophy } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isSoundEnabled,
  onToggleSound,
  onOpenStats
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line, no subtitle chips) */}
        <button
          onClick={() => onNavigate('home')}
          className="text-lg sm:text-xl font-bold tracking-tight text-emerald-900 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
            ยล
          </span>
          <span>สมุนไพรบัญชียาหลัก</span>
        </button>

        {/* Zone 2: 4-5 clean single-line navigation links with hover states */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentView === 'home'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-emerald-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>หน้าหลัก</span>
          </button>

          <button
            onClick={() => onNavigate('multiplayer-lobby')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentView.includes('multiplayer')
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-emerald-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ห้องแข่งขัน</span>
          </button>

          <button
            onClick={() => onNavigate('flashcards')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentView === 'flashcards'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-emerald-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>การ์ดจำสมุนไพร</span>
          </button>

          <button
            onClick={() => onNavigate('compendium')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentView === 'compendium'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-emerald-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คู่มือ 10 กลุ่มอาการ</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action block */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleSound}
            title={isSoundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            aria-label="สลับเสียง"
          >
            {isSoundEnabled ? <Volume2 className="w-5 h-5 text-emerald-700" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          <button
            onClick={onOpenStats}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-emerald-200" />
            <span>สถิติผู้เล่น</span>
          </button>
        </div>
      </div>
    </header>
  );
};
