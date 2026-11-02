import React, { useState } from 'react';
import { Question, EducationLevel, QuestionType, CognitiveLevel } from '../types';
import { QuestionEditorModal } from './QuestionEditorModal';
import {
  Database,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Save,
  X,
} from 'lucide-react';

interface QuestionBankProps {
  bankQuestions: Question[];
  onAddQuestionToBank: (q: Question) => void;
  onUpdateQuestionInBank: (q: Question) => void;
  onDeleteQuestionFromBank: (id: string) => void;
  onImportQuestions: (questions: Question[]) => void;
  onAddToCurrentExam: (selectedQuestions: Question[]) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  bankQuestions,
  onAddQuestionToBank,
  onUpdateQuestionInBank,
  onDeleteQuestionFromBank,
  onImportQuestions,
  onAddToCurrentExam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedHotsOnly, setSelectedHotsOnly] = useState(false);

  // Selected for batch inclusion into current exam
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Manual Add / Edit Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  // Filter questions
  const filtered = bankQuestions.filter((q) => {
    if (selectedJenjang !== 'all' && q.jenjang !== selectedJenjang) return false;
    if (selectedType !== 'all' && q.type !== selectedType) return false;
    if (selectedHotsOnly && !q.isHots) return false;

    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchPrompt = q.prompt.toLowerCase().includes(qLower);
      const matchTopic = q.topic?.toLowerCase().includes(qLower);
      const matchStimulus = q.stimulus?.toLowerCase().includes(qLower);
      const matchMapel = q.mataPelajaran?.toLowerCase().includes(qLower);
      if (!matchPrompt && !matchTopic && !matchStimulus && !matchMapel) return false;
    }

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((q) => q.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = (fullQuestion: Question) => {
    const exists = bankQuestions.some((q) => q.id === fullQuestion.id);
    if (exists) {
      onUpdateQuestionInBank(fullQuestion);
    } else {
      onAddQuestionToBank(fullQuestion);
    }
    setIsEditorOpen(false);
    setEditingQuestion(null);
  };

  const handleExportBankJson = () => {
    const jsonStr = JSON.stringify(bankQuestions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Soal_Kurikulum_Merdeka_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const handleImportBankJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportQuestions(parsed);
          alert(`Berhasil mengimpor ${parsed.length} butir soal ke dalam Bank Soal!`);
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddSelectedToExam = () => {
    const toAdd = bankQuestions.filter((q) => selectedIds.includes(q.id));
    if (toAdd.length === 0) return;
    onAddToCurrentExam(toAdd);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Bank Soal Terkustomisasi (Kurikulum Merdeka & OSN)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola arsip soal per jenjang, topik pembelajaran, dan level kognitif. Anda dapat menambah, mengedit, atau
            memasukkan butir soal ke paket naskah ujian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal Baru
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Impor JSON
            <input type="file" accept=".json" onChange={handleImportBankJson} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleExportBankJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor JSON
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi pokok, kata kunci stimulus, indikator soal, atau mata pelajaran..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Jenjang Filter */}
          <select
            value={selectedJenjang}
            onChange={(e) => setSelectedJenjang(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">Semua Jenjang</option>
            <option value="SD">SD (Fase A, B, C)</option>
            <option value="SMP">SMP (Fase D)</option>
            <option value="SMA">SMA (Fase E, F)</option>
            <option value="Olimpiade">Olimpiade Sains (OSN)</option>
          </select>

          {/* Tipe Soal Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">Semua Tipe Soal</option>
            <option value="pg">Pilihan Ganda (PG)</option>
            <option value="pg_kompleks">PG Kompleks (Benar/Salah)</option>
            <option value="menjodohkan">Menjodohkan</option>
            <option value="isian">Isian Singkat</option>
            <option value="uraian">Uraian / Esai</option>
          </select>

          {/* HOTS toggle */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer px-2">
            <input
              type="checkbox"
              checked={selectedHotsOnly}
              onChange={(e) => setSelectedHotsOnly(e.target.checked)}
              className="rounded text-blue-600"
            />
            Khusus HOTS
          </label>
        </div>

        {/* Batch Selection Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <span className="font-semibold">
              {selectedIds.length} butir soal dipilih dari bank soal.
            </span>
            <button
              type="button"
              onClick={handleAddSelectedToExam}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Masukkan ke Naskah Soal Saat Ini
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <span className="font-bold text-slate-800">{filtered.length}</span> dari{' '}
            {bankQuestions.length} butir soal
          </span>
          <button type="button" onClick={toggleSelectAll} className="text-blue-600 hover:underline font-medium">
            {selectedIds.length === filtered.length && filtered.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada butir soal yang cocok dengan filter atau kata kunci pencarian.
          </div>
        ) : (
          filtered.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <div
                key={q.id}
                className={`bg-white p-4 rounded-xl border transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(q.id)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {q.jenjang || 'SMP'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {q.mataPelajaran || 'IPA'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {q.type.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.isHots ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {q.cognitiveLevel || 'C3'} {q.isHots ? '• HOTS' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                      title="Edit Soal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestionFromBank(q.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                      title="Hapus dari Bank"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stimulus */}
                {q.stimulus && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 leading-relaxed mb-2 italic">
                    <span className="font-semibold text-slate-900 not-italic block mb-0.5">Stimulus:</span>
                    {q.stimulus}
                  </div>
                )}

                {/* Prompt */}
                <p className="text-xs font-semibold text-slate-900 leading-relaxed">{q.prompt}</p>

                {/* Options preview for PG */}
                {q.type === 'pg' && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 my-2 pl-2 text-[11px] text-slate-600">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="leading-snug">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key & Topic */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Kunci: {q.answerKey}
                  </span>
                  <span className="text-slate-400 italic">Materi: {q.topic || 'Umum'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Question Modal */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        initialQuestion={editingQuestion}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />
    </div>
  );
};
