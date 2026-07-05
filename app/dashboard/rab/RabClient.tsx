"use client";

import { useState } from "react";
import { createRab, updateRabStatus } from "./actions";

export default function RabClient({ initialData }: { initialData: any }) {
  const { rabs, role } = initialData;
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<any[]>([{ category: "", item: "", qty: 1, unitPrice: 0 }]);

  const isBendahara = role === "BENDAHARA";
  const isAdmin = role === "SUPER_ADMIN";
  const canCreate = role === "BENDAHARA" || role === "SEKRETARIS" || role === "KOORDINATOR_DIVISI";

  const handleAddItem = () => {
    setItems([...items, { category: "", item: "", qty: 1, unitPrice: 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRab(title, items);
    setShowForm(false);
    setTitle("");
    setItems([{ category: "", item: "", qty: 1, unitPrice: 0 }]);
  };

  const calculateTotal = (rabItems: any[]) => rabItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "DRAFT": return "badge-pill bg-gray-200 text-gray-800";
      case "USULAN": return "badge-pill bg-blue-200 text-blue-800";
      case "SUBMITTED": return "badge-pill bg-yellow-200 text-yellow-800";
      case "APPROVED": return "badge-pill bg-green-200 text-green-800";
      case "REJECTED": return "badge-pill bg-red-200 text-red-800";
      default: return "badge-pill";
    }
  };

  const handleExport = (rabId: string, format: "pdf" | "excel") => {
    window.open(`/api/export/${format}?rabId=${rabId}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="display-md mb-2">Rencana Anggaran Biaya (RAB)</h1>
          <p className="text-body-sm text-body-mid">Manage budget planning and approvals.</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 text-sm">
            {showForm ? "Cancel" : "+ Buat RAB Baru"}
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <form onSubmit={handleSubmit} className="card-content border border-mute">
          <h3 className="font-semibold text-lg mb-4">Buat RAB Baru</h3>
          <div className="mb-4">
            <label className="text-sm font-semibold mb-1 block">Judul RAB</label>
            <input required className="text-input w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: RAB Konsumsi" />
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-12 gap-2 text-xs uppercase font-semibold text-body-mid mb-1">
              <div className="col-span-3">Kategori</div>
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Harga Satuan</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input required className="col-span-3 text-input py-1 text-sm" value={it.category} onChange={e => handleItemChange(idx, "category", e.target.value)} placeholder="Konsumsi" />
                <input required className="col-span-4 text-input py-1 text-sm" value={it.item} onChange={e => handleItemChange(idx, "item", e.target.value)} placeholder="Nasi Kotak" />
                <input required type="number" min="1" className="col-span-2 text-input py-1 text-sm" value={it.qty} onChange={e => handleItemChange(idx, "qty", parseInt(e.target.value))} />
                <input required type="number" min="0" className="col-span-2 text-input py-1 text-sm" value={it.unitPrice} onChange={e => handleItemChange(idx, "unitPrice", parseFloat(e.target.value))} />
                <button type="button" onClick={() => handleRemoveItem(idx)} className="col-span-1 text-red-600 hover:text-red-800 font-bold text-center">&times;</button>
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="text-sm font-semibold text-primary hover:underline mt-2">+ Tambah Item</button>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-mute">
            <div className="text-lg font-bold">
              Total: {formatCurrency(items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0))}
            </div>
            <button type="submit" className="btn-primary py-2 text-sm">Simpan sebagai Draft</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6">
        {rabs.length === 0 ? (
          <div className="card-content border border-mute text-center py-8 text-body-mid italic">
            Belum ada dokumen RAB.
          </div>
        ) : rabs.map((rab: any) => (
          <div key={rab.id} className="card-content border border-mute flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-sans font-bold text-lg">{rab.title}</h3>
                <p className="text-xs text-body-mid">Dibuat: {new Date(rab.createdAt).toLocaleDateString()} {rab.creator && `oleh ${rab.creator.name}`}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className={getStatusBadge(rab.status)}>{rab.status}</span>
                <div className="flex bg-canvas-soft border border-mute rounded overflow-hidden">
                  <button onClick={() => handleExport(rab.id, "pdf")} className="px-3 py-1 text-xs font-semibold text-ink border-r border-mute hover:bg-mute transition-colors">PDF</button>
                  <button onClick={() => handleExport(rab.id, "excel")} className="px-3 py-1 text-xs font-semibold text-ink hover:bg-mute transition-colors">Excel</button>
                </div>
              </div>
            </div>
            
            <div className="bg-canvas border border-mute rounded mb-4 overflow-hidden overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-canvas-soft border-b border-mute">
                  <tr>
                    <th className="px-3 py-2 text-ink-soft font-semibold">Kategori</th>
                    <th className="px-3 py-2 text-ink-soft font-semibold">Item</th>
                    <th className="px-3 py-2 text-ink-soft font-semibold text-right">Qty</th>
                    <th className="px-3 py-2 text-ink-soft font-semibold text-right">Harga Satuan</th>
                    <th className="px-3 py-2 text-ink-soft font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mute">
                  {rab.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2">{item.item}</td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-canvas-soft border-t border-mute">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right font-bold text-ink">TOTAL:</td>
                    <td className="px-3 py-2 text-right font-bold text-primary">{formatCurrency(calculateTotal(rab.items))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="flex justify-end gap-3 mt-auto border-t border-mute pt-4">
              {rab.status === "DRAFT" && (
                <button onClick={() => updateRabStatus(rab.id, isBendahara ? "SUBMITTED" : "USULAN")} className="btn-secondary py-1 px-4 text-sm">
                  {isBendahara ? "Submit to Admin" : "Usulkan ke Bendahara"}
                </button>
              )}
              {isBendahara && rab.status === "USULAN" && (
                <>
                  <button onClick={() => updateRabStatus(rab.id, "DRAFT")} className="btn-text text-red-600 border border-red-200 hover:bg-red-50">Tolak Usulan</button>
                  <button onClick={() => updateRabStatus(rab.id, "SUBMITTED")} className="btn-primary py-1 px-4 text-sm">Teruskan ke Admin</button>
                </>
              )}
              {isAdmin && rab.status === "SUBMITTED" && (
                <>
                  <button onClick={() => updateRabStatus(rab.id, "REJECTED")} className="btn-text text-red-600 border border-red-200 hover:bg-red-50">Reject</button>
                  <button onClick={() => updateRabStatus(rab.id, "APPROVED")} className="btn-primary py-1 px-4 text-sm bg-green-600 text-white border-none hover:bg-green-700">Approve</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
