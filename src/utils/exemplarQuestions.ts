import { Question, KopConfig, ExamMetadata } from '../types';

// Tut Wuri Handayani vector logo as SVG Data URL
export const DEFAULT_TUTWURI_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="%230284c7" stroke="%23facc15" stroke-width="3"/>
  <circle cx="50" cy="50" r="42" fill="%23ffffff" />
  <path d="M50 15 L58 35 L79 38 L64 53 L68 74 L50 63 L32 74 L36 53 L21 38 L42 35 Z" fill="%23f59e0b" stroke="%23b45309" stroke-width="1.5"/>
  <path d="M50 30 Q60 48 50 60 Q40 48 50 30" fill="%230284c7"/>
  <circle cx="50" cy="46" r="6" fill="%23e11d48"/>
  <path d="M30 75 Q50 82 70 75 Q50 90 30 75" fill="%230284c7"/>
  <text x="50" y="82" font-size="5" font-family="Arial" font-weight="bold" fill="%23ffffff" text-anchor="middle">TUT WURI HANDAYANI</text>
</svg>`;

// Modern School Crest vector logo as SVG Data URL
export const DEFAULT_SCHOOL_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231e3a8a"/>
      <stop offset="100%" stop-color="%233b82f6"/>
    </linearGradient>
  </defs>
  <path d="M50 8 L85 24 V52 C85 72 50 92 50 92 C50 92 15 72 15 52 V24 Z" fill="url(%23grad)" stroke="%23fbbf24" stroke-width="3"/>
  <circle cx="50" cy="42" r="22" fill="%23ffffff" opacity="0.95"/>
  <path d="M50 26 L56 38 L69 40 L60 49 L62 62 L50 56 L38 62 L40 49 L31 40 L44 38 Z" fill="%23f59e0b"/>
  <path d="M35 65 C40 60 47 62 50 67 C53 62 60 60 65 65 L65 74 C60 69 53 71 50 76 C47 71 40 69 35 74 Z" fill="%23047857"/>
  <text x="50" y="84" font-size="5.5" font-family="Arial" font-weight="bold" fill="%23ffffff" text-anchor="middle">UNGGUL & BERKARAKTER</text>
</svg>`;

// Kemenag Madrasah Ikhlas Beramal logo
export const DEFAULT_KEMENAG_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="%23065f46" stroke="%23f59e0b" stroke-width="3"/>
  <circle cx="50" cy="50" r="42" fill="%23ffffff"/>
  <path d="M50 20 L58 36 L75 39 L63 51 L66 68 L50 60 L34 68 L37 51 L25 39 L42 36 Z" fill="%2310b981"/>
  <path d="M34 50 Q50 65 66 50 Q50 56 34 50 Z" fill="%23f59e0b"/>
  <circle cx="50" cy="40" r="7" fill="%23047857"/>
  <text x="50" y="78" font-size="5" font-family="Arial" font-weight="bold" fill="%23065f46" text-anchor="middle">IKHLAS BERAMAL</text>
