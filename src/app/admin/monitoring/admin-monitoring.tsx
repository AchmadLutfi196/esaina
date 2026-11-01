"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChartColumn, ClipboardList, FileText, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";

type MonitoringRow = {
  id: string;
  title: string;
  className: string;
  teacherName: string;
  status: string;
  questionCount: number;
  submittedCount: number;
  gradedCount: number;
  progressPercent: number | null;
};

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "soft" }> = {
  OPEN: { label: "Dibuka", variant: "success" },
  CLOSED: { label: "Ditutup", variant: "warning" },
  DRAFT: { label: "Draf", variant: "soft" },
};

export function AdminMonitoring() {
  const q = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: () => api.get<{ monitoring: MonitoringRow[] }>("/api/admin/monitoring"),
  });

  if (q.isPending) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Memuat monitoring…
      </p>
    );
  }

  if (q.isError) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTitle>Gagal memuat.</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-2">
          <span>{q.error instanceof Error ? q.error.message : "Gagal memuat monitoring."}</span>
          <Button size="sm" variant="soft" onClick={() => void q.refetch()}>
            Coba lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (q.data.monitoring.length === 0) {
    return (
      <EmptyState
        icon={ChartColumn}
        title="Belum ada asesmen"
        description="Asesmen yang dibuat guru akan muncul di sini beserta progres penilaiannya."
      />
    );
  }

  const totalSubmitted = q.data.monitoring.reduce((s, a) => s + a.submittedCount, 0);
  const totalGraded = q.data.monitoring.reduce((s, a) => s + a.gradedCount, 0);
  const overall = totalSubmitted > 0 ? Math.round((totalGraded / totalSubmitted) * 100) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total asesmen" value={q.data.monitoring.length} icon={FileText} />
        <StatCard label="LJK terkumpul" value={totalSubmitted} icon={ClipboardList} />
        <StatCard label="LJK disahkan" value={totalGraded} icon={ShieldCheck} />
        <StatCard
          label="Progres total"
          value={overall === null ? "—" : `${overall}%`}
          hint="Dari seluruh LJK terkumpul"
        />
      </div>

      <div className="flex flex-col gap-3">
        {q.data.monitoring.map((a) => {
          const pct = a.progressPercent ?? 0;
          const badge = STATUS_BADGE[a.status];
          return (
            <Card key={a.id} className="gap-3">
              <CardHeader className="flex-row items-center justify-between gap-3">
                <CardTitle className="text-base font-medium text-primary">{a.title}</CardTitle>
                <Badge variant={badge?.variant ?? "soft"}>{badge?.label ?? a.status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>{a.className}</span>
                  <span aria-hidden="true">·</span>
                  <span>Guru: {a.teacherName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{a.questionCount} soal</span>
                </p>
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-foreground">
                  <span>Progres penilaian</span>
                  <span>
                    {a.gradedCount} / {a.submittedCount} LJK disahkan
                    {a.progressPercent === null ? "" : ` (${a.progressPercent}%)`}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-[var(--neu-surface-low)]"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={`${a.gradedCount} dari ${a.submittedCount} LJK disahkan`}
                  aria-label={`Progres penilaian ${a.title}`}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div>
                  <Button asChild variant="soft" size="sm">
                    <Link href={`/guru/assessments/${a.id}/submissions`}>Lihat LJK</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
