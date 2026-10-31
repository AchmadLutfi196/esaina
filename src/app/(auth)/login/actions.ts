"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(
  prevStateOrFormData: FormData | { error?: string } | null | undefined,
  formDataOrUndefined?: FormData
) {
  const formData =
    prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : formDataOrUndefined;

  if (!formData) {
    return { error: "Data formulir tidak ditemukan." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { error: undefined };
  } catch (error: any) {
    // Next.js redirection throws a special error which must not be swallowed
    if (
      error?.message?.includes("NEXT_REDIRECT") ||
      error?.digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau kata sandi tidak sesuai. Periksa kembali." };
        default:
          return { error: "Terjadi kesalahan saat masuk. Silakan coba lagi." };
      }
    }

    return { error: "Email atau kata sandi tidak sesuai." };
  }
}