</svg>`;

export const DEFAULT_KOP_CONFIG: KopConfig = {
  showKop: true,
  instansiAtas: 'PEMERINTAH DAERAH PROVINSI / KABUPATEN',
  dinasPendidikan: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
  namaSekolah: 'SMP NEGERI 1 MERDEKA BELAJAR',
  alamat: 'Jl. Merdeka Belajar No. 45, Kompleks Edukasi Terpadu, Telp. (021) 7894561',
  telp: '(021) 7894561',
  email: 'smpn1merdeka@sekolah.sch.id',
  website: 'www.smpn1merdekabelajar.sch.id',
  kodePos: '12345',
  npsn: '20104567',
  akreditasi: 'A (Unggul)',
  logoLeft: DEFAULT_TUTWURI_LOGO,
  logoRight: DEFAULT_SCHOOL_LOGO,
  logoPosition: 'both',
  logoSizePx: 64,
  logoShape: 'original',
  borderStyle: 'double_thick_thin',
  template: 'kemdikbud',
};

export const DEFAULT_EXAM_METADATA: ExamMetadata = {
  judulAsesmen: 'ASESMEN SUMATIF AKHIR SEMESTER (SAS) GANJIL',
  mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
  jenjang: 'SMP',
  fase: 'Fase D (Kelas 7-9)',
  kelas: 'Kelas VIII (Delapan)',
  semester: 'Ganjil',
  tahunAjaran: '2026/2027',
  tanggal: 'Senin, 02 November 2026',
  waktu: '07.30 - 09.00 WIB',
  alokasiMenit: 90,
  tipeAsesmen: 'Sumatif',
  petunjukUmum:
    '1. Berdoalah sebelum mengerjakan soal. 2. Periksa kelengkapan naskah soal sebelum menjawab. 3. Tulis identitas diri pada lembar jawaban yang tersedia. 4. Jawablah soal-soal yang Anda anggap lebih mudah terlebih dahulu. 5. Teliti kembali seluruh jawaban sebelum diserahkan kepada pengawas ujian.',
  guruPengampu: 'Hajar Rahmawati, S.Pd., Gr.',
  nip: '19890415 201503 2 004',
  materiPokok: 'Sistem Peredaran Darah Manusia & Mekanisme Transportasi Tubuh',
  capaianPembelajaran:
    'Peserta didik memahami struktur dan fungsi sistem organ peredaran darah manusia serta dapat menganalisis gangguan kesehatan yang berhubungan dengannya.',
};

export const EXEMPLAR_QUESTIONS: Question[] = [
  {
    id: 'smp-ipa-01',
    number: 1,
    type: 'pg',
    jenjang: 'SMP',
    fase: 'Fase D (Kelas 7-9)',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    topic: 'Sistem Peredaran Darah',
    cognitiveLevel: 'C4',
    isHots: true,
    scoreWeight: 2,
    stimulus:
      'Seorang atlet lari maraton bernama Dika melakukan pemeriksaan denyut nadi dan tekanan darah sebelum dan sesudah berlari menempuh jarak 5 km. Sebelum berlari, denyut nadinya tercatat 68 kali/menit dengan tekanan darah 115/75 mmHg. Setelah berlari kencang, denyut nadinya melonjak menjadi 142 kali/menit dengan tekanan darah 140/85 mmHg.',
    prompt:
      'Berdasarkan prinsip fisiologi sistem peredaran darah, apa penyebab utama peningkatan frekuensi denyut nadi dan curah jantung pada tubuh Dika saat aktivitas fisik intens tersebut?',
    options: [
      'A. Tubuh membutuhkan suplai oksigen dan nutrisi yang lebih cepat ke otot rangka serta pembuangan karbon dioksida yang lebih efisien.',
      'B. Volume darah dalam pembuluh mengalami penurunan drastis akibat penguapan keringat selama berlari.',
      'C. Katup jantung mengalami penyempitan sementara sehingga frekuensi pemompaan harus dilipatgandakan.',
      'D. Paru-paru berhenti memompa udara sehingga darah harus bekerja mandiri mengalirkan energi ke sel otak.',
    ],
    answerKey: 'A',
    explanation:
      'Saat berolahraga keras, laju respirasi seluler pada jaringan otot meningkat pesat guna menghasilkan ATP. Hal ini memicu peningkatan kebutuhan O2 dan akumulasi CO2. Sistem saraf simpatik merespons dengan mempercepat denyut jantung (frekuensi) dan memperbesar volume sekuncup agar perfusi darah ke otot rangka meningkat seimbang.',
    learningOutcome: 'Menganalisis hubungan antara aktivitas fisik dengan dinamika sistem peredaran darah manusia.',
  },
  {
    id: 'smp-ipa-02',
    number: 2,
    type: 'pg_kompleks',
    jenjang: 'SMP',
    fase: 'Fase D (Kelas 7-9)',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    topic: 'Komponen Darah & Golongan Darah',
    cognitiveLevel: 'C4',
    isHots: true,
    scoreWeight: 3,
    stimulus:
      'Dalam suatu uji laboratorium donor darah darurat di rumah sakit, terdapat seorang pasien bergolongan darah B (rhesus positif) yang membutuhkan transfusi akibat kecelakaan lalu lintas. Dokter jaga harus menentukan donor yang aman agar tidak terjadi aglutinasi (penggumpalan sel darah merah).',
    prompt:
      'Tentukan Benar atau Salah untuk setiap pernyataan berikut terkait kecocokan transfusi darah dan antigen-antibodi pasien tersebut!',
    complexStatements: [
      {
        text: 'Pasien bergolongan darah B memiliki aglutinogen B pada eritrosit dan aglutinin anti-A (alfa) di dalam plasmanya.',
        isCorrect: true,
      },
      {
        text: 'Donor bergolongan darah AB aman ditransfusikan dalam jumlah besar kepada pasien karena merupakan donor universal.',
        isCorrect: false,
      },
      {
        text: 'Donor bergolongan darah O (rhesus positif) dapat diterima oleh pasien karena sel darah donor tidak memiliki antigen A maupun B.',
        isCorrect: true,
      },
      {
        text: 'Jika terjadi salah transfusi dari donor golongan A, aglutinin anti-A milik resipien akan menggumpalkan eritrosit donor.',
        isCorrect: true,
      },
    ],
    answerKey: 'Benar, Salah, Benar, Benar',
    explanation:
      'Golongan darah B memiliki antigen B dan antibodi anti-A. Golongan darah AB mengandung antigen A dan B, sehingga jika diberikan ke pasien B, antigen A donor akan diserang antibodi anti-A pasien (bukan donor universal, melainkan resipien universal). Golongan O tidak memiliki antigen A/B sehingga aman sebagai donor darurat.',
    learningOutcome: 'Mengevaluasi mekanisme reaksi aglutinasi pada transfusi darah berdasarkan sistem antigen ABO.',
  },
  {
    id: 'smp-ipa-03',
    number: 3,
    type: 'menjodohkan',
    jenjang: 'SMP',
    fase: 'Fase D (Kelas 7-9)',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    topic: 'Pembuluh Darah',
    cognitiveLevel: 'C3',
    isHots: false,
    scoreWeight: 3,
    stimulus:
      'Sistem pembuluh darah manusia terdiri atas tiga jenis utama dengan karakteristik dinding, elastisitas, dan arah aliran darah yang spesifik untuk menunjang kelangsungan hidup.',
    prompt: 'Jodohkan jenis pembuluh darah pada Kolom A dengan karakteristik fungsinya yang tepat pada Kolom B!',
    matchingPairs: [
      {
        left: '1. Pembuluh Nadi (Arteri)',
        right: 'Dinding tebal, elastis, membawa darah kaya O2 keluar dari bilik jantung (kecuali pulmonalis)',
      },
      {
        left: '2. Pembuluh Balik (Vena)',
        right: 'Dinding tipis tidak elastis, memiliki banyak katup di sepanjang pembuluh, mengalir menuju jantung',
      },
      {
        left: '3. Pembuluh Kapiler',
        right: 'Dinding setebal selapis sel endotel, tempat pertukaran gas O2/CO2 dan nutrisi dengan jaringan sel',
      },
    ],
    answerKey: '1 -> Dinding tebal..., 2 -> Dinding tipis..., 3 -> Dinding setebal selapis...',
    explanation:
      'Arteri menahan tekanan tinggi dari kontraksi ventrikel sehingga dindingnya tebal dan berotot. Vena bertekanan rendah dan membutuhkan katup untuk mencegah aliran balik gravitasi. Kapiler memiliki permeabilitas mikroskopis untuk difusi nutrisi.',
    learningOutcome: 'Mengidentifikasi perbedaan struktural dan fungsional ketiga jenis pembuluh darah.',
  },
  {
    id: 'smp-ipa-04',
    number: 4,
    type: 'isian',
    jenjang: 'SMP',
    fase: 'Fase D (Kelas 7-9)',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    topic: 'Komponen Darah',
    cognitiveLevel: 'C2',
    isHots: false,
    scoreWeight: 2,
    prompt:
      'Komponen sel darah yang tidak berinti, berbentuk kepingan kecil, dan berperan vital dalam proses pembekuan darah serta penutupan luka melalui pelepasan enzim trombokinase adalah ...',
    answerKey: 'Trombosit (Keping Darah)',
    explanation:
      'Trombosit (platelet) pecah ketika bersentuhan dengan permukaan kasar luka dan melepaskan trombokinase. Trombokinase dengan ion kalsium dan vitamin K mengubah protrombin menjadi trombin, yang kemudian mengonversi fibrinogen menjadi benang fibrin untuk menjerat sel darah merah.',
    learningOutcome: 'Mendeskripsikan fungsi spesifik trombosit dalam hemostasis luka.',
  },
  {
    id: 'smp-ipa-05',
    number: 5,
    type: 'uraian',
    jenjang: 'SMP',
    fase: 'Fase D (Kelas 7-9)',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    topic: 'Kesehatan Kardiovaskular',
    cognitiveLevel: 'C5',
    isHots: true,
    scoreWeight: 5,
    stimulus:
      'Pola makan tinggi lemak jenuh, konsumsi garam berlebih, serta kebiasaan merokok dapat memicu penumpukan plak aterosklerosis di dalam dinding pembuluh koroner. Berdasarkan data Riskesdas, hipertensi dan penyakit jantung koroner (PJK) kini semakin banyak dialami kelompok usia produktif.',
    prompt:
      'Jelaskan bagaimana proses pembentukan plak aterosklerosis dapat memicu serangan jantung (infark miokard), dan rumuskan 3 rekomendasi gaya hidup preventif berbasis Kurikulum Merdeka yang dapat diterapkan oleh peserta didik di lingkungan sekolah!',
    answerKey:
      'Penimbunan lipid/kolesterol jahat (LDL) pada endotel memicu penyempitan lumen arteri koroner. Jika plak robek, terbentuk bekuan trombus yang menyumbat aliran darah beroksigen ke otot jantung miokardium. 3 rekomendasi: (1) Mengurangi konsumsi gorengan/makanan cepat saji di kantin sekolah, (2) Rutin berolahraga aerobik minimal 30 menit sehari (senam/jalan kaki), (3) Menjauhi rokok konvensional maupun vape serta mengelola stres akademik.',
    explanation:
      'Infark miokard terjadi akibat iskemia jaringan jantung yang berkepanjangan. Peserta didik perlu membiasakan pola hidup sehat CERDIK (Cek kesehatan, Enyahkan asap rokok, Rajin aktivitas fisik, Diet seimbang, Istirahat cukup, Kelola stres).',
    rubric:
      'Skor 5: Menjelaskan mekanisme plak-trombus-iskemia dengan runut dan memberikan 3 rekomendasi konkret yang dapat diterapkan siswa. Skor 3: Menjelaskan secara umum tanpa rincian trombus/iskemia, rekomendasi tepat. Skor 1: Menjawab hanya sebagian kecil.',
    learningOutcome: 'Menganalisis patofisiologi penyakit jantung koroner dan merumuskan aksi nyata pencegahan.',
  },

  // Contoh Olimpiade Sains (OSN) Soal HOTS
  {
    id: 'osn-mat-01',
    number: 6,
    type: 'pg',
    jenjang: 'Olimpiade',
    fase: 'Olimpiade SMA',
    mataPelajaran: 'Matematika Olimpiade',
    topic: 'Teori Bilangan & Aljabar',
    cognitiveLevel: 'C6',
    isHots: true,
    scoreWeight: 4,
    stimulus:
      'Diberikan fungsi polinomial $P(x)$ berderajat 4 dengan koefisien bilangan bulat. Diketahui bahwa $P(1) = 2024$, $P(2) = 2025$, $P(3) = 2026$, dan $P(4) = 2027$.',
    prompt: 'Jika diketahui bahwa $P(5) + P(-1) = k$, maka nilai dari $k$ adalah ...',
    options: ['A. 4096', 'B. 4072', 'C. 4098', 'D. 4102', 'E. 4120'],
    answerKey: 'C',
    explanation:
      'Tinjau fungsi pembantu $Q(x) = P(x) - (x + 2023)$. Karena $P(x) = x + 2023$ untuk $x = 1, 2, 3, 4$, maka $x = 1, 2, 3, 4$ adalah akar-akar dari $Q(x)$. Karena $P(x)$ berderajat 4, maka $Q(x) = a(x - 1)(x - 2)(x - 3)(x - 4)$ untuk suatu konstanta $a$. Sehingga $P(x) = a(x-1)(x-2)(x-3)(x-4) + x + 2023$. Nilai $P(5) = a(4)(3)(2)(1) + 5 + 2023 = 24a + 2028$. Nilai $P(-1) = a(-2)(-3)(-4)(-5) - 1 + 2023 = 24a + 2022$. Maka $P(5) + P(-1) = 48a + 4050$. Mengingat koefisien bulat dan bentuk simetri suku utama jika $a = 1$, kita peroleh $48(1) + 4050 = 4098$.',
    learningOutcome: 'Menyelesaikan permasalahan polinomial non-rutin dengan metode fungsi selisih pada seleksi OSN.',
  },

  // Contoh Soal SD Fase C
  {
    id: 'sd-ipas-01',
    number: 7,
    type: 'pg',
    jenjang: 'SD',
    fase: 'Fase C (Kelas 5-6)',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    topic: 'Ekosistem dan Rantai Makanan',
    cognitiveLevel: 'C3',
    isHots: true,
    scoreWeight: 2,
    stimulus:
      'Di persawahan Desa Sukamaju, para petani mengeluhkan serangan hama tikus yang memakan batang padi muda hingga gagal panen. Sebagian warga berinisiatif menembak burung hantu dan ular sawah karena dianggap menakutkan.',
    prompt:
      'Sebagai siswa yang belajar IPAS Kurikulum Merdeka, penjelasan apa yang paling tepat untuk disampaikan kepada warga desa agar panen padi kembali berhasil?',
    options: [
      'A. Memburu burung hantu dan ular justru membuat populasi tikus meledak karena predator alaminya hilang.',
      'B. Burung hantu dan ular adalah pemakan padi utama di sawah sehingga harus terus diburu.',
      'C. Populasi tikus tidak ada hubungannya dengan keberadaan ular dan burung hantu di ekosistem.',
      'D. Lebih baik memasang racun kimia sebanyak-banyaknya di seluruh lahan sawah.',
    ],
    answerKey: 'A',
    explanation:
      'Dalam rantai makanan ekosistem sawah, ular dan burung hantu berkedudukan sebagai konsumen sekunder/tersier yang berperan sebagai predator alami pengendali hama tikus. Membasmi predator alami menyebabkan ketidakseimbangan trofik dan ledakan populasi hama.',
    learningOutcome: 'Memprediksi dampak gangguan pada rantai makanan terhadap keseimbangan ekosistem persawahan.',
  },
];
