import React, { useState, useEffect } from 'react';
import { Play, Users, BookOpen, Layers, Award, Sparkles, ChevronRight, CheckCircle2, HeartPulse, Clock, HelpCircle } from 'lucide-react';
import { ViewState, Question, QuizAnswerRecord } from './types';
import { allQuestions, symptomGroups } from './data/herbalData';
import { Header } from './components/Header';
import { SoloQuiz } from './components/SoloQuiz';
import { MultiplayerView } from './components/MultiplayerView';
import { FlashcardsView } from './components/FlashcardsView';
import { CompendiumModal } from './components/CompendiumModal';
import { ResultReviewModal } from './components/ResultReviewModal';
import { StatsModal, UserStats } from './components/StatsModal';
import { sound } from './utils/sound';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('thai_herbal_nickname') || 'หมอสมุนไพร';
  });

  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(sound.enabled);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Active quiz pool
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);

  // Last finished quiz results
  const [lastResult, setLastResult] = useState<{
    score: number;
    correctCount: number;
    maxCombo: number;
    total: number;
    answersLog: QuizAnswerRecord[];
  } | null>(null);

  // User lifetime stats
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('thai_herbal_quiz_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      gamesPlayed: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      highScore: 0,
      longestCombo: 0
    };
  });

  // Save nickname
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlayerName(val);
    localStorage.setItem('thai_herbal_nickname', val);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const state = sound.toggle();
    setIsSoundEnabled(state);
  };

  // Start Solo Game
  const handleStartSolo = () => {
    sound.playClick();
    // Filter questions
    let pool = [...allQuestions];
    if (selectedGroupFilter !== 'all') {
      pool = pool.filter((q) => q.groupId === selectedGroupFilter);
    }
    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setActiveQuizQuestions(shuffled);
    setCurrentView('solo-quiz');
  };

  // Finish game callback (Solo or Multiplayer)
  const handleFinishQuiz = (
    score: number,
    correctCount: number,
    maxCombo: number,
    answersLog: QuizAnswerRecord[]
  ) => {
    const total = answersLog.length || questionCount;
    setLastResult({
      score,
      correctCount,
      maxCombo,
      total,
      answersLog
    });

    // Update stats
    setStats((prev) => {
      const updated: UserStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        totalCorrect: prev.totalCorrect + correctCount,
        totalQuestions: prev.totalQuestions + total,
        highScore: Math.max(prev.highScore, score),
        longestCombo: Math.max(prev.longestCombo, maxCombo)
      };
      localStorage.setItem('thai_herbal_quiz_stats', JSON.stringify(updated));
      return updated;
    });

    setCurrentView('result');
  };

  // Reset lifetime stats
  const handleResetStats = () => {
    const resetVal: UserStats = {
      gamesPlayed: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      highScore: 0,
      longestCombo: 0
    };
    setStats(resetVal);
    localStorage.setItem('thai_herbal_quiz_stats', JSON.stringify(resetVal));
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Universal Top Bar Contract */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          sound.playClick();
          setCurrentView(view);
        }}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStats={() => {
          sound.playClick();
          setShowStatsModal(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        {/* VIEW 1: HOME DASHBOARD */}
        {currentView === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-sm text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 shadow-inner">
                <span className="text-3xl">🌿</span>
              </div>

              <div className="max-w-2xl mx-auto space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
                  ทดสอบความรู้ยาสมุนไพรในบัญชียาหลักแห่งชาติ
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed text-balance">
                  ทบทวน 10 กลุ่มอาการโรคและยาสมุนไพรไทยมาตรฐานกระทรวงสาธารณสุข
                  พร้อมระบบจับเวลา สตรีคคอมโบ ห้องแข่งขันออนไลน์ และการ์ดช่วยจำ
                </p>
              </div>

              {/* Player Configuration Form */}
              <div className="max-w-md mx-auto space-y-4 pt-2 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ชื่อผู้เล่น / ฉายาของคุณ:
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={handleNameChange}
                    placeholder="ระบุชื่อของคุณ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium text-sm bg-white shadow-sm"
                  />
                </div>

                {/* Quick Quiz Options */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">จำนวนข้อ:</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                      {[5, 10, 15].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setQuestionCount(cnt);
                          }}
                          className={`py-1 rounded font-medium transition-colors ${
                            questionCount === cnt
                              ? 'bg-white text-emerald-800 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {cnt} ข้อ
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">เวลาต่อข้อ:</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                      {[10, 15, 20].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setTimePerQuestion(sec);
                          }}
                          className={`py-1 rounded font-medium transition-colors ${
                            timePerQuestion === sec
                              ? 'bg-white text-emerald-800 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Game Launch Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleStartSolo}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>เล่นเดี่ยว (Time Attack)</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentView('multiplayer-lobby');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Users className="w-4 h-4" />
                    <span>ห้องแข่งขันออนไลน์</span>
                  </button>
                </div>
              </div>

              {/* Study Mode Secondary Shortcuts */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('flashcards');
                  }}
                  className="hover:text-emerald-700 font-medium transition-colors flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>การ์ดช่วยจำสมุนไพร</span>
                </button>

                <span aria-hidden="true" className="text-slate-300">·</span>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('compendium');
                  }}
                  className="hover:text-emerald-700 font-medium transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>คู่มือ 10 กลุ่มอาการ</span>
                </button>
              </div>
            </div>

            {/* 10 Symptom Groups Preview Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span>ครอบคลุม 10 กลุ่มอาการในบัญชียาหลักแห่งชาติ</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('compendium');
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <span>ดูคลังความรู้ทั้งหมด</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {symptomGroups.slice(0, 6).map((group) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedGroupFilter(group.id);
                      handleStartSolo();
                    }}
                    className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        กลุ่มที่ {group.id}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {group.title.replace(/^\d+\.\s*/, '')}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {group.shortDesc}
                    </p>

                    <div className="pt-1 text-[11px] text-emerald-800 font-medium truncate">
                      {group.primaryHerbs.slice(0, 2).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SOLO QUIZ */}
        {currentView === 'solo-quiz' && (
          <SoloQuiz
            questions={activeQuizQuestions.length > 0 ? activeQuizQuestions : allQuestions.slice(0, 10)}
            playerName={playerName}
            timePerQuestion={timePerQuestion}
            onFinish={handleFinishQuiz}
            onExit={() => {
              sound.playClick();
              setCurrentView('home');
            }}
          />
        )}

        {/* VIEW 3: MULTIPLAYER LOBBY & RACING */}
        {(currentView === 'multiplayer-lobby' || currentView === 'multiplayer-quiz') && (
          <MultiplayerView
            questions={allQuestions.slice(0, 10)}
            playerName={playerName}
            onFinishMatch={handleFinishQuiz}
            onExit={() => {
              sound.playClick();
              setCurrentView('home');
            }}
          />
        )}

        {/* VIEW 4: FLASHCARDS STUDY */}
        {currentView === 'flashcards' && (
          <FlashcardsView
            onBack={() => {
              sound.playClick();
              setCurrentView('home');
            }}
          />
        )}

        {/* VIEW 5: COMPENDIUM REFERENCE */}
        {currentView === 'compendium' && (
          <CompendiumModal
            onBack={() => {
              sound.playClick();
              setCurrentView('home');
            }}
          />
        )}

        {/* VIEW 6: POST-QUIZ RESULT & DETAILED REVIEW */}
        {currentView === 'result' && lastResult && (
          <ResultReviewModal
            score={lastResult.score}
            correctCount={lastResult.correctCount}
            totalQuestions={lastResult.total}
            maxCombo={lastResult.maxCombo}
            answersLog={lastResult.answersLog}
            onPlayAgain={() => {
              sound.playClick();
              handleStartSolo();
            }}
            onGoHome={() => {
              sound.playClick();
              setCurrentView('home');
            }}
            onOpenStudy={() => {
              sound.playClick();
              setCurrentView('flashcards');
            }}
          />
        )}
      </main>

      {/* Lifetime Stats Modal */}
      {showStatsModal && (
        <StatsModal
          stats={stats}
          onClose={() => {
            sound.playClick();
            setShowStatsModal(false);
          }}
          onResetStats={handleResetStats}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white py-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ระบบทดสอบความรู้ยาสมุนไพรในบัญชียาหลักแห่งชาติ · กระทรวงสาธารณสุข
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>มาตรฐานบัญชียาหลัก พ.ศ. 2566–ปัจจุบัน</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
