import React, { useRef } from 'react';
import { KopConfig, LogoPosition, LogoShape, KopBorderStyle } from '../types';
import { DEFAULT_TUTWURI_LOGO, DEFAULT_SCHOOL_LOGO, DEFAULT_KEMENAG_LOGO } from '../utils/exemplarQuestions';
import {
  Upload,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  School,
  Building2,
  Trash2,
  RotateCcw,
  Check,
  LayoutTemplate,
  Info,
} from 'lucide-react';

interface KopSoalEditorProps {
  kop: KopConfig;
  onChange: (updated: KopConfig) => void;
  onApplyPreset?: (presetName: string) => void;
}

export const KopSoalEditor: React.FC<KopSoalEditorProps> = ({ kop, onChange }) => {
  const fileInputRefLeft = useRef<HTMLInputElement>(null);
  const fileInputRefRight = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file format gambar (PNG, JPG, SVG, atau WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (side === 'left') {
        onChange({ ...kop, logoLeft: result });
      } else {
        onChange({ ...kop, logoRight: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const setPreset = (type: KopConfig['template']) => {
    if (type === 'kemdikbud') {
      onChange({
        ...kop,
        template: 'kemdikbud',
        instansiAtas: 'PEMERINTAH KABUPATEN / KOTA DINAS PENDIDIKAN',
        dinasPendidikan: 'BIDANG PEMBINAAN PENDIDIKAN DASAR & MENENGAH',
        namaSekolah: 'SMP NEGERI 1 MERDEKA BELAJAR',
        alamat: 'Jl. Merdeka Belajar No. 45, Telp. (021) 7894561, Email: info@sekolah.sch.id',
        logoLeft: DEFAULT_TUTWURI_LOGO,
        logoRight: kop.logoRight || DEFAULT_SCHOOL_LOGO,
        logoPosition: 'both',
        borderStyle: 'double_thick_thin',
      });
    } else if (type === 'kemenag') {
      onChange({
        ...kop,
        template: 'kemenag',
        instansiAtas: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
        dinasPendidikan: 'KANTOR KEMENTERIAN AGAMA KABUPATEN / KOTA',
        namaSekolah: 'MADRASAH TSANAWIYAH NEGERI (MTsN) 1 UNGGULAN',
        alamat: 'Jl. Ikhlas Beramal No. 12, Telp. (021) 8765432, Website: mtsn1.sch.id',
        logoLeft: DEFAULT_KEMENAG_LOGO,
        logoRight: kop.logoRight || DEFAULT_SCHOOL_LOGO,
        logoPosition: 'both',
        borderStyle: 'double_thick_thin',
      });
    } else if (type === 'yayasan') {
      onChange({
        ...kop,
        template: 'yayasan',
        instansiAtas: 'YAYASAN PENDIDIKAN DAN PENGEMBANGAN GENERASI EMAS',
        dinasPendidikan: 'BADAN PENGELOLA SEKOLAH TERPADU',
        namaSekolah: 'SMA ISLAM TERPADU / KRISTEN BINA BANGSA',
        alamat: 'Jl. Patriot Bangsa No. 88, Telp. (021) 6543210, Email: contact@binabangsa.sch.id',
        logoLeft: kop.logoLeft || DEFAULT_SCHOOL_LOGO,
        logoRight: '',
        logoPosition: 'left',
        borderStyle: 'double_thick_thin',
      });
    } else if (type === 'olimpiade') {
      onChange({
        ...kop,
        template: 'olimpiade',
        instansiAtas: 'PUSAT PRESTASI NASIONAL - KEMDIKBUDRISTEK RI',
        dinasPendidikan: 'KOMITE OLIMPIADE SAINS NASIONAL (OSN)',
        namaSekolah: 'SELEKSI KOMPETISI SAINS & NUMERASI TINGKAT KABUPATEN/KOTA',
        alamat: 'Sekretariat Puspresnas RI, Gedung D Kemdikbudristek, Jakarta Pusat',
        logoLeft: DEFAULT_TUTWURI_LOGO,
        logoRight: DEFAULT_SCHOOL_LOGO,
        logoPosition: 'both',
        borderStyle: 'solid_thick',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <School className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold tracking-tight">Kop Soal & Unggah Logo Sekolah</h2>
          </div>
          <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
            Sesuaikan identitas sekolah Anda. Logo yang diunggah akan otomatis terintegrasi ke dalam kop soal pada lembar ujian cetak (PDF), file Word (.docx), dan mode kuis interaktif.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-medium border border-white/20">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>Otomatis Sinkron ke Word & PDF</span>
        </div>
      </div>

      {/* Preset Quick Select */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
          Pilihan Template Kop Resmi Sesuai Instansi:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setPreset('kemdikbud')}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 text-xs font-medium ${
              kop.template === 'kemdikbud'
                ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Kemdikbudristek</div>
              <div className="text-[11px] text-slate-500">SD / SMP / SMA Negeri</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPreset('kemenag')}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 text-xs font-medium ${
              kop.template === 'kemenag'
                ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
            }`}
          >
            <School className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Kemenag Madrasah</div>
              <div className="text-[11px] text-slate-500">MI / MTs / MA</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPreset('yayasan')}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 text-xs font-medium ${
              kop.template === 'yayasan'
                ? 'border-purple-600 bg-purple-50/80 text-purple-900 shadow-xs ring-1 ring-purple-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Sekolah Yayasan / Swasta</div>
              <div className="text-[11px] text-slate-500">IT / Kristen / Katolik / Umum</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPreset('olimpiade')}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 text-xs font-medium ${
              kop.template === 'olimpiade'
                ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-xs ring-1 ring-amber-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Olimpiade Sains (OSN)</div>
              <div className="text-[11px] text-slate-500">Puspresnas / Seleksi Juara</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Logo Upload & Positioning Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Logo Upload Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Logo Sekolah
              </h3>
              <span className="text-xs text-slate-500">Format PNG/JPG/SVG</span>
            </div>

            {/* School Logo (Right or Primary) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Logo Utama Sekolah / Satuan Pendidikan</span>
                  <span className="text-[11px] text-slate-500">Logo identitas sekolah yang akan dicetak di kop</span>
                </div>
                {kop.logoRight && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...kop, logoRight: '' })}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-white p-1 overflow-hidden shrink-0 shadow-xs ${
                    kop.logoShape === 'circle' ? 'rounded-full' : kop.logoShape === 'rounded' ? 'rounded-xl' : 'rounded-md'
                  }`}
                >
                  {kop.logoRight ? (
                    <img src={kop.logoRight} alt="Logo Sekolah" className="w-full h-full object-contain" />
                  ) : (
                    <School className="w-7 h-7 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRefRight}
                    onChange={(e) => handleFileUpload(e, 'right')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefRight.current?.click()}
                    className="w-full py-2 px-3 text-xs font-semibold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Logo Sekolah
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onChange({ ...kop, logoRight: DEFAULT_SCHOOL_LOGO })}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Gunakan Logo Standar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Logo (Left: Pemda / Tut Wuri Handayani / Kemenag) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Logo Instansi / Tut Wuri / Pemda (Kiri)</span>
                  <span className="text-[11px] text-slate-500">Digunakan untuk format kop dua logo resmi</span>
                </div>
                {kop.logoLeft && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...kop, logoLeft: '' })}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-white p-1 overflow-hidden shrink-0 shadow-xs ${
                    kop.logoShape === 'circle' ? 'rounded-full' : kop.logoShape === 'rounded' ? 'rounded-xl' : 'rounded-md'
                  }`}
                >
                  {kop.logoLeft ? (
                    <img src={kop.logoLeft} alt="Logo Instansi Kiri" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-7 h-7 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRefLeft}
                    onChange={(e) => handleFileUpload(e, 'left')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefLeft.current?.click()}
                    className="w-full py-2 px-3 text-xs font-semibold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Logo Kiri
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onChange({ ...kop, logoLeft: DEFAULT_TUTWURI_LOGO })}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Tut Wuri
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => onChange({ ...kop, logoLeft: DEFAULT_KEMENAG_LOGO })}
                      className="text-[11px] text-emerald-600 hover:underline"
                    >
                      Kemenag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Placement & Size Customizer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Pengaturan Penempatan & Ukuran Logo
            </h3>

            {/* Position Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Posisi Logo dalam Kop:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onChange({ ...kop, logoPosition: 'both' })}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    kop.logoPosition === 'both'
                      ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-800 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Kiri & Kanan (2 Logo)
                  <span className="block text-[10px] font-normal text-slate-500">Standar resmi kedinasan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...kop, logoPosition: 'left' })}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    kop.logoPosition === 'left'
                      ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-800 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Satu Logo di Kiri
                  <span className="block text-[10px] font-normal text-slate-500">Logo sekolah di sebelah kiri</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...kop, logoPosition: 'right' })}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    kop.logoPosition === 'right'
                      ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-800 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Satu Logo di Kanan
                  <span className="block text-[10px] font-normal text-slate-500">Logo sekolah di sebelah kanan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...kop, logoPosition: 'center' })}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    kop.logoPosition === 'center'
                      ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-800 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Tengah (Atas Teks)
                  <span className="block text-[10px] font-normal text-slate-500">Format medali/olimpiade</span>
                </button>
              </div>
            </div>

            {/* Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">Ukuran Logo:</label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {kop.logoSizePx} px (~{Math.round((kop.logoSizePx / 3.78) * 10) / 10} mm)
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="105"
                step="2"
                value={kop.logoSizePx}
                onChange={(e) => onChange({ ...kop, logoSizePx: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1">
                <span>Kecil (45px)</span>
                <span>Standar (65px)</span>
                <span>Besar (85px)</span>
                <span>Ekstra (105px)</span>
              </div>
            </div>

            {/* Shape and Frame */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Bentuk Tampilan Logo:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['original', 'circle', 'rounded'] as LogoShape[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => onChange({ ...kop, logoShape: shape })}
                    className={`py-2 px-3 rounded-lg border text-center capitalize transition-all ${
                      kop.logoShape === shape
                        ? 'border-blue-600 bg-blue-50 font-bold text-blue-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {shape === 'original' ? 'Asli (Natural)' : shape === 'circle' ? 'Lingkaran' : 'Melingkar Lembut'}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Style */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Gaya Garis Pembatas Kop:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onChange({ ...kop, borderStyle: 'double_thick_thin' })}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    kop.borderStyle === 'double_thick_thin'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Garis Ganda Resmi Dinas
                  <span className="block border-b-2 border-t-1 border-slate-800 h-1.5 mt-1"></span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...kop, borderStyle: 'solid_thick' })}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    kop.borderStyle === 'solid_thick'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Garis Tebal Tunggal
                  <span className="block border-b-2 border-slate-800 h-1 mt-1"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: School Information Form & Live Letterhead Preview */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Kop Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4 text-blue-600" />
                Pratinjau Langsung Kop Surat (Live Preview)
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kop.showKop}
                    onChange={(e) => onChange({ ...kop, showKop: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Tampilkan Kop pada Lembar Soal
                </label>
              </div>
            </div>

            {/* WYSIWYG Letterhead Box */}
            <div
              className={`p-5 bg-white rounded-xl border border-slate-300 shadow-2xs font-serif transition-all ${
                !kop.showKop ? 'opacity-40 grayscale pointer-events-none' : ''
              }`}
            >
              <div
                className={`flex items-center justify-between gap-4 ${
                  kop.logoPosition === 'center' ? 'flex-col text-center' : ''
                }`}
              >
                {/* Left Logo */}
                {(kop.logoPosition === 'left' || kop.logoPosition === 'both') && (
                  <div className="shrink-0 flex items-center justify-center">
                    {kop.logoPosition === 'left' ? (
                      kop.logoRight || kop.logoLeft ? (
                        <img
                          src={kop.logoRight || kop.logoLeft}
                          alt="Logo Kiri"
                          style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                          className={`object-contain transition-all ${
                            kop.logoShape === 'circle'
                              ? 'rounded-full border border-slate-200 shadow-2xs'
                              : kop.logoShape === 'rounded'
                              ? 'rounded-lg'
                              : ''
                          }`}
                        />
                      ) : (
                        <div
                          style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                          className="bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400"
                        >
                          Logo
                        </div>
                      )
                    ) : kop.logoLeft ? (
                      <img
                        src={kop.logoLeft}
                        alt="Logo Kiri Instansi"
                        style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                        className={`object-contain transition-all ${
                          kop.logoShape === 'circle'
                            ? 'rounded-full border border-slate-200 shadow-2xs'
                            : kop.logoShape === 'rounded'
                            ? 'rounded-lg'
                            : ''
                        }`}
                      />
                    ) : (
                      <div
                        style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                        className="bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400"
                      >
                        Logo Kiri
                      </div>
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
                        kop.logoShape === 'circle' ? 'rounded-full border border-slate-200' : ''
                      }`}
                    />
                  </div>
                )}

                {/* Center Texts */}
                <div className={`flex-1 text-center px-1 ${kop.logoPosition === 'center' ? 'w-full' : ''}`}>
                  <h4 className="text-[12px] font-medium text-slate-700 tracking-wider uppercase leading-tight">
                    {kop.instansiAtas || 'PEMERINTAH DAERAH PROVINSI / KABUPATEN'}
                  </h4>
                  {kop.dinasPendidikan && (
                    <h4 className="text-[13px] font-semibold text-slate-800 tracking-wide uppercase leading-tight">
                      {kop.dinasPendidikan}
                    </h4>
                  )}
                  <h3 className="text-[16px] md:text-[18px] font-black text-slate-950 uppercase tracking-tight leading-tight my-0.5">
                    {kop.namaSekolah || 'SEKOLAH PENGGERAK KURIKULUM MERDEKA'}
                  </h3>
                  <p className="text-[10px] md:text-[11px] text-slate-600 leading-snug">
                    {kop.alamat || 'Jl. Pendidikan No. 01, Telp. (021) 1234567'}
                  </p>
                  <p className="text-[9.5px] text-slate-500 italic mt-0.5">
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
                    {kop.logoRight ? (
                      <img
                        src={kop.logoRight}
                        alt="Logo Kanan Sekolah"
                        style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                        className={`object-contain transition-all ${
                          kop.logoShape === 'circle'
                            ? 'rounded-full border border-slate-200 shadow-2xs'
                            : kop.logoShape === 'rounded'
                            ? 'rounded-lg'
                            : ''
                        }`}
                      />
                    ) : (
                      <div
                        style={{ width: `${kop.logoSizePx}px`, height: `${kop.logoSizePx}px` }}
                        className="bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400"
                      >
                        Logo Sekolah
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Decorative Divider Line */}
              {kop.borderStyle === 'double_thick_thin' ? (
                <div className="mt-3">
                  <div className="h-0.5 bg-slate-900 w-full mb-0.5"></div>
                  <div className="h-0.25 bg-slate-900 w-full"></div>
                </div>
              ) : (
                <div className="mt-3 h-0.75 bg-slate-900 w-full"></div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Logo & Kop aktif. Siap otomatis di-inject ke lembar soal, ekspor Word (.docx), dan cetak PDF!
              </span>
            </div>
          </div>

          {/* School Details Input Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Rincian Teks Kop Surat
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Instansi Induk / Yayasan:</label>
                <input
                  type="text"
                  value={kop.instansiAtas}
                  onChange={(e) => onChange({ ...kop, instansiAtas: e.target.value })}
                  placeholder="PEMERINTAH PROVINSI / KABUPATEN..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dinas / Kantor Wilayah:</label>
                <input
                  type="text"
                  value={kop.dinasPendidikan}
                  onChange={(e) => onChange({ ...kop, dinasPendidikan: e.target.value })}
                  placeholder="DINAS PENDIDIKAN DAN KEBUDAYAAN..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Nama Satuan Pendidikan / Sekolah:</label>
                <input
                  type="text"
                  value={kop.namaSekolah}
                  onChange={(e) => onChange({ ...kop, namaSekolah: e.target.value })}
                  placeholder="SMP NEGERI 1 MERDEKA BELAJAR"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap & Kontak:</label>
                <input
                  type="text"
                  value={kop.alamat}
                  onChange={(e) => onChange({ ...kop, alamat: e.target.value })}
                  placeholder="Jl. Merdeka Belajar No. 45, Telp. (021) 7894561"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Telepon / Fax:</label>
                <input
                  type="text"
                  value={kop.telp}
                  onChange={(e) => onChange({ ...kop, telp: e.target.value })}
                  placeholder="(021) 7894561"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Sekolah Resmi:</label>
                <input
                  type="email"
                  value={kop.email}
                  onChange={(e) => onChange({ ...kop, email: e.target.value })}
                  placeholder="info@sekolah.sch.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NPSN & Akreditasi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={kop.npsn || ''}
                    onChange={(e) => onChange({ ...kop, npsn: e.target.value })}
                    placeholder="NPSN: 20104567"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={kop.akreditasi || ''}
                    onChange={(e) => onChange({ ...kop, akreditasi: e.target.value })}
                    placeholder="Akreditasi: A"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Website Sekolah:</label>
                <input
                  type="text"
                  value={kop.website}
                  onChange={(e) => onChange({ ...kop, website: e.target.value })}
                  placeholder="www.sekolah.sch.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
