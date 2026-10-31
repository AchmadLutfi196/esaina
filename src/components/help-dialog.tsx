import { Dialog } from "@/components/ui/dialog";
import type { Role } from "@/types";

export function HelpDialog({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
}) {
  const content =
    role === "teacher"
      ? [
          [
            "1. Buat kelas & asesmen",
            "Buka Daftar Kelas untuk membuat kelas, lalu susun asesmen esai dengan kunci jawaban dan poin kunci rubrik.",
          ],
          [
            "2. Bagikan kode asesmen",
            "Setiap asesmen memperoleh kode unik. Siswa memakai kode tersebut untuk bergabung dan mengerjakan esai.",
          ],
          [
            "3. Nilai dengan rubrik",
            "Ruang Penilaian menampilkan esai siswa di samping rubrik. Setiap kriteria dinilai terpisah agar transparan.",
          ],
          [
            "4. Rekomendasi IndoBERT",
            "Skor AI bersifat pendukung. Guru tetap memegang keputusan akhir dan dapat menimpa saran mesin.",
          ],
          [
            "5. Terbitkan nilai",
            "Setelah semua jawaban difinalisasi, nilai dapat diterbitkan agar siswa melihat hasil dan umpan balik.",
          ],
        ]
      : role === "student"
        ? [
            [
              "1. Gabung kelas",
              "Masukkan kode kelas yang dibagikan guru pada halaman Gabung Kelas.",
              "Kode kelas dapat berbeda dari kode asesmen. Jika ragu, tanyakan kepada guru Anda.",
            ],
            [
              "2. Kerjakan esai",
              "Buka asesmen yang tersedia, tulis jawaban pada tiap nomor, dan pantau penghitung kata serta sisa waktu.",
            ],
            [
              "3. Kumpulkan jawaban",
              "Jawaban terkunci setelah dikumpulkan. Pastikan seluruh nomor sudah terisi sebelum menekan tombol kumpulkan.",
            ],
            [
              "4. Lihat hasil",
              "Setelah guru menerbitkan nilai, rincian skor per kriteria dan umpan balik tampil di halaman Hasil & Nilai.",
            ],
          ]
        : [
            [
              "1. Kelola pengguna",
              "Tambahkan akun guru, siswa, atau admin, lalu atur status aktifnya.",
            ],
            [
              "2. Pantau asesmen",
              "Halaman Monitoring merangkum progres penilaian tiap asesmen beserta capaian guru pengampu.",
            ],
            [
              "3. Verifikasi & terbitkan nilai",
              "Pantau penyelesaian penilaian oleh guru pengampu dan verifikasi kesiapan publikasi hasil esai siswa.",
            ],
          ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Panduan Singkat ESAINA"
      description="Alur kerja utama sesuai peran Anda."
      className="max-w-xl"
    >
      <ol className="space-y-3">
        {content.map(([title, body]) => (
          <li key={title} className="rounded-xl border border-line/50 bg-white/70 p-3">
            <p className="text-xs font-bold text-ink">{title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl border border-brand-line/40 bg-brand-tint/60 p-3">
        <p className="text-[11px] font-semibold text-brand">
          Prinsip explainability: setiap perubahan skor tercatat pada jejak audit
          (Grade History) beserta alasan dan penilainya.
        </p>
      </div>
    </Dialog>
  );
}
