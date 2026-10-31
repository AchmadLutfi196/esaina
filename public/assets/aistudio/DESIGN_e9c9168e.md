# DESIGN.md — ESAINA

Spesifikasi visual dan interaksi untuk web MVP ESAINA (Explainable Essay Assessment Platform). Diturunkan dari PRD ESAINA v1.0, bagian 6 dan 7, dengan palet warna terbaru. Bila ada perbedaan, PRD menjadi acuan sampai dokumen ini diberi versi.

## 1. Arah visual

- Glassmorphism ringan dengan Bleu océan sebagai warna utama.
- Latar gradasi biru pucat. Panel kaca hanya untuk navigasi dan ringkasan.
- Jawaban esai, rubrik, tabel nilai, dan input memakai permukaan hampir solid agar teks tetap terbaca.
- Jangan menumpuk lapisan blur atau memberi efek kaca pada setiap elemen.

## 2. Warna

| Token | Nama | Hex | Peran |
| --- | --- | --- | --- |
| `--color-primary` | Bleu océan | `#0A1680` | Teks utama, tombol utama, heading, angka ringkasan |
| `--color-accent` | Bleu ciel | `#93B2F8` | Aksen, gradasi latar, penanda aktif |
| `--color-highlight` | Butter yellow | `#FBEDB0` | Sorotan lembut, latar catatan atau kutipan |
| `--color-warning` | Orange pastel | `#F1B94C` | Aksen, peringatan, status perlu perhatian |
| `--color-surface` | Blanc cassé | `#FCFDFF` | Latar halaman dan permukaan |
| `--color-text-secondary` | (dari PRD awal) | `#52697C` | Teks pendukung |
| `--color-border` | (dari PRD awal) | `#C9D9E8` | Garis dan pemisah |

Warna sukses dan error belum ditetapkan di PRD; tentukan sebelum implementasi status validasi.

### Kontras (terhitung)

| Teks di atas latar | Rasio | Keterangan |
| --- | --- | --- |
| Primary di Surface | 14,3:1 | Lolos |
| Primary di Butter yellow | 12,4:1 | Lolos |
| Primary di Orange pastel | 8,2:1 | Lolos |
| Primary di Bleu ciel | 6,9:1 | Lolos |
| Text secondary di Surface | 5,6:1 | Lolos |
| Surface (putih) di Bleu ciel | 2,07:1 | Gagal, jangan dipakai |
| Surface (putih) di Orange pastel | 1,75:1 | Gagal, jangan dipakai |

Aturan: teks di atas Bleu ciel, Butter yellow, dan Orange pastel selalu Bleu océan. Teks putih hanya di atas Bleu océan. Target PRD: 4,5:1 untuk teks normal dan 3:1 untuk teks besar, diukur pada latar efektif setelah dikomposisi, pada kondisi kaca paling terang dan paling gelap.

### Latar halaman

Gradasi dari Bleu ciel transparan ke Blanc cassé, misalnya `linear-gradient(180deg, rgba(147,178,248,0.25), #FCFDFF)`.

## 3. Tipografi

| Penggunaan | Font | Bobot |
| --- | --- | --- |
| H1, judul bagian, angka ringkasan besar | Bebas Neue | 400 |
| Paragraf, navigasi, tabel, formulir, tombol | Montserrat | 400 / 500 / 600 |
| Teks esai siswa | Montserrat | 400 (tidak memakai Bebas Neue) |

| Gaya | Web | Mobile |
| --- | --- | --- |
| H1 | 40/44 px | 32/36 px |
| H2 | 28/34 px | — |
| Isi | 16/24 px | — |
| Label | 14/20 px | — |
| Tabel | min. 14/20 px | — |
| Teks pendukung | min. 12/18 px | — |

- Font dihosting oleh aplikasi sendiri, `font-display: swap`, fallback `sans-serif`.
- Huruf kapital hanya untuk heading dan teks pendek.

## 4. Bentuk, jarak, gerak

- Skala jarak: 4, 8, 12, 16, 24, 32 px. Jarak antarseksi 32 px.
- Radius: panel 20 px; input dan tombol 10 px.
- Transisi 150–200 ms, hanya `opacity` dan `transform`. Kurangi animasi bila `prefers-reduced-motion`.

## 5. Komponen

### Panel kaca (navigasi, ringkasan)

