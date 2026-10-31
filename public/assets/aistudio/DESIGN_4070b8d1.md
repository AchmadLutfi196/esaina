# Design System — LMS Penilaian Esai Multi-Rater

> Dokumen ini mendokumentasikan tataletak (layout), tipografi, palet warna,
> komponen UI, dan pola spacing yang digunakan di seluruh antarmuka LMS.
> Digunakan sebagai referensi pengembangan dan konsistensi desain.


---

## 1. Tipografi

### Font Stack

| Peran            | Font Family       | Fallback                                        |
|------------------|-------------------|-------------------------------------------------|
| **Heading**      | Bebas Neue        | ui-sans-serif, system-ui, sans-serif            |
| **Body / UI**    | Montserrat        | ui-sans-serif, system-ui, sans-serif            |
| **Kode / Mono**  | JetBrains Mono    | ui-monospace, monospace                         |

- Bebas Neue dipakai untuk semua heading (h1–h4) dan elemen hero/display.
- Montserrat dipakai untuk body text, label, paragraf, tombol, dan navigasi.
- Kode asesmen dan angka tabular memakai font monospace.

### Skala Ukuran

| Token              | Ukuran   | Line Height | Penggunaan                              |
|--------------------|----------|-------------|-----------------------------------------|
| `text-3xl`         | 30px     | 36px        | Hero heading, angka metrik besar        |
| `text-2xl`         | 24px     | 32px        | Judul halaman (h1), tanggal kalender    |
| `text-base`        | 16px     | 24px        | Heading seksi (h2), sub-judul           |
| `text-sm`          | 14px     | 20px        | Paragraf hero, nama asesmen             |
| `text-xs`          | 12px     | 16px        | Body utama, label, tombol, deskripsi    |
| `text-[11px]`      | 11px     | 16px        | Caption, meta info, sublabel            |
| `text-[10px]`      | 10px     | 14px        | Badge status (uppercase tracking-wider) |

### Bobot Huruf

| Kelas            | Nilai  | Penggunaan                                   |
|------------------|--------|----------------------------------------------|
| `font-extrabold` | 800    | Angka metrik, hero heading, judul halaman    |
| `font-bold`      | 700    | Heading seksi, nama user, item aktif sidebar |
| `font-semibold`  | 600    | Label form, badge peran, link navigasi       |
| `font-medium`    | 500    | Teks sekunder, deskripsi pendek              |
| `font-normal`    | 400    | Body paragraf, placeholder                   |

### Sifat Tambahan

- `tracking-tight` pada heading dan angka besar
- `tracking-wider` + `uppercase` pada label badge dan header tabel
- `font-variant-numeric: tabular-nums` (kelas `.nums`) pada tabel & skor
- `overflow-wrap: anywhere` pada semua heading (h1–h4)
- `antialiased` pada `<body>`


---

## 2. Palet Warna

### Warna Inti

| Token               | Hex       | Rasio WCAG | Peran                                    |
|----------------------|-----------|------------|------------------------------------------|
| `paper`              | `#F7F6F2` | —          | Latar belakang utama halaman             |
| `surface`            | `#FFFFFF` | —          | Latar kartu, sidebar, input              |
| `forest`             | `#1E3A2F` | —          | Sidebar brand, hero bg, avatar           |
| `forest-dark`        | `#152A22` | —          | Hover tombol gelap                       |
| `mist`               | `#CFE3DE` | —          | Teks sekunder di atas forest             |
| `ink`                | `#101828` | 16.75:1    | Teks utama (heading, judul, nama)        |
| `ink-2`              | `#334155` | 10.35:1    | Teks sekunder gelap (email, nilai)       |

### Warna Brand

| Token               | Hex       | Rasio WCAG | Peran                                    |
|----------------------|-----------|------------|------------------------------------------|
| `brand`              | `#006B61` | 6.41:1     | Tombol utama, link, fokus                |
| `brand-dark`         | `#00544C` | 8.85:1     | Hover tombol, ring fokus                 |
| `brand-tint`         | `#E6F7F5` | —          | Latar badge, latar tint brand            |
| `brand-line`         | `#289B8D` | 3.41:1     | Border badge, garis non-teks             |

### Warna Aksen

