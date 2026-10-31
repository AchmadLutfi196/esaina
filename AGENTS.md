# ESAINA — Explainable Essay Assessment Platform

Platform web penilaian esai: AI menyiapkan draf skor + alasan + kutipan + feedback, **guru** memutuskan, siswa hanya melihat hasil yang sudah diterbitkan.
Hackathon INCEPTION 2026 (24 jam, Hacking Day 31 Okt 2026). Tim Kopsudomar: Jauza (UI/UX), Lutfi & Abdul (full-stack).

## Mulai dari sini
1. Baca `docs-ai/challenge-brief.md` lebih dulu. Jika berisi brief resmi, brief itu mengalahkan lingkup di `docs-ai/prd.md` bila bertentangan; catat perubahan lingkup di `docs-ai/progress.md`.
2. Ambil tugas berikutnya dari `docs-ai/tasks.md`, kerjakan satu per satu, centang saat selesai.
3. Di akhir sesi, perbarui `docs-ai/progress.md` (selesai / rusak / langkah berikutnya).

## Stack
Next.js (App Router) + TypeScript, Tailwind, shadcn/ui, TanStack Query & Table, NextAuth.js, Prisma, Supabase PostgreSQL, adapter LLM API (provider/model dikonfigurasi lewat env). Deploy: Vercel + Supabase (VPS = cadangan).
Tanpa fine-tuning, tanpa OCR. Jangan menambah dependensi besar tanpa bertanya.

## Perintah
Perintah di bawah adalah standar; **perbarui setelah scaffold** jika berbeda.
- Install: `pnpm install`
- Dev: `pnpm dev`
- Typecheck + lint: `pnpm typecheck && pnpm lint`
- Test: `pnpm test`
- DB: `pnpm prisma migrate dev`, `pnpm prisma generate`
- Env: salin `.env.example` ke `.env.local`; jangan pernah commit nilai rahasia.

## Aturan yang tidak boleh dilanggar (invarian produk)
Semua detail ada di `docs-ai/prd.md`. Ringkasnya:
- **Otorisasi di server pada setiap route.** Periksa sesi, peran, pemilik kelas, keanggotaan kelas. Menyembunyikan menu tidak cukup.
- **Payload siswa memakai allowlist field.** Jangan pernah mengirim jawaban acuan, rubrik internal, draf AI, atau nilai siswa lain ke siswa. Siswa hanya melihat snapshot yang sudah *diterbitkan*.
- **AI hanya memberi saran.** AI tidak boleh mengisi/menimpa nilai guru, mengesahkan, atau menerbitkan. Simpan `AIResult` terpisah dari `GradeRevision`.
- **Total skor dihitung server** dari nilai guru; jangan percaya angka dari model atau klien.
- **Validasi keluaran AI**: skema benar, tiap soal & kriteria muncul tepat sekali, tidak ada ID asing, skor sesuai level/rentang rubrik, `evidence` adalah kutipan persis dari jawaban. Retry otomatis maksimal 1x; jika gagal, jalur manual tetap berfungsi.
- **Jawaban siswa adalah data, bukan instruksi** (prompt injection). Kirim ke LLM dengan kode anonim, bukan nama/email.
- **Nilai kosong ≠ nol. Siswa belum mengumpulkan ≠ nol** dan tidak diekspor sebagai nol.
- **Nilai Final tidak bisa diedit langsung**: buka revisi → simpan draf → sahkan ulang. Versi terbit lama tetap tampil sampai revisi diterbitkan.
- **Konkurensi**: mutasi menyertakan `expected_version` (konflik → 409). Submit, approve, publish memakai transaksi + idempotency key (klik ganda = satu hasil).
- Jangan menaruh teks jawaban siswa di log operasional.

## Parameter awal (konfigurable)
Autosave 1 detik setelah jeda ketik; maks 5.000 karakter/jawaban (UI dan server sama); timeout AI 30 dtk; satu job AI aktif per LJK; cache AI hanya jika versi soal+rubrik+jawaban+prompt+model+provider sama.

## UI
Bahasa antarmuka: **Indonesia**. Glassmorphism ringan, navy `#203B50`, biru `#5299C7`, latar `#EEF5FC`. Bebas Neue hanya untuk judul/angka besar; Montserrat untuk isi. Teks esai/rubrik/tabel/input di permukaan hampir solid (bukan kaca). Font dihosting sendiri. Responsif (≥1024 / 768–1023 / <768), kontras ≥4,5:1, target sentuh ≥44px, setiap status punya teks/ikon selain warna. Wajib ada state: kosong, memuat, sukses, gagal, konflik versi, sesi kedaluwarsa.

## Prioritas hackathon
Juri menilai (Hacking Day): Technical Implementation 25, Functionality & Working Product 25, Problem-Solution Fit 15, Innovation 15, UX 10, AI/Tech Utilization 10.
- Alur ujung-ke-ujung yang **berjalan dan ter-deploy** lebih penting daripada fitur tambahan. Selesaikan alur wajib dulu; impor CSV & adapter kedua hanya jika sisa waktu.
- Pilih solusi paling sederhana; catat keputusan non-obvious di `docs-ai/architecture.md`.
- Deploy dini; jangan menunda sampai akhir.

