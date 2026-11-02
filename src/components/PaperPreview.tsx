import React, { useRef, useState } from 'react';
import { Question, KopConfig, ExamMetadata, PaperLayoutSettings, PaperSize } from '../types';
import {
  Printer,
  FileDown,
  Columns2,
  AlignJustify,
  Maximize2,
  Eye,
  EyeOff,
  Key,
  CheckCircle2,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface PaperPreviewProps {
  questions: Question[];
  kop: KopConfig;
  examInfo: ExamMetadata;
  settings: PaperLayoutSettings;
  onUpdateSettings: (settings: PaperLayoutSettings) => void;
  onUpdateExamInfo: (info: ExamMetadata) => void;
}

export const PaperPreview: React.FC<PaperPreviewProps> = ({
  questions,
  kop,
  examInfo,
  settings,
  onUpdateSettings,
  onUpdateExamInfo,
}) => {
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);

  // Paper dimensions in mm for visual container
  const paperDimensions: Record<PaperSize, { widthMm: number; heightMm: number; label: string }> = {
    A4: { widthMm: 210, heightMm: 297, label: 'A4 (210 × 297 mm)' },
    F4: { widthMm: 215, heightMm: 330, label: 'F4 / Folio (215 × 330 mm) - Standar Sekolah' },
    Legal: { widthMm: 215.9, heightMm: 355.6, label: 'Legal (215.9 × 355.6 mm)' },
    Letter: { widthMm: 215.9, heightMm: 279.4, label: 'Letter (215.9 × 279.4 mm)' },
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    setDocxError(null);
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kop,
          examInfo,
          questions,
          options: {
            paperSize: settings.paperSize,
            includeAnswerKey: settings.includeAnswerKey,
            includeRubric: settings.includeRubric,
            includeStimulus: settings.includeStimulus,
            showInlineAnswerKeys: settings.showInlineAnswerKeys,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor file Word DOCX');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (examInfo.mataPelajaran || 'Naskah_Soal').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Naskah_Soal_${cleanTitle}_${settings.paperSize}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      console.error(err);
      setDocxError(err.message || 'Terjadi kesalahan saat mengekspor ke DOCX.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Font size classes
  const fontSizeClass =
    settings.fontSize === 'sm'
      ? 'text-[11px] leading-relaxed'
      : settings.fontSize === 'lg'
      ? 'text-[13px] leading-relaxed'
      : 'text-[12px] leading-relaxed';

  // Margin padding
  const marginPadding =
    settings.margin === 'compact' ? 'p-6 md:p-8' : settings.margin === 'wide' ? 'p-10 md:p-14' : 'p-8 md:p-10';

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        {/* Paper Size & Layout */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Ukuran Kertas:</span>
            <select
              value={settings.paperSize}
              onChange={(e) => onUpdateSettings({ ...settings, paperSize: e.target.value as PaperSize })}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="F4">F4 / Folio (Standar Ujian Sekolah)</option>
              <option value="A4">A4 (Standar Internasional)</option>
              <option value="Legal">Legal</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* Columns */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, columns: 1 })}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                settings.columns === 1
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="1 Kolom (Standar)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>1 Kolom</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, columns: 2 })}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                settings.columns === 2
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="2 Kolom (Hemat Kertas Ujian)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>2 Kolom (Hemat Kertas)</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* Margin & Font */}
          <div className="flex items-center gap-2">
            <select
              value={settings.margin}
              onChange={(e) => onUpdateSettings({ ...settings, margin: e.target.value as any })}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700"
            >
              <option value="compact">Margin Sempit (Hemat)</option>
              <option value="normal">Margin Standar</option>
              <option value="wide">Margin Lebar</option>
            </select>

            <select
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ ...settings, fontSize: e.target.value as any })}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700"
            >
              <option value="sm">Huruf Kecil (10-11pt)</option>
              <option value="base">Huruf Standar (11-12pt)</option>
              <option value="lg">Huruf Besar (13pt)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Print PDF & Export Word */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExportingDocx || questions.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            {isExportingDocx ? 'Memproses Word...' : 'Ekspor ke DOCX (Word)'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={questions.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {docxError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200 print:hidden">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{docxError}</span>
        </div>
      )}

      {/* Quick Teacher Access Bar for Answer Keys */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              settings.showInlineAnswerKeys ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {settings.showInlineAnswerKeys ? <Key className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Akses Kunci Jawaban Guru:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.showInlineAnswerKeys
                    ? 'bg-emerald-400 text-emerald-950 font-black'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.showInlineAnswerKeys ? 'KUNCI AKTIF (MODE GURU)' : 'KUNCI TERSEMBUNYI (MODE SISWA)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {settings.showInlineAnswerKeys
                ? 'Semua varian soal (PG, Kompleks, Benar/Salah, Menjodohkan, Isian & Uraian) menampilkan tanda kunci jawaban.'
                : 'Naskah bersih tanpa kunci jawaban, siap dicetak atau diekspor untuk pengerjaan ujian peserta didik.'}
            </p>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Presets */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                showInlineAnswerKeys: false,
                includeAnswerKey: false,
                includeRubric: false,
              })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !settings.showInlineAnswerKeys && !settings.includeAnswerKey
                ? 'bg-blue-600 text-white font-bold shadow-xs ring-1 ring-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20'
            }`}
          >
            Versi Ujian Siswa (Bersih)
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                showInlineAnswerKeys: true,
                includeAnswerKey: true,
                includeRubric: true,
              })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              settings.showInlineAnswerKeys && settings.includeAnswerKey
                ? 'bg-emerald-500 text-slate-950 font-black shadow-xs ring-2 ring-emerald-300'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20'
            }`}
          >
            Versi Master Guru (Lengkap)
          </button>

          {/* Master 1-Click Toggle */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                showInlineAnswerKeys: !settings.showInlineAnswerKeys,
              })
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              settings.showInlineAnswerKeys
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-900 shadow-sm'
            }`}
          >
            {settings.showInlineAnswerKeys ? (
              <>
                <EyeOff className="w-4 h-4 text-slate-900" />
                <span>Sembunyikan Kunci</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-blue-700" />
                <span>Tampilkan Kunci Guru</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Options Bar: Answer Key & Rubrics checkboxes */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
            <input
              type="checkbox"
              checked={settings.showInlineAnswerKeys}
              onChange={(e) => onUpdateSettings({ ...settings, showInlineAnswerKeys: e.target.checked })}
              className="rounded text-emerald-600"
            />
            Tandai Kunci Jawaban pada Butir Soal
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.includeStimulus}
              onChange={(e) => onUpdateSettings({ ...settings, includeStimulus: e.target.checked })}
              className="rounded text-blue-600"
            />
            Sertakan Teks Stimulus
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.includeAnswerKey}
              onChange={(e) => onUpdateSettings({ ...settings, includeAnswerKey: e.target.checked })}
              className="rounded text-blue-600"
            />
            Sertakan Lampiran Kunci & Pembahasan di Akhir
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.includeRubric}
              onChange={(e) => onUpdateSettings({ ...settings, includeRubric: e.target.checked })}
              className="rounded text-blue-600"
            />
            Sertakan Rubrik Penilaian HOTS
          </label>
        </div>
        <div className="text-[11px] text-slate-500">
          Total: <span className="font-bold text-slate-900">{questions.length} Butir Soal</span>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div className="overflow-x-auto flex justify-center py-4 bg-slate-200/70 p-2 sm:p-6 rounded-2xl">
        <div
          id="printable-paper"
          className={`bg-white shadow-xl transition-all ${marginPadding} font-serif text-slate-900 mx-auto print:shadow-none print:m-0 print:p-0`}
          style={{
            width: '100%',
            maxWidth: settings.paperSize === 'F4' ? '215mm' : settings.paperSize === 'Legal' ? '216mm' : '210mm',
            minHeight: settings.paperSize === 'F4' ? '330mm' : '297mm',
            backgroundColor: '#ffffff',
          }}
        >
          {/* 1. KOP SURAT (Letterhead with Uploaded Logo) */}
          {kop.showKop && (
            <div className="mb-4 pb-1">
              <div
                className={`flex items-center justify-between gap-4 ${
                  kop.logoPosition === 'center' ? 'flex-col text-center' : ''
                }`}
              >
                {/* Left Logo */}
                {(kop.logoPosition === 'left' || kop.logoPosition === 'both') && (
                  <div className="shrink-0 flex items-center justify-center">
                    {(kop.logoPosition === 'left' ? kop.logoRight || kop.logoLeft : kop.logoLeft) && (
                      <img
                        src={kop.logoPosition === 'left' ? kop.logoRight || kop.logoLeft : kop.logoLeft}
                        alt="Logo Kiri"
                        style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                        className={`object-contain ${
                          kop.logoShape === 'circle' ? 'rounded-full' : kop.logoShape === 'rounded' ? 'rounded-lg' : ''
                        }`}
                      />
                    )}
                  </div>
                )}

                {/* Center / Stacked Logo for Center Mode */}
                {kop.logoPosition === 'center' && (kop.logoRight || kop.logoLeft) && (
                  <div className="shrink-0 mb-1">
                    <img
                      src={kop.logoRight || kop.logoLeft}
                      alt="Logo Tengah"
                      style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                      className={`object-contain mx-auto ${
                        kop.logoShape === 'circle' ? 'rounded-full' : kop.logoShape === 'rounded' ? 'rounded-lg' : ''
                      }`}
                    />
                  </div>
                )}

                {/* Center Texts */}
                <div className="flex-1 text-center px-1">
                  <h4 className="text-[12px] font-normal text-slate-800 uppercase tracking-wider leading-tight">
                    {kop.instansiAtas}
                  </h4>
                  {kop.dinasPendidikan && (
                    <h4 className="text-[12px] font-semibold text-slate-900 uppercase tracking-wide leading-tight">
                      {kop.dinasPendidikan}
                    </h4>
                  )}
                  <h3 className="text-[16px] font-bold text-slate-950 uppercase tracking-tight leading-tight my-0.5">
                    {kop.namaSekolah}
                  </h3>
                  <p className="text-[9.5px] text-slate-700 leading-tight">{kop.alamat}</p>
                  <p className="text-[9px] text-slate-600 italic">
                    {[
                      kop.npsn ? `NPSN: ${kop.npsn}` : '',
                      kop.akreditasi ? `Akreditasi: ${kop.akreditasi}` : '',
                      kop.website ? `Website: ${kop.website}` : '',
                      kop.email ? `Email: ${kop.email}` : '',
                    ]
                      .filter(Boolean)
                      .join(' | ')}
                  </p>
                </div>

                {/* Right Logo */}
                {(kop.logoPosition === 'right' || kop.logoPosition === 'both') && (
                  <div className="shrink-0 flex items-center justify-center">
                    {kop.logoRight && (
                      <img
                        src={kop.logoRight}
                        alt="Logo Kanan"
                        style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                        className={`object-contain ${
                          kop.logoShape === 'circle' ? 'rounded-full' : kop.logoShape === 'rounded' ? 'rounded-lg' : ''
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Decorative Divider */}
              {kop.borderStyle === 'double_thick_thin' ? (
                <div className="mt-2.5">
                  <div className="h-0.75 bg-black w-full mb-0.5"></div>
                  <div className="h-0.25 bg-black w-full"></div>
                </div>
              ) : (
                <div className="mt-2.5 h-0.75 bg-black w-full"></div>
              )}
            </div>
          )}

          {/* 2. JUDUL ASESMEN */}
          <div className="text-center my-3">
            <h2 className="text-[14px] font-bold uppercase tracking-wider underline">{examInfo.judulAsesmen}</h2>
            <div className="text-[11px] font-medium text-slate-700 mt-0.5">
              TAHUN PELAJARAN {examInfo.tahunAjaran} - SEMESTER {examInfo.semester?.toUpperCase()}
            </div>
          </div>

          {/* 3. TABEL INFORMASI UJIAN */}
          <div className="border border-black text-[11px] mb-3">
            <div className="grid grid-cols-2 divide-x divide-black p-1.5 leading-tight">
              <div className="space-y-0.5 pr-2">
                <div className="flex">
                  <span className="w-28 font-semibold">Mata Pelajaran</span>
                  <span>: {examInfo.mataPelajaran}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold">Kelas / Fase</span>
                  <span>
                    : {examInfo.kelas} / {examInfo.fase}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold">Materi Pokok</span>
                  <span>: {examInfo.materiPokok}</span>
                </div>
              </div>
              <div className="space-y-0.5 pl-2">
                <div className="flex">
                  <span className="w-28 font-semibold">Hari / Tanggal</span>
                  <span>: {examInfo.tanggal}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold">Alokasi Waktu</span>
                  <span>: {examInfo.waktu}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold">Guru Pengampu</span>
                  <span>: {examInfo.guruPengampu}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PETUNJUK UMUM */}
          {examInfo.petunjukUmum && (
            <div className="mb-3 p-1.5 bg-slate-50 border border-slate-300 text-[10px] leading-snug italic">
              <span className="font-bold not-italic">PETUNJUK UMUM: </span>
              {examInfo.petunjukUmum}
            </div>
          )}

          {/* 5. BUTIR-BUTIR SOAL */}
          <div
            className={`${fontSizeClass} ${
              settings.columns === 2 ? 'columns-1 md:columns-2 gap-6 [column-rule:1px_solid_#e2e8f0]' : 'space-y-3'
            }`}
          >
            {questions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-sans italic">
                Belum ada butir soal. Silakan gunakan generator otomatis di tab &quot;Generator Soal&quot; atau pilih
                dari &quot;Bank Soal&quot;.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id || idx} className="break-inside-avoid mb-4 space-y-1.5">
                  {/* Stimulus */}
                  {settings.includeStimulus && q.stimulus && (
                    <div className="p-2 bg-slate-50/80 border border-slate-300 rounded text-[10.5px] leading-relaxed mb-1">
                      <div className="font-bold text-slate-700 italic text-[9.5px] mb-0.5">
                        [Stimulus untuk Soal No. {q.number || idx + 1}]
                      </div>
                      <p className="text-justify">{q.stimulus}</p>
                    </div>
                  )}

                  {/* Pertanyaan */}
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">{q.number || idx + 1}.</span>
                    <div className="flex-1 text-justify">
                      <span>{q.prompt}</span>

                      {/* Tag tipe & level untuk guru jika bukan naskah siswa */}
                      <span className="text-[9px] font-sans font-medium text-slate-400 ml-1.5 print:hidden">
                        [{q.type.toUpperCase()} | {q.cognitiveLevel}
                        {q.isHots ? ' - HOTS' : ''}]
                      </span>
                    </div>
                  </div>

                  {/* Opsi Pilihan Ganda (PG) */}
                  {q.type === 'pg' && q.options && q.options.length > 0 && (
                    <div className="pl-5 space-y-1">
                      {q.options.map((opt, oIdx) => {
                        const letter = opt.trim().charAt(0);
                        const isKey = settings.showInlineAnswerKeys && q.answerKey.toUpperCase().includes(letter);
                        return (
                          <div
                            key={oIdx}
                            className={`leading-tight flex items-center justify-between p-1 rounded transition-colors ${
                              isKey
                                ? 'font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-400'
                                : ''
                            }`}
                          >
                            <span>{opt}</span>
                            {isKey && (
                              <span className="text-[8.5px] font-sans font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                                KUNCI BENAR [✓]
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* PG Kompleks Multi-Centang (Jika ada opsi pilihan) */}
                  {q.type === 'pg_kompleks' && q.options && q.options.length > 0 && (
                    <div className="pl-5 space-y-1 my-1">
                      <div className="text-[9.5px] italic text-slate-500 font-sans">
                        (Berilah tanda centang [✓] pada setiap pilihan jawaban yang benar!)
                      </div>
                      {q.options.map((opt, oIdx) => {
                        const letter = opt.trim().charAt(0);
                        const isKey = settings.showInlineAnswerKeys && q.answerKey.toUpperCase().includes(letter);
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center justify-between p-1 rounded leading-tight transition-colors ${
                              isKey
                                ? 'font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-400'
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono ${
                                  isKey ? 'font-bold text-emerald-800' : 'text-slate-700'
                                }`}
                              >
                                [{isKey ? '✓' : ' &nbsp; '}]
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isKey && (
                              <span className="text-[8.5px] font-sans font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                                KUNCI BENAR [✓]
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tipe Benar atau Salah & PG Kompleks dengan Tabel Pernyataan */}
                  {(q.type === 'benar_salah' || q.type === 'pg_kompleks') && q.complexStatements && (
                    <div className="pl-5 my-1.5">
                      <table className="w-full text-[10px] border-collapse border border-slate-400">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-400 p-1 text-left font-bold">Pernyataan</th>
                            <th className="border border-slate-400 p-1 text-center font-bold w-14">Benar</th>
                            <th className="border border-slate-400 p-1 text-center font-bold w-14">Salah</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.complexStatements.map((st, sIdx) => {
                            const showKey = settings.showInlineAnswerKeys;
                            const isTrue = st.isCorrect;
                            return (
                              <tr key={sIdx} className={showKey ? 'bg-slate-50/50' : ''}>
                                <td className="border border-slate-400 p-1">{st.text}</td>
                                <td
                                  className={`border border-slate-400 p-1 text-center font-mono ${
                                    showKey && isTrue ? 'font-bold text-emerald-800 bg-emerald-100' : 'text-slate-400'
                                  }`}
                                >
                                  [{showKey && isTrue ? '✓' : ' &nbsp; '}]
                                </td>
                                <td
                                  className={`border border-slate-400 p-1 text-center font-mono ${
                                    showKey && !isTrue ? 'font-bold text-rose-800 bg-rose-100' : 'text-slate-400'
                                  }`}
                                >
                                  [{showKey && !isTrue ? '✓' : ' &nbsp; '}]
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Menjodohkan */}
                  {q.type === 'menjodohkan' && q.matchingPairs && (
                    <div className="pl-5 my-1.5">
                      <table className="w-full text-[10px] border-collapse border border-slate-400">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-400 p-1 text-left font-bold w-1/2">
                              Kolom A (Konsep / Pernyataan)
                            </th>
                            <th className="border border-slate-400 p-1 text-center font-bold w-14">Jodoh</th>
                            <th className="border border-slate-400 p-1 text-left font-bold w-1/2">
                              Kolom B (Pasangan)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.matchingPairs.map((pair, pIdx) => {
                            const showKey = settings.showInlineAnswerKeys;
                            return (
                              <tr key={pIdx} className={showKey ? 'bg-emerald-50/30' : ''}>
                                <td className="border border-slate-400 p-1">{pair.left}</td>
                                <td
                                  className={`border border-slate-400 p-1 text-center font-bold ${
                                    showKey
                                      ? 'text-emerald-800 bg-emerald-100 font-mono text-[9.5px]'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {showKey ? `↔ #${pIdx + 1}` : '.....'}
                                </td>
                                <td className="border border-slate-400 p-1 font-medium">{pair.right}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Isian Singkat */}
                  {q.type === 'isian' && (
                    <div className="pl-5 pt-1 text-[10.5px]">
                      {settings.showInlineAnswerKeys ? (
                        <div className="bg-emerald-50 border border-emerald-300 p-1.5 rounded inline-flex items-center gap-2 text-emerald-950 font-sans">
                          <span className="font-semibold text-slate-700">Kunci Jawaban Isian:</span>
                          <span className="font-bold underline decoration-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                            {q.answerKey}
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[10px]">
                          Jawab: ___________________________________________________________
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uraian */}
                  {q.type === 'uraian' && (
                    <div className="pl-5 pt-1">
                      {settings.showInlineAnswerKeys ? (
                        <div className="bg-emerald-50/80 border border-emerald-300 rounded p-2.5 space-y-1 text-[10px] text-slate-800 font-sans">
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            [KUNCI JAWABAN & PEMBAHASAN GURU]:
                          </div>
                          <p className="leading-relaxed font-serif text-[10.5px]">{q.answerKey || q.explanation}</p>
                          {q.rubric && (
                            <div className="mt-1 pt-1 border-t border-emerald-200 text-slate-600 italic">
                              <span className="font-semibold not-italic">Rubrik Penskoran: </span>
                              {q.rubric}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-300 rounded p-2 text-slate-300 italic text-[9.5px]">
                          Ruang jawaban peserta didik:
                          <div className="h-14"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 6. LAMPIRAN KUNCI JAWABAN & PEMBAHASAN */}
          {settings.includeAnswerKey && questions.length > 0 && (
            <div className="mt-8 pt-4 border-t-2 border-black break-before-page">
              <div className="text-center mb-4">
                <h3 className="text-[13px] font-bold uppercase underline">
                  LAMPIRAN: KUNCI JAWABAN, PEMBAHASAN & RUBRIK ASESMEN
                </h3>
                <p className="text-[10px] text-slate-600 italic">Dokumen Pegangan Guru / Penilai</p>
              </div>

              <div className="space-y-3 text-[11px]">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-2 border border-slate-200 bg-slate-50 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">
                        No. {q.number || idx + 1} [{q.type.toUpperCase()} | Level: {q.cognitiveLevel} | Bobot: {q.scoreWeight}]
                      </span>
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        Kunci: {q.answerKey}
                      </span>
                    </div>
                    <div className="text-slate-700 leading-snug">
                      <span className="font-semibold text-slate-800">Pembahasan: </span>
                      {q.explanation}
                    </div>
                    {settings.includeRubric && q.rubric && (
                      <div className="mt-1 pt-1 border-t border-slate-200 text-slate-600 text-[10px] italic">
                        <span className="font-semibold not-italic">Rubrik Penskoran: </span>
                        {q.rubric}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
