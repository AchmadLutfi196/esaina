"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ROLE_LABEL: Record<string, string> = { TEACHER: "Guru", STUDENT: "Siswa", ADMIN: "Admin" };

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  identifier: string | null;
  isActive: boolean;
  createdAt: string;
  submissionCount: number;
  classCount: number;
};

export function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const q = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<{ users: AdminUser[] }>("/api/admin/users"),
  });

  const toggle = useMutation({
    mutationFn: (u: AdminUser) => api.patch("/api/admin/users", { id: u.id, isActive: !u.isActive }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const users = (q.data?.users ?? []).filter((u) => {
    const s = search.toLowerCase();
    const matches = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.identifier ?? "").includes(search);
    return matches && (roleFilter === "ALL" || u.role === roleFilter);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="admin-user-search">Cari</Label>
          <Input id="admin-user-search" placeholder="Nama, email, atau NIP/NIS…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2 sm:w-40">
          <Label htmlFor="admin-user-role">Peran</Label>
          <Select id="admin-user-role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="TEACHER">Guru</SelectItem>
            <SelectItem value="STUDENT">Siswa</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </Select>
        </div>
        <CreateUserDialog />
      </div>

      {q.isPending ? <p role="status">Memuat pengguna…</p> : null}
      {q.isError ? <Alert variant="destructive" role="alert"><AlertDescription>{q.error.message}</AlertDescription></Alert> : null}
      {toggle.isError ? <Alert variant="destructive" role="alert"><AlertDescription>{toggle.error.message}</AlertDescription></Alert> : null}

      {users.length > 0 ? (
        <Card className="overflow-hidden px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead className="hidden md:table-cell">NIP/NIS</TableHead>
                <TableHead className="hidden sm:table-cell">Aktivitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}{u.id === currentUserId ? " (Anda)" : ""}</TableCell>
                  <TableCell className="hidden sm:table-cell">{u.email}</TableCell>
                  <TableCell><Badge variant={u.role === "ADMIN" ? "primary" : "soft"}>{ROLE_LABEL[u.role] ?? u.role}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">{u.identifier ?? "—"}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {u.role === "STUDENT" ? `${u.submissionCount} LJK` : `${u.classCount} kelas`}
                  </TableCell>
                  <TableCell><Badge variant={u.isActive ? "success" : "warning"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={u.isActive ? "destructive" : "soft"}
                      disabled={u.id === currentUserId || toggle.isPending}
                      onClick={() => toggle.mutate(u)}
                    >
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}
      {q.data && users.length === 0 ? <p className="text-sm text-muted-foreground">Tidak ada pengguna yang cocok dengan filter.</p> : null}
    </div>
  );
}

function CreateUserDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const create = useMutation({
    mutationFn: (body: Record<string, string>) => api.post("/api/admin/users", body),
    onSuccess: () => {
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate(Object.fromEntries(f.entries()) as Record<string, string>);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="solid" />}>Tambah pengguna</DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Tambah pengguna</DialogTitle>
            <DialogDescription>Kata sandi awal minimal 8 karakter; bagikan ke pengguna terkait.</DialogDescription>
          </DialogHeader>
          {create.isError ? <Alert variant="destructive" role="alert"><AlertDescription>{create.error.message}</AlertDescription></Alert> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-user-name">Nama</Label>
            <Input id="new-user-name" name="name" required maxLength={120} placeholder="Budi Santoso" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-user-email">Email</Label>
            <Input id="new-user-email" name="email" type="email" required placeholder="budi@demo.sch.id" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-user-role">Peran</Label>
              <Select id="new-user-role" name="role" defaultValue="STUDENT">
                <SelectItem value="TEACHER">Guru</SelectItem>
                <SelectItem value="STUDENT">Siswa</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-user-identifier">NIP/NIS</Label>
              <Input id="new-user-identifier" name="identifier" maxLength={40} placeholder="Opsional" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-user-password">Kata sandi awal</Label>
            <Input id="new-user-password" name="password" type="password" required minLength={8} maxLength={100} placeholder="Min. 8 karakter" />
          </div>
          <DialogFooter>
            <Button type="button" variant="soft" onClick={() => setOpen(false)} disabled={create.isPending}>Batal</Button>
            <Button type="submit" variant="solid" disabled={create.isPending}>{create.isPending ? "Menyimpan…" : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
