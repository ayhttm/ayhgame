import React from 'react';
import { Trophy, Award, Zap, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { sound } from '../utils/sound';

export interface UserStats {
  gamesPlayed: number;
  totalCorrect: number;
  totalQuestions: number;
  highScore: number;
  longestCombo: number;
}

interface StatsModalProps {
  stats: UserStats;
  onClose: () => void;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose, onResetStats }) => {
  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;

  const badges = [
    {
      title: 'ก้าวแรกหมอสมุนไพร',
      desc: 'เข้าร่วมทำแบบทดสอบอย่างน้อย 1 ครั้ง',
      unlocked: stats.gamesPlayed >= 1,
      icon: '🌿'
    },
    {
      title: 'ปรมาจารย์ยาหลัก',
      desc: 'ทำคะแนนได้มากกว่า 1,200 คะแนนในการเล่นรอบเดียว',
      unlocked: stats.highScore >= 1200,
      icon: '🏆'
    },
    {
      title: 'จอมคอมโบ 5x',
      desc: 'ตอบถูกต่อเนื่องกันตั้งแต่ 5 ข้อขึ้นไป',
      unlocked: stats.longestCombo >= 5,
      icon: '⚡'
    },
    {
      title: 'ผู้เชี่ยวชาญ 50 ข้อ',
      desc: 'ตอบคำถามสะสมถูกต้องรวม 50 ข้อขึ้นไป',
      unlocked: stats.totalCorrect >= 50,
      icon: '📜'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-xl mb-2">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">สถิติและเหรียญรางวัลของคุณ</h3>
          <p className="text-xs text-slate-500">บันทึกพัฒนาการการเรียนรู้ยาสมุนไพรในบัญชียาหลัก</p>
        </div>

        {/* 4 KPI metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">เล่นทั้งหมด</span>
            <span className="text-xl font-bold font-mono text-slate-800">{stats.gamesPlayed} รอบ</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">คะแนนสูงสุด</span>
            <span className="text-xl font-bold font-mono text-emerald-700">{stats.highScore} คะแนน</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">ความแม่นยำรวม</span>
            <span className="text-xl font-bold font-mono text-slate-800">
              {stats.totalCorrect}/{stats.totalQuestions} ({accuracy}%)
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">คอมโบสูงสุด</span>
            <span className="text-xl font-bold font-mono text-amber-600">x{stats.longestCombo} ข้อ</span>
          </div>
        </div>

        {/* Badges List */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-700 block">เหรียญความสำเร็จ (Badges):</span>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {badges.map((b, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  b.unlocked
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <span className="font-bold text-slate-900 block">{b.title}</span>
                    <span className="text-[11px] text-slate-500">{b.desc}</span>
                  </div>
                </div>
                <div>
                  {b.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ปลดล็อกแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">ยังไม่ปลดล็อก</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => {
              if (confirm('คุณต้องการรีเซ็ตสถิติทั้งหมดหรือไม่?')) {
                onResetStats();
              }
            }}
            className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตสถิติ</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