| Token               | Hex       | Rasio WCAG | Peran                                    |
|----------------------|-----------|------------|------------------------------------------|
| `accent`             | `#D43E01` | 4.68:1     | CTA sekunder, indikator aktif sidebar    |
| `accent-dark`        | `#B23301` | 6.24:1     | Hover aksen                              |
| `accent-tint`        | `#FFF0E8` | —          | Latar badge siswa/item aktif             |
| `accent-ink`         | `#9A2D00` | 6.87:1     | Teks di atas accent-tint                 |

### Warna Utilitas

| Token               | Hex       | Rasio WCAG | Peran                                    |
|----------------------|-----------|------------|------------------------------------------|
| `muted`              | `#5C6F8A` | 5.13:1     | Teks deskripsi, placeholder              |
| `line`               | `#7A9288` | 3.34:1     | Border kartu, separator                  |
| `line-2`             | `#7B8EA8` | 3.35:1     | Border input, tombol ikon                |
| `sage-dark`          | `#5F7E61` | 4.52:1     | Latar mini-kalender pekan                |

### Warna Kartu Metrik (Tint + Ink)

| Hue     | Background    | Ink (Teks)  | Rasio  | Dipakai di                     |
|---------|---------------|-------------|--------|--------------------------------|
| Teal    | `#E6F7F5`     | `#00544C`   | 8.00:1 | Total asesmen, asesmen diikuti |
| Blue    | `#E7EFFB`     | `#0B3E7F`   | 9.02:1 | Progres, sedang dikerjakan     |
| Amber   | `#FDF2E0`     | `#7A4C05`   | 6.62:1 | Terkumpul, tenggat             |
| Plum    | `#F0EAFE`     | `#4C1D95`   | 9.34:1 | Tugas penilaian, selesai       |


---

## 3. Tataletak (Layout)

### 3.1 Struktur Utama (Authenticated)

```
┌──────────────────────────────────────────────────────────┐
│ <body>  bg-paper  min-h-screen  font-sans  antialiased  │
│                                                          │
│  ┌────────┬─────────────────────────────────────────┐    │
│  │SIDEBAR │              CONTENT AREA               │    │
│  │        │                                         │    │
│  │ w-16   │  ┌─────────────────────────────────┐    │    │
│  │ sm:w-20│  │ HEADER                          │    │    │
│  │ lg:w-60│  │ px-4 sm:px-6  pt-6 pb-6         │    │    │
│  │        │  │ flex-col md:flex-row              │    │    │
│  │ border-│  │                                   │    │    │
│  │ r      │  │ [Sapaan+Nama+Badge] [Search+Exit] │    │    │
│  │        │  └─────────────────────────────────┘    │    │
│  │ flex   │                                         │    │
│  │ col    │  ┌─────────────────────────────────┐    │    │
│  │        │  │ MAIN                            │    │    │
│  │ items- │  │ flex-1  space-y-5               │    │    │
│  │ center │  │ px-4 sm:px-6  pb-6              │    │    │
│  │        │  │                                 │    │    │
│  │ py-5   │  │ [Alerts]                        │    │    │
│  │        │  │ [@yield('content')]              │    │    │
│  │        │  │                                 │    │    │
│  │        │  └─────────────────────────────────┘    │    │
│  └────────┴─────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar

```
┌──────────────┐
│    Logo      │  h-11 w-11 rounded-2xl bg-forest
│  (Ikon 2x2)  │  shadow-md
│              │
├──────────────┤
│              │
│  Nav Item 1  │  h-11 w-11 lg:w-full
│  ──────────  │  rounded-lg
│  Nav Item 2  │  gap-3  px-3 (lg)
│  ──────────  │
│  Nav Item 3  │  Aktif: bg-accent-tint text-accent-ink
│  ──────────  │        + bar kiri accent (h-6 w-1.5)
│  Nav Item 4  │  Idle:  text-muted hover:bg-surface
│              │
├──────────────┤
│              │
│  ? Panduan   │  h-10 w-10 rounded-2xl
│              │
│  [IN] Avatar │  h-9 w-9 rounded-full
│              │  bg-forest border-2 border-white
└──────────────┘