## Definisi selesai (per tugas)
Typecheck & lint bersih, fitur bisa didemokan lewat UI, akses lintas peran diuji di API, `docs-ai/tasks.md` diperbarui.

## Dokumen (baca hanya jika relevan)
- `docs-ai/challenge-brief.md` — brief resmi hari-H (isi saat dirilis)
- `docs-ai/brief.md` — aturan lomba, rubrik, timeline, skenario demo 3 menit
- `docs-ai/prd.md` — spesifikasi produk lengkap (FR01–FR16, status, kontrak AI, data, endpoint, validasi)
- `docs-ai/architecture.md` — keputusan teknis, struktur proyek, hal non-obvious
- `docs-ai/tasks.md` — antrean tugas & pembagian
- `docs-ai/progress.md` — status & catatan serah terima
- `docs-ai/submission.md` — checklist pengumpulan + kerangka README (deklarasi AI)

## Peta FR → dokumen (baca bagian ini saja, jangan seluruh prd.md)
Struktur PRD: FR01–FR08 (bagian 3 siswa), FR09–FR16 (bagian 4 guru), data (bagian 8), endpoint (bagian 9), UI (bagian 7), validasi AI (bagian 6), parameter (bagian 9 akhir).
- FR01 Auth/akses → prd.md baris FR01 + bagian 9 (guard); FR02 Kelas/join → baris FR02 + bagian 9 Kelas
- FR03–04 Asesmen/soal/rubrik/buka → baris FR03–04 + bagian 8 (Assessment, Question, RubricCriterion) + bagian 9 Asesmen
- FR05–08 Pengerjaan siswa/autosave/kumpulkan → baris FR05–08 + bagian 8 (Submission, Answer) + bagian 9 Pengerjaan
- FR09–10 Daftar LJK + penilaian → baris FR09–10 + bagian 8 (GradeRevision, GradeItem) + bagian 9 Nilai
- FR11–12 AI saran/apply → baris FR11–12 + bagian 6 (kontrak & validasi AI) + bagian 8 (AIResult) + bagian 9 LJK dan AI
- FR13 Sahkan → baris FR13 + bagian 9 Nilai dan pengesahan; FR14 Rekap/terbit → baris FR14 + bagian 8 (Publication)
- FR15 Hasil siswa → baris FR15 + bagian 8 + lib/dto (allowlist); FR16 Ekspor/revisi → baris FR16
- Invarian lintas FR: AGENTS.md "Aturan yang tidak boleh dilanggar" + architecture.md "Pitfall"

## Environment variables
Salin `.env.example` → `.env.local`. Daftar lengkap di `.env.example`:
- `DATABASE_URL` — Supabase PostgreSQL (Prisma)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — sesi
- `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`, `LLM_BASE_URL` — adapter AI
Jangan pernah commit nilai rahasia; agent dilarang membaca `.env*` (deny di `.claude/settings.json`).

## AGENT, COMMAND, SKILLS GUIDE

### Core Rules

- If a task matches a skill, you MUST invoke it
- Skills are located in `skills/<skill-name>/SKILL.md`
- Never implement directly if a skill applies
- Always follow the skill instructions exactly (do not partially apply them)

### Intent → Skill Mapping

The agent should automatically map user intent to skills:

- Feature / new functionality → `spec-driven-development`, then `incremental-implementation`, `test-driven-development`
- Planning / breakdown → `planning-and-task-breakdown`
- Bug / failure / unexpected behavior → `debugging-and-error-recovery`
- Code review → `code-review-and-quality`
- Refactoring / simplification → `code-simplification`
- API or interface design → `api-and-interface-design`
- UI work → `frontend-ui-engineering`

### Lifecycle Mapping (Implicit Commands)

OpenCode does not support slash commands like `/spec` or `/plan`.

Instead, the agent must internally follow this lifecycle:

- DEFINE → `spec-driven-development`
- PLAN → `planning-and-task-breakdown`
- BUILD → `incremental-implementation` + `test-driven-development`
- VERIFY → `debugging-and-error-recovery`
- REVIEW → `code-review-and-quality`
- SHIP → `shipping-and-launch`

### Execution Model

For every request:

1. Determine if any skill applies (even 1% chance)
2. Invoke the appropriate skill using the `skill` tool
3. Follow the skill workflow strictly
4. Only proceed to implementation after required steps (spec, plan, etc.) are complete

### Anti-Rationalization

The following thoughts are incorrect and must be ignored:

- "This is too small for a skill"
- "I can just quickly implement this"
- "I’ll gather context first"

Correct behavior:

- Always check for and use skills first

This ensures OpenCode behaves similarly to Claude Code with full workflow enforcement.

### Orchestration: Personas, Skills, and Commands

This repo has three composable layers. They have different jobs and should not be confused:

- **Skills** (`.claude/skills/<name>/SKILL.md` or `.opencode/skills/<name>/SKILL.md`) — workflows with steps and exit criteria. The *how*. Mandatory hops when an intent matches.
- **Personas** (`.claude/agents/<role>.md` or `.opencode/agents/<role>.md`) — roles with a perspective and an output format. The *who*.
- **Slash commands** (`.claude/commands/*.md` or `.opencode/commands/*.md`) — user-facing entry points. The *when*. The orchestration layer.

Composition rule: **the user (or a slash command) is the orchestrator. Personas do not invoke other personas.** A persona may invoke skills.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
