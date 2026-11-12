import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Copy, Check, Play, UserPlus, Trophy, Medal, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { Question, PlayerScore, QuizAnswerRecord } from '../types';
import { simulatedOpponents } from '../data/herbalData';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface MultiplayerViewProps {
  questions: Question[];
  playerName: string;
  onFinishMatch: (score: number, correctCount: number, maxCombo: number, answersLog: QuizAnswerRecord[]) => void;
  onExit: () => void;
}

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({
  questions,
  playerName,
  onFinishMatch,
  onExit
}) => {
  // Phase: 'setup' | 'lobby' | 'racing' | 'podium'
  const [phase, setPhase] = useState<'setup' | 'lobby' | 'racing' | 'podium'>('setup');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isHost, setIsHost] = useState(true);
  const [copied, setCopied] = useState(false);

  // Players in room
  const [players, setPlayers] = useState<PlayerScore[]>([]);

  // Racing Game state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [userScore, setUserScore] = useState(0);
  const [userCorrectCount, setUserCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answersLog, setAnswersLog] = useState<QuizAnswerRecord[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentQ = questions[currentQIndex];

  // Helper to init room
  const handleCreateRoom = () => {
    sound.playClick();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setIsHost(true);

    const initialPlayers: PlayerScore[] = [
      { id: 'user', name: playerName || 'คุณหมอสมุนไพร', avatar: '🌿', score: 0, correctCount: 0, isHost: true, isUser: true },
      { id: simulatedOpponents[0].id, name: simulatedOpponents[0].name, avatar: simulatedOpponents[0].avatar, score: 0, correctCount: 0 },
      { id: simulatedOpponents[1].id, name: simulatedOpponents[1].name, avatar: simulatedOpponents[1].avatar, score: 0, correctCount: 0 }
    ];
    setPlayers(initialPlayers);
    setPhase('lobby');
  };

  const handleJoinRoom = () => {
    sound.playClick();
    if (!inputCode.trim() || inputCode.length < 4) {
      alert('กรุณากรอกรหัสห้อง 4 หลัก');
      return;
    }
    setRoomCode(inputCode.trim());
    setIsHost(false);

    const initialPlayers: PlayerScore[] = [
      { id: 'host-player', name: 'หัวหน้าห้อง (Host ภก.ชัยวัฒน์)', avatar: '👨‍⚕️', score: 0, correctCount: 0, isHost: true },
      { id: 'user', name: playerName || 'คุณหมอสมุนไพร', avatar: '🌿', score: 0, correctCount: 0, isHost: false, isUser: true },
      { id: simulatedOpponents[2].id, name: simulatedOpponents[2].name, avatar: simulatedOpponents[2].avatar, score: 0, correctCount: 0 }
    ];
    setPlayers(initialPlayers);
    setPhase('lobby');
  };

  const handleAddBot = () => {
    sound.playClick();
    if (players.length >= 6) return;
    const availableBots = simulatedOpponents.filter((b) => !players.some((p) => p.id === b.id));
    if (availableBots.length > 0) {
      const nextBot = availableBots[0];
      setPlayers((prev) => [
        ...prev,
        { id: nextBot.id, name: nextBot.name, avatar: nextBot.avatar, score: 0, correctCount: 0 }
      ]);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  // Start Racing
  const handleStartGame = () => {
    sound.playClick();
    setUserScore(0);
    setUserCorrectCount(0);
    setCombo(0);
    setMaxCombo(0);
    setAnswersLog([]);
    setCurrentQIndex(0);

    // reset players scores
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, correctCount: 0, status: 'answering' })));
    setPhase('racing');
  };

  // Advance question or finish
  const handleNextQuestion = useCallback(() => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Finished match! Show Podium
      setPhase('podium');
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onFinishMatch(userScore, userCorrectCount, maxCombo, answersLog);
    }
  }, [currentQIndex, questions.length, onFinishMatch, userScore, userCorrectCount, maxCombo, answersLog]);

  // Handle timeout for current question
  const handleRacingTimeOut = useCallback(() => {
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
      timeTakenSec: 15,
      explanation: currentQ.explanation
    };
    setAnswersLog((prev) => [...prev, record]);
  }, [isAnswered, currentQ]);

  // Load question & simulate bot answers
  useEffect(() => {
    if (phase !== 'racing' || !currentQ) return;

    const shuffled = [...currentQ.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(15);

    // Clear old timers
    if (timerRef.current) clearInterval(timerRef.current);
    botTimersRef.current.forEach((t) => clearTimeout(t));
    botTimersRef.current = [];

    // Question countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) sound.playTick();
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleRacingTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate bot answers
    players.forEach((player) => {
      if (player.isUser) return;

      const botConfig = simulatedOpponents.find((b) => b.id === player.id) || { baseAccuracy: 0.8 };
      // delay 3 to 11 seconds
      const delay = Math.floor(3000 + Math.random() * 8000);

      const timeout = setTimeout(() => {
        const isBotCorrect = Math.random() < botConfig.baseAccuracy;
        if (isBotCorrect) {
          const remaining = Math.max(1, 15 - Math.round(delay / 1000));
          const botPts = 100 + remaining * 5;
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === player.id
                ? { ...p, score: p.score + botPts, correctCount: p.correctCount + 1, status: 'ready' }
                : p
            )
          );
        }
      }, delay);

      botTimersRef.current.push(timeout);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      botTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [phase, currentQIndex, currentQ, handleRacingTimeOut]);

  const handleSelectAnswer = (opt: string) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correct;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      sound.playCorrect(nextCombo);

      const pts = 100 + timeLeft * 6 + (nextCombo > 1 ? nextCombo * 25 : 0);
      const newScore = userScore + pts;
      const newCount = userCorrectCount + 1;

      setUserScore(newScore);
      setUserCorrectCount(newCount);

      // update user in players roster
      setPlayers((prev) =>
        prev.map((p) =>
          p.isUser ? { ...p, score: newScore, correctCount: newCount, status: 'ready' } : p
        )
      );
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
      timeTakenSec: 15 - timeLeft,
      explanation: currentQ.explanation
    };
    setAnswersLog((prev) => [...prev, record]);
  };

  // Sorted players for live leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // 1. SETUP PHASE
  if (phase === 'setup') {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            <Users className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">โหมดห้องแข่งขันออนไลน์</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              สร้างห้องแข่งขันใหม่เพื่อประลองความรู้กับเพื่อน หรือใส่รหัส 4 หลักเพื่อเข้าร่วม
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-left space-y-3">
              <span className="text-xs font-bold text-emerald-900 block">สร้างห้องแข่งขันใหม่ (Host)</span>
              <p className="text-xs text-slate-600">
                คุณจะได้รับรหัสห้อง 4 หลัก สามารถเชิญเพื่อนหรือแข่งขันกับแพทย์แผนไทย/เภสัชกรจำลองได้
              </p>
              <button
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>สร้างห้องประลอง</span>
              </button>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs font-semibold text-slate-400">หรือ</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <span className="text-xs font-bold text-slate-800 block">เข้าร่วมห้องเพื่อนด้วยรหัส</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="รหัส 4 หลัก เช่น 7492"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono font-bold tracking-widest text-slate-800 bg-white text-sm"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
                >
                  เข้าร่วม
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onExit}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // 2. LOBBY PHASE
  if (phase === 'lobby') {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-medium text-slate-500">รหัสห้องแข่งขัน</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-800 tracking-wider bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-200">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                title="คัดลอกรหัสห้อง"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <span className="text-xs text-emerald-600 font-medium block">คัดลอกรหัสแล้ว! ส่งให้เพื่อนได้เลย</span>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>ผู้เล่นในห้อง ({players.length}/6 คน)</span>
              {isHost && players.length < 6 && (
                <button
                  onClick={handleAddBot}
                  className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>เพิ่มผู้ท้าชิง AI</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{p.avatar}</span>
                    <span className="font-semibold text-slate-800">
                      {p.name} {p.isUser && '(คุณ)'}
                    </span>
                  </div>
                  <div>
                    {p.isHost ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Host
                      </span>
                    ) : (
                      <span className="text-slate-400">พร้อม</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-3">
            {isHost ? (
              <button
                onClick={handleStartGame}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>เริ่มการแข่งขันพร้อมกัน (Start Match)</span>
              </button>
            ) : (
              <div className="text-center py-2 text-xs text-slate-500 italic flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>กำลังรอให้หัวหน้าห้อง (Host) กดเริ่มเกม...</span>
              </div>
            )}

            <button
              onClick={() => setPhase('setup')}
              className="w-full py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              ออกจากห้อง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. RACING MATCH PHASE
  if (phase === 'racing' && currentQ) {
    return (
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quiz Area (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  ข้อ {currentQIndex + 1} จาก {questions.length}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  ห้อง #{roomCode}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-slate-800 tabular-nums">
                  <span className="text-emerald-700">{userScore}</span>
                  <span className="text-xs font-normal text-slate-500 ml-1">คะแนน</span>
                </div>

                <div className={`px-3 py-1 rounded-lg text-xs font-bold tabular-nums ${
                  timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-2">
                {currentQ.groupName}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {shuffledOptions.map((opt, idx) => {
                let btnClass = 'p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all border flex items-center justify-between gap-2 ';

                if (!isAnswered) {
                  btnClass += 'bg-white hover:bg-emerald-50/70 border-slate-200 text-slate-800 hover:border-emerald-400 active:scale-[0.99]';
                } else {
                  if (opt === currentQ.correct) {
                    btnClass += 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                  } else if (opt === selectedOption) {
                    btnClass += 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    btnClass += 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(opt)}
                    className={btnClass}
                  >
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200/80 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-emerald-900">คำอธิบาย: </span>
                <span>{currentQ.explanation}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={onExit}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ออกจากห้อง</span>
              </button>

              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>{currentQIndex + 1 < questions.length ? 'ข้อต่อไป' : 'ดูผลการแข่งขัน'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Leaderboard Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>คะแนนสดในห้อง</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">เรียลไทม์</span>
            </div>

            <div className="space-y-2">
              {sortedPlayers.map((p, idx) => {
                const isMe = p.isUser;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isMe
                        ? 'bg-emerald-50 border border-emerald-300 font-bold'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                      <span className="text-sm">{p.avatar}</span>
                      <span className="text-xs text-slate-800 truncate max-w-[120px]">
                        {p.name} {isMe && '(คุณ)'}
                      </span>
                    </div>

                    <div className="text-xs font-bold tabular-nums text-emerald-800">
                      {p.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. PODIUM PHASE
  const podiumTop3 = sortedPlayers.slice(0, 3);
  const userRank = sortedPlayers.findIndex((p) => p.isUser) + 1;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {userRank === 1 ? '🎉 ยินดีด้วย! คุณคว้าอันดับ 1' : `จบการแข่งขัน! คุณได้อันดับที่ ${userRank}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            การประลองความรู้ยาสมุนไพรในบัญชียาหลักแห่งชาติเสร็จสิ้นแล้ว
          </p>
        </div>

        {/* Podium visualization */}
        <div className="grid grid-cols-3 gap-3 pt-4 items-end max-w-md mx-auto">
          {/* 2nd place */}
          {podiumTop3[1] && (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{podiumTop3[1].avatar}</span>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[90px]">
                {podiumTop3[1].name}
              </span>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-t-xl pt-4 pb-3 text-center">
                <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                <span className="text-xs font-bold text-slate-700 block mt-1">อันดับ 2</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{podiumTop3[1].score} pts</span>
              </div>
            </div>
          )}

          {/* 1st place */}
          {podiumTop3[0] && (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-3xl animate-bounce">{podiumTop3[0].avatar}</span>
              <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                {podiumTop3[0].name}
              </span>
              <div className="w-full bg-amber-50 border border-amber-300 rounded-t-xl pt-6 pb-4 text-center shadow-sm">
                <Award className="w-6 h-6 text-amber-500 mx-auto" />
                <span className="text-xs font-bold text-amber-800 block mt-1">อันดับ 1</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{podiumTop3[0].score} pts</span>
              </div>
            </div>
          )}

          {/* 3rd place */}
          {podiumTop3[2] && (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{podiumTop3[2].avatar}</span>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[90px]">
                {podiumTop3[2].name}
              </span>
              <div className="w-full bg-orange-50 border border-orange-200 rounded-t-xl pt-3 pb-3 text-center">
                <Medal className="w-5 h-5 text-amber-700 mx-auto" />
                <span className="text-xs font-bold text-amber-900 block mt-1">อันดับ 3</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{podiumTop3[2].score} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Full match scores table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-600 flex justify-between">
            <span>ตารางสรุปคะแนนผู้เล่น</span>
            <span>คะแนนรวม</span>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className={`px-4 py-2.5 flex items-center justify-between ${
                  p.isUser ? 'bg-emerald-50/50 font-semibold' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-4">#{idx + 1}</span>
                  <span>{p.avatar}</span>
                  <span className="text-slate-800">{p.name} {p.isUser && '(คุณ)'}</span>
                </div>
                <div className="font-mono font-bold text-emerald-800 tabular-nums">
                  {p.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => setPhase('lobby')}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
          >
            เล่นอีกรอบในห้องนี้
          </button>
          <button
            onClick={onExit}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};