Label teks sidebar: hidden (mobile), block (lg:)
Ikon selalu tampil: h-5 w-5
Indikator aktif: span absolute left-0
```

### 3.3 Header

```
┌─────────────────────────────────────────────────────────┐
│ flex  flex-col md:flex-row  justify-between  gap-4      │
│ px-4 sm:px-6  pt-6 pb-6                                │
│                                                          │
│  ┌──────────────────────┐    ┌────────────────────────┐  │
│  │ "Selamat datang,"    │    │ [🔍 Cari asesmen...]   │  │
│  │ Nama User  [Badge]   │    │  sm:w-64 rounded-lg    │  │
│  │ "Subheading..."      │    │                        │  │
│  │ Heading (opsional)   │    │ [⊗ Keluar]             │  │
│  └──────────────────────┘    │  h-9 w-9 rounded-lg    │  │
│                               └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Sapaan:    text-xs  font-medium  text-muted
Nama:      text-2xl font-bold  tracking-tight text-ink
Badge:     rounded-full border px-2.5 py-0.5
           text-[11px] font-semibold
Subhead:   text-xs text-muted
Heading:   text-base font-bold text-ink (mt-3)
```

### 3.4 Layout Dasbor (12-Kolom)

```
grid grid-cols-1 xl:grid-cols-12  items-start  gap-6

┌─────────────────────────────────┬──────────────────┐
│         KOLOM UTAMA             │   KOLOM KANAN    │
│         xl:col-span-8           │   xl:col-span-4  │
│                                 │                  │
│  ┌───────────────────────────┐  │  ┌────────────┐  │
│  │ HERO BANNER               │  │  │ KALENDER   │  │
│  │ bg-forest rounded-xl      │  │  │ PEKAN      │  │
│  │ p-6 sm:p-7                │  │  │            │  │
│  │ flex-col sm:flex-row      │  │  │ Tanggal    │  │
│  │                           │  │  │ Mini-cal   │  │
│  │ [Heading+CTA] [Clay 3D]  │  │  │ CTA        │  │
│  └───────────────────────────┘  │  └────────────┘  │
│                                 │                  │
│  ┌──┬──┬──┬──┐ KARTU METRIK    │  ┌────────────┐  │
│  │  │  │  │  │ grid 1→2→4 col  │  │ TENGGAT    │  │
│  │  │  │  │  │ gap-4            │  │ TERDEKAT   │  │
│  └──┴──┴──┴──┘                  │  │            │  │
│                                 │  │ List item  │  │
│  ┌─────────────────────────┐    │  │ List item  │  │
│  │ DAFTAR ASESMEN          │    │  │ List item  │  │
│  │ Heading + badge + "→"   │    │  └────────────┘  │
│  │                         │    │                  │
│  │ ┌─────┬─────┬─────┐    │    │                  │
│  │ │Card │Card │Card │    │    │                  │
│  │ │1    │2    │3    │    │    │                  │
│  │ └─────┴─────┴─────┘    │    │                  │
│  │ grid 1→3 col  gap-4    │    │                  │
│  └─────────────────────────┘    │                  │
│                                 │                  │
│  ┌─────────────────────────┐    │                  │
│  │ DAFTAR/TABEL TAMBAHAN   │    │                  │
│  │ (x-card component)      │    │                  │
│  └─────────────────────────┘    │                  │
└─────────────────────────────────┴──────────────────┘
```

### 3.5 Layout Login (Unauthenticated)

```
Tidak ada sidebar — full-screen centered.

