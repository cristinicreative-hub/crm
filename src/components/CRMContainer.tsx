'use client'

import { useState, useTransition } from 'react'
import CompanyTabs from './CompanyTabs'
import CustomerTable from './CustomerTable'
import CustomerFormModal from './CustomerFormModal'
import TransactionTable from './TransactionTable'
import TransactionFormModal from './TransactionFormModal'
import { Building2, Users, CheckCircle, Clock, Euro, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react'
import { getCustomers, getTransactions } from '@/app/actions'

interface Company {
  id: string
  name: string
  code: string
  color: string
  description?: string | null
  _count?: {
    customers: number
    transactions?: number
  }
}

interface CRMContainerProps {
  initialCompanies: Company[]
  initialCustomers: any[]
  initialTransactions: any[]
}

export default function CRMContainer({
  initialCompanies,
  initialCustomers,
  initialTransactions,
}: CRMContainerProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [customers, setCustomers] = useState<any[]>(initialCustomers)
  const [transactions, setTransactions] = useState<any[]>(initialTransactions)

  const [activeTab, setActiveTab] = useState<'customers' | 'finance'>('customers')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState<string>('ALL')

  const [isPending, startTransition] = useTransition()

  // Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null)

  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<any | null>(null)

  const reloadData = (
    tab = activeTab,
    companyId = selectedCompanyId,
    search = searchQuery,
    typeF = txTypeFilter
  ) => {
    startTransition(async () => {
      if (tab === 'customers') {
        const updatedCustomers = await getCustomers(companyId, search)
        setCustomers(updatedCustomers)
      } else {
        const updatedTransactions = await getTransactions(companyId, typeF, search)
        setTransactions(updatedTransactions)
      }
    })
  }

  const handleTabChange = (newTab: 'customers' | 'finance') => {
    setActiveTab(newTab)
    setSearchQuery('')
    reloadData(newTab, selectedCompanyId, '', txTypeFilter)
  }

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id)
    reloadData(activeTab, id, searchQuery, txTypeFilter)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    reloadData(activeTab, selectedCompanyId, query, txTypeFilter)
  }

  const handleTxTypeFilterChange = (type: string) => {
    setTxTypeFilter(type)
    reloadData(activeTab, selectedCompanyId, searchQuery, type)
  }

  // Customer Modal handlers
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null)
    setIsCustomerModalOpen(true)
  }
  const handleOpenEditCustomer = (c: any) => {
    setEditingCustomer(c)
    setIsCustomerModalOpen(true)
  }

  // Transaction Modal handlers
  const handleOpenAddTx = () => {
    setEditingTx(null)
    setIsTxModalOpen(true)
  }
  const handleOpenEditTx = (tx: any) => {
    setEditingTx(tx)
    setIsTxModalOpen(true)
  }

  const handleSuccess = () => {
    reloadData()
  }

  // Calculate totals
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === 'ATTIVO').length
  const potentialCustomers = customers.filter((c) => c.status === 'POTENZIALE').length

  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30 mb-2">
            <Building2 className="h-3.5 w-3.5" /> Gestione Multi-Aziendale (4 Aziende)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {selectedCompanyId === 'all'
              ? 'Dashboard Centralizzata Gruppo'
              : `Dashboard - ${selectedCompanyObj?.name}`}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Gestione integrata dell'Anagrafica Clienti e della Prima Nota Entrate/Uscite con allegati.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 min-w-28 text-center">
            <div className="text-2xl font-black">{totalCustomers}</div>
            <div className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> Clienti
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-500/20 p-3.5 backdrop-blur-md border border-emerald-500/30 min-w-28 text-center text-emerald-300">
            <div className="text-2xl font-black">{activeCustomers}</div>
            <div className="text-xs font-medium flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> Attivi
            </div>
          </div>
          <div className="rounded-2xl bg-amber-500/20 p-3.5 backdrop-blur-md border border-amber-500/30 min-w-28 text-center text-amber-300">
            <div className="text-2xl font-black">{potentialCustomers}</div>
            <div className="text-xs font-medium flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Potenziali
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Navigation Tabs (Clienti vs Entrate/Uscite) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('customers')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
              activeTab === 'customers'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Anagrafica Clienti
          </button>
          <button
            onClick={() => handleTabChange('finance')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
              activeTab === 'finance'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Euro className="h-4 w-4" />
            Entrate & Uscite
          </button>
        </div>
      </div>

      {/* Company Selector Filter */}
      <CompanyTabs
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={handleSelectCompany}
        totalCustomersCount={activeTab === 'customers' ? customers.length : transactions.length}
      />

      {/* Main Tab Content */}
      {activeTab === 'customers' ? (
        <CustomerTable
          customers={customers}
          onEdit={handleOpenEditCustomer}
          onAddClick={handleOpenAddCustomer}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          loading={isPending}
        />
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={handleOpenEditTx}
          onAddClick={handleOpenAddTx}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          typeFilter={txTypeFilter}
          onTypeFilterChange={handleTxTypeFilterChange}
          loading={isPending}
        />
      )}

      {/* Customer Modal Form */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        initialData={editingCustomer}
        onSuccess={handleSuccess}
      />

      {/* Transaction Modal Form */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        companies={companies}
        customers={customers}
        selectedCompanyId={selectedCompanyId}
        initialData={editingTx}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
