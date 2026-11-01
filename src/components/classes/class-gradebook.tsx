"use client";

import React from "react";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { scoreCellOf } from "@/lib/class-analytics";
import { cn } from "@/lib/utils";
import type { Assessment, StudentSubmission } from "@/types";

export interface GradebookStudent {
  id: string;
  name: string;
  nis: string;
}

export function ClassGradebook({
  students,
  assessments,
  onOpenStudent,
}: {
  students: GradebookStudent[];
  assessments: Assessment[];
  onOpenStudent: (assessment: Assessment, submission: StudentSubmission) => void;
}) {
  const scoredAssessments = assessments.filter((assessment) =>
    assessment.submissions.some((submission) => submission.statusWork === "submitted")
  );

  function averageFor(studentId: string): number | null {
    const percents = scoredAssessments
      .map((assessment) => {
        const submission = assessment.submissions.find((s) => s.studentId === studentId);
        const cell = scoreCellOf(submission, assessment);
        return cell.percent;
      })
      .filter((value): value is number => typeof value === "number");

    if (percents.length === 0) return null;
    return Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
  }

  return (
    <section
      aria-labelledby="buku-nilai-heading"
      className="glass-panel space-y-3 p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            id="buku-nilai-heading"
            className="text-sm font-bold uppercase tracking-wider text-brand"
          >
            Buku Nilai Kelas
          </h3>
          <p className="text-xs text-muted">
            Klik nilai siswa untuk membuka input rubrik &amp; skor.
          </p>
        </div>
        <span className="rounded-full border border-line bg-white/80 px-2.5 py-1 text-[10px] font-bold text-brand">
          {students.length} siswa · {scoredAssessments.length} asesmen bernilai
        </span>
      </header>

      <div className="overflow-x-auto rounded-xl border border-line bg-white/85">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">
            Rekap nilai seluruh siswa pada setiap asesmen kelas
          </caption>
          <thead>
            <tr className="border-b border-line bg-paper text-brand">
              <th scope="col" className="px-4 py-3 font-bold">
                Nama Siswa
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                NISN
              </th>
              {assessments.map((assessment, index) => (
                <th key={assessment.id} scope="col" className="px-4 py-3 font-bold">
                  <span className="block">Tugas #{index + 1}</span>
                  <span className="font-mono text-[10px] font-normal text-muted">
                    {assessment.code}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-4 py-3 font-bold">
                Rerata
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {students.map((student) => {
              const average = averageFor(student.id);
              return (
                <tr key={student.id} className="hover:bg-paper/60">
                  <th scope="row" className="px-4 py-3 text-left font-bold text-brand">
                    {student.name}
                  </th>
                  <td className="px-4 py-3 font-mono text-muted">{student.nis}</td>
                  {assessments.map((assessment) => {
                    const submission = assessment.submissions.find(
                      (s) => s.studentId === student.id
                    );
                    const cell = scoreCellOf(submission, assessment);

                    if (!submission || cell.state === "not_submitted") {
                      return (
                        <td key={assessment.id} className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] italic text-muted">
                            <ClipboardList className="h-3 w-3" aria-hidden />
                            Belum kumpul
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={assessment.id} className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onOpenStudent(assessment, submission)}
                          className={cn(
                            "nums inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 font-bold transition-colors",
                            cell.state === "final"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                              : cell.state === "draft"
                                ? "border-accent bg-butter-yellow/60 text-brand hover:bg-butter-yellow"
                                : "border-line bg-paper text-brand hover:bg-butter-yellow/50"
                          )}
                          aria-label={`${student.name} pada ${assessment.title}: ${
                            cell.percent === null ? "belum dinilai" : `${cell.percent} dari 100`
                          }. Buka input skor.`}
                        >
                          {cell.percent === null ? "Beri nilai" : `${cell.percent}/100`}
                          <ArrowUpRight className="h-3 w-3" aria-hidden />
                        </button>
                      </td>
                    );
                  })}
                  <td className="nums px-4 py-3 font-extrabold text-brand">
                    {average === null ? "—" : `${average}/100`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted">
        Legenda: hijau = nilai final, kuning = draf penilaian, abu = belum dinilai. Nilai kosong
        tidak dihitung sebagai nol.
      </p>
    </section>
  );
}
