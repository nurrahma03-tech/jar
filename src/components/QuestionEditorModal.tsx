import React, { useState } from 'react';
import {
  Question,
  QuestionType,
  CognitiveLevel,
  EducationLevel,
  ComplexStatement,
  MatchingPair,
} from '../types';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  CheckSquare,
  ToggleLeft,
  Columns,
  FileEdit,
  PenTool,
  Save,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface QuestionEditorModalProps {
  initialQuestion?: Partial<Question> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: Question) => void;
  defaultJenjang?: EducationLevel;
  defaultMataPelajaran?: string;
  defaultTopic?: string;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  initialQuestion,
  isOpen,
  onClose,
  onSave,
  defaultJenjang = 'SMP',
  defaultMataPelajaran = 'IPA',
  defaultTopic = 'Materi Pembelajaran',
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'pg');
  const [prompt, setPrompt] = useState(initialQuestion?.prompt || '');
  const [stimulus, setStimulus] = useState(initialQuestion?.stimulus || '');
  const [topic, setTopic] = useState(initialQuestion?.topic || defaultTopic);
  const [mataPelajaran, setMataPelajaran] = useState(initialQuestion?.mataPelajaran || defaultMataPelajaran);
  const [jenjang, setJenjang] = useState<EducationLevel>(initialQuestion?.jenjang || defaultJenjang);
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel>(initialQuestion?.cognitiveLevel || 'C3');
  const [isHots, setIsHots] = useState(initialQuestion?.isHots || false);
  const [scoreWeight, setScoreWeight] = useState(initialQuestion?.scoreWeight || (type === 'uraian' ? 5 : 2));
  const [learningOutcome, setLearningOutcome] = useState(initialQuestion?.learningOutcome || '');
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [rubric, setRubric] = useState(initialQuestion?.rubric || '');

  // Variant 1: PG Options (A, B, C, D, E)
  const [pgOptions, setPgOptions] = useState<string[]>(
    initialQuestion?.options && initialQuestion.options.length > 0
      ? initialQuestion.options
      : ['A. Opsi Jawaban A', 'B. Opsi Jawaban B', 'C. Opsi Jawaban C', 'D. Opsi Jawaban D']
  );
  const [pgKey, setPgKey] = useState<string>(
    initialQuestion?.type === 'pg' && initialQuestion.answerKey ? initialQuestion.answerKey.charAt(0) : 'A'
  );

  // Variant 2: PG Kompleks Options with checkboxes
  const [complexOptions, setComplexOptions] = useState<{ text: string; isCorrect: boolean }[]>(() => {
    if (initialQuestion?.type === 'pg_kompleks' && initialQuestion.options) {
      const keys = (initialQuestion.answerKey || '').toUpperCase();
      return initialQuestion.options.map((opt) => {
        const letter = opt.trim().charAt(0);
        return {
          text: opt.substring(2).trim(),
          isCorrect: keys.includes(letter),
        };
      });
    }
    return [
      { text: 'Pernyataan pilihan 1 (Benar)', isCorrect: true },
      { text: 'Pernyataan pilihan 2 (Salah)', isCorrect: false },
      { text: 'Pernyataan pilihan 3 (Benar)', isCorrect: true },
      { text: 'Pernyataan pilihan 4 (Salah)', isCorrect: false },
    ];
  });

  // Variant 3: Benar / Salah Statements
  const [trueFalseStatements, setTrueFalseStatements] = useState<ComplexStatement[]>(() => {
    if (initialQuestion?.complexStatements && initialQuestion.complexStatements.length > 0) {
      return initialQuestion.complexStatements;
    }
    return [
      { text: 'Pernyataan pertama terkait materi pembelajaran', isCorrect: true },
      { text: 'Pernyataan kedua terkait materi pembelajaran', isCorrect: false },
      { text: 'Pernyataan ketiga terkait materi pembelajaran', isCorrect: true },
    ];
  });

  // Variant 4: Menjodohkan Pairs
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(() => {
    if (initialQuestion?.matchingPairs && initialQuestion.matchingPairs.length > 0) {
      return initialQuestion.matchingPairs;
    }
    return [
      { left: 'Konsep A (Kolom Kiri)', right: 'Pasangan / Definisi A (Kolom Kanan)' },
      { left: 'Konsep B (Kolom Kiri)', right: 'Pasangan / Definisi B (Kolom Kanan)' },
      { left: 'Konsep C (Kolom Kiri)', right: 'Pasangan / Definisi C (Kolom Kanan)' },
    ];
  });

  // Variant 5: Isian Singkat
  const [isianKey, setIsanKey] = useState(
    initialQuestion?.type === 'isian' ? initialQuestion.answerKey : ''
  );

  // Variant 6: Uraian Key
  const [uraianKey, setUraianKey] = useState(
    initialQuestion?.type === 'uraian' ? initialQuestion.answerKey : ''
  );

  const handleCognitiveChange = (level: CognitiveLevel) => {
    setCognitiveLevel(level);
    if (['C4', 'C5', 'C6'].includes(level)) {
      setIsHots(true);
    } else {
      setIsHots(false);
    }
  };

  const handleSave = () => {
    if (!prompt.trim()) {
      alert('Pertanyaan inti soal tidak boleh kosong!');
      return;
    }

    let finalAnswerKey = '';
    let finalOptions: string[] | undefined = undefined;
    let finalComplexStatements: ComplexStatement[] | undefined = undefined;
    let finalMatchingPairs: MatchingPair[] | undefined = undefined;

    if (type === 'pg') {
      finalOptions = pgOptions;
      finalAnswerKey = pgKey;
    } else if (type === 'pg_kompleks') {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      finalOptions = complexOptions.map((opt, idx) => `${letters[idx]}. ${opt.text}`);
      const correctLetters = complexOptions
        .map((opt, idx) => (opt.isCorrect ? letters[idx] : null))
        .filter(Boolean);
      finalAnswerKey = correctLetters.join(', ');
    } else if (type === 'benar_salah') {
      finalComplexStatements = trueFalseStatements;
      finalAnswerKey = trueFalseStatements.map((st) => (st.isCorrect ? 'Benar' : 'Salah')).join(', ');
    } else if (type === 'menjodohkan') {
      finalMatchingPairs = matchingPairs;
      finalAnswerKey = matchingPairs.map((p) => `${p.left} -> ${p.right}`).join('; ');
    } else if (type === 'isian') {
      finalAnswerKey = isianKey || '';
    } else if (type === 'uraian') {
      finalAnswerKey = uraianKey || '';
    }

    const compiled: Question = {
      id: initialQuestion?.id || `manual-${Date.now()}`,
      number: initialQuestion?.number || 1,
      type,
      prompt,
      stimulus: stimulus.trim() || undefined,
      options: finalOptions,
      complexStatements: finalComplexStatements,
      matchingPairs: finalMatchingPairs,
      answerKey: finalAnswerKey || 'Sesuai pembahasan',
      explanation: explanation || 'Sesuai capaian pembelajaran dan konsep materi.',
      rubric: rubric || undefined,
      cognitiveLevel,
      isHots,
      scoreWeight: scoreWeight > 0 ? scoreWeight : 2,
      learningOutcome: learningOutcome || undefined,
      topic: topic || 'Materi Pembelajaran',
      jenjang,
      mataPelajaran,
    };

    onSave(compiled);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {initialQuestion?.id ? 'Sunting Butir Soal' : 'Tambah Soal Manual'}
              </h3>
              <p className="text-xs text-slate-500">
                Pilih jenis soal yang ingin dibuat dan tentukan komponen instrumennya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Pemilihan Jenis / Varian Soal */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
            Pilih Jenis / Varian Soal:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* PG */}
            <button
              type="button"
              onClick={() => {
                setType('pg');
                setScoreWeight(2);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                type === 'pg'
                  ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-900 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Pilihan Ganda</span>
                <span className="text-[10px] text-slate-500 font-normal">1 opsi jawaban benar</span>
              </div>
            </button>

            {/* PG Kompleks */}
            <button
              type="button"
              onClick={() => {
                setType('pg_kompleks');
                setScoreWeight(3);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                type === 'pg_kompleks'
                  ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-2 ring-indigo-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">PG Kompleks</span>
                <span className="text-[10px] text-slate-500 font-normal">Multi-centang jawaban</span>
              </div>
            </button>

            {/* Benar atau Salah */}
            <button
              type="button"
              onClick={() => {
                setType('benar_salah');
                setScoreWeight(3);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                type === 'benar_salah'
                  ? 'border-emerald-600 bg-emerald-50/80 font-bold text-emerald-900 ring-2 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <ToggleLeft className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Benar atau Salah</span>
                <span className="text-[10px] text-slate-500 font-normal">Tabel status Benar/Salah</span>
              </div>
            </button>

            {/* Menjodohkan */}
            <button
              type="button"
              onClick={() => {
                setType('menjodohkan');
                setScoreWeight(3);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                type === 'menjodohkan'
                  ? 'border-purple-600 bg-purple-50/80 font-bold text-purple-900 ring-2 ring-purple-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <Columns className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Menjodohkan</span>
                <span className="text-[10px] text-slate-500 font-normal">Mencocokkan pasangan</span>
              </div>
            </button>

            {/* Isian Singkat */}
            <button
              type="button"
              onClick={() => {
                setType('isian');
                setScoreWeight(2);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                type === 'isian'
                  ? 'border-amber-600 bg-amber-50/80 font-bold text-amber-900 ring-2 ring-amber-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <FileEdit className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Isian Singkat</span>
                <span className="text-[10px] text-slate-500 font-normal">Isian kata/angka padat</span>
              </div>
            </button>

            {/* Uraian */}
            <button
              type="button"
              onClick={() => {
                setType('uraian');
                setScoreWeight(5);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                type === 'uraian'
                  ? 'border-rose-600 bg-rose-50/80 font-bold text-rose-900 ring-2 ring-rose-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <PenTool className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Uraian / Esai</span>
                <span className="text-[10px] text-slate-500 font-normal">Analisis HOTS & rubrik</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Informasi Dasar Soal */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
            <input
              type="text"
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Topik / Materi:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Level Kognitif:</label>
            <select
              value={cognitiveLevel}
              onChange={(e) => handleCognitiveChange(e.target.value as CognitiveLevel)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold"
            >
              <option value="C1">C1 - Mengingat</option>
              <option value="C2">C2 - Memahami</option>
              <option value="C3">C3 - Mengaplikasikan</option>
              <option value="C4">C4 - Menganalisis (HOTS)</option>
              <option value="C5">C5 - Mengevaluasi (HOTS)</option>
              <option value="C6">C6 - Mencipta (HOTS)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Bobot Skor Soal:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={scoreWeight}
              onChange={(e) => setScoreWeight(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
          </div>
        </div>

        {/* 3. Teks Stimulus & Pertanyaan Inti */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Teks Stimulus (Studi Kasus / Bacaan / Data Konteks):
            </label>
            <textarea
              rows={2}
              value={stimulus}
              onChange={(e) => setStimulus(e.target.value)}
              placeholder="Tuliskan stimulus bacaan atau skenario kontekstual (opsional, disukai untuk soal HOTS)..."
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pertanyaan Inti (Prompt): *</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tuliskan butir pertanyaan yang diajukan kepada peserta didik..."
              className="w-full p-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 4. FORM SPESIFIK BERDASARKAN VARIAN SOAL */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
          {/* VARIAN 1: Pilihan Ganda (PG) */}
          {type === 'pg' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Opsi Pilihan Ganda & Kunci Jawaban:</span>
                <span className="text-[11px] text-slate-500">Klik huruf di sebelah kiri untuk memilih kunci benar</span>
              </div>
              <div className="space-y-2">
                {pgOptions.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelectedKey = pgKey === letter;
                  const textWithoutPrefix = opt.replace(/^[A-E]\.\s*/, '');
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPgKey(letter)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isSelectedKey
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Jadikan Kunci Jawaban Benar"
                      >
                        {letter}
                      </button>
                      <input
                        type="text"
                        value={textWithoutPrefix}
                        onChange={(e) => {
                          const updated = [...pgOptions];
                          updated[idx] = `${letter}. ${e.target.value}`;
                          setPgOptions(updated);
                        }}
                        placeholder={`Teks pilihan ${letter}...`}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      />
                      {pgOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = pgOptions.filter((_, i) => i !== idx);
                            setPgOptions(
                              updated.map((o, i) => `${String.fromCharCode(65 + i)}. ${o.replace(/^[A-E]\.\s*/, '')}`)
                            );
                            if (pgKey === letter) setPgKey('A');
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {pgOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextLetter = String.fromCharCode(65 + pgOptions.length);
                    setPgOptions([...pgOptions, `${nextLetter}. Opsi ${nextLetter}`]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Opsi {String.fromCharCode(65 + pgOptions.length)}
                </button>
              )}
            </div>
          )}

          {/* VARIAN 2: Pilihan Ganda Kompleks (Multi-Opsi) */}
          {type === 'pg_kompleks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Daftar Pilihan Jawaban (Centang yang Benar):</span>
                <span className="text-[11px] text-slate-500">Bisa lebih dari 1 opsi benar</span>
              </div>
              <div className="space-y-2">
                {complexOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-2 border border-slate-300 rounded-lg shrink-0">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) => {
                          const updated = [...complexOptions];
                          updated[idx] = { ...opt, isCorrect: e.target.checked };
                          setComplexOptions(updated);
                        }}
                        className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-[11px] text-slate-700">
                        {String.fromCharCode(65 + idx)} {opt.isCorrect ? '(Benar)' : ''}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...complexOptions];
                        updated[idx] = { ...opt, text: e.target.value };
                        setComplexOptions(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      placeholder={`Teks pilihan ${String.fromCharCode(65 + idx)}...`}
                    />
                    {complexOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setComplexOptions(complexOptions.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setComplexOptions([
                    ...complexOptions,
                    { text: `Pilihan baru ${complexOptions.length + 1}`, isCorrect: false },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Pilihan Baru
              </button>
            </div>
          )}

          {/* VARIAN 3: Benar atau Salah */}
          {type === 'benar_salah' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Daftar Pernyataan (Tentukan Status Benar / Salah):</span>
                <span className="text-[11px] text-slate-500">Klik tombol Benar / Salah untuk setiap pernyataan</span>
              </div>
              <div className="space-y-2">
                {trueFalseStatements.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-bold text-slate-600 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={st.text}
                      onChange={(e) => {
                        const updated = [...trueFalseStatements];
                        updated[idx] = { ...st, text: e.target.value };
                        setTrueFalseStatements(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      placeholder="Tuliskan pernyataan yang perlu dianalisis..."
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...trueFalseStatements];
                          updated[idx] = { ...st, isCorrect: true };
                          setTrueFalseStatements(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                          st.isCorrect
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        Benar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...trueFalseStatements];
                          updated[idx] = { ...st, isCorrect: false };
                          setTrueFalseStatements(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                          !st.isCorrect
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        Salah
                      </button>
                    </div>
                    {trueFalseStatements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTrueFalseStatements(trueFalseStatements.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setTrueFalseStatements([
                    ...trueFalseStatements,
                    { text: 'Pernyataan baru terkait topik', isCorrect: true },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris Pernyataan
              </button>
            </div>
          )}

          {/* VARIAN 4: Menjodohkan */}
          {type === 'menjodohkan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Pasangan Menjodohkan (Kolom A & Kolom B):</span>
                <span className="text-[11px] text-slate-500">Tentukan pasangan yang tepat</span>
              </div>
              <div className="space-y-2">
                {matchingPairs.map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => {
                        const updated = [...matchingPairs];
                        updated[idx] = { ...pair, left: e.target.value };
                        setMatchingPairs(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      placeholder={`Kolom A #${idx + 1}...`}
                    />
                    <span className="font-bold text-slate-400">↔</span>
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => {
                        const updated = [...matchingPairs];
                        updated[idx] = { ...pair, right: e.target.value };
                        setMatchingPairs(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      placeholder={`Pasangan Kolom B #${idx + 1}...`}
                    />
                    {matchingPairs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setMatchingPairs([
                    ...matchingPairs,
                    { left: `Konsep baru ${matchingPairs.length + 1}`, right: `Pasangan baru ${matchingPairs.length + 1}` },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Pasangan Jodoh
              </button>
            </div>
          )}

          {/* VARIAN 5: Isian Singkat */}
          {type === 'isian' && (
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Kunci Jawaban Isian Singkat:</label>
              <input
                type="text"
                value={isianKey}
                onChange={(e) => setIsanKey(e.target.value)}
                placeholder="Contoh: Fotosintesis / 24 cm / Mitokondria"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
              />
              <span className="text-[10px] text-slate-500">
                Tuliskan kata kunci jawaban yang tepat untuk auto-grading CBT dan kunci naskah.
              </span>
            </div>
          )}

          {/* VARIAN 6: Uraian */}
          {type === 'uraian' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Kunci Jawaban Uraian / Pembahasan Esai:</label>
                <textarea
                  rows={3}
                  value={uraianKey}
                  onChange={(e) => setUraianKey(e.target.value)}
                  placeholder="Uraian langkah pengerjaan atau poin-poin jawaban yang diharapkan..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Rubrik Penskoran Esai (Kriteria Nilai):</label>
                <textarea
                  rows={2}
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  placeholder="Contoh: Skor 5 jika penjelasan lengkap dan ada 3 contoh; Skor 3 jika hanya 1-2 contoh; Skor 1 jika tidak lengkap."
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Pembahasan Tambahan */}
        <div className="text-xs space-y-2">
          <label className="font-bold text-slate-700 block">Pembahasan / Penjelasan Jawaban (Untuk Lampiran):</label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Jelaskan alasan ilmiah, teori, atau konsep di balik jawaban tersebut..."
            className="w-full p-2.5 border border-slate-300 rounded-xl"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Butir Soal
          </button>
        </div>
      </div>
    </div>
  );
};
