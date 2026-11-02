import React, { useState, useEffect } from 'react';
import {
  KopConfig,
  ExamMetadata,
  Question,
  PaperLayoutSettings,
} from './types';
import {
  DEFAULT_KOP_CONFIG,
  DEFAULT_EXAM_METADATA,
  EXEMPLAR_QUESTIONS,
} from './utils/exemplarQuestions';
import { KopSoalEditor } from './components/KopSoalEditor';
import { PaperPreview } from './components/PaperPreview';
import { QuestionGeneratorModal } from './components/QuestionGeneratorModal';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { QuestionBank } from './components/QuestionBank';
import { LMSIntegration } from './components/LMSIntegration';
import {
  FileText,
  School,
  Printer,
  Sparkles,
  Database,
  Layers,
  Server,
  Play,
  FileDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'generator' | 'kop' | 'preview' | 'quiz' | 'bank' | 'lms'
  >('generator');

  // School Letterhead & Logo State with localStorage persistence
  const [kop, setKop] = useState<KopConfig>(() => {
    try {
      const saved = localStorage.getItem('merdekagen_kop_config');
      return saved ? JSON.parse(saved) : DEFAULT_KOP_CONFIG;
    } catch {
      return DEFAULT_KOP_CONFIG;
    }
  });

  // Exam Metadata State
  const [examInfo, setExamInfo] = useState<ExamMetadata>(() => {
    try {
      const saved = localStorage.getItem('merdekagen_exam_info');
      return saved ? JSON.parse(saved) : DEFAULT_EXAM_METADATA;
    } catch {
      return DEFAULT_EXAM_METADATA;
    }
  });

  // Current Exam Questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('merdekagen_questions');
      return saved ? JSON.parse(saved) : EXEMPLAR_QUESTIONS.slice(0, 5);
    } catch {
      return EXEMPLAR_QUESTIONS.slice(0, 5);
    }
  });

  // Question Bank
  const [bankQuestions, setBankQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('merdekagen_bank_questions');
      return saved ? JSON.parse(saved) : EXEMPLAR_QUESTIONS;
    } catch {
      return EXEMPLAR_QUESTIONS;
    }
  });

  // Paper Layout Settings
  const [paperSettings, setPaperSettings] = useState<PaperLayoutSettings>({
    paperSize: 'F4', // F4/Folio is the standard Indonesian exam paper
    columns: 1,
    margin: 'normal',
    fontFamily: 'serif',
    fontSize: 'base',
    showInlineAnswerKeys: false, // Default naskah siswa (bersih), guru bisa klik 1 tombol untuk tampilkan
    includeAnswerKey: true,
    includeRubric: true,
    includeStimulus: true,
    showLJK: false,
  });

  // Generator & Manual Editor Modals
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleOpenAddManual = () => {
    setEditingQuestion(null);
    setShowEditorModal(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setShowEditorModal(true);
  };

  const handleSaveManualQuestion = (savedQ: Question) => {
    setQuestions((prev) => {
      const exists = prev.some((item) => item.id === savedQ.id);
      if (exists) {
        return prev.map((item) => (item.id === savedQ.id ? savedQ : item));
      }
      return [
        ...prev,
        {
          ...savedQ,
          number: prev.length + 1,
        },
      ];
    });

    // Also update bank
    setBankQuestions((prev) => {
      const exists = prev.some((item) => item.id === savedQ.id);
      if (exists) {
        return prev.map((item) => (item.id === savedQ.id ? savedQ : item));
      }
      return [savedQ, ...prev];
    });
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('merdekagen_kop_config', JSON.stringify(kop));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [kop]);

  useEffect(() => {
    try {
      localStorage.setItem('merdekagen_exam_info', JSON.stringify(examInfo));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [examInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('merdekagen_questions', JSON.stringify(questions));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem('merdekagen_bank_questions', JSON.stringify(bankQuestions));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [bankQuestions]);

  // Handlers for questions
  const handleQuestionsGenerated = (newQs: Question[]) => {
    setQuestions(newQs);
    // Also save to bank
    setBankQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const unique = newQs.filter((q) => !existingIds.has(q.id));
      return [...unique, ...prev];
    });
    setShowGeneratorModal(false);
  };

  const handleAddQuestionToBank = (q: Question) => {
    setBankQuestions((prev) => [q, ...prev]);
  };

  const handleUpdateQuestionInBank = (q: Question) => {
    setBankQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
  };

  const handleDeleteQuestionFromBank = (id: string) => {
    setBankQuestions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImportQuestions = (imported: Question[]) => {
    setBankQuestions((prev) => [...imported, ...prev]);
  };

  const handleAddToCurrentExam = (selected: Question[]) => {
    setQuestions((prev) => {
      const updated = [...prev];
      selected.forEach((sel) => {
        if (!updated.some((item) => item.id === sel.id)) {
          updated.push({
            ...sel,
            number: updated.length + 1,
          });
        }
      });
      return updated;
    });
    setActiveTab('preview');
  };

  const handleRemoveQuestionFromExam = (index: number) => {
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((q, idx) => ({ ...q, number: idx + 1 }));
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col">
      {/* App Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  MerdekaGen <span className="text-blue-600">Soal</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Kurikulum Merdeka & OSN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Pembuat Soal Otomatis SD • SMP • SMA • Olimpiade • Ekspor Word & PDF
              </p>
            </div>
          </div>

          {/* School Badge Status */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            {kop.logoRight || kop.logoLeft ? (
              <img
                src={kop.logoRight || kop.logoLeft}
                alt="Logo Sekolah"
                className="w-5 h-5 object-contain rounded"
              />
            ) : (
              <School className="w-4 h-4 text-slate-400" />
            )}
            <div className="leading-tight">
              <span className="font-bold text-slate-800 text-[11px] block truncate max-w-[200px]">
                {kop.namaSekolah || 'Sekolah Belum Diatur'}
              </span>
              <span className="text-[9.5px] text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Logo & Kop Aktif
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddManual}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Tambah Soal</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGeneratorModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Buat Soal AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-900" />
              <span>Kuis Interaktif</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {[
            { id: 'generator', label: 'Naskah & Butir Soal', icon: FileText },
            { id: 'kop', label: 'Kop & Logo Sekolah', icon: School },
            { id: 'preview', label: 'Ukuran Kertas & Ekspor', icon: Printer },
            { id: 'quiz', label: 'Kuis Interaktif (CBT)', icon: Play },
            { id: 'bank', label: 'Bank Soal', icon: Database },
            { id: 'lms', label: 'Integrasi LMS & Sekolah', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: Naskah Soal & Generator Overview */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Quick Summary Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {examInfo.jenjang} • {examInfo.fase}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-semibold text-slate-700">{examInfo.kelas}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{examInfo.judulAsesmen}</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mata Pelajaran: <span className="font-semibold">{examInfo.mataPelajaran}</span> • Materi:{' '}
                  <span className="font-semibold">{examInfo.materiPokok}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddManual}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  Tambah Soal Manual
                </button>

                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Generate Soal AI
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Pratinjau Kertas & Ekspor
                </button>
              </div>
            </div>

            {/* Exam Information Form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Informasi Naskah Asesmen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Asesmen:</label>
                  <input
                    type="text"
                    value={examInfo.judulAsesmen}
                    onChange={(e) => setExamInfo({ ...examInfo, judulAsesmen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
                  <input
                    type="text"
                    value={examInfo.mataPelajaran}
                    onChange={(e) => setExamInfo({ ...examInfo, mataPelajaran: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas & Fase:</label>
                  <input
                    type="text"
                    value={examInfo.kelas}
                    onChange={(e) => setExamInfo({ ...examInfo, kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester & Tahun Ajaran:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={examInfo.semester}
                      onChange={(e) => setExamInfo({ ...examInfo, semester: e.target.value })}
                      placeholder="Ganjil"
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={examInfo.tahunAjaran}
                      onChange={(e) => setExamInfo({ ...examInfo, tahunAjaran: e.target.value })}
                      placeholder="2026/2027"
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hari / Tanggal Pelaksanaan:</label>
                  <input
                    type="text"
                    value={examInfo.tanggal}
                    onChange={(e) => setExamInfo({ ...examInfo, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alokasi Waktu:</label>
                  <input
                    type="text"
                    value={examInfo.waktu}
                    onChange={(e) => setExamInfo({ ...examInfo, waktu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Materi Pokok / Bahasan:</label>
                  <input
                    type="text"
                    value={examInfo.materiPokok}
                    onChange={(e) => setExamInfo({ ...examInfo, materiPokok: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Petunjuk Umum Ujian:</label>
                  <textarea
                    rows={2}
                    value={examInfo.petunjukUmum}
                    onChange={(e) => setExamInfo({ ...examInfo, petunjukUmum: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* List of Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span>Daftar Butir Soal Saat Ini ({questions.length} Soal)</span>
                <span className="text-slate-400 font-normal">
                  Dapat disunting dan langsung tercetak di Word & PDF
                </span>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">
                        {q.number || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        [{q.type.toUpperCase()}]
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.cognitiveLevel} {q.isHots ? '• HOTS' : ''}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Bobot: {q.scoreWeight} Poin
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Sunting Butir Soal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionFromExam(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Hapus dari Naskah"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {q.stimulus && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 italic">
                      <span className="font-bold text-slate-900 not-italic block mb-0.5">Stimulus:</span>
                      {q.stimulus}
                    </div>
                  )}

                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">{q.prompt}</p>

                  {/* Options for PG */}
                  {q.type === 'pg' && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-2 text-xs text-slate-600">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>{opt}</div>
                      ))}
                    </div>
                  )}

                  {/* Answer Key & Explanation */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Kunci Jawaban: {q.answerKey}
                    </span>
                    <span className="text-slate-500 italic max-w-lg truncate">
                      Pembahasan: {q.explanation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Kop & Logo Sekolah Editor */}
        {activeTab === 'kop' && <KopSoalEditor kop={kop} onChange={setKop} />}

        {/* TAB 3: Ukuran Kertas & Ekspor PDF / Word */}
        {activeTab === 'preview' && (
          <PaperPreview
            questions={questions}
            kop={kop}
            examInfo={examInfo}
            settings={paperSettings}
            onUpdateSettings={setPaperSettings}
            onUpdateExamInfo={setExamInfo}
          />
        )}

        {/* TAB 4: Kuis Interaktif (CBT Mode) */}
        {activeTab === 'quiz' && (
          <InteractiveQuiz
            questions={questions}
            kop={kop}
            examInfo={examInfo}
            onExitQuiz={() => setActiveTab('generator')}
          />
        )}

        {/* TAB 5: Bank Soal Terkustomisasi */}
        {activeTab === 'bank' && (
          <QuestionBank
            bankQuestions={bankQuestions}
            onAddQuestionToBank={handleAddQuestionToBank}
            onUpdateQuestionInBank={handleUpdateQuestionInBank}
            onDeleteQuestionFromBank={handleDeleteQuestionFromBank}
            onImportQuestions={handleImportQuestions}
            onAddToCurrentExam={handleAddToCurrentExam}
          />
        )}

        {/* TAB 6: Integrasi Sistem Manajemen Sekolah & LMS */}
        {activeTab === 'lms' && (
          <LMSIntegration questions={questions} kop={kop} examInfo={examInfo} />
        )}
      </main>

      {/* Floating AI Generator Modal if open */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <QuestionGeneratorModal
              onQuestionsGenerated={handleQuestionsGenerated}
              onClose={() => setShowGeneratorModal(false)}
            />
          </div>
        </div>
      )}

      {/* Manual Question Add/Edit Modal */}
      <QuestionEditorModal
        isOpen={showEditorModal}
        initialQuestion={editingQuestion}
        onClose={() => {
          setShowEditorModal(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveManualQuestion}
        defaultJenjang={examInfo.jenjang}
        defaultMataPelajaran={examInfo.mataPelajaran}
        defaultTopic={examInfo.materiPokok}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <p>
          MerdekaGen Soal • Generator Soal Kurikulum Merdeka & OSN • Terintegrasi Kustomisasi Kop Sekolah & Logo • Ekspor
          A4 / F4 / DOCX / PDF
        </p>
      </footer>
    </div>
  );
}
