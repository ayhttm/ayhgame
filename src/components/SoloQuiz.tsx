import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Question, QuizAnswerRecord } from '../types';
import { sound } from '../utils/sound';

interface SoloQuizProps {
  questions: Question[];
  playerName: string;
  timePerQuestion?: number;
  onFinish: (score: number, correctCount: number, maxCombo: number, answersLog: QuizAnswerRecord[]) => void;
  onExit: () => void;
}

export const SoloQuiz: React.FC<SoloQuizProps> = ({
  questions,
  playerName,
  timePerQuestion = 15,
  onFinish,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answersLog, setAnswersLog] = useState<QuizAnswerRecord[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQ = questions[currentIndex];

  // Shuffle options whenever currentIndex changes
  useEffect(() => {
    if (!currentQ) return;
    const shuffled = [...currentQ.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(timePerQuestion);
    startTimeRef.current = Date.now();

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          sound.playTick();
        }
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentQ, timePerQuestion]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    sound.playIncorrect();
    setCombo(0);

    const record: QuizAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      groupName: currentQ.groupName,
      userAnswer: '(หมดเวลาตอบ)',
      correctAnswer: currentQ.correct,
      isCorrect: false,
      timeTakenSec: timePerQuestion,
      explanation: currentQ.explanation
    };

    setAnswersLog((prev) => [...prev, record]);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correct;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) {
        setMaxCombo(nextCombo);
      }
      sound.playCorrect(nextCombo);

      // Score formula: 100 base + remaining time * 6 + combo bonus
      const pts = 100 + timeLeft * 6 + (nextCombo > 1 ? nextCombo * 25 : 0);
      setScore((prev) => prev + pts);
      setCorrectCount((prev) => prev + 1);
    } else {
      sound.playIncorrect();
      setCombo(0);
    }

    const record: QuizAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      groupName: currentQ.groupName,
      userAnswer: opt,
      correctAnswer: currentQ.correct,
      isCorrect,
      timeTakenSec: timeSpent,
      explanation: currentQ.explanation
    };

    setAnswersLog((prev) => [...prev, record]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed!
      onFinish(score, correctCount, maxCombo, answersLog);
    }
  };

  if (!currentQ) return null;

  const timerPercentage = (timeLeft / timePerQuestion) * 100;
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top HUD */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              ข้อ {currentIndex + 1} จาก {questions.length}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs font-medium text-emerald-800">
              {playerName}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {combo > 1 && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 animate-pulse">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>คอมโบ x{combo}</span>
              </div>
            )}

            <div className="text-sm font-bold text-slate-800 tabular-nums">
              <span className="text-emerald-700">{score}</span>
              <span className="text-xs font-normal text-slate-500 ml-1">คะแนน</span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tabular-nums ${
              isTimeCritical ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{timeLeft} วินาที</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isTimeCritical ? 'bg-rose-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="text-xs font-medium text-emerald-700 mb-2">
            {currentQ.groupName}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
            {currentQ.question}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {shuffledOptions.map((opt, idx) => {
            let btnClass = 'p-4 rounded-xl text-left text-sm font-medium transition-all border flex items-center justify-between gap-3 ';

            if (!isAnswered) {
              btnClass += 'bg-white hover:bg-emerald-50/70 border-slate-200 text-slate-800 hover:border-emerald-400 active:scale-[0.99]';
            } else {
              const isCorrectOpt = opt === currentQ.correct;
              const isSelected = opt === selectedOption;

              if (isCorrectOpt) {
                btnClass += 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
              } else if (isSelected) {
                btnClass += 'bg-rose-50 border-rose-400 text-rose-900';
              } else {
                btnClass += 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={btnClass}
              >
                <span>{opt}</span>
                {isAnswered && opt === currentQ.correct && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && opt === selectedOption && opt !== currentQ.correct && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation & Pharmacological note */}
        {isAnswered && (
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <span>คำอธิบายทางเภสัชกรรม:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {currentQ.explanation}
            </p>
            {currentQ.activeIngredient && (
              <div className="text-xs text-slate-600 pt-1 flex flex-wrap gap-2">
                <span><strong>สารสำคัญ:</strong> {currentQ.activeIngredient}</span>
                {currentQ.contraindications && (
                  <span>· <strong>ข้อห้ามใช้/ข้อควรระวัง:</strong> {currentQ.contraindications}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onExit}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ออกจากการทดสอบ</span>
          </button>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <span>{currentIndex + 1 < questions.length ? 'ข้อถัดไป' : 'ดูสรุปผลคะแนน'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
