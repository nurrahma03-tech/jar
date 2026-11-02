export type EducationLevel = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Olimpiade';

export type KurikulumFase =
  | 'Fase A (Kelas 1-2)'
  | 'Fase B (Kelas 3-4)'
  | 'Fase C (Kelas 5-6)'
  | 'Fase D (Kelas 7-9)'
  | 'Fase E (Kelas 10)'
  | 'Fase F (Kelas 11-12)'
  | 'Olimpiade SD'
  | 'Olimpiade SMP'
  | 'Olimpiade SMA';

export type AssessmentType = 'Formatif' | 'Sumatif' | 'Diagnostik' | 'Olimpiade / Seleksi Prestasi';

export type QuestionType =
  | 'pg'
  | 'pg_kompleks'
  | 'menjodohkan'
  | 'benar_salah'
  | 'isian'
  | 'uraian';

export interface QuestionVariantCount {
  pg: number;
  pg_kompleks: number;
  menjodohkan: number;
  benar_salah: number;
  isian: number;
  uraian: number;
}

export type CognitiveLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface ComplexStatement {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  stimulus?: string;
  options?: string[];
  answerKey: string;
  matchingPairs?: MatchingPair[];
  complexStatements?: ComplexStatement[];
  explanation: string;
  cognitiveLevel: CognitiveLevel;
  isHots: boolean;
  scoreWeight: number;
  rubric?: string;
  learningOutcome?: string;
  topic?: string;
  jenjang?: EducationLevel;
  fase?: KurikulumFase;
  mataPelajaran?: string;
}

export type LogoPosition = 'left' | 'right' | 'both' | 'center';
export type LogoShape = 'original' | 'circle' | 'rounded';
export type KopBorderStyle = 'double_thick_thin' | 'double_thin' | 'single' | 'solid_thick';

export interface KopConfig {
  showKop: boolean;
  instansiAtas: string;
  dinasPendidikan: string;
  namaSekolah: string;
  alamat: string;
  telp: string;
  email: string;
  website: string;
  kodePos: string;
  npsn?: string;
  akreditasi?: string;
  logoLeft: string; // base64 or URL
  logoRight: string; // base64 or URL
  logoPosition: LogoPosition;
  logoSizePx: number; // 30 - 120
  logoShape: LogoShape;
  borderStyle: KopBorderStyle;
  template: 'kemdikbud' | 'kemenag' | 'yayasan' | 'modern' | 'olimpiade';
}

export interface ExamMetadata {
  judulAsesmen: string;
  mataPelajaran: string;
  jenjang: EducationLevel;
  fase: KurikulumFase;
  kelas: string;
  semester: string;
  tahunAjaran: string;
  tanggal: string;
  waktu: string;
  alokasiMenit: number;
  tipeAsesmen: AssessmentType;
  petunjukUmum: string;
  guruPengampu: string;
  nip: string;
  materiPokok: string;
  capaianPembelajaran?: string;
}

export type PaperSize = 'A4' | 'F4' | 'Legal' | 'Letter';
export type PaperColumns = 1 | 2;
export type PaperMargin = 'normal' | 'compact' | 'wide';

export interface PaperLayoutSettings {
  paperSize: PaperSize;
  columns: PaperColumns;
  margin: PaperMargin;
  fontFamily: 'serif' | 'sans';
  fontSize: 'sm' | 'base' | 'lg';
  showInlineAnswerKeys: boolean; // Menampilkan / menyembunyikan tanda kunci jawaban pada butir soal
  includeAnswerKey: boolean; // Menampilkan / menyembunyikan lampiran kunci & pembahasan di akhir
  includeRubric: boolean;
  includeStimulus: boolean;
  showLJK: boolean;
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedOption?: string; // for pg
  complexAnswers?: Record<number, boolean>; // for pg_kompleks
  matchingAnswers?: Record<string, string>; // for menjodohkan
  textAnswer?: string; // for isian / uraian
  isFlagged?: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  predicate: 'Sangat Baik' | 'Mahir' | 'Cakap' | 'Layak' | 'Perlu Bimbingan';
  timeSpentSeconds: number;
  dateCompleted: string;
  details: {
    questionNumber: number;
    questionPrompt: string;
    type: QuestionType;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    cognitiveLevel: CognitiveLevel;
    isHots: boolean;
  }[];
}

export interface StudentInfo {
  nama: string;
  nomorPeserta: string;
  kelas: string;
  ruang: string;
}
