import React, { useState } from 'react';
import { Search, BookOpen, AlertTriangle, ShieldCheck, Pill, ArrowLeft } from 'lucide-react';
import { symptomGroups, herbalDrugs } from '../data/herbalData';
import { sound } from '../utils/sound';

interface CompendiumModalProps {
  onBack: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'drugs'>('groups');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');

  const filteredGroups = symptomGroups.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.primaryHerbs.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase())) ||
      g.clinicalHighlight.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const filteredDrugs = herbalDrugs.filter((d) => {
    const matchGroup = selectedGroupFilter === 'all' || d.groupId === selectedGroupFilter;
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.thaiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.indications.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.botanicalOrComposition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cautions.toLowerCase().includes(searchTerm.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('groups');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'groups'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            10 กลุ่มอาการหลัก
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('drugs');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'drugs'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            บัญชีรายการยาสมุนไพร ({herbalDrugs.length})
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อสมุนไพร, สรรพคุณ, โรค หรือข้อบ่งใช้ (เช่น แก้ปวด, เริม, ท้องอืด)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs sm:text-sm bg-slate-50/50"
          />
        </div>
      </div>

      {/* TAB 1: 10 SYMPTOM GROUPS */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 px-1">
            แสดง {filteredGroups.length} จาก 10 กลุ่มอาการตามมาตรฐานกระทรวงสาธารณสุข
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map((group) => {
              const matchingDrugs = herbalDrugs.filter((d) => d.groupId === group.id);
              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {group.title}
                      </h3>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        กลุ่ม {group.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {group.shortDesc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-emerald-800">ยาสมุนไพรเด่น: </span>
                      <span>{group.primaryHerbs.join(', ')}</span>
                    </div>

                    <div className="bg-emerald-50/70 p-2.5 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="leading-relaxed"><strong>ไฮไลท์คลินิก:</strong> {group.clinicalHighlight}</span>
                    </div>

                    {matchingDrugs.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {matchingDrugs.map((d) => (
                          <span
                            key={d.id}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED DRUG COMPENDIUM */}
      {activeTab === 'drugs' && (
        <div className="space-y-4">
          {/* Subfilter by group */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
                selectedGroupFilter === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ยาทั้งหมด ({herbalDrugs.length})
            </button>
            {symptomGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroupFilter(g.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
                  selectedGroupFilter === g.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                กลุ่มที่ {g.id}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredDrugs.map((drug) => (
              <div
                key={drug.id}
                className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        {drug.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {drug.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {drug.thaiName} · {drug.botanicalOrComposition}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 self-start sm:self-center">
                    {drug.groupName}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        ข้อบ่งใช้และสรรพคุณ:
                      </span>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {drug.indications}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        ขนาดและวิธีใช้:
                      </span>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {drug.dosage}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-rose-800 block mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ข้อห้ามใช้:</span>
                      </span>
                      <p className="text-rose-900 leading-relaxed bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                        {drug.contraindications}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-amber-800 block mb-1">
                        ข้อควรระวังสำคัญ:
                      </span>
                      <p className="text-amber-900 leading-relaxed bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                        {drug.cautions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredDrugs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                ไม่พบรายการสมุนไพรที่ตรงกับคำค้นหา "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
