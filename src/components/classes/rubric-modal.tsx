"use client";

import React from "react";
import { ChevronRight, ListChecks, Users } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GRADING_STATUS_LABEL } from "@/types";
import { maxScoreOf, scoreCellOf } from "@/lib/class-analytics";
import { cn } from "@/lib/utils";
import type { Assessment, StudentSubmission } from "@/types";

export function RubricModal({
  open,
  onClose,
  assessment,
  onGradeStudent,
}: {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  onGradeStudent: (submission: StudentSubmission) => void;
}) {
  if (!open || !assessment) return null;

  const maxTotal = maxScoreOf(assessment);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Rubrik & Skor — ${assessment.title}`}
      description={`${assessment.className ?? "Kelas"} · ${assessment.questions.length} soal · total ${maxTotal} poin`}
      className="max-h-[90vh] max-w-4xl overflow-y-auto"
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {assessment.questions.map((question, index) => (
            <section
              key={question.id}
              aria-label={`Soal ${index + 1}`}
              className="rounded-xl border border-line/70 bg-white/80 p-3"
            >
              <header className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold text-brand">
                  Soal {index + 1} · {question.prompt}
                </p>
                <span className="nums shrink-0 rounded-md bg-butter-yellow/70 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                  {question.maxScore} poin
                </span>
              </header>

              <ul className="mt-2 space-y-1.5">
                {question.rubric.length === 0 && (
                  <li className="text-[11px] text-muted">
                    Belum ada kriteria rubrik untuk soal ini.
                  </li>
                )}
                {question.rubric.map((criterion) => (
                  <li
                    key={criterion.id}
                    className="rounded-lg border border-line/60 bg-paper/60 p-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold text-ink-2">
                        {criterion.name}
                      </p>
                      <span className="nums shrink-0 text-[10px] text-muted">
                        0–{criterion.maxScore}
                      </span>
                    </div>
                    {criterion.levels.length > 0 && (
                      <ul className="mt-1 grid gap-0.5">
                        {criterion.levels.map((level, levelIndex) => (
                          <li
                            key={`${criterion.id}-${levelIndex}`}
                            className="flex gap-1.5 text-[10px] leading-snug text-muted"
                          >
                            <span className="nums shrink-0 font-bold text-brand">
                              {level.score}
                            </span>
                            <span>
                              <strong className="font-semibold text-ink-2">
                                {level.label}
                              </strong>
                              {level.description ? ` — ${level.description}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-brand" aria-hidden />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand">
              Antrean LJK ({assessment.submissions.length})
            </h3>
          </div>

          {assessment.submissions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-white/70 p-3 text-[11px] text-muted">
              Belum ada siswa yang mengumpulkan asesmen ini.
            </p>
          ) : (
            <ul className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1">
              {assessment.submissions.map((submission) => {
                const cell = scoreCellOf(submission, assessment);
                return (
                  <li key={submission.id}>
                    <button
                      type="button"
                      onClick={() => onGradeStudent(submission)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-line/70 bg-white/80 px-2.5 py-2 text-left transition-all hover:border-brand hover:bg-white",
                        cell.state === "final" && "border-emerald-200"
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-bold text-ink">
                          {submission.studentName}
                        </span>
                        <span className="block text-[10px] text-muted">
                          {submission.studentNis} ·{" "}
                          {cell.percent === null ? "belum dinilai" : `${cell.percent}/100`}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Badge status={GRADING_STATUS_LABEL[submission.statusGrading]} />
                        <ChevronRight className="h-3.5 w-3.5 text-brand" aria-hidden />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="flex items-start gap-1.5 rounded-xl border border-line/60 bg-paper/70 p-2 text-[10px] text-muted">
            <ListChecks className="mt-0.5 h-3 w-3 shrink-0 text-brand" aria-hidden />
            Pilih siswa untuk membuka input skor per kriteria. Skor total dihitung server dari item
            rubrik.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
