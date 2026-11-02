import React, { useState, useEffect } from 'react';
import { Question, KopConfig, ExamMetadata, QuizAnswerRecord, QuizResult } from '../types';
import confetti from 'canvas-confetti';
import {
  Timer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  RotateCcw,
  Printer,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface InteractiveQuizProps {
  questions: Question[];
  kop: KopConfig;
  examInfo: ExamMetadata;
  onExitQuiz?: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  kop,
  examInfo,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, QuizAnswerRecord>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((examInfo.alokasiMenit || 60) * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [studentName, setStudentName] = useState('Siswa Teladan');
  const [studentNumber, setStudentNumber] = useState('2026-0801');
  const [isStarted, setIsStarted] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!isStarted || isSubmitted || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isSubmitted, isTimerPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const currentRecord = currentQ ? studentAnswers[currentQ.id] || { questionId: currentQ.id } : null;

  // Answer handlers
  const handleSelectOption = (optPrefix: string) => {
    if (!currentQ || isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        selectedOption: optPrefix,
      },
    }));
  };

  const handleToggleComplex = (statementIdx: number, val: boolean) => {
    if (!currentQ || isSubmitted) return;
    setStudentAnswers((prev) => {
      const existing = prev[currentQ.id] || { questionId: currentQ.id };
      const currentComplex = existing.complexAnswers || {};
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          complexAnswers: {
            ...currentComplex,
            [statementIdx]: val,
          },
        },
      };
    });
  };

  const handleSelectMatching = (leftText: string, rightText: string) => {
    if (!currentQ || isSubmitted) return;
    setStudentAnswers((prev) => {
      const existing = prev[currentQ.id] || { questionId: currentQ.id };
      const currentMatching = existing.matchingAnswers || {};
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          matchingAnswers: {
            ...currentMatching,
            [leftText]: rightText,
          },
        },
      };
    });
  };

  const handleTextAnswer = (text: string) => {
    if (!currentQ || isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        textAnswer: text,
      },
    }));
  };

  const toggleFlag = () => {
    if (!currentQ || isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        isFlagged: !prev[currentQ.id]?.isFlagged,
      },
    }));
  };

  // Grade Quiz
  const handleSubmitQuiz = () => {
    if (isSubmitted) return;

    let correctCount = 0;
    let totalScore = 0;
    let maxScore = 0;

    const details = questions.map((q, idx) => {
      const rec = studentAnswers[q.id];
      const weight = q.scoreWeight || 2;
      maxScore += weight;

      let isCorrect = false;
      let userAnswerStr = '-';

      if (q.type === 'pg') {
        const selected = rec?.selectedOption || '';
        userAnswerStr = selected;
        // Compare with key, e.g. "A" with "A"
        const cleanKey = q.answerKey.trim().toUpperCase().charAt(0);
        const cleanSel = selected.trim().toUpperCase().charAt(0);
        if (cleanKey && cleanSel && cleanKey === cleanSel) {
          isCorrect = true;
        }
      } else if ((q.type === 'pg_kompleks' || q.type === 'benar_salah') && q.complexStatements) {
        const answers = rec?.complexAnswers || {};
        let allStatementsMatch = true;
        q.complexStatements.forEach((st, sIdx) => {
          if (answers[sIdx] !== st.isCorrect) {
            allStatementsMatch = false;
          }
        });
        isCorrect = allStatementsMatch;
        userAnswerStr = Object.entries(answers)
          .map(([idx, val]) => `#${parseInt(idx, 10) + 1}: ${val ? 'Benar' : 'Salah'}`)
          .join(', ');
      } else if (q.type === 'pg_kompleks' && q.options) {
        const selected = rec?.selectedOption || '';
        userAnswerStr = selected;
        isCorrect = selected.trim().toLowerCase() === q.answerKey.trim().toLowerCase();
      } else if (q.type === 'menjodohkan' && q.matchingPairs) {
        const matching = rec?.matchingAnswers || {};
        let matches = true;
        q.matchingPairs.forEach((pair) => {
          if (matching[pair.left] !== pair.right) {
            matches = false;
          }
        });
        isCorrect = matches;
        userAnswerStr = Object.entries(matching)
          .map(([k, v]) => `${k} -> ${v}`)
          .join('; ');
      } else if (q.type === 'isian') {
        const userText = (rec?.textAnswer || '').trim().toLowerCase();
        const keyText = q.answerKey.trim().toLowerCase();
        userAnswerStr = rec?.textAnswer || '-';
        if (userText && (keyText.includes(userText) || userText.includes(keyText))) {
          isCorrect = true;
        }
      } else if (q.type === 'uraian') {
        // For essays, give provisional credit if answered
        userAnswerStr = rec?.textAnswer || '-';
        isCorrect = (rec?.textAnswer || '').trim().length > 15;
      }

      if (isCorrect) {
        correctCount += 1;
        totalScore += weight;
      }

      return {
        questionNumber: q.number || idx + 1,
        questionPrompt: q.prompt,
        type: q.type,
        userAnswer: userAnswerStr,
        correctAnswer: q.answerKey,
        isCorrect,
        explanation: q.explanation,
        cognitiveLevel: q.cognitiveLevel,
        isHots: q.isHots,
      };
    });

    const scorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Kurikulum Merdeka Predicate
    let predicate: QuizResult['predicate'] = 'Perlu Bimbingan';
    if (scorePercentage >= 88) predicate = 'Sangat Baik';
    else if (scorePercentage >= 75) predicate = 'Mahir';
    else if (scorePercentage >= 65) predicate = 'Cakap';
    else if (scorePercentage >= 50) predicate = 'Layak';

    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      totalScore,
      maxScore,
      scorePercentage,
      predicate,
      timeSpentSeconds: (examInfo.alokasiMenit || 60) * 60 - timeLeftSeconds,
      dateCompleted: new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      details,
    };

    setQuizResult(result);
    setIsSubmitted(true);

    if (scorePercentage >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const restartQuiz = () => {
    setStudentAnswers({});
    setTimeLeftSeconds((examInfo.alokasiMenit || 60) * 60);
    setIsSubmitted(false);
    setQuizResult(null);
    setCurrentIndex(0);
    setIsStarted(true);
  };

  // Start Screen
  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6 text-center">
        {/* School Logo */}
        <div className="flex justify-center items-center gap-3">
          {kop.logoLeft && (
            <img
              src={kop.logoLeft}
              alt="Logo Kiri"
              style={{ width: `${kop.logoSizePx || 60}px`, height: `${kop.logoSizePx || 60}px` }}
              className="object-contain"
            />
          )}
          {kop.logoRight && kop.logoPosition !== 'left' && (
            <img
              src={kop.logoRight}
              alt="Logo Sekolah"
              style={{ width: `${kop.logoSizePx || 60}px`, height: `${kop.logoSizePx || 60}px` }}
              className="object-contain"
            />
          )}
        </div>

        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
            Computer Based Test (CBT) Kurikulum Merdeka
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{examInfo.judulAsesmen}</h2>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            {examInfo.mataPelajaran} • {examInfo.kelas}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{kop.namaSekolah}</p>
        </div>

        {/* Student Data Input */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3 max-w-md mx-auto text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nomor Ujian / NISN:</label>
            <input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
            />
          </div>
        </div>

        {/* Summary Rules */}
        <div className="grid grid-cols-3 gap-3 text-center max-w-md mx-auto text-xs">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[10px] text-slate-500 block">Jumlah Soal</span>
            <span className="text-base font-black text-blue-800">{questions.length} Butir</span>
          </div>
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-[10px] text-slate-500 block">Waktu</span>
            <span className="text-base font-black text-indigo-800">{examInfo.alokasiMenit || 60} Menit</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-slate-500 block">Penilaian</span>
            <span className="text-base font-black text-emerald-800">Otomatis CBT</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsStarted(true)}
          disabled={questions.length === 0}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-sm transition-all cursor-pointer"
        >
          Mulai Mengerjakan Ujian Sekarang
        </button>
      </div>
    );
  }

  // Result Screen
  if (isSubmitted && quizResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Card Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Hasil Asesmen Kurikulum Merdeka</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">{studentName}</h2>
            <p className="text-xs text-slate-300">
              NISN: {studentNumber} • {examInfo.mataPelajaran} • {examInfo.kelas}
            </p>
            <p className="text-xs text-slate-400">{kop.namaSekolah}</p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Nilai Akhir</span>
              <span className="text-4xl md:text-5xl font-black text-yellow-300">{quizResult.scorePercentage}</span>
              <span className="text-xs text-slate-300 block">/ 100</span>
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Kategori Capaian:</span>
              <span className="text-sm font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-block mt-1">
                {quizResult.predicate}
              </span>
              <span className="text-[11px] text-slate-300 block mt-1">
                Benar {quizResult.correctAnswers} dari {quizResult.totalQuestions} soal
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restartQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-blue-600" />
              Ulangi Kuis
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Raport Kuis Siswa
            </button>
          </div>

          {onExitQuiz && (
            <button
              type="button"
              onClick={onExitQuiz}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Kembali ke Naskah Soal
            </button>
          )}
        </div>

        {/* Detailed Review */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Pembahasan & Analisis Butir Soal
          </h3>

          <div className="space-y-4">
            {quizResult.details.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  item.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        item.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.questionNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      [{item.type.toUpperCase()} | {item.cognitiveLevel}
                      {item.isHots ? ' HOTS' : ''}]
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.isCorrect ? 'Jawaban Benar' : 'Jawaban Salah'}
                  </span>
                </div>

                <p className="text-xs text-slate-900 font-medium mb-3">{item.questionPrompt}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Jawaban Siswa:</span>
                    <span className="font-bold text-slate-800">{item.userAnswer || '(Tidak dijawab)'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-emerald-600 block font-semibold uppercase">Kunci Benar:</span>
                    <span className="font-bold text-emerald-700">{item.correctAnswer}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block mb-0.5">Pembahasan:</span>
                  <p>{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Bar: Timer, Progress & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl font-mono text-sm font-bold border border-blue-200">
            <Timer className="w-4 h-4 text-blue-600" />
            <span>Sisa Waktu: {formatTime(timeLeftSeconds)}</span>
          </div>

          <div className="text-xs font-semibold text-slate-600 hidden sm:block">
            Soal <span className="font-bold text-blue-700">{currentIndex + 1}</span> dari {questions.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFlag}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentRecord?.isFlagged
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{currentRecord?.isFlagged ? 'Ragu-ragu (Ditandai)' : 'Ragu-ragu'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitQuiz}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
          >
            Selesai Ujian
          </button>
        </div>
      </div>

      {/* Main Question Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Question Content */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Soal Nomor {currentIndex + 1}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Tipe: <span className="font-bold uppercase">{currentQ?.type}</span> • Bobot: {currentQ?.scoreWeight} Poin
            </span>
          </div>

          {/* Stimulus */}
          {currentQ?.stimulus && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed text-justify">
              <span className="font-bold text-slate-600 block mb-1 italic text-[11px]">
                Stimulus Bacaan / Konteks Kasus:
              </span>
              {currentQ.stimulus}
            </div>
          )}

          {/* Prompt */}
          <div className="text-sm font-semibold text-slate-900 leading-relaxed">{currentQ?.prompt}</div>

          {/* Options / Inputs by Type */}
          {currentQ?.type === 'pg' && currentQ.options && (
            <div className="space-y-2 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const optLetter = opt.trim().charAt(0);
                const isSelected = currentRecord?.selectedOption?.startsWith(optLetter);
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(optLetter)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-900 ring-2 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Benar atau Salah & PG Kompleks Berbasis Pernyataan */}
          {(currentQ?.type === 'benar_salah' || currentQ?.type === 'pg_kompleks') && currentQ.complexStatements && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-600 block">
                Pilih status Benar atau Salah untuk setiap pernyataan:
              </span>
              <div className="space-y-2">
                {currentQ.complexStatements.map((st, sIdx) => {
                  const currentVal = currentRecord?.complexAnswers?.[sIdx];
                  return (
                    <div
                      key={sIdx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <span className="flex-1 text-slate-800">{st.text}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleComplex(sIdx, true)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            currentVal === true
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          Benar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleComplex(sIdx, false)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            currentVal === false
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50'
                          }`}
                        >
                          Salah
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PG Kompleks Multi-Opsi (Centang Lebih Dari Satu) */}
          {currentQ?.type === 'pg_kompleks' && currentQ.options && !currentQ.complexStatements && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-600 block">
                Pilihlah satu atau lebih pilihan jawaban yang Anda anggap benar:
              </span>
              <div className="space-y-2">
                {currentQ.options.map((opt, oIdx) => {
                  const letter = opt.trim().charAt(0);
                  const selectedArr = (currentRecord?.selectedOption || '')
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const isChecked = selectedArr.includes(letter);
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        let nextArr: string[];
                        if (isChecked) {
                          nextArr = selectedArr.filter((l) => l !== letter);
                        } else {
                          nextArr = [...selectedArr, letter].sort();
                        }
                        handleSelectOption(nextArr.join(', '));
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-2 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                          isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked ? '✓' : ''}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menjodohkan */}
          {currentQ?.type === 'menjodohkan' && currentQ.matchingPairs && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-600 block">
                Pilih pasangan yang cocok untuk setiap item Kolom A:
              </span>
              <div className="space-y-2.5">
                {currentQ.matchingPairs.map((pair, pIdx) => {
                  const selectedRight = currentRecord?.matchingAnswers?.[pair.left] || '';
                  return (
                    <div
                      key={pIdx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center gap-2 text-xs"
                    >
                      <span className="font-semibold text-slate-800 w-full md:w-1/2">{pair.left}</span>
                      <select
                        value={selectedRight}
                        onChange={(e) => handleSelectMatching(pair.left, e.target.value)}
                        className="w-full md:w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="">-- Pilih Pasangan --</option>
                        {currentQ.matchingPairs?.map((optPair, oIdx) => (
                          <option key={oIdx} value={optPair.right}>
                            {optPair.right}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Isian Singkat */}
          {currentQ?.type === 'isian' && (
            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">Tuliskan jawaban singkat Anda:</label>
              <input
                type="text"
                value={currentRecord?.textAnswer || ''}
                onChange={(e) => handleTextAnswer(e.target.value)}
                placeholder="Ketik jawaban di sini..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Uraian */}
          {currentQ?.type === 'uraian' && (
            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">
                Tuliskan uraian dan penjelasan lengkap Anda:
              </label>
              <textarea
                rows={5}
                value={currentRecord?.textAnswer || ''}
                onChange={(e) => handleTextAnswer(e.target.value)}
                placeholder="Ketik uraian jawaban secara runut..."
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Navigation Prev / Next */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Soal Sebelumnya
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 flex items-center gap-1.5 shadow-2xs"
            >
              Soal Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Question Navigator Grid */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Navigasi Nomor Soal</h4>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const rec = studentAnswers[q.id];
              const isCurrent = idx === currentIndex;
              const hasAnswered =
                rec?.selectedOption ||
                rec?.textAnswer ||
                (rec?.complexAnswers && Object.keys(rec.complexAnswers).length > 0) ||
                (rec?.matchingAnswers && Object.keys(rec.matchingAnswers).length > 0);
              const isFlagged = rec?.isFlagged;

              let btnBg = 'bg-slate-100 text-slate-700 border-slate-200';
              if (isFlagged) {
                btnBg = 'bg-amber-400 text-slate-900 border-amber-500 font-bold';
              } else if (hasAnswered) {
                btnBg = 'bg-blue-600 text-white border-blue-600 font-bold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${btnBg} ${
                    isCurrent ? 'ring-2 ring-offset-2 ring-blue-600 scale-105' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-blue-600"></span>
              <span>Sudah dijawab</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-amber-400"></span>
              <span>Ragu-ragu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300"></span>
              <span>Belum dijawab</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
