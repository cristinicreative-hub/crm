'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Building2,
  Paperclip,
  Download,
  Calendar,
  User,
  CreditCard,
  Euro,
  Scale,
} from 'lucide-react'
import { deleteTransaction } from '@/app/actions'

interface TransactionAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number | null
}

interface Transaction {
  id: string
  companyId: string
  customerId?: string | null
  type: string
  category?: string | null
  amount: number
  description: string
  date: Date
  paymentMethod?: string | null
  attachments?: TransactionAttachment[]
  company: {
    id: string
    name: string
    code: string
    color: string
  }
  customer?: {
    id: string
    name: string
  } | null
}

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onAddClick: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  typeFilter: string
  onTypeFilterChange: (type: string) => void
  loading?: boolean
}

export default function TransactionTable({
  transactions,
  onEdit,
  onAddClick,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  loading,
}: TransactionTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, desc: string) => {
    if (confirm(`Sei sicuro di voler eliminare la registrazione "${desc}"?`)) {
      try {
        setDeletingId(id)
        await deleteTransaction(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'ENTRATA')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'USCITA')
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Income */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Totale Entrate
            </span>
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            +€ {totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Total Expense */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
              Totale Uscite
            </span>
            <div className="rounded-xl bg-red-500/20 p-2 text-red-600 dark:text-red-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-700 dark:text-red-400">
            -€ {totalExpense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Net Balance */}
        <div
          className={`rounded-2xl border p-5 ${
            netBalance >= 0
              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20'
              : 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                netBalance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              Saldo Netto
            </span>
            <div
              className={`rounded-xl p-2 ${
                netBalance >= 0
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-black ${
              netBalance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {netBalance >= 0 ? '+' : ''}€ {netBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTypeFilterChange('ALL')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Tutti i Movimenti ({transactions.length})
          </button>
          <button
            onClick={() => onTypeFilterChange('ENTRATA')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              typeFilter === 'ENTRATA'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
            }`}
          >
            Entrate (+)
          </button>
          <button
            onClick={() => onTypeFilterChange('USCITA')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              typeFilter === 'USCITA'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300'
            }`}
          >
            Uscite (-)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca per descrizione, categoria..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={onAddClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nuova Operazione
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Data / Descrizione</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Azienda</th>
                <th className="px-6 py-4">Importo</th>
                <th className="px-6 py-4">Cliente / Metodo</th>
                <th className="px-6 py-4">Allegato</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Caricamento transazioni in corso...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Euro className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Nessuna registrazione trovata</p>
                    <p className="text-xs text-slate-500">Aggiungi la tua prima entrata o uscita.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    {/* Date & Description */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{t.description}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.date).toLocaleDateString('it-IT')}
                        </span>
                        {t.category && (
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t.category}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-6 py-4">
                      {t.type === 'ENTRATA' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          <TrendingUp className="h-3 w-3" /> ENTRATA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900">
                          <TrendingDown className="h-3 w-3" /> USCITA
                        </span>
                      )}
                    </td>

                    {/* Company Tag */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
                        style={{ backgroundColor: t.company.color }}
                      >
                        <Building2 className="h-3 w-3" />
                        {t.company.name}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div
                        className={`text-base font-black font-mono ${
                          t.type === 'ENTRATA'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {t.type === 'ENTRATA' ? '+' : '-'}€{' '}
                        {t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Linked Customer & Payment Method */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        {t.customer && (
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <User className="h-3 w-3 text-blue-500 shrink-0" />
                            <span className="truncate">{t.customer.name}</span>
                          </div>
                        )}
                        {t.paymentMethod && (
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <CreditCard className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{t.paymentMethod}</span>
                          </div>
                        )}
                        {!t.customer && !t.paymentMethod && (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>

                    {/* Attachments */}
                    <td className="px-6 py-4">
                      {t.attachments && t.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {t.attachments.map((att) => (
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

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(t)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                          title="Modifica"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.description)}
                          disabled={deletingId === t.id}
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
