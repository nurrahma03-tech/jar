import React, { useState } from 'react';
import { Question, KopConfig, ExamMetadata } from '../types';
import {
  Server,
  Download,
  FileSpreadsheet,
  Printer,
  QrCode,
  FileCode2,
  CheckCircle2,
  GraduationCap,
  Copy,
  Table,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LMSIntegrationProps {
  questions: Question[];
  kop: KopConfig;
  examInfo: ExamMetadata;
}

export const LMSIntegration: React.FC<LMSIntegrationProps> = ({ questions, kop, examInfo }) => {
  const [activeTab, setActiveTab] = useState<'lms_export' | 'ljk_print' | 'student_cards' | 'kisi_kisi'>('lms_export');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Generate Moodle GIFT Format string
  const generateMoodleGift = () => {
    let output = `// ${examInfo.judulAsesmen} - ${examInfo.mataPelajaran}\n\n`;
    questions.forEach((q, idx) => {
      const num = q.number || idx + 1;
      output += `::Soal ${num}:: ${q.prompt} {\n`;
      if (q.type === 'pg' && q.options) {
        const keyLetter = q.answerKey.trim().charAt(0).toUpperCase();
        q.options.forEach((opt) => {
          const optLetter = opt.trim().charAt(0).toUpperCase();
          const cleanText = opt.substring(2).trim();
          if (optLetter === keyLetter) {
            output += `  =${cleanText}\n`;
          } else {
            output += `  ~${cleanText}\n`;
          }
        });
      } else if (q.type === 'isian') {
        output += `  =${q.answerKey}\n`;
      } else if (q.type === 'uraian') {
        output += `  {}\n`; // Essay in Moodle
      }
      output += `}\n\n`;
    });
    return output;
  };

  // Generate CBT Online JSON (Candy CBT / AiOCBT standard)
  const generateCbtJson = () => {
    const payload = {
      exam_name: examInfo.judulAsesmen,
      subject: examInfo.mataPelajaran,
      grade: examInfo.kelas,
      duration_minutes: examInfo.alokasiMenit || 90,
      school_name: kop.namaSekolah,
      total_questions: questions.length,
      questions: questions.map((q, idx) => ({
        number: q.number || idx + 1,
        type: q.type,
        stimulus: q.stimulus || '',
        question: q.prompt,
        options: q.options || [],
        correct_answer: q.answerKey,
        explanation: q.explanation,
        level: q.cognitiveLevel,
        is_hots: q.isHots,
        score: q.scoreWeight || 2,
      })),
    };
    return JSON.stringify(payload, null, 2);
  };

  // Generate Google Forms CSV
  const generateGoogleFormsCsv = () => {
    let csv = `Nomor,Pertanyaan,Tipe,Opsi A,Opsi B,Opsi C,Opsi D,Opsi E,Kunci,Pembahasan\n`;
    questions.forEach((q, idx) => {
      const num = q.number || idx + 1;
      const opts = q.options || [];
      const row = [
        num,
        `"${q.prompt.replace(/"/g, '""')}"`,
        q.type,
        `"${(opts[0] || '').replace(/"/g, '""')}"`,
        `"${(opts[1] || '').replace(/"/g, '""')}"`,
        `"${(opts[2] || '').replace(/"/g, '""')}"`,
        `"${(opts[3] || '').replace(/"/g, '""')}"`,
        `"${(opts[4] || '').replace(/"/g, '""')}"`,
        `"${q.answerKey}"`,
        `"${(q.explanation || '').replace(/"/g, '""')}"`,
      ].join(',');
      csv += row + '\n';
    });
    return csv;
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Integrasi Sistem Manajemen Sekolah & LMS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor naskah soal ke Moodle, Google Classroom, CBT Online, cetak Lembar Jawaban Komputer (LJK), serta kartu
            peserta ujian dengan kop resmi sekolah Anda.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('lms_export')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'lms_export' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ekspor LMS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ljk_print')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ljk_print' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cetak LJK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('student_cards')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'student_cards'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kartu Peserta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kisi_kisi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'kisi_kisi' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriks Kisi-Kisi
          </button>
        </div>
      </div>

      {/* 1. LMS Export View */}
      {activeTab === 'lms_export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Moodle GIFT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                GIFT
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Moodle Quiz (Format GIFT)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standar bank soal Moodle sekolah. Dapat langsung diimpor ke course LMS tanpa input manual satu per satu.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadFile(generateMoodleGift(), `Soal_Moodle_${Date.now()}.txt`, 'text/plain')}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Unduh .TXT
              </button>
              <button
                type="button"
                onClick={() => handleCopyText(generateMoodleGift(), 'Moodle')}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600"
                title="Salin Teks"
              >
                {copiedFormat === 'Moodle' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CBT JSON Standard */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                JSON
              </div>
              <h3 className="font-bold text-slate-900 text-sm">CBT Online Server Sekolah</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Format standar untuk sistem ujian komputer lokal (Candy CBT, AiOCBT, BeeSMART, Geschool, dll).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadFile(generateCbtJson(), `Paket_CBT_${Date.now()}.json`, 'application/json')
                }
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Unduh JSON
              </button>
              <button
                type="button"
                onClick={() => handleCopyText(generateCbtJson(), 'CBT')}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600"
                title="Salin Teks"
              >
                {copiedFormat === 'CBT' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Google Forms / Classroom CSV */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                CSV
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Google Forms / Classroom CSV</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tabel spreadsheet berisi butir pertanyaan, opsi A-E, kunci, dan pembahasan siap upload ke Google Drive.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadFile(generateGoogleFormsCsv(), `Google_Forms_Soal_${Date.now()}.csv`, 'text/csv')
                }
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Unduh CSV
              </button>
              <button
                type="button"
                onClick={() => handleCopyText(generateGoogleFormsCsv(), 'CSV')}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600"
                title="Salin Teks"
              >
                {copiedFormat === 'CSV' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Lembar Jawaban Komputer (LJK) Cetak */}
      {activeTab === 'ljk_print' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <p className="text-xs text-slate-600">
              Format lembar jawaban pilihan ganda standar sekolah (25/40 soal) lengkap dengan kop dan logo sekolah Anda.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak LJK Ini
            </button>
          </div>

          {/* LJK Sheet Preview */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-300 shadow-md max-w-2xl mx-auto font-serif text-slate-900 print:shadow-none print:border-none print:p-0">
            {/* LJK Header Kop */}
            <div className="border-b-2 border-black pb-2 mb-3 text-center">
              <div className="flex items-center justify-between gap-2">
                {kop.logoLeft && (
                  <img
                    src={kop.logoLeft}
                    alt="Logo"
                    style={{ width: `${Math.min(kop.logoSizePx, 50)}px`, height: `${Math.min(kop.logoSizePx, 50)}px` }}
                    className="object-contain"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold uppercase">{kop.instansiAtas}</h4>
                  <h3 className="text-[13px] font-black uppercase">{kop.namaSekolah}</h3>
                  <h2 className="text-[12px] font-bold underline mt-1">LEMBAR JAWABAN ASESMEN (LJA)</h2>
                </div>
                {kop.logoRight && (
                  <img
                    src={kop.logoRight}
                    alt="Logo"
                    style={{ width: `${Math.min(kop.logoSizePx, 50)}px`, height: `${Math.min(kop.logoSizePx, 50)}px` }}
                    className="object-contain"
                  />
                )}
              </div>
            </div>

            {/* Student Info Box on LJK */}
            <div className="grid grid-cols-2 gap-2 border border-black p-2 text-[10px] mb-3">
              <div className="space-y-1">
                <div>Nama Siswa : ____________________________</div>
                <div>No. Peserta : [ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ]</div>
                <div>Kelas / Ruang : ____________________________</div>
              </div>
              <div className="space-y-1">
                <div>Mata Pelajaran : {examInfo.mataPelajaran}</div>
                <div>Tanggal : {examInfo.tanggal}</div>
                <div>Tanda Tangan : ____________________________</div>
              </div>
            </div>

            <div className="text-[9px] text-center italic text-slate-600 mb-2">
              PETUNJUK: Berilah tanda silang (X) atau hitamkan penuh bulatan huruf jawaban yang Anda anggap paling benar!
            </div>

            {/* Bubble Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-black p-3 text-[10px]">
              {[1, 2, 3, 4].map((col) => {
                const start = (col - 1) * 10 + 1;
                return (
                  <div key={col} className="space-y-1.5">
                    {Array.from({ length: 10 }, (_, i) => start + i).map((num) => (
                      <div key={num} className="flex items-center justify-between pr-1">
                        <span className="w-5 font-bold">{num}.</span>
                        <div className="flex gap-1 font-sans text-[9px] font-bold">
                          {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                            <span
                              key={letter}
                              className="w-4 h-4 rounded-full border border-black flex items-center justify-center"
                            >
                              {letter}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between text-[9px] text-slate-500">
              <span>Kurikulum Merdeka Asesmen Nasional</span>
              <span>Dokumen Resmi {kop.namaSekolah}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Kartu Peserta Ujian */}
      {activeTab === 'student_cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <p className="text-xs text-slate-600">
              Kartu tanda peserta ujian siswa otomatis dengan kop, QR verifikasi, dan data ruang ujian.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Kartu Peserta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-black shadow-xs font-serif text-slate-900">
                {/* Header Kop Mini */}
                <div className="flex items-center justify-between gap-2 border-b border-black pb-1.5 mb-2">
                  {kop.logoLeft && (
                    <img src={kop.logoLeft} alt="Logo" style={{ width: '36px', height: '36px' }} className="object-contain" />
                  )}
                  <div className="text-center flex-1">
                    <h5 className="text-[9px] font-bold uppercase">{kop.instansiAtas}</h5>
                    <h4 className="text-[11px] font-black uppercase">{kop.namaSekolah}</h4>
                    <span className="text-[9.5px] font-bold uppercase underline">KARTU PESERTA ASESMEN</span>
                  </div>
                  {kop.logoRight && (
                    <img src={kop.logoRight} alt="Logo" style={{ width: '36px', height: '36px' }} className="object-contain" />
                  )}
                </div>

                <div className="flex gap-3 text-[10px]">
                  {/* Photo / QR box */}
                  <div className="w-20 h-24 border border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-center p-1 text-slate-400 bg-slate-50">
                    <QrCode className="w-8 h-8 text-slate-600 mb-1" />
                    <span className="text-[8px]">QR Verifikasi</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div>
                      <span className="font-semibold">Nama: </span> Siswa {idx} ({examInfo.kelas})
                    </div>
                    <div>
                      <span className="font-semibold">No. Peserta: </span> 2026-08-{idx.toString().padStart(3, '0')}
                    </div>
                    <div>
                      <span className="font-semibold">NISN: </span> 008123456{idx}
                    </div>
                    <div>
                      <span className="font-semibold">Ruang / Sesi: </span> Ruang 02 / Sesi 1
                    </div>
                    <div>
                      <span className="font-semibold">Jadwal: </span> {examInfo.tanggal}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-1 border-t border-slate-300 flex justify-between items-end text-[8.5px]">
                  <span>Dicetak otomatis via MerdekaGen</span>
                  <div className="text-center">
                    <div>Kepala Sekolah,</div>
                    <div className="h-6"></div>
                    <div className="font-bold underline">Drs. H. Mulyadi, M.Pd.</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Matriks Kisi-Kisi Soal (Blueprint Resmi) */}
      {activeTab === 'kisi_kisi' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-600" />
                Matriks Kisi-Kisi Soal Standar Kurikulum Merdeka
              </h3>
              <p className="text-xs text-slate-500">
                Penyelarasan Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), Indikator Soal, dan Level Kognitif.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Kisi-Kisi
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2">Capaian Pembelajaran (CP)</th>
                  <th className="border border-slate-300 p-2">Materi Pokok</th>
                  <th className="border border-slate-300 p-2">Indikator Butir Soal</th>
                  <th className="border border-slate-300 p-2 text-center w-24">Level</th>
                  <th className="border border-slate-300 p-2 text-center w-24">Bentuk</th>
                  <th className="border border-slate-300 p-2 text-center w-16">Bobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {questions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="border border-slate-300 p-2 text-center font-bold">{q.number || idx + 1}</td>
                    <td className="border border-slate-300 p-2">{examInfo.capaianPembelajaran || 'Sesuai Kurikulum Merdeka'}</td>
                    <td className="border border-slate-300 p-2 font-medium">{q.topic || examInfo.materiPokok}</td>
                    <td className="border border-slate-300 p-2">{q.learningOutcome || q.prompt.substring(0, 80) + '...'}</td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className="font-bold text-indigo-700">{q.cognitiveLevel}</span>{' '}
                      {q.isHots ? <span className="text-[10px] font-bold text-amber-700">(HOTS)</span> : ''}
                    </td>
                    <td className="border border-slate-300 p-2 text-center uppercase font-mono font-medium">
                      {q.type}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">
                      {q.scoreWeight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
