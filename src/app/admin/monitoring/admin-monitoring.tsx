"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const STATUS_LABEL: Record<string, string> = { DRAFT: "Draf", OPEN: "Dibuka", CLOSED: "Ditutup" };

export function AdminMonitoring() {
  const q = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: () => api.get<{ monitoring: MonitoringRow[] }>("/api/admin/monitoring"),
  });

  if (q.isPending) return <p role="status">Memuat-monitoring…</p>;
  if (q.isError) return <Alert variant="destructive" role="alert"><AlertDescription>{q.error.message}</AlertDescription></Alert>;
  if (!q.data.monitoring.length) {
    return (
      <Card className="items-center px-6 py-8 text-center">
        <CardContent className="text-sm text-muted-foreground">
          Belum ada asesmen untuk dipantau.
        </CardContent>
      </Card>
    );
  }

  const totalSubmitted = q.data.monitoring.reduce((s, a) => s + a.submittedCount, 0);
  const totalGraded = q.data.monitoring.reduce((s, a) => s + a.gradedCount, 0);
  const overall = totalSubmitted > 0 ? Math.round((totalGraded / totalSubmitted) * 100) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="gap-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total asesmen</p>
          <p className="text-2xl font-bold text-primary">{q.data.monitoring.length}</p>
        </Card>
        <Card className="gap-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">LJK terkumpul</p>
          <p className="text-2xl font-bold text-primary">{totalSubmitted}</p>
        </Card>
        <Card className="gap-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">LJK disahkan</p>
          <p className="text-2xl font-bold text-primary">{totalGraded}</p>
        </Card>
        <Card className="gap-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progres total</p>
          <p className="text-2xl font-bold text-primary">{overall === null ? "—" : `${overall}%`}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {q.data.monitoring.map((a) => {
          const pct = a.progressPercent ?? 0;
          return (
            <Card key={a.id} className="gap-3 px-5">
              <CardHeader className="flex-row items-center justify-between gap-3">
                <CardTitle className="text-base font-medium text-primary">{a.title}</CardTitle>
                <Badge variant={a.status === "OPEN" ? "success" : "soft"}>{STATUS_LABEL[a.status] ?? a.status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {a.className} · Guru: {a.teacherName} · {a.questionCount} soal
                </p>
                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                  <span>Progres penilaian</span>
                  <span>{a.gradedCount} / {a.submittedCount} LJK disahkan{a.progressPercent === null ? "" : ` (${a.progressPercent}%)`}</span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-[var(--neu-surface-low)]"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progres penilaian ${a.title}`}
                >
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
