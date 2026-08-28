'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Tag,
  UserCheck,
  Paperclip,
  Upload,
  Trash2,
  File,
  Download,
} from 'lucide-react'
import { createCustomer, updateCustomer, uploadAttachment, deleteAttachment } from '@/app/actions'

interface Company {
  id: string
  name: string
  code: string
  color: string
}

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number | null
  fileType?: string | null
  createdAt: Date
}

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  companies: Company[]
  selectedCompanyId?: string
  initialData?: any
  onSuccess: () => void
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  companies,
  selectedCompanyId,
  initialData,
  onSuccess,
}: CustomerFormModalProps) {
  const [companyId, setCompanyId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [address, setAddress] = useState('')
  const [referredBy, setReferredBy] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('ATTIVO')
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (initialData) {
      setCompanyId(initialData.companyId)
      setName(initialData.name || '')
      setEmail(initialData.email || '')
      setPhone(initialData.phone || '')
      setVatNumber(initialData.vatNumber || '')
      setAddress(initialData.address || '')
      setReferredBy(initialData.referredBy || '')
      setNotes(initialData.notes || '')
      setStatus(initialData.status || 'ATTIVO')
      setAttachments(initialData.attachments || [])
    } else {
      const defaultId =
        selectedCompanyId && selectedCompanyId !== 'all'
          ? selectedCompanyId
          : companies[0]?.id || ''
      setCompanyId(defaultId)
      setName('')
      setEmail('')
      setPhone('')
      setVatNumber('')
      setAddress('')
      setReferredBy('')
      setNotes('')
      setStatus('ATTIVO')
      setAttachments([])
    }
    setSelectedFile(null)
    setError('')
  }, [initialData, selectedCompanyId, companies, isOpen])

  if (!isOpen) return null

  const activeCompanyId = companyId || (selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id) || ''

  const handleFileUpload = async (customerId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const newAttachment = await uploadAttachment(customerId, formData)
    return newAttachment
  }

  const handleDirectUpload = async () => {
    if (!initialData?.id || !selectedFile) return
    try {
      setUploading(true)
      setError('')
      const newAtt = await handleFileUpload(initialData.id, selectedFile)
      setAttachments((prev) => [newAtt as unknown as Attachment, ...prev])
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
      await deleteAttachment(attachmentId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Errore durante la rimozione dell\'allegato.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetCompanyId = activeCompanyId

    if (!name.trim()) {
      setError('Il nome del cliente è obbligatorio.')
      return
    }
    if (!targetCompanyId) {
      setError('Seleziona un\'azienda per il cliente.')
      return
    }

    try {
      setLoading(true)
      setError('')

      let savedCustomer: any
      if (initialData?.id) {
        savedCustomer = await updateCustomer(initialData.id, {
          companyId: targetCompanyId,
          name,
          email,
          phone,
          vatNumber,
          address,
          referredBy,
          notes,
          status,
        })
      } else {
        savedCustomer = await createCustomer({
          companyId: targetCompanyId,
          name,
          email,
          phone,
          vatNumber,
          address,
          referredBy,
          notes,
          status,
        })
      }

      if (!initialData?.id && selectedFile && savedCustomer?.id) {
        await handleFileUpload(savedCustomer.id, selectedFile)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {initialData ? 'Modifica Cliente' : 'Nuovo Cliente'}
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
          {/* Company Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Azienda di appartenenza *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={activeCompanyId}
                onChange={(e) => setCompanyId(e.target.value)}
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
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Nome / Ragione Sociale *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Es. Mario Rossi S.r.l."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Presentato Da / Referente */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Presentato da / Referente
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <input
                  type="text"
                  placeholder="Es. Dott. Bianchi / Partner X"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="w-full rounded-xl border border-blue-200 bg-blue-50/20 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-white"
                />
              </div>
            </div>

            {/* Vat Number / Tax Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                P.IVA / Codice Fiscale
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Es. IT01234567890"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Telefono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+39 02 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Stato Cliente
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ATTIVO">ATTIVO</option>
                <option value="POTENZIALE">POTENZIALE</option>
                <option value="INATTIVO">INATTIVO</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Indirizzo
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Via Roma 10, Milano"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Note / Dettagli
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Informazioni utili, accordi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-blue-500" /> Allegati e Documenti
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

            {/* File Input Box */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
              />
            </div>

            {/* Existing Attachments List */}
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-500/20"
            >
              {loading ? 'Salvataggio...' : initialData ? 'Aggiorna Cliente' : 'Crea Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
