import React, { useState } from 'react';
import { EducationLevel, KurikulumFase, AssessmentType, Question, QuestionType, QuestionVariantCount } from '../types';
import {
  Sparkles,
  Loader2,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sliders,
  CheckSquare,
  HelpCircle as QuestionIcon,
  Columns,
  ToggleLeft,
  FileEdit,
  PenTool,
} from 'lucide-react';

interface QuestionGeneratorProps {
  onQuestionsGenerated: (newQuestions: Question[]) => void;
  onClose?: () => void;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorProps> = ({
  onQuestionsGenerated,
  onClose,
}) => {
  const [jenjang, setJenjang] = useState<EducationLevel>('SMP');
  const [fase, setFase] = useState<KurikulumFase>('Fase D (Kelas 7-9)');
  const [tingkatKelas, setTingkatKelas] = useState('Kelas 8 SMP');
  const [mataPelajaran, setMataPelajaran] = useState('Ilmu Pengetahuan Alam (IPA)');
  const [tipeAsesmen, setTipeAsesmen] = useState<AssessmentType>('Sumatif');
  const [materiPokok, setMateriPokok] = useState('Sistem Peredaran Darah Manusia & Penyakit Kardiovaskular');
  const [capaianPembelajaran, setCapaianPembelajaran] = useState(
    'Peserta didik mampu menganalisis struktur dan fungsi organ peredaran darah serta keterkaitannya dengan kesehatan tubuh.'
  );

  // Manual Question Count Mode: 'total_langsung' vs 'distribusi_varian'
  const [countMode, setCountMode] = useState<'total_langsung' | 'distribusi_varian'>('distribusi_varian');
  const [jumlahSoalManual, setJumlahSoalManual] = useState<number>(10);

  // Varian Soal Breakdown
  const [variantCounts, setVariantCounts] = useState<QuestionVariantCount>({
    pg: 4,
    pg_kompleks: 2,
    benar_salah: 2,
    menjodohkan: 1,
    isian: 1,
    uraian: 1,
  });

  const [tipeSoalTunggal, setTipeSoalTunggal] = useState<
    'campuran' | 'pg' | 'pg_kompleks' | 'benar_salah' | 'menjodohkan' | 'isian' | 'uraian'
  >('campuran');

  const [tingkatKesulitan, setTingkatKesulitan] = useState('Campuran Berimbang');
  const [profilPelajar, setProfilPelajar] = useState<string[]>(['Bernalar Kritis', 'Kreatif']);
  const [instruksiTambahan, setInstruksiTambahan] = useState(
    'Sertakan stimulus narasi kontekstual atau studi kasus nyata di Indonesia. Lengkapi dengan kunci jawaban dan pembahasan analitis.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Total calculated from variant counts
  const totalFromVariants =
    (variantCounts.pg || 0) +
    (variantCounts.pg_kompleks || 0) +
    (variantCounts.benar_salah || 0) +
    (variantCounts.menjodohkan || 0) +
    (variantCounts.isian || 0) +
    (variantCounts.uraian || 0);

  const effectiveTotal = countMode === 'distribusi_varian' ? totalFromVariants : jumlahSoalManual;

  // Sync Fase when Jenjang changes
  const handleJenjangChange = (newJenjang: EducationLevel) => {
    setJenjang(newJenjang);
    if (newJenjang === 'SD') {
      setFase('Fase C (Kelas 5-6)');
      setTingkatKelas('Kelas 5 SD');
      setMataPelajaran('Ilmu Pengetahuan Alam dan Sosial (IPAS)');
    } else if (newJenjang === 'SMP') {
      setFase('Fase D (Kelas 7-9)');
      setTingkatKelas('Kelas 8 SMP');
      setMataPelajaran('Ilmu Pengetahuan Alam (IPA)');
    } else if (newJenjang === 'SMA' || newJenjang === 'SMK') {
      setFase('Fase E (Kelas 10)');
      setTingkatKelas('Kelas 10 SMA');
      setMataPelajaran('Matematika');
    } else if (newJenjang === 'Olimpiade') {
      setFase('Olimpiade SMP');
      setTingkatKelas('Olimpiade Sains Nasional (OSN)');
      setMataPelajaran('Matematika Olimpiade');
      setTipeAsesmen('Olimpiade / Seleksi Prestasi');
      setTingkatKesulitan('Level Olimpiade (HOTS Maksimal)');
    }
  };

  const updateVariantCount = (key: keyof QuestionVariantCount, val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    setVariantCounts((prev) => ({
      ...prev,
      [key]: safeVal,
    }));
  };

  const toggleProfil = (dimensi: string) => {
    if (profilPelajar.includes(dimensi)) {
      setProfilPelajar(profilPelajar.filter((d) => d !== dimensi));
    } else {
      setProfilPelajar([...profilPelajar, dimensi]);
    }
  };

  const handleGenerate = async () => {
    if (effectiveTotal <= 0) {
      setErrorMsg('Mohon masukkan jumlah butir soal minimal 1 soal.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenjang,
          fase,
          tingkatKelas,
          mataPelajaran,
          tipeAsesmen,
          materiPokok,
          capaianPembelajaran,
          jumlahSoal: effectiveTotal,
          tipeSoal: countMode === 'distribusi_varian' ? 'campuran' : tipeSoalTunggal,
          distribusiTipeSoal: countMode === 'distribusi_varian' ? variantCounts : null,
          tingkatKesulitan,
          profilPelajarPancasila: profilPelajar,
          instruksiTambahan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghasilkan butir soal otomatis');
      }

      if (data.questions && Array.isArray(data.questions)) {
        onQuestionsGenerated(data.questions);
        if (onClose) onClose();
      } else {
        throw new Error('Format data soal tidak sesuai format.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          'Terjadi kendala saat memanggil generator soal otomatis. Pastikan kuota atau koneksi tersedia.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 md:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              Generator Soal Otomatis (Kurikulum Merdeka & OSN)
            </h2>
            <p className="text-xs text-slate-500">
              Input manual jumlah butir soal & tentukan varian (Pilihan Ganda, Kompleks, Menjodohkan, Benar/Salah, Isian, Uraian).
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Perhatian: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Bagian 1: Identitas & Parameter Jenjang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Jenjang */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Jenjang Pendidikan:</label>
          <div className="grid grid-cols-5 gap-1">
            {(['SD', 'SMP', 'SMA', 'SMK', 'Olimpiade'] as EducationLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleJenjangChange(level)}
                className={`py-2 px-1 text-center rounded-lg border font-bold transition-all text-[11px] cursor-pointer ${
                  jenjang === level
                    ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Fase Kurikulum */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Fase Kurikulum Merdeka:</label>
          <select
            value={fase}
            onChange={(e) => setFase(e.target.value as KurikulumFase)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            {jenjang === 'SD' && (
              <>
                <option value="Fase A (Kelas 1-2)">Fase A (Kelas 1-2 SD)</option>
                <option value="Fase B (Kelas 3-4)">Fase B (Kelas 3-4 SD)</option>
                <option value="Fase C (Kelas 5-6)">Fase C (Kelas 5-6 SD)</option>
              </>
            )}
            {jenjang === 'SMP' && <option value="Fase D (Kelas 7-9)">Fase D (Kelas 7, 8, 9 SMP)</option>}
            {(jenjang === 'SMA' || jenjang === 'SMK') && (
              <>
                <option value="Fase E (Kelas 10)">Fase E (Kelas 10 SMA/SMK)</option>
                <option value="Fase F (Kelas 11-12)">Fase F (Kelas 11-12 SMA/SMK)</option>
              </>
            )}
            {jenjang === 'Olimpiade' && (
              <>
                <option value="Olimpiade SD">Olimpiade Sains SD (OSN)</option>
                <option value="Olimpiade SMP">Olimpiade Sains SMP (OSN)</option>
                <option value="Olimpiade SMA">Olimpiade Sains SMA (OSN)</option>
              </>
            )}
          </select>
        </div>

        {/* Tingkat Kelas */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Tingkat Kelas / Bidang:</label>
          <input
            type="text"
            value={tingkatKelas}
            onChange={(e) => setTingkatKelas(e.target.value)}
            placeholder="Contoh: Kelas 8 SMP / OSN IPA"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Mata Pelajaran:</label>
          <input
            type="text"
            value={mataPelajaran}
            onChange={(e) => setMataPelajaran(e.target.value)}
            placeholder="IPA, Matematika, Bahasa Indonesia..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Jenis Asesmen */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Jenis Asesmen:</label>
          <select
            value={tipeAsesmen}
            onChange={(e) => setTipeAsesmen(e.target.value as AssessmentType)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Sumatif">Asesmen Sumatif (SAS/PAS/Ujian Akhir)</option>
            <option value="Formatif">Asesmen Formatif (Penilaian Harian/Kuis)</option>
            <option value="Diagnostik">Asesmen Diagnostik / Awal</option>
            <option value="Olimpiade / Seleksi Prestasi">Olimpiade / Seleksi Prestasi</option>
          </select>
        </div>

        {/* Tingkat Kesulitan */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Tingkat Kesulitan / Kognitif:</label>
          <select
            value={tingkatKesulitan}
            onChange={(e) => setTingkatKesulitan(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Campuran Berimbang">Campuran Berimbang (Mudah, Sedang, HOTS)</option>
            <option value="Sedang">Sedang (Standar Kurikulum Merdeka)</option>
            <option value="Sulit (HOTS)">Dominan HOTS (C4 Analisis, C5 Evaluasi, C6 Kreasi)</option>
            <option value="Level Olimpiade (HOTS Maksimal)">Level Olimpiade Sains / Penalaran Tinggi</option>
            <option value="Mudah">Mudah (Pemahaman Konsep C1-C2)</option>
          </select>
        </div>

        {/* Materi Pokok */}
        <div className="md:col-span-3">
          <label className="font-bold text-slate-700 block mb-1.5">Materi Pokok / Bab Pembelajaran:</label>
          <input
            type="text"
            value={materiPokok}
            onChange={(e) => setMateriPokok(e.target.value)}
            placeholder="Contoh: Sistem Peredaran Darah Manusia & Penyakit Kardiovaskular"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bagian 2: INPUT MANUAL JUMLAH SOAL & PENGATURAN VARIAN SOAL */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Pengaturan Jumlah Butir & Varian Soal
            </h3>
            <p className="text-[11px] text-slate-500">
              Tentukan jumlah butir soal secara manual untuk setiap varian yang Anda butuhkan.
            </p>
          </div>

          {/* Toggle Mode */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCountMode('distribusi_varian')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                countMode === 'distribusi_varian'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rincian Per Varian (Custom)
            </button>
            <button
              type="button"
              onClick={() => setCountMode('total_langsung')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                countMode === 'total_langsung'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satu Tipe Saja
            </button>
          </div>
        </div>

        {/* MODE A: Distribusi Manual Per Varian Soal */}
        {countMode === 'distribusi_varian' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Pilihan Ganda */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <CheckSquare className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Pilihan Ganda</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={variantCounts.pg}
                    onChange={(e) => updateVariantCount('pg', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">soal</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight">1 opsi benar (A-D / A-E)</span>
              </div>

              {/* 2. Pilihan Ganda Kompleks */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <Layers className="w-4 h-4" />
                  <span className="font-bold text-[11px]">PG Kompleks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={variantCounts.pg_kompleks}
                    onChange={(e) => updateVariantCount('pg_kompleks', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">soal</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Multi-jawaban centang</span>
              </div>

              {/* 3. Benar atau Salah */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <ToggleLeft className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Benar / Salah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={variantCounts.benar_salah}
                    onChange={(e) => updateVariantCount('benar_salah', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">soal</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Tabel status B / S</span>
              </div>

              {/* 4. Menjodohkan */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-purple-700">
                  <Columns className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Menjodohkan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={variantCounts.menjodohkan}
                    onChange={(e) => updateVariantCount('menjodohkan', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">soal</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Pasangan Kolom A & B</span>
              </div>

              {/* 5. Isian Singkat */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <FileEdit className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Isian Singkat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={variantCounts.isian}
                    onChange={(e) => updateVariantCount('isian', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">soal</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Kata / istilah / angka</span>
              </div>

              {/* 6. Uraian */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-rose-700">
                  <PenTool className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Uraian / Esai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={variantCounts.uraian}
                    onChange={(e) => updateVariantCount('uraian', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">soal</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Esai + rubrik skor</span>
              </div>
            </div>

            {/* Total Indicator */}
            <div className="flex items-center justify-between bg-blue-50/80 px-4 py-2.5 rounded-xl border border-blue-200 text-xs">
              <span className="font-medium text-blue-900">
                Total naskah soal yang akan disusun:
              </span>
              <span className="font-black text-sm text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
                {totalFromVariants} Butir Soal
              </span>
            </div>
          </div>
        ) : (
          /* MODE B: Input Manual Total Langsung & Pilih 1 Varian */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">
                Jumlah Butir Soal (Input Manual Bebas):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={jumlahSoalManual}
                  onChange={(e) => setJumlahSoalManual(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-black text-base text-slate-900 bg-white"
                />
                <div className="flex items-center gap-1">
                  {[5, 10, 15, 20, 25, 30].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setJumlahSoalManual(preset)}
                      className={`px-2 py-1 rounded border text-xs font-semibold cursor-pointer ${
                        jumlahSoalManual === preset ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">Format Varian Soal:</label>
              <select
                value={tipeSoalTunggal}
                onChange={(e) => setTipeSoalTunggal(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 text-xs"
              >
                <option value="campuran">Campuran Otomatis (Proporsional Kurikulum Merdeka)</option>
                <option value="pg">Pilihan Ganda Saja (PG 1 Opsi Tepat)</option>
                <option value="pg_kompleks">Pilihan Ganda Kompleks Saja (Multi-Pilihan)</option>
                <option value="benar_salah">Benar atau Salah Saja (True/False)</option>
                <option value="menjodohkan">Menjodohkan Saja (Matching Column)</option>
                <option value="isian">Isian Singkat Saja</option>
                <option value="uraian">Uraian / Esai Saja (HOTS)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bagian 3: Capaian Pembelajaran & Dimensi PPP */}
      <div className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Capaian Pembelajaran (CP) / Alur Tujuan Pembelajaran (ATP):
          </label>
          <textarea
            rows={2}
            value={capaianPembelajaran}
            onChange={(e) => setCapaianPembelajaran(e.target.value)}
            placeholder="Tuliskan indikator kompetensi atau tujuan pembelajaran..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Dimensi Profil Pelajar Pancasila:</label>
          <div className="flex flex-wrap gap-2">
            {[
              'Bernalar Kritis',
              'Kreatif',
              'Mandiri',
              'Gotong Royong',
              'Berkebhinekaan Global',
              'Beriman & Berakhlak Mulia',
            ].map((dimensi) => {
              const active = profilPelajar.includes(dimensi);
              return (
                <button
                  key={dimensi}
                  type="button"
                  onClick={() => toggleProfil(dimensi)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-300'}`} />
                  {dimensi}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Instruksi Spesifik Guru (Opsional):</label>
          <input
            type="text"
            value={instruksiTambahan}
            onChange={(e) => setInstruksiTambahan(e.target.value)}
            placeholder="Contoh: Tekankan penalaran grafis, sertakan data tabel, hindari hafalan istilah..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Total akan dibuatkan: <strong className="text-slate-800">{effectiveTotal} butir soal</strong> berstandar Kurikulum Merdeka
          </span>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !materiPokok.trim() || effectiveTotal <= 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm disabled:opacity-50 cursor-pointer transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyusun Naskah Soal ({effectiveTotal} Soal)...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Buat {effectiveTotal} Soal Otomatis
            </>
          )}
        </button>
      </div>
    </div>
  );
};
