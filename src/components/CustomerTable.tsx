'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  Paperclip,
  Download,
} from 'lucide-react'
import { deleteCustomer } from '@/app/actions'

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number | null
  fileType?: string | null
}

interface Customer {
  id: string
  companyId: string
  name: string
  email?: string | null
  phone?: string | null
  vatNumber?: string | null
  address?: string | null
  referredBy?: string | null
  notes?: string | null
  status: string
  attachments?: Attachment[]
  createdAt: Date
  company: {
    id: string
    name: string
    code: string
    color: string
  }
}

interface CustomerTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onAddClick: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  loading?: boolean
}

export default function CustomerTable({
  customers,
  onEdit,
  onAddClick,
  searchQuery,
  onSearchChange,
  loading,
}: CustomerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare il cliente "${name}"?`)) {
      try {
        setDeletingId(id)
        await deleteCustomer(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATTIVO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="h-3 w-3" /> ATTIVO
          </span>
        )
      case 'POTENZIALE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <Clock className="h-3 w-3" /> POTENZIALE
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <AlertCircle className="h-3 w-3" /> INATTIVO
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar & Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca per nome, email, P.IVA, presentato da..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Aggiungi Cliente
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Presentato Da</th>
                <th className="px-6 py-4">Azienda</th>
                <th className="px-6 py-4">Contatti</th>
                <th className="px-6 py-4">Allegati</th>
                <th className="px-6 py-4">Stato</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Caricamento clienti in corso...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <User className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Nessun cliente trovato</p>
                    <p className="text-xs text-slate-500">Aggiungi il tuo primo cliente o modifica la ricerca.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                      {c.vatNumber && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          P.IVA/CF: {c.vatNumber}
                        </div>
                      )}
                    </td>

                    {/* Presentato Da / Referente */}
                    <td className="px-6 py-4">
                      {c.referredBy ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                          <UserCheck className="h-3 w-3 text-blue-500" />
                          {c.referredBy}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* Company Tag */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
                        style={{ backgroundColor: c.company.color }}
                      >
                        <Building2 className="h-3 w-3" />
                        {c.company.name}
                      </span>
                    </td>

                    {/* Contacts */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <a href={`mailto:${c.email}`} className="hover:underline">
                              {c.email}
                            </a>
                          </div>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <a href={`tel:${c.phone}`} className="hover:underline">
                              {c.phone}
                            </a>
                          </div>
                        )}
                        {!c.email && !c.phone && (
                          <span className="text-slate-400 italic">Nessun contatto</span>
                        )}
                      </div>
                    </td>

                    {/* Allegati */}
                    <td className="px-6 py-4">
                      {c.attachments && c.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {c.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 truncate max-w-xs"
                              title={`Download ${att.fileName}`}
                            >
                              <Paperclip className="h-3 w-3 text-blue-500 shrink-0" />
                              <span className="truncate">{att.fileName}</span>
                              <Download className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Nessun file</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                          title="Modifica / Allegati"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition disabled:opacity-50"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