┌──────────────────────────────────────────────────┐
│ flex min-h-screen items-center justify-center    │
│ p-4 sm:p-6  bg-paper                             │
│                                                    │
│  ┌────────────────────────────────────────┐        │
│  │ max-w-4xl  rounded-2xl  border         │        │
│  │ flex-col md:flex-row  overflow-hidden   │        │
│  │                                        │        │
│  │  ┌──────────┬─────────────────────┐    │        │
│  │  │ BRANDING │    FORM AREA        │    │        │
│  │  │ md:w-5/12│    md:w-7/12        │    │        │
│  │  │          │                     │    │        │
│  │  │ bg-forest│  Badge "Masuk"      │    │        │
│  │  │ p-8      │  Judul              │    │        │
│  │  │ sm:p-10  │  Deskripsi          │    │        │
│  │  │          │                     │    │        │
│  │  │ Logo     │  [Demo 1][Demo 2]   │    │        │
│  │  │ Heading  │  [Demo 3]           │    │        │
│  │  │ Desc     │  grid 1→3 col       │    │        │
│  │  │          │                     │    │        │
│  │  │ Clay 3D  │  [Email input]      │    │        │
│  │  │          │  [Password input]   │    │        │
│  │  │ Footer   │  [Submit button]    │    │        │
│  │  │          │  Footer text        │    │        │
│  │  └──────────┴─────────────────────┘    │        │
│  └────────────────────────────────────────┘        │
│                                                    │
└──────────────────────────────────────────────────┘
```

### 3.6 Layout Form (Buat Asesmen)

```
space-y-5 (gap vertikal antar seksi)

┌─────────────────────────────────────────┐
│ x-card "Informasi Asesmen"              │
│ rounded-xl border p-5                   │
│                                         │
│  grid gap-4 sm:grid-cols-2              │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Judul (col-span-2)              │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────┬───────────────┐       │
│  │ Mata Pelajar │ Kelas         │       │
│  └──────────────┴───────────────┘       │
│  ┌──────────────────────────────────┐   │
│  │ Deskripsi (col-span-2)          │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────┬───────────────┐       │
│  │ Durasi       │ Batas Waktu   │       │
│  └──────────────┴───────────────┘       │
│  ┌──────────────┐                       │
│  │ Jml Penilai  │                       │
│  └──────────────┘                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ x-card "Soal Esai"  [+ Tambah Soal]    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Soal 1  rounded-2xl border p-4   │  │
│  │                                   │  │
│  │ [Pertanyaan textarea]             │  │
│  │ [Kunci Jawaban textarea]          │  │
│  │ ┌──────────────────┬──────────┐   │  │
│  │ │ Poin Kunci (2/3) │ Skor (1) │   │  │
│  │ │ sm:col-span-2    │          │   │  │
│  │ └──────────────────┴──────────┘   │  │
│  └───────────────────────────────────┘  │
│  (repeat per soal, Alpine x-for)        │
└─────────────────────────────────────────┘

┌──────────────────────┐
│ [Simpan]  [Batal]    │
│ flex gap-2           │
└──────────────────────┘
```


---

## 4. Komponen

### 4.1 x-card

```
Kontainer seksi generik.
Props: title (opsional), actions slot (opsional).

┌────────────────────────────────────────┐
│ rounded-xl  border border-line/30      │
│ bg-surface  p-5                        │
│                                        │
│  ┌──────────────┬──────────────────┐   │
│  │ Title (h3)   │ Actions slot     │   │
│  │ text-sm bold │ flex gap-2       │   │
│  └──────────────┴──────────────────┘   │
│  mb-4 (jika title/actions ada)         │
│                                        │
│  {{ $slot }}                           │
└────────────────────────────────────────┘
```

### 4.2 x-stat

```
Kartu statistik sederhana.
Props: label, value.

┌──────────────────────┐
│ rounded-xl border    │
│ border-line/30       │
│ bg-surface p-5       │
│                      │
│ Label  text-xs muted │
│ Value  text-2xl      │
│        font-extrabold│
│        text-brand    │
│        .nums         │
└──────────────────────┘
```

### 4.3 x-badge

```
Lencana status inline.
Props: status (string).

┌─────────────┐
│ rounded-full│  inline-block
│ border      │  px-2.5 py-1
│ text-[10px] │  font-bold uppercase
│ tracking-   │  tracking-wider
│ wider       │
└─────────────┘

Tone per status:
  draft          → slate-100/700/400
  active         → brand-tint/dark/line
  completed      → emerald-50/800/500
  submitted      → amber-50/800/500
  grading_*      → indigo-50/800/400
  waiting_raters → amber-50/800/500
  ready_*        → indigo-50/800/400
  unavailable    → rose-50/800/400
  inactive       → rose-50/800/400
```

### 4.4 x-alerts

```
Pesan sukses & error. Semantik ARIA.

Sukses:
  role="status"  aria-live="polite"
  rounded-2xl border-brand-line/70
  bg-brand-tint  text-brand-dark
  px-4 py-3  text-xs font-semibold

