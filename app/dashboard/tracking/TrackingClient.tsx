"use client";

import { useState } from "react";
import { createTask, updateTaskStatus, approveTask, rejectTask, giveConsultedFeedback } from "./actions";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function TrackingClient({ initialData }: { initialData: any }) {
  const { tasks, divisions, users, role, userId, userDivisiId } = initialData;
  const [viewMode, setViewMode] = useState<"TABLE" | "KANBAN">("KANBAN");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  
  // New task form state
  const [title, setTitle] = useState("");
  const [divisiId, setDivisiId] = useState("");
  const [picId, setPicId] = useState("");
  const [accountableId, setAccountableId] = useState("");
  const [consultedIds, setConsultedIds] = useState<string[]>([]);
  const [informedIds, setInformedIds] = useState<string[]>([]);
  const [informAll, setInformAll] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  
  // Feedback states
  const [rejectNotes, setRejectNotes] = useState<{ [taskId: string]: string }>({});
  const [saran, setSaran] = useState<{ [taskId: string]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<{ [taskId: string]: boolean }>({});
  const [showSaranForm, setShowSaranForm] = useState<{ [taskId: string]: boolean }>({});
  
  // Custom popup
  const [popup, setPopup] = useState<{ show: boolean, type: "success" | "error", message: string }>({ show: false, type: "success", message: "" });
  const showPopup = (message: string, type: "success" | "error" = "success") => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 4000);
  };

  const canCreate = role !== "ANGGOTA" && role !== "PENASIHAT";
  const isCO = role === "KOORDINATOR_DIVISI";

  // Filter PIC options
  const rUsers = (isCO && userDivisiId) ? users.filter((u: any) => u.divisiId === userDivisiId) : users;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !divisiId) return;

    if (!picId || !accountableId || consultedIds.length === 0 || (!informAll && informedIds.length === 0)) {
      showPopup("Semua kolom RACI (R, A, C, I) harus diisi! Jika 'I' untuk semua orang, centang opsi 'Semua Orang'.", "error");
      return;
    }

    await createTask({ 
      title, divisiId, picId, deadline, notes, 
      accountableId, consultedIds, informedIds, informAll 
    });
    setShowNewTaskForm(false);
    setTitle(""); setDivisiId(""); setPicId(""); setDeadline(""); setNotes("");
    setAccountableId(""); setConsultedIds([]); setInformedIds([]); setInformAll(false);
  };

  const toggleConsulted = (id: string) => setConsultedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleInformed = (id: string) => setInformedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BELUM": return "bg-gray-200 text-gray-800";
      case "PROSES": return "bg-yellow-200 text-yellow-800";
      case "SELESAI": return "bg-green-200 text-green-800";
      case "TERHAMBAT": return "bg-red-200 text-red-800";
      default: return "bg-gray-100";
    }
  };

  const columns = ["BELUM", "PROSES", "SELESAI", "TERHAMBAT"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="display-md mb-2">Document Tracking</h1>
          <p className="text-body-sm text-body-mid">Track task progress and view RACI details.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex bg-canvas-soft border border-mute rounded-md overflow-hidden">
            <button 
              className={`px-4 py-2 text-sm font-semibold ${viewMode === "KANBAN" ? "bg-primary text-on-primary" : "text-ink"}`}
              onClick={() => setViewMode("KANBAN")}
            >Kanban</button>
            <button 
              className={`px-4 py-2 text-sm font-semibold ${viewMode === "TABLE" ? "bg-primary text-on-primary" : "text-ink"}`}
              onClick={() => setViewMode("TABLE")}
            >Table</button>
          </div>
          {canCreate && (
            <button onClick={() => setShowNewTaskForm(true)} className="btn-primary py-2 text-sm">
              + New Task
            </button>
          )}
        </div>
      </div>

      {showNewTaskForm && (
        <form onSubmit={handleCreate} className="card-content border border-mute grid grid-cols-2 gap-4">
          <div className="col-span-2"><h3 className="font-semibold text-lg border-b border-mute pb-2">Create New Task (RACI Setup)</h3></div>
          
          <div className="flex flex-col"><label className="text-sm font-semibold">Title</label><input required className="text-input" value={title} onChange={e=>setTitle(e.target.value)} /></div>
          
          <div className="flex flex-col"><label className="text-sm font-semibold">Divisi</label>
            <select required className="text-input" value={divisiId} onChange={e=>setDivisiId(e.target.value)}>
              <option value="">Select Divisi</option>
              {divisions.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col bg-blue-50 p-2 rounded border border-blue-100"><label className="text-sm font-semibold text-blue-900">(R) Responsible / PIC</label>
            <select className="text-input mt-1" value={picId} onChange={e=>setPicId(e.target.value)}>
              <option value="">Pilih Pekerja Utama</option>
              {rUsers.map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {isCO && <p className="text-[10px] text-blue-700 mt-1">*Hanya menampilkan anggota divisi Anda</p>}
          </div>

          <div className="flex flex-col bg-red-50 p-2 rounded border border-red-100"><label className="text-sm font-semibold text-red-900">(A) Accountable</label>
            <select className="text-input mt-1" value={accountableId} onChange={e=>setAccountableId(e.target.value)}>
              <option value="">Pilih Pengambil Keputusan</option>
              {users.map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col bg-yellow-50 p-2 rounded border border-yellow-100"><label className="text-sm font-semibold text-yellow-900">(C) Consulted (Bisa pilih &gt;1)</label>
            <div className="h-24 overflow-y-auto mt-1 border border-mute bg-canvas rounded p-1 text-sm">
              {users.map((u:any) => (
                <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-canvas-soft cursor-pointer">
                  <input type="checkbox" checked={consultedIds.includes(u.id)} onChange={() => toggleConsulted(u.id)} /> {u.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col bg-green-50 p-2 rounded border border-green-100"><label className="text-sm font-semibold text-green-900">(I) Informed</label>
            <label className="flex items-center gap-2 mb-1 mt-1 text-sm"><input type="checkbox" checked={informAll} onChange={e=>setInformAll(e.target.checked)} /> <b>Semua Orang (Inform All)</b></label>
            {!informAll && (
              <div className="h-16 overflow-y-auto border border-mute bg-canvas rounded p-1 text-sm">
                {users.map((u:any) => (
                  <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-canvas-soft cursor-pointer">
                    <input type="checkbox" checked={informedIds.includes(u.id)} onChange={() => toggleInformed(u.id)} /> {u.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col"><label className="text-sm font-semibold">Deadline</label><input type="datetime-local" className="text-input" value={deadline} onChange={e=>setDeadline(e.target.value)} /></div>
          
          <div className="col-span-2 flex flex-col"><label className="text-sm font-semibold">Notes / Deskripsi Task</label><textarea className="text-input" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
          
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={()=>setShowNewTaskForm(false)} className="btn-text border border-mute">Cancel</button>
            <button type="submit" className="btn-primary py-2 text-sm">Save Task</button>
          </div>
        </form>
      )}

      {viewMode === "KANBAN" ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {columns.map(status => (
            <div key={status} className="bg-canvas-soft border border-mute rounded-md p-4 flex flex-col h-full min-h-[500px]">
              <h3 className="font-sans font-bold text-ink mb-4 pb-2 border-b border-mute flex justify-between">
                {status} <span className="bg-canvas text-ink-soft px-2 py-0.5 rounded text-xs">{tasks.filter((t:any) => t.status === status).length}</span>
              </h3>
              <div className="flex flex-col gap-3 flex-1">
                {tasks.filter((t:any) => t.status === status).map((task:any) => {
                  const isA = task.raci?.some((r:any) => r.userId === userId && r.roleType === "A");
                  const isC = task.raci?.some((r:any) => r.userId === userId && r.roleType === "C");
                  
                  return (
                  <div key={task.id} className={`bg-canvas border rounded p-3 shadow-sm flex flex-col gap-2 relative group ${task.approvalStatus === 'APPROVED' ? 'border-green-500' : task.approvalStatus === 'REJECTED' ? 'border-red-500' : 'border-mute'}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-primary">{task.divisi.name}</span>
                      {task.approvalStatus === "APPROVED" && <span className="badge-pill bg-green-100 text-green-800 text-[10px]">APPROVED</span>}
                      {task.approvalStatus === "REJECTED" && <span className="badge-pill bg-red-100 text-red-800 text-[10px]">REJECTED</span>}
                    </div>
                    
                    <p className="font-sans font-medium text-ink text-sm leading-tight">{task.title}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.pic && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">R: {task.pic.name}</span>}
                      {task.raci?.filter((r:any)=>r.roleType==="A").map((r:any) => <span key={r.id} className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-200">A: {r.user.name}</span>)}
                    </div>

                    <div className="space-y-3 text-sm font-sans mb-4">
                      {task.deadline && (
                        <div>
                          <span className="font-semibold block text-body-mid text-xs">Tenggat Waktu:</span> 
                          {new Date(task.deadline).toLocaleString("id-ID")}
                        </div>
                      )}
                      
                      {task.notes && <div><span className="font-semibold block text-body-mid text-xs">Catatan:</span> <p className="mt-1 bg-canvas-soft p-2 rounded break-words whitespace-pre-wrap text-xs">{task.notes}</p></div>}
                      
                      <div className="border-t border-mute pt-2 mt-2">
                        <span className="font-semibold block text-ink text-xs mb-1">Bukti Pengerjaan</span>
                        {(task.proofUrl || task.proofNotes) ? (
                          <>
                            {task.proofUrl && (
                              <a href={task.proofUrl} target="_blank" rel="noreferrer" className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-200 hover:bg-blue-100 mb-1">Lihat Berkas / Foto</a>
                            )}
                            {task.proofNotes && <p className="bg-canvas-soft p-1.5 rounded text-[10px] text-ink-soft italic border border-mute break-words">"{task.proofNotes}"</p>}
                          </>
                        ) : (
                          <p className="text-[10px] text-ink-soft italic text-gray-500">Belum ada bukti yang diunggah oleh PIC.</p>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS FOR A */}
                    {isA && status === "SELESAI" && task.approvalStatus === "WAITING" && (
                      <div className="border-t border-red-200 bg-red-50 p-2 -mx-3 mb-2">
                        <p className="text-xs font-semibold text-red-900 mb-2">Anda adalah (A). Review hasil ini:</p>
                        {showRejectForm[task.id] ? (
                          <div className="space-y-2">
                            <textarea placeholder="Alasan reject / revisi..." className="text-input w-full text-xs h-16" value={rejectNotes[task.id] || ""} onChange={e=>setRejectNotes({...rejectNotes, [task.id]: e.target.value})} />
                            <div className="flex gap-2">
                              <button onClick={() => { rejectTask(task.id, rejectNotes[task.id] || "Ditolak tanpa catatan"); setShowRejectForm({...showRejectForm, [task.id]: false}) }} className="btn-primary bg-red-600 text-xs py-1 flex-1 text-white border-none">Kirim Revisi</button>
                              <button onClick={() => setShowRejectForm({...showRejectForm, [task.id]: false})} className="btn-text text-xs py-1">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => approveTask(task.id)} className="btn-primary bg-green-600 text-xs py-1.5 flex-1 border-none text-white">Approve</button>
                            <button onClick={() => setShowRejectForm({...showRejectForm, [task.id]: true})} className="btn-primary bg-red-600 text-xs py-1.5 flex-1 border-none text-white">Reject</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTIONS FOR C */}
                    {isC && (
                      <div className="border-t border-yellow-200 bg-yellow-50 p-2 -mx-3 mb-2">
                        {showSaranForm[task.id] ? (
                          <div className="space-y-2">
                            <textarea placeholder="Tuliskan saran Anda..." className="text-input w-full text-xs h-16" value={saran[task.id] || ""} onChange={e=>setSaran({...saran, [task.id]: e.target.value})} />
                            <div className="flex gap-2">
                              <button onClick={async () => { await giveConsultedFeedback(task.id, saran[task.id] || ""); setShowSaranForm({...showSaranForm, [task.id]: false}); setSaran({...saran, [task.id]: ""}) }} className="btn-primary bg-yellow-600 text-xs py-1 flex-1 text-white border-none">Kirim Saran</button>
                              <button onClick={() => setShowSaranForm({...showSaranForm, [task.id]: false})} className="btn-text text-xs py-1">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setShowSaranForm({...showSaranForm, [task.id]: true})} className="w-full text-center text-xs font-semibold text-yellow-800 py-1 hover:bg-yellow-100 rounded">
                            + Berikan Saran (Sebagai C)
                          </button>
                        )}
                      </div>
                    )}

                    <select 
                      className="text-xs border border-mute rounded bg-canvas-soft p-1 mt-auto w-full opacity-0 group-hover:opacity-100 transition-opacity"
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )})}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-canvas border border-mute rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-canvas-soft border-b border-mute">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-soft">Title</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Divisi</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">PIC</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Deadline</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mute">
              {tasks.map((task:any) => (
                <tr key={task.id}>
                  <td className="px-4 py-3">{task.title}</td>
                  <td className="px-4 py-3">{task.divisi.name}</td>
                  <td className="px-4 py-3">{task.pic?.name || "-"}</td>
                  <td className="px-4 py-3">{task.deadline ? new Date(task.deadline).toLocaleString("id-ID") : "-"}</td>
                  <td className="px-4 py-3">
                    <select 
                      className={`text-xs font-semibold px-2 py-1 rounded border-none ${getStatusColor(task.status)}`}
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pop up (Toast) */}
      {popup.show && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 ${
          popup.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {popup.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />} 
          {popup.message}
        </div>
      )}
    </div>
  );
}
