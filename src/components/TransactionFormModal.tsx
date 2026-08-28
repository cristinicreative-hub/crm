'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Building2,
  Euro,
  FileText,
  Calendar,
  CreditCard,
  Tag,
  Paperclip,
  Upload,
  Trash2,
  File,
  Download,
  TrendingUp,
  TrendingDown,
  User,
} from 'lucide-react'
import {
  createTransaction,
  updateTransaction,
  uploadTransactionAttachment,
  deleteTransactionAttachment,
} from '@/app/actions'

interface Company {
  id: string
  name: string
  code: string
  color: string
}

interface Customer {
  id: string
  name: string
  companyId: string
}

interface TransactionAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number | null
  fileType?: string | null
  createdAt: Date
}

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  companies: Company[]
  customers: Customer[]
  selectedCompanyId?: string
  initialData?: any
  onSuccess: () => void
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  companies,
  customers,
  selectedCompanyId,
  initialData,
  onSuccess,
}: TransactionFormModalProps) {
  const [companyId, setCompanyId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [type, setType] = useState<'ENTRATA' | 'USCITA'>('ENTRATA')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Fatturazione')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('Bonifico')
  const [attachments, setAttachments] = useState<TransactionAttachment[]>([])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (initialData) {
      setCompanyId(initialData.companyId)
      setCustomerId(initialData.customerId || '')
      setType(initialData.type || 'ENTRATA')
      setAmount(initialData.amount ? String(initialData.amount) : '')
      setDescription(initialData.description || '')
      setCategory(initialData.category || 'Fatturazione')
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      )
      setPaymentMethod(initialData.paymentMethod || 'Bonifico')
      setAttachments(initialData.attachments || [])
    } else {
      const defaultId =
        selectedCompanyId && selectedCompanyId !== 'all'
          ? selectedCompanyId
          : companies[0]?.id || ''
      setCompanyId(defaultId)
      setCustomerId('')
      setType('ENTRATA')
      setAmount('')
      setDescription('')
      setCategory('Fatturazione')
      setDate(new Date().toISOString().split('T')[0])
      setPaymentMethod('Bonifico')
      setAttachments([])
    }
    setSelectedFile(null)
    setError('')
  }, [initialData, selectedCompanyId, companies, isOpen])

  if (!isOpen) return null

  const activeCompanyId = companyId || (selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id) || ''

  // Filter customers matching selected company
  const availableCustomers = customers.filter(
    (c) => c.companyId === activeCompanyId
  )

  const handleFileUpload = async (txId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const newAtt = await uploadTransactionAttachment(txId, formData)
    return newAtt
  }

  const handleDirectUpload = async () => {
    if (!initialData?.id || !selectedFile) return
    try {
      setUploading(true)
      setError('')
      const newAtt = await handleFileUpload(initialData.id, selectedFile)
      setAttachments((prev) => [newAtt as unknown as TransactionAttachment, ...prev])
      setSelectedFile(null)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Errore durante il caricamento del file.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteTransactionAttachment(attachmentId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Errore durante la rimozione dell\'allegato.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetCompanyId = activeCompanyId

    if (!description.trim()) {
      setError('La descrizione è obbligatoria.')
      return
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Inserisci un importo valido.')
      return
    }
    if (!targetCompanyId) {
      setError('Seleziona un\'azienda.')
      return
    }

    try {
      setLoading(true)
      setError('')

      let savedTx: any
      if (initialData?.id) {
        savedTx = await updateTransaction(initialData.id, {
          companyId: targetCompanyId,
          customerId: customerId || null,
          type,
          amount: Number(amount),
          description,
          category,
          date,
          paymentMethod,
        })
      } else {
        savedTx = await createTransaction({
          companyId: targetCompanyId,
          customerId: customerId || null,
          type,
          amount: Number(amount),
          description,
          category,
          date,
          paymentMethod,
        })
      }

      if (!initialData?.id && selectedFile && savedTx?.id) {
        await handleFileUpload(savedTx.id, selectedFile)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio della transazione.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {type === 'ENTRATA' ? (
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            {initialData ? 'Modifica Registrazione' : 'Nuova Registrazione Entrata / Uscita'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Selector (ENTRATA / USCITA) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Tipo Operazione *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('ENTRATA')}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition border ${
                  type === 'ENTRATA'
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                ENTRATA (+)
              </button>
              <button
                type="button"
                onClick={() => setType('USCITA')}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition border ${
                  type === 'USCITA'
                    ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                USCITA (-)
              </button>
            </div>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Azienda di appartenenza *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={activeCompanyId}
                onChange={(e) => {
                  setCompanyId(e.target.value)
                  setCustomerId('')
                }}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Amount (€) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Importo (€) *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Data *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Descrizione / Oggetto *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Es. Fattura n. 104 per servizi di consulenza"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Fatturazione">Fatturazione</option>
                <option value="Fornitore">Fornitore</option>
                <option value="Stipendi">Stipendi & Collaborazioni</option>
                <option value="Tasse">Tasse & Imposte</option>
                <option value="Consulenza">Consulenza</option>
                <option value="Noleggio">Noleggio & Attrezzature</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Metodo di Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Bonifico">Bonifico Bancario</option>
                <option value="Carta">Carta di Credito</option>
                <option value="RID">RID / Addebito Diretto</option>
                <option value="Contanti">Contanti</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            {/* Linked Customer (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cliente Associato (Opzionale)
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Nessuno --</option>
                {availableCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-blue-500" /> Allegato / Documento (Fattura, Ricevuta, PDF)
              </label>
              {selectedFile && initialData?.id && (
                <button
                  type="button"
                  onClick={handleDirectUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Caricamento...' : 'Carica ora'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                id="tx-file-upload"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <File className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span className="font-medium truncate">{att.fileName}</span>
                      {att.fileSize && (
                        <span className="text-[10px] text-slate-400">
                          ({(att.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-blue-600 dark:hover:bg-slate-700"
                        title="Download / Apri"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600 dark:hover:bg-slate-700"
                        title="Elimina allegato"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition shadow-md ${
                type === 'ENTRATA'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
              } disabled:opacity-50`}
            >
              {loading ? 'Salvataggio...' : initialData ? 'Aggiorna Operazione' : 'Salva Operazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
