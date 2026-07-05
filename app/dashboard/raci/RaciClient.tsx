"use client";

import { useState } from "react";
import { updateRaciAssignment } from "./actions";

export default function RaciClient({ initialData }: { initialData: any }) {
  const { tasks, divisions, users, role } = initialData;
  const [filterDivisi, setFilterDivisi] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const canEdit = role === "SUPER_ADMIN" || role === "SEKRETARIS";

  const handleToggle = async (taskId: string, userId: string, roleType: "R"|"A"|"C"|"I", isAdding: boolean) => {
    if (!canEdit) return;
    setIsUpdating(true);
    setError("");
    try {
      await updateRaciAssignment(taskId, userId, roleType, isAdding);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTasks = filterDivisi === "ALL" 
    ? tasks 
    : tasks.filter((t: any) => t.divisiId === filterDivisi);

  const getRaciBadgeClass = (type: string) => {
    switch (type) {
      case "R": return "bg-blue-100 text-blue-800 border-blue-200";
      case "A": return "bg-red-100 text-red-800 border-red-200";
      case "C": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "I": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="display-md mb-2">RACI Matrix</h1>
          <p className="text-body-sm text-body-mid">
            Responsible, Accountable, Consulted, and Informed matrix.
          </p>
        </div>
        <div className="flex flex-col">
          <label className="text-xs uppercase font-sans font-semibold text-body-mid mb-1">Filter Divisi</label>
          <select 
            className="text-input py-2 text-sm"
            value={filterDivisi}
            onChange={(e) => setFilterDivisi(e.target.value)}
          >
            <option value="ALL">All Divisions</option>
            {divisions.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md font-sans text-sm">
          {error}
        </div>
      )}

      {/* RACI Explanation Box */}
      <div className="bg-canvas-soft border border-mute rounded-md p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><span className="badge-pill bg-blue-100 text-blue-800">R</span> Responsible (Penanggung Jawab)</h3>
          <p className="text-xs text-body-mid">Orang yang secara langsung mengeksekusi dan mengerjakan tugas tersebut. Biasanya merupakan PIC dari tugas terkait.</p>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><span className="badge-pill bg-red-100 text-red-800">A</span> Accountable (Pengambil Keputusan)</h3>
          <p className="text-xs text-body-mid">Orang yang memiliki wewenang penuh untuk menyetujui (Approve) atau menolak (Reject) hasil kerja dari R. Biasanya atasan atau Koordinator.</p>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><span className="badge-pill bg-yellow-100 text-yellow-800">C</span> Consulted (Pemberi Saran)</h3>
          <p className="text-xs text-body-mid">Orang yang dimintai pendapat atau sarannya terkait tugas tersebut. Mereka dapat memberikan *feedback* langsung ke pekerja.</p>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><span className="badge-pill bg-green-100 text-green-800">I</span> Informed (Yang Diinformasikan)</h3>
          <p className="text-xs text-body-mid">Orang yang hanya perlu diberi tahu mengenai progres dan hasil akhir tugas tanpa perlu terlibat langsung.</p>
        </div>
      </div>

      <div className="bg-canvas border border-mute rounded-md overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-canvas-soft border-b border-mute">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink-soft">Task Description</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Divisi</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">R <span className="font-normal text-xs text-body-mid">(Responsible)</span></th>
              <th className="px-4 py-3 font-semibold text-ink-soft">A <span className="font-normal text-xs text-body-mid">(Accountable)</span></th>
              <th className="px-4 py-3 font-semibold text-ink-soft">C <span className="font-normal text-xs text-body-mid">(Consulted)</span></th>
              <th className="px-4 py-3 font-semibold text-ink-soft">I <span className="font-normal text-xs text-body-mid">(Informed)</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mute">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-body-mid italic mb-4">Belum ada tugas/task pada divisi ini.</p>
                  {canEdit && (
                    <a href="/dashboard/tracking" className="btn-primary inline-block text-sm">
                      Buat Task di Document Tracking
                    </a>
                  )}
                </td>
              </tr>
            ) : filteredTasks.map((task: any) => {
              const getRoles = (type: string) => task.raci.filter((r: any) => r.roleType === type);

              return (
                <tr key={task.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="px-4 py-4 align-top max-w-[200px] font-medium text-ink">
                    {task.title}
                  </td>
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <span className="badge-pill !text-xs bg-gray-100 text-gray-700">{task.divisi?.name || '-'}</span>
                  </td>
                  {["R", "A", "C", "I"].map((roleType) => {
                    const assigned = getRoles(roleType);
                    return (
                      <td key={roleType} className="px-4 py-4 align-top min-w-[150px]">
                        {roleType === "I" && task.informAll ? (
                          <div className="mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${getRaciBadgeClass("I")}`}>SEMUA / ALL</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {assigned.map((a: any) => (
                              <span key={a.id} className={`text-xs px-2 py-1 rounded border ${getRaciBadgeClass(roleType)} flex items-center gap-1`}>
                                {a.user.name}
                                {canEdit && (
                                  <button 
                                    onClick={() => handleToggle(task.id, a.userId, roleType as any, false)}
                                    className="hover:text-red-900 ml-1 font-bold"
                                    disabled={isUpdating}
                                  >&times;</button>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                        {canEdit && (
                          <select 
                            className="text-xs border border-mute rounded bg-canvas px-1 py-1 w-full text-ink"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleToggle(task.id, e.target.value, roleType as any, true);
                                e.target.value = ""; // Reset
                              }
                            }}
                            disabled={isUpdating}
                          >
                            <option value="">+ Add Person</option>
                            {users.map((u: any) => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
