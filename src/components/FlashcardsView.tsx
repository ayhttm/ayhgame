import React, { useState } from 'react';
import { Layers, RotateCw, CheckCircle2, Bookmark, ArrowLeft, ArrowRight, Filter, Shuffle } from 'lucide-react';
import { herbalDrugs, symptomGroups } from '../data/herbalData';
import { sound } from '../utils/sound';

interface FlashcardsViewProps {
  onBack: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onBack }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const filteredDrugs = selectedGroupId === 'all'
    ? herbalDrugs
    : herbalDrugs.filter((d) => d.groupId === selectedGroupId);

  const currentDrug = filteredDrugs[currentIndex] || filteredDrugs[0];

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    sound.playClick();
    setIsFlipped(false);
    if (currentIndex + 1 < filteredDrugs.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredDrugs.length - 1);
    }
  };

  const handleToggleMastered = () => {
    if (!currentDrug) return;
    sound.playClick();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentDrug.id)) {
        next.delete(currentDrug.id);
      } else {
        next.add(currentDrug.id);
        sound.playCorrect(1);
      }
      return next;
    });
  };

  const handleShuffle = () => {
    sound.playClick();
    setCurrentIndex(Math.floor(Math.random() * filteredDrugs.length));
    setIsFlipped(false);
  };

  const isMastered = currentDrug ? masteredIds.has(currentDrug.id) : false;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="สุ่มการ์ด"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors text-xs flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">สลับสุ่ม</span>
          </button>
        </div>
      </div>

      {/* Group Filter Bar (Segmented control) */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-3 sm:p-4 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>เลือกกลุ่มอาการสมุนไพร:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => {
              setSelectedGroupId('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
              selectedGroupId === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({herbalDrugs.length})
          </button>
          {symptomGroups.map((g) => {
            const count = herbalDrugs.filter((d) => d.groupId === g.id).length;
            if (count === 0) return null;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGroupId(g.id);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
                  selectedGroupId === g.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                กลุ่มที่ {g.id} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          การ์ดที่ {currentIndex + 1} จาก {filteredDrugs.length}
        </span>
        <span className="text-emerald-700 font-semibold">
          จำได้แล้ว {masteredIds.size} / {herbalDrugs.length} ชนิด
        </span>
      </div>

      {/* Flashcard Area */}
      {currentDrug ? (
        <div
          onClick={handleFlip}
          className="cursor-pointer select-none min-h-[360px] bg-white rounded-3xl border border-emerald-100 shadow-md hover:shadow-lg transition-all p-6 sm:p-10 flex flex-col justify-between relative group"
        >
          {/* Card Top Pill & Flip Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-emerald-700">
              {currentDrug.groupName}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-emerald-600 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>แตะเพื่อพลิกการ์ด</span>
            </div>
          </div>

          {/* Card Content: Front vs Back */}
          {!isFlipped ? (
            /* FRONT OF CARD */
            <div className="my-auto py-8 text-center space-y-4">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg">
                {currentDrug.category}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {currentDrug.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-mono italic">
                {currentDrug.botanicalOrComposition}
              </p>
              <p className="text-xs text-slate-400 pt-3">
                สรรพคุณเด่น, ขนาดวิธีใช้, และข้อควรระวังสำคัญคืออะไร?
              </p>
            </div>
          ) : (
            /* BACK OF CARD */
            <div className="my-auto py-4 space-y-4 text-left animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  สรรพคุณ / ข้อบ่งใช้:
                </span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {currentDrug.indications}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  ขนาดและวิธีใช้:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentDrug.dosage}
                </p>
              </div>

              <div className="space-y-1 bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                <span className="text-xs font-bold text-rose-800">
                  ข้อห้ามใช้ & ข้อควรระวัง:
                </span>
                <p className="text-xs text-rose-900 leading-relaxed">
                  <strong>ห้ามใช้:</strong> {currentDrug.contraindications}
                </p>
                <p className="text-xs text-rose-700 leading-relaxed">
                  <strong>ข้อควรระวัง:</strong> {currentDrug.cautions}
                </p>
              </div>
            </div>
          )}

          {/* Card Bottom: Mastered Toggle */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {currentDrug.thaiName}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMastered();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isMastered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMastered ? 'จำได้แล้ว ✓' : 'ทำเครื่องหมายว่าจำได้'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Prev / Next Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>การ์ดก่อนหน้า</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span>การ์ดถัดไป</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