Error:
  role="alert"  aria-live="assertive"
  rounded-2xl border-rose-400
  bg-rose-50  text-rose-800
  px-4 py-3  text-xs font-semibold
  <ul> dengan space-y-1
```

### 4.5 Kartu Metrik Dashboard

```
┌───────────────────────────┐
│ rounded-xl border         │
│ bg-metric-{hue}-bg        │
│ text-metric-{hue}-ink     │
│ p-5 shadow-sm             │
│                           │
│ [Icon] Label  text-xs     │
│               font-semi   │
│                           │
│ Angka   text-3xl          │
│         font-extrabold    │
│         .nums             │
│                           │
│ Keterangan  text-xs       │
│             font-medium   │
└───────────────────────────┘

4 hue: teal, blue, amber, plum
Setiap kartu punya ikon + label teks unik
(warna bukan satu-satunya pembeda — SC 1.4.1)
```

### 4.6 Hero Banner

```
┌──────────────────────────────────────────────┐
│ rounded-xl  bg-forest  text-white            │
│ p-6 sm:p-7  overflow-hidden                  │
│ flex-col sm:flex-row  shadow-md              │
│                                              │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ max-w-md         │  │ Clay 3D SVG     │   │
│  │                  │  │ h-28 w-36       │   │
│  │ Heading 2xl/3xl  │  │ hidden sm:block │   │
│  │ font-bold        │  │                 │   │
│  │ tracking-tight   │  └──────────────────┘   │
│  │                  │                        │
│  │ Desc text-sm     │                        │
│  │ text-mist        │                        │
│  │                  │                        │
│  │ [CTA Button]     │                        │
│  │ rounded-full     │                        │
│  │ bg-white         │                        │
│  │ text-forest      │                        │
│  └─────────────────┘                         │
└──────────────────────────────────────────────┘
```

### 4.7 Kartu Asesmen

```
┌─────────────────────────────┐
│ rounded-xl border-line/30   │
│ bg-surface p-5 shadow-xs    │
│ hover:border-brand          │
│ flex flex-col justify-between│
│ space-y-3                   │
│                             │
│  [Kode] [Badge Status]     │
│  Judul  text-sm font-bold  │
│  Meta   text-xs text-muted │
│                             │
│  [Clay 3D Illustration]    │
│  h-24 w-28 centered        │
│                             │
│  [Progress bar / Info]     │
│  [CTA Button]              │
│  rounded-xl bg-brand       │
│  text-xs font-bold white   │
└─────────────────────────────┘
```


---

## 5. Spacing & Radius

### Spacing Scale

| Ukuran    | Nilai | Penggunaan                                     |
|-----------|-------|------------------------------------------------|
| `gap-2`   | 8px   | Antar item inline, grid demo login             |
| `gap-3`   | 12px  | Antar nav item sidebar, antar badge & nama     |
| `gap-4`   | 16px  | Grid kartu metrik, grid form                   |
| `gap-5`   | 20px  | Antar seksi utama (space-y-5)                  |
| `gap-6`   | 24px  | Antar blok besar, kolom utama ↔ kanan          |
| `p-3`     | 12px  | Padding kartu kecil, list item                 |
| `p-4`     | 16px  | Padding soal, sub-card                         |
| `p-5`     | 20px  | Padding kartu utama (x-card, metrik, stat)     |
| `p-6`     | 24px  | Padding hero, sidebar area, kolom kanan        |
| `p-8`     | 32px  | Padding branding login, modal profil           |
| `p-10`    | 40px  | Padding form login, empty state                |

### Border Radius

| Kelas         | Nilai | Penggunaan                                    |
|---------------|-------|-----------------------------------------------|
| `rounded-full`| 9999px| Badge, avatar, pill button, kalender          |
| `rounded-2xl` | 16px  | Logo, modal, sub-card soal, tombol panduan    |
| `rounded-xl`  | 12px  | Kartu utama, input, tombol aksi, hero banner  |
| `rounded-lg`  | 8px   | Nav item sidebar, tombol ikon keluar          |
| `rounded-md`  | 6px   | Badge kode asesmen                            |


---

## 6. Interaksi & State

### Focus Visible

```css
:where(a, button, input, select, textarea):focus-visible {
    outline: 2px solid var(--color-brand-dark);  /* #00544C */
    outline-offset: 3px;
}
```
Semua elemen interaktif mendapat ring brand-dark saat fokus keyboard.

### Hover States

| Elemen               | Normal                  | Hover                         |
|----------------------|-------------------------|-------------------------------|
| Tombol brand         | `bg-brand`              | `bg-brand-dark`               |
| Tombol accent        | `bg-accent`             | `bg-accent-dark`              |
| Tombol forest        | `bg-forest`             | `bg-forest-dark`              |
| Tombol ghost         | `bg-surface`            | `bg-white` / `bg-slate-50`    |
| Kartu asesmen        | `border-line/30`        | `border-brand`                |
| Link navigasi        | `text-muted`            | `text-ink`                    |
| Tombol keluar        | `text-slate-600`        | `text-red-600`                |

### Selection

```
selection:bg-brand selection:text-white
```
Teks yang diseleksi memakai warna brand hijau dengan teks putih.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```


