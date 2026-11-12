import React, { useState } from 'react';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, BookOpen, Filter } from 'lucide-react';
import { QuizAnswerRecord } from '../types';
import { sound } from '../utils/sound';

interface ResultReviewModalProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxCombo: number;
  answersLog: QuizAnswerRecord[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenStudy: () => void;
}

export const ResultReviewModal: React.FC<ResultReviewModalProps> = ({
  score,
  correctCount,
  totalQuestions,
  maxCombo,
  answersLog,
  onPlayAgain,
  onGoHome,
  onOpenStudy
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  const accuracyPct = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  let title = 'ยอดเยี่ยมระดับผู้เชี่ยวชาญ!';
  let subtitle = 'คุณมีความรู้ความเข้าใจในยาสมุนไพรในบัญชียาหลักแห่งชาติเป็นอย่างดีเยี่ยม';

  if (accuracyPct < 50) {
    title = 'พยายามอีกนิดนะ!';
    subtitle = 'ลองเปิดการ์ดความจำและคู่มือ 10 กลุ่มอาการเพื่อฝึกฝนเพิ่มเติม';
  } else if (accuracyPct < 80) {
    title = 'ทำได้ดีมาก!';
    subtitle = 'คุณมีพื้นฐานความรู้สมุนไพรไทยที่ดีมาก ทบทวนข้อที่ผิดอีกนิดก็สมบูรณ์แบบ';
  }

  const filteredLogs = answersLog.filter((log) => {
    if (filter === 'correct') return log.isCorrect;
    if (filter === 'wrong') return !log.isCorrect;
    return true;
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>

        {/* 3 Metric Boxes */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-2xl">
            <span className="block text-[11px] text-slate-500 font-medium">คะแนนรวม</span>
            <span className="text-lg sm:text-2xl font-bold font-mono text-emerald-700">{score}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-2xl">
            <span className="block text-[11px] text-slate-500 font-medium">ความแม่นยำ</span>
            <span className="text-lg sm:text-2xl font-bold font-mono text-slate-800">
              {correctCount}/{totalQuestions} ({accuracyPct}%)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-2xl">
            <span className="block text-[11px] text-slate-500 font-medium">คอมโบสูงสุด</span>
            <span className="text-lg sm:text-2xl font-bold font-mono text-amber-600">x{maxCombo || 1}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>เริ่มเล่นใหม่อีกครั้ง</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenStudy();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>ทบทวนการ์ดความจำ</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900">
            เฉลยและคำอธิบายยาสมุนไพร ({filteredLogs.length} ข้อ)
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'correct' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ตอบถูก ({correctCount})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'wrong' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ตอบผิด ({totalQuestions - correctCount})
            </button>
          </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-4">
          {filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border space-y-3 ${
                log.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">
                  ข้อที่ {idx + 1} · {log.groupName}
                </span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    log.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {log.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ตอบถูกต้อง (+เวลา {log.timeTakenSec}s)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>ตอบไม่ถูกต้อง</span>
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                {log.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">คำตอบของคุณ:</span>
                  <span className={`font-semibold ${log.isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {log.userAnswer}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">คำตอบที่ถูกต้อง:</span>
                  <span className="font-semibold text-emerald-800">
                    {log.correctAnswer}
                  </span>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-800">คำอธิบายทางเภสัชกรรม: </span>
                <span>{log.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
