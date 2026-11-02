import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  ImageRun,
} from "docx";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API: Generate questions with Gemini 3.8 Flash
app.post("/api/generate-questions", async (req, res) => {
  try {
    const {
      jenjang = "SMP",
      fase = "Fase D (Kelas 7-9)",
      tingkatKelas = "Kelas 8 SMP",
      mataPelajaran = "Ilmu Pengetahuan Alam (IPA)",
      tipeAsesmen = "Sumatif",
      materiPokok = "Sistem Peredaran Darah Manusia",
      capaianPembelajaran = "",
      jumlahSoal = 5,
      tipeSoal = "pg", // pg, pg_kompleks, menjodohkan, isian, uraian, atau campuran
      distribusiTipeSoal,
      tingkatKesulitan = "Sedang",
      profilPelajarPancasila = ["Bernalar Kritis"],
      instruksiTambahan = "",
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Falling back to structured exemplar generator.");
      return res.status(503).json({
        error: "API_KEY_MISSING",
        message: "Kunci API Gemini belum terpasang di Secrets. Sistem menggunakan bank soal kurikulum merdeka.",
      });
    }

    const promptText = `
Anda adalah seorang Pakar Kurikulum Merdeka dan Tim Pengembang Asesmen Nasional Kemendikbudristek RI, serta pakar soal Olimpiade Sains Nasional (OSN).
Tugas Anda adalah menyusun paket naskah soal berkualitas tinggi, kontekstual, berbasis penalaran (Higher Order Thinking Skills - HOTS), dan berlandaskan Kurikulum Merdeka.

PARAMETER SOAL:
- Jenjang Pendidikan: ${jenjang}
- Fase Kurikulum Merdeka: ${fase}
- Tingkat / Kelas: ${tingkatKelas}
PARAMETER SOAL:
- Jenjang Pendidikan: ${jenjang}
- Fase Kurikulum Merdeka: ${fase}
- Tingkat / Kelas: ${tingkatKelas}
- Mata Pelajaran: ${mataPelajaran}
- Jenis Asesmen: ${tipeAsesmen} (Formatif / Sumatif / Diagnostik / Olimpiade)
- Topik / Materi Pokok: ${materiPokok}
- Capaian Pembelajaran (CP) / Alur Tujuan: ${capaianPembelajaran || "Sesuai Standar BSKAP Kemendikbudristek"}
- Total Jumlah Soal yang Diminta: ${jumlahSoal}
- Format Tipe Soal: ${tipeSoal}
- Distribusi Jumlah Butir per Varian Soal: ${
      distribusiTipeSoal
        ? `WAJIB IKUTI JUMLAH PERSIS INI: ${JSON.stringify(distribusiTipeSoal)} (misal: pg=${distribusiTipeSoal.pg || 0}, pg_kompleks=${distribusiTipeSoal.pg_kompleks || 0}, menjodohkan=${distribusiTipeSoal.menjodohkan || 0}, benar_salah=${distribusiTipeSoal.benar_salah || 0}, isian=${distribusiTipeSoal.isian || 0}, uraian=${distribusiTipeSoal.uraian || 0})`
        : "Buatkan proporsional sesuai jumlah total."
    }
- Tingkat Kesulitan: ${tingkatKesulitan}
- Dimensi Profil Pelajar Pancasila: ${Array.isArray(profilPelajarPancasila) ? profilPelajarPancasila.join(", ") : profilPelajarPancasila}
- Instruksi Tambahan Guru: ${instruksiTambahan || "Gunakan stimulus kontekstual kehidupan sehari-hari, data tabel/grafik jika relevan, dan hindari soal hafalan murni"}

KETENTUAN 6 VARIAN SOAL:
1. "pg": Pilihan Ganda biasa (1 jawaban paling tepat, 4 opsi A-D untuk SD/SMP atau 5 opsi A-E untuk SMA/Olimpiade).
2. "pg_kompleks": Pilihan Ganda Kompleks (peserta didik mencentang beberapa opsi yang benar, misal "Pilihlah dua atau tiga pernyataan yang tepat", kunci berupa "A, C" dsb).
3. "benar_salah": Soal Analisis Benar atau Salah (sajikan stimulus lalu 2-4 pernyataan yang harus ditentukan Benar atau Salah di kolom complexStatements).
4. "menjodohkan": Soal Menjodohkan (sajikan pasangan matchingPairs antara pernyataan di kolom kiri dan definisi/konsep di kolom kanan).
5. "isian": Soal Isian Singkat (pertanyaan langsung dengan jawaban singkat berupa istilah, angka, atau frasa padat).
6. "uraian": Soal Uraian / Esai Penalaran HOTS (pertanyaan terbuka, sediakan kunci dan rubrik penskoran berjenjang).

FORMAT OUTPUT WAJIB JSON MURNI:
Kembalikan JSON array objek valid dengan struktur persis seperti ini:
[
  {
    "number": 1,
    "type": "pg" | "pg_kompleks" | "benar_salah" | "menjodohkan" | "isian" | "uraian",
    "stimulus": "Teks bacaan, konteks masalah, data percobaan, atau narasi situasi (wajib ada untuk HOTS)",
    "prompt": "Pertanyaan inti yang diajukan kepada peserta didik",
    "options": ["A. Opsi satu", "B. Opsi dua", "C. Opsi tiga", "D. Opsi empat"],
    "answerKey": "Kunci jawaban singkat",
    "matchingPairs": [
      {"left": "Pernyataan A", "right": "Pasangan A"},
      {"left": "Pernyataan B", "right": "Pasangan B"}
    ],
    "complexStatements": [
      {"text": "Pernyataan 1 terkait stimulus", "isCorrect": true},
      {"text": "Pernyataan 2 terkait stimulus", "isCorrect": false}
    ],
    "explanation": "Pembahasan komprehensif langkah pengerjaan analitis",
    "cognitiveLevel": "C1" | "C2" | "C3" | "C4" | "C5" | "C6",
    "isHots": true | false,
    "scoreWeight": 2,
    "rubric": "Rubrik penskoran",
    "learningOutcome": "Indikator soal / TP spesifik"
  }
]

HANYA BERIKAN JSON MURNI tanpa markdown pembungkus codeblocks (jangan pakai \`\`\`json atau \`\`\`). Mulai langsung dengan karakter [ dan akhiri dengan ].`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction:
          "Anda adalah asisten AI kurikulum pendidikan Indonesia yang ahli dalam menyusun naskah soal asesmen nasional, Kurikulum Merdeka, dan soal Olimpiade Sains Nasional (OSN). Selalu hasilkan output valid JSON.",
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "[]";
    let parsedQuestions = [];
    try {
      // Clean possible stray markdown
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedQuestions = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", parseErr, rawText);
      return res.status(500).json({
        error: "PARSE_ERROR",
        message: "Gagal memproses format respons AI. Silakan coba lagi.",
        raw: rawText,
      });
    }

    // Ensure IDs and numbering
    const questionsWithIds = parsedQuestions.map((q: any, idx: number) => ({
      ...q,
      id: q.id || `gen-${Date.now()}-${idx + 1}`,
      number: idx + 1,
      scoreWeight: q.scoreWeight || (q.type === "uraian" ? 5 : q.type === "pg_kompleks" ? 3 : 2),
    }));

    res.json({
      success: true,
      questions: questionsWithIds,
      metadata: {
        jenjang,
        fase,
        tingkatKelas,
        mataPelajaran,
        tipeAsesmen,
        materiPokok,
        total: questionsWithIds.length,
      },
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      error: "GENERATION_FAILED",
      message: error?.message || "Terjadi kesalahan saat memproses generator soal.",
    });
  }
});

