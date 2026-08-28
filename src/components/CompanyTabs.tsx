'use client'

import { Building2, Layers } from 'lucide-react'

interface Company {
  id: string
  name: string
  code: string
  color: string
  _count?: {
    customers: number
  }
}

interface CompanyTabsProps {
  companies: Company[]
  selectedCompanyId: string
  onSelectCompany: (id: string) => void
  totalCustomersCount: number
}

export default function CompanyTabs({
  companies,
  selectedCompanyId,
  onSelectCompany,
  totalCustomersCount,
}: CompanyTabsProps) {
  if (companies.length <= 1) {
    const singleCompany = companies[0]
    if (!singleCompany) return null
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md"
          style={{ backgroundColor: singleCompany.color }}
        >
          <Building2 className="h-4 w-4" />
          <span>Azienda: {singleCompany.name}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
            {totalCustomersCount} clienti
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
      <button
        onClick={() => onSelectCompany('all')}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          selectedCompanyId === 'all'
            ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
        }`}
      >
        <Layers className="h-4 w-4" />
        Tutte le Aziende ({totalCustomersCount})
      </button>

      {companies.map((company) => {
        const isSelected = selectedCompanyId === company.id
        return (
          <button
            key={company.id}
            onClick={() => onSelectCompany(company.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition border ${
              isSelected
                ? 'border-transparent text-white shadow-md'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            style={{
              backgroundColor: isSelected ? company.color : undefined,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: isSelected ? '#ffffff' : company.color,
              }}
            />
            <span>{company.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {company._count?.customers ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