---

## 7. Modal & Overlay

### Pola Modal (Panduan / Profil)

```
┌──────────────────────────────────────────────┐
│ BACKDROP                                     │
│ fixed inset-0 z-50                           │
│ bg-slate-900/40 backdrop-blur-xs             │
│ flex items-center justify-center p-4         │
│                                              │
│    ┌────────────────────────────────┐         │
│    │ KONTEN MODAL                  │         │
│    │ max-w-lg (panduan)            │         │
│    │ max-w-sm (profil)             │         │
│    │ rounded-xl border border-white│         │
│    │ bg-white shadow-2xl           │         │
│    │ p-6 sm:p-8                    │         │
│    │                               │         │
│    │ [Header + Close btn]          │         │
│    │ [Content]                     │         │
│    │ [Footer button]              │         │
│    └────────────────────────────────┘         │
│                                              │
│  Alpine.js:                                  │
│  x-show, x-cloak, x-transition.opacity       │
│  x-on:click.outside → tutup                  │
│  x-on:keydown.escape.window → tutup          │
└──────────────────────────────────────────────┘
```

Tombol tutup modal:
  h-8 w-8 rounded-full bg-slate-100
  text-ink-2 hover:bg-slate-200


---

## 8. Tabel Data

```
┌─────────────────────────────────────────────────┐
│ x-card wrapper                                  │
│                                                 │
│  <table class="nums w-full text-left text-xs">  │
│                                                 │
│  ┌─────┬─────┬─────┬──────┬──────┐             │
│  │ th  │ th  │ th  │ th   │ th   │  thead      │
│  │ text-[11px] uppercase          │  text-muted │
│  │ tracking-wider                 │  py-2 pr-3  │
│  ├─────┼─────┼─────┼──────┼──────┤             │
│  │ td  │ td  │ td  │ td   │ td   │  tbody      │
│  │ py-2.5 pr-3                    │  text-xs    │
│  │ border-t border-line/25        │             │
│  ├─────┼─────┼─────┼──────┼──────┤             │
│  │ ... │ ... │ ... │ ...  │ ...  │             │
│  └─────┴─────┴─────┴──────┴──────┘             │
│                                                 │
│  overflow-x-auto (horizontal scroll mobile)     │
└─────────────────────────────────────────────────┘
```


---

## 9. Form Input

### Input Text / Email / Number / Datetime

```
┌────────────────────────────────────────────┐
│ space-y-1.5                                │
│                                            │
│ <label>                                    │
│   text-xs font-semibold text-ink-2         │
│   Wajib: <span class="text-rose-600">*    │
│                                            │
│ <div class="relative">                     │
│   [Icon kiri]  absolute left-3.5           │
│                top-1/2 -translate-y-1/2    │
│                h-4 w-4 text-muted          │
│                                            │
│   <input>                                  │
│     rounded-xl border-line-2               │
│     bg-white py-2.5 pl-10 pr-4             │
│     text-base font-medium text-ink         │
│     shadow-xs                              │
│     focus: border-brand ring-2             │
│            ring-brand-dark outline-none    │
│ </div>                                     │
└────────────────────────────────────────────┘
```

### Textarea

