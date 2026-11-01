import { randomInt } from "node:crypto";

// Tanpa karakter ambigu (0/O, 1/I/L) agar mudah dibacakan guru ke siswa.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateJoinCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** Coba beberapa kali sampai kode unik; gagal -> lempar agar route memetakan 500. */
export async function uniqueJoinCode(exists: (code: string) => Promise<boolean>): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateJoinCode();
    if (!(await exists(code))) return code;
  }
  throw new Error("Tidak dapat membuat kode kelas unik.");
}