```css
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.85);
box-shadow: 0 8px 32px rgba(10, 22, 128, 0.08);
border-radius: 20px;
```

Fallback bila blur tidak didukung: latar putih solid. Informasi dan fungsi tetap sama.

### Area kerja (jawaban, rubrik, tabel nilai, input)

- Latar putih dengan opacity minimal 0,96, radius 10 px.
- Tanpa efek kaca.

### Tombol

- Utama: latar Bleu océan, teks Blanc cassé, radius 10 px.
- Target sentuh minimal 44 × 44 px; fokus keyboard terlihat.

### Status

Semua status memakai teks atau ikon, tidak hanya warna.

| Objek | Status |
| --- | --- |
| Asesmen | Draf, Dibuka, Ditutup |
| Pengerjaan | Belum mulai, Draf jawaban, Dikumpulkan |
| Penilaian LJK | Belum dinilai, Draf penilaian, Final |
| Publikasi | Belum diterbitkan, Diterbitkan |
| Penyimpanan | Menyimpan, Tersimpan, Gagal disimpan |

- Label khusus: "Draf AI" untuk saran AI, "Perubahan belum diterbitkan" untuk revisi guru, "Menunggu hasil" untuk siswa.
- Total yang belum final berlabel Draf, bukan ditampilkan seperti nilai final.

### Dialog

- Fokus terkelola, dapat ditutup dengan Escape sebelum aksi dikonfirmasi.
- Dialog pengumpulan menyebut jumlah jawaban kosong dan bahwa LJK akan terkunci.
- Dialog penerbitan menampilkan jumlah LJK yang akan terbit.

### Keadaan antarmuka

Sediakan: kosong, memuat, sukses, gagal, konflik versi, sesi kedaluwarsa. Skeleton hanya mengikuti bentuk konten; jangan menampilkan nilai palsu saat memuat.

## 6. Layar

| Layar | Isi utama |
| --- | --- |
| Masuk dan gabung kelas | Login; siswa mengisi kode kelas; kode salah menampilkan pesan tanpa menghapus isian |
| Guru: daftar kelas | Nama kelas, jumlah anggota, asesmen, tombol buat kelas |
| Guru: detail asesmen | Tab Soal dan rubrik, LJK siswa, Rekap; pembuatan bertahap: informasi → soal dan rubrik → tinjau → buka |
| Guru: penilaian LJK | Sidebar kelas; rail siswa dan nomor soal; pertanyaan di atas; jawaban di kiri; rubrik, skor, feedback di kanan; saran AI dapat diperluas; footer aksi tetap terlihat |
| Guru: rekap | Hitungan belum mengumpulkan, belum dinilai, draf, final; tabel dengan detail, revisi, terbitkan, ekspor |
| Siswa: pengerjaan | Instruksi, navigasi nomor, textarea jawaban, status simpan, sebelumnya/berikutnya; tanpa jawaban acuan |
| Siswa: hasil | Sebelum terbit hanya status menunggu; setelah terbit: total, nilai dan feedback per soal, jawaban sendiri, waktu publikasi |

## 7. Responsif

| Lebar | Perilaku |
| --- | --- |
| Desktop ≥ 1024 px | Dua kolom: jawaban dan penilaian |
| Tablet 768–1023 px | Sidebar dapat dilipat |
| Mobile < 768 px | Susunan vertikal: pertanyaan, jawaban, rubrik, tindakan; pemilih soal tetap mudah diakses |

## 8. Aksesibilitas

- Kontras sesuai bagian 2.
- Label formulir eksplisit; urutan tab mengikuti urutan baca.
- Target sentuh ≥ 44 × 44 px; fokus keyboard terlihat.
- Validasi muncul dekat field yang salah.
- Kegagalan simpan atau kumpul tidak pernah menampilkan status sukses.

## 9. Token siap pakai

```css
:root {
  --color-primary: #0A1680;
  --color-accent: #93B2F8;
  --color-highlight: #FBEDB0;
  --color-warning: #F1B94C;
  --color-surface: #FCFDFF;
  --color-text-secondary: #52697C;
  --color-border: #C9D9E8;

  --font-display: "Bebas Neue", sans-serif;
  --font-body: "Montserrat", sans-serif;

  --radius-panel: 20px;
  --radius-control: 10px;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --motion-fast: 150ms; --motion-base: 200ms;
}
```