```
rounded-xl border-line-2  px-3 py-2.5
text-xs  (form asesmen)
Focus sama dengan input biasa.
```

### Search Input (Header)

```
rounded-lg border-line-2  bg-surface
py-2 pl-9 pr-4  text-xs
Ikon search absolute left-3.5
```


---

## 10. Tombol

### Hierarki Tombol

| Varian        | Kelas                                                        | Penggunaan               |
|---------------|--------------------------------------------------------------|--------------------------|
| Primary       | `bg-brand text-white rounded-xl px-4 py-2.5`                | Simpan, submit utama     |
| Primary Pill  | `bg-forest text-white rounded-full px-5 py-2.5`             | CTA hero, gabung kode    |
| Accent        | `bg-accent text-white rounded-xl px-4 py-2.5 shadow-md`     | CTA admin (Kelola User)  |
| Ghost/Glass   | `border-white/20 bg-white/15 text-white backdrop-blur-md`    | Tombol sekunder di hero  |
| Secondary     | `bg-slate-100 text-slate-600 rounded-xl px-4 py-2.5`        | Batal, aksi minor        |
| Danger (icon) | `border-line-2 bg-surface text-slate-600 hover:text-red-600` | Tombol keluar             |

Semua tombol: `cursor-pointer transition-colors text-xs font-bold`


---

## 11. Responsivitas

| Breakpoint | Lebar    | Perubahan                                           |
|------------|----------|-----------------------------------------------------|
| Default    | < 640px  | 1 kolom, sidebar rail 64px, hero stacked            |
| `sm`       | ≥ 640px  | Sidebar 80px, hero flex-row, form 2-col             |
| `md`       | ≥ 768px  | Header flex-row, kartu asesmen 3-col                |
| `lg`       | ≥ 1024px | Sidebar 240px + label teks, metrik 4-col            |
| `xl`       | ≥ 1280px | Dashboard grid 12-col (8+4 split)                   |

### Perilaku Sidebar per Breakpoint

```
< sm   → w-16   ikon saja, tanpa label
sm     → w-20   ikon saja, tanpa label
lg     → w-60   ikon + label teks (text-sm)
```


---

## 12. Aksesibilitas (WCAG 2.2 AA)

- Semua warna teks terverifikasi ≥ 4.5:1 (SC 1.4.3)
- Elemen non-teks (border, ikon fungsional) ≥ 3.0:1 (SC 1.4.11)
- Warna tidak pernah satu-satunya pembeda makna (SC 1.4.1)
- Focus-visible ring pada semua interaktif (SC 2.4.7)
- aria-label pada tombol ikon dan navigasi
- aria-current="page" pada nav item aktif
- aria-live pada alert sukses/error (SC 4.1.3)
- Reduced motion dihormati (WCAG 2.3.3)
- Heading overflow-wrap: anywhere (mencegah overflow horizontal)


---

## 13. Ikon

Semua ikon menggunakan komponen `<x-icon>` (Blade) dengan library
Lucide Icons. Ukuran standar:

| Konteks               | Ukuran      |
|------------------------|-------------|
| Nav sidebar            | `h-5 w-5`  |
| Tombol ikon kecil      | `h-4 w-4`  |
| Badge inline           | `h-3 w-3`  |
| Empty state            | `h-6 w-6`  |
| Empty state besar      | `h-7 w-7`  |

Ikon selalu diberi `aria-hidden="true"` (kecuali
jika satu-satunya konten — maka aria-label di parent).


---

## 14. Ilustrasi 3D (Clay)

Komponen `<x-clay>` menghasilkan SVG ilustrasi gaya clay 3D.
Varian yang tersedia:

| Variant     | Penggunaan                        | Ukuran Tipikal   |
|-------------|-----------------------------------|------------------|
| `hero`      | Banner hero login & dashboard     | h-28 w-36 / h-36 w-48 |
| `essay`     | Kartu asesmen (soal)              | h-24 w-28        |
| `rating`    | Kartu asesmen (penilaian)         | h-24 w-28        |
| `consensus` | Kartu asesmen (konsensus)         | h-24 w-28        |

Ditempatkan di tengah kartu atau di sisi kanan hero.
Pada mobile (`< sm`), hero clay di-hidden.