// API: Export DOCX file for Microsoft Word
app.post("/api/export-docx", async (req, res) => {
  try {
    const { kop, examInfo, questions, options = {} } = req.body;

    const {
      paperSize = "A4", // A4 or F4
      includeAnswerKey = true,
      includeRubric = true,
      includeStimulus = true,
      fontSize = 11,
    } = options;

    // Define dimensions based on paper size
    // A4: 11906 x 16838 twips (8.27 x 11.69 in)
    // F4 / Folio: 12189 x 18709 twips (8.46 x 12.99 in)
    const pageDimensions =
      paperSize === "F4"
        ? { width: 12189, height: 18709 } // 215mm x 330mm
        : { width: 11906, height: 16838 }; // 210mm x 297mm

    const children: any[] = [];

    // 1. KOP SURAT (Letterhead)
    if (kop && kop.showKop !== false) {
      const logoCells: TableCell[] = [];
      const logoSize = kop.logoSizePx || 65;
      const logoWidthTwips = Math.round(logoSize * 15); // approx conversion

      let leftLogoRun: any = null;
      let rightLogoRun: any = null;

      // Helper to convert base64 image data to ImageRun
      const createImageRun = (dataUrl: string, size: number) => {
        try {
          if (!dataUrl || !dataUrl.includes(",")) return null;
          const base64Content = dataUrl.split(",")[1];
          const buffer = Buffer.from(base64Content, "base64");
          const imgType = dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg") ? "jpg" : "png";
          return new ImageRun({
            data: buffer,
            transformation: {
              width: size,
              height: size,
            },
            type: imgType,
          });
        } catch (e) {
          console.warn("Failed to create ImageRun for logo:", e);
          return null;
        }
      };

      if (kop.logoLeft) {
        leftLogoRun = createImageRun(kop.logoLeft, logoSize);
      }
      if (kop.logoRight) {
        rightLogoRun = createImageRun(kop.logoRight, logoSize);
      }

      // If single logo and position is right
      if (kop.logoPosition === "right" && kop.logoLeft && !kop.logoRight) {
        rightLogoRun = leftLogoRun;
        leftLogoRun = null;
      }

      const rowChildren: TableCell[] = [];

      // Left Logo Cell
      if (leftLogoRun && (kop.logoPosition === "left" || kop.logoPosition === "both")) {
        rowChildren.push(
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.DOUBLE, size: 24, color: "000000" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [leftLogoRun],
              }),
            ],
          })
        );
      }

      // Center Text Cell
      const centerWidth = (leftLogoRun ? 0 : 15) + (rightLogoRun ? 0 : 15) + 70;
      rowChildren.push(
        new TableCell({
          width: { size: centerWidth, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.DOUBLE, size: 24, color: "000000" },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: (kop.instansiAtas || "PEMERINTAH DAERAH / YAYASAN PENDIDIKAN").toUpperCase(),
                  font: "Times New Roman",
                  size: 20, // 10pt
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: (kop.dinasPendidikan || "DINAS PENDIDIKAN DAN KEBUDAYAAN").toUpperCase(),
                  font: "Times New Roman",
                  bold: true,
                  size: 22, // 11pt
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: (kop.namaSekolah || "SEKOLAH PENGGERAK KURIKULUM MERDEKA").toUpperCase(),
                  bold: true,
                  font: "Times New Roman",
                  size: 26, // 13pt
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: kop.alamat || "Alamat: Jl. Pendidikan No. 01, Website: www.sekolah.sch.id - Email: info@sekolah.sch.id",
                  italics: true,
                  font: "Times New Roman",
                  size: 16, // 8pt
                }),
              ],
            }),
          ],
        })
      );

      // Right Logo Cell
      if (rightLogoRun && (kop.logoPosition === "right" || kop.logoPosition === "both")) {
        rowChildren.push(
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.DOUBLE, size: 24, color: "000000" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [rightLogoRun],
              }),
            ],
          })
        );
      }

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: rowChildren })],
        })
      );

      // Spacer
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }

    // 2. JUDUL ASESMEN
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 140 },
        children: [
          new TextRun({
            text: (examInfo?.judulAsesmen || "ASESMEN SUMATIF / FORMATIF KURIKULUM MERDEKA").toUpperCase(),
            bold: true,
            underline: {},
            font: "Times New Roman",
            size: 24, // 12pt
          }),
        ],
      })
    );

    // 3. TABEL INFORMASI UJIAN (Mata Pelajaran, Kelas, Hari/Tgl, Waktu)
    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Mata Pelajaran   : ", bold: true, font: "Times New Roman", size: 18 }),
                    new TextRun({ text: examInfo?.mataPelajaran || "-", font: "Times New Roman", size: 18 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Kelas / Fase     : ", bold: true, font: "Times New Roman", size: 18 }),
                    new TextRun({ text: examInfo?.kelasFase || "-", font: "Times New Roman", size: 18 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Hari / Tanggal  : ", bold: true, font: "Times New Roman", size: 18 }),
                    new TextRun({ text: examInfo?.tanggal || "-", font: "Times New Roman", size: 18 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Alokasi Waktu   : ", bold: true, font: "Times New Roman", size: 18 }),
                    new TextRun({ text: examInfo?.waktu || "90 Menit", font: "Times New Roman", size: 18 }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    children.push(infoTable);

    // 4. PETUNJUK UMUM
    if (examInfo?.petunjukUmum) {
      children.push(
        new Paragraph({
          spacing: { before: 140, after: 60 },
          children: [
            new TextRun({
              text: "PETUNJUK UMUM:",
              bold: true,
              font: "Times New Roman",
              size: 18,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: examInfo.petunjukUmum,
              italics: true,
              font: "Times New Roman",
              size: 16,
            }),
          ],
        })
      );
    }

    children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

    // 5. BUTIR-BUTIR SOAL
    if (Array.isArray(questions)) {
      questions.forEach((q: any, idx: number) => {
        const num = q.number || idx + 1;

        // Stimulus jika ada
        if (includeStimulus && q.stimulus) {
          children.push(
            new Paragraph({
              spacing: { before: 120, after: 60 },
              children: [
                new TextRun({
                  text: `[Stimulus untuk Soal No. ${num}]`,
                  bold: true,
                  italics: true,
                  font: "Times New Roman",
                  size: 18,
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: q.stimulus,
                  font: "Times New Roman",
                  size: 20,
                }),
              ],
            })
          );
        }

        // Pertanyaan
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: `${num}. `,
                bold: true,
                font: "Times New Roman",
                size: 22,
              }),
              new TextRun({
                text: q.prompt,
                font: "Times New Roman",
                size: 22,
              }),
            ],
          })
        );

        // Opsi PG jika ada
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          q.options.forEach((opt: string) => {
            children.push(
              new Paragraph({
                indent: { left: 400 },
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: opt,
                    font: "Times New Roman",
                    size: 20,
                  }),
                ],
              })
            );
          });
        }

        // Tipe Benar / Salah atau PG Kompleks Pernyataan
        if (
          (q.type === "pg_kompleks" || q.type === "benar_salah") &&
          q.complexStatements &&
          Array.isArray(q.complexStatements)
        ) {
          const rows = [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Pernyataan", bold: true, size: 18 })] })],
                }),
                new TableCell({
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Benar", bold: true, size: 18 })] })],
                }),
                new TableCell({
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Salah", bold: true, size: 18 })] })],
                }),
              ],
            }),
            ...q.complexStatements.map(
              (st: any) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: st.text, size: 18 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[  ]", size: 18 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[  ]", size: 18 })] })],
                    }),
                  ],
                })
            ),
          ];

          children.push(
            new Table({
              width: { size: 90, type: WidthType.PERCENTAGE },
              rows,
            })
          );
        }

        // Tipe Menjodohkan
        if (q.type === "menjodohkan" && q.matchingPairs && Array.isArray(q.matchingPairs)) {
          const rows = [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Kolom A (Pernyataan)", bold: true, size: 18 })] })],
                }),
                new TableCell({
                  width: { size: 10, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jodoh", bold: true, size: 18 })] })],
                }),
                new TableCell({
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Kolom B (Pasangan)", bold: true, size: 18 })] })],
                }),
              ],
            }),
            ...q.matchingPairs.map(
              (pair: any) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: pair.left, size: 18 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ".......", size: 18 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: pair.right, size: 18 })] })],
                    }),
                  ],
                })
            ),
          ];

          children.push(
            new Table({
              width: { size: 90, type: WidthType.PERCENTAGE },
              rows,
            })
          );
        }

        // Tipe Uraian: berikan ruang kosong pengerjaan
        if (q.type === "uraian") {
          children.push(
            new Paragraph({
              spacing: { before: 80, after: 120 },
              children: [
                new TextRun({
                  text: "Jawaban:\n\n\n\n",
                  italics: true,
                  color: "888888",
                  font: "Times New Roman",
                  size: 16,
                }),
              ],
            })
          );
        }
      });
    }

    // 6. KUNCI JAWABAN & PEMBAHASAN (Lampiran)
    if (includeAnswerKey && Array.isArray(questions)) {
      children.push(
        new Paragraph({
          pageBreakBefore: true,
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 140 },
          children: [
            new TextRun({
              text: "LAMPIRAN: KUNCI JAWABAN & PEMBAHASAN",
              bold: true,
              underline: {},
              font: "Times New Roman",
              size: 24,
            }),
          ],
        })
      );

      questions.forEach((q: any, idx: number) => {
        const num = q.number || idx + 1;
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: `No. ${num} [${(q.type || "").toUpperCase()} | ${q.cognitiveLevel || "C3"} | Bobot: ${q.scoreWeight || 2}]: `,
                bold: true,
                font: "Times New Roman",
                size: 20,
              }),
              new TextRun({
                text: `Kunci: ${q.answerKey || "-"}`,
                bold: true,
                color: "006600",
                font: "Times New Roman",
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 300 },
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `Pembahasan: ${q.explanation || "Sesuai konsep capaian pembelajaran."}`,
                font: "Times New Roman",
                size: 18,
              }),
            ],
          })
        );

        if (includeRubric && q.rubric) {
          children.push(
            new Paragraph({
              indent: { left: 300 },
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: `Rubrik Penilaian: ${q.rubric}`,
                  italics: true,
                  color: "555555",
                  font: "Times New Roman",
                  size: 16,
                }),
              ],
            })
          );
        }
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: pageDimensions,
              margin: {
                top: 1000,
                bottom: 1000,
                left: 1200,
                right: 1200,
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `${examInfo?.mataPelajaran || "Soal Asesmen"} - Kurikulum Merdeka`,
                      italics: true,
                      size: 16,
                      color: "777777",
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: ["Halaman ", PageNumber.CURRENT, " dari ", PageNumber.TOTAL_PAGES],
                      size: 16,
                    }),
                  ],
                }),
              ],
            }),
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Naskah_Soal_${(examInfo?.mataPelajaran || "Kurikulum_Merdeka").replace(/[\s/]/g, "_")}.docx"`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (error: any) {
    console.error("Error creating DOCX:", error);
    res.status(500).json({ error: "DOCX_CREATION_FAILED", message: error.message });
  }
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
