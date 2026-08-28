import { getCompanies, getCustomers, getTransactions, getCurrentUser, logoutAction } from './actions'
import CRMContainer from '@/components/CRMContainer'
import LoginForm from '@/components/LoginForm'
import { LogOut, User, Building2, Shield } from 'lucide-react'

export const revalidate = 0

export default async function Home() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <LoginForm />
  }

  const companies = await getCompanies()
  const customers = await getCustomers()
  const transactions = await getTransactions()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
              4
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Multi-Company <span className="text-blue-600 dark:text-blue-400">CRM</span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Piattaforma di Gestione Clienti & Contabilità
              </p>
            </div>
          </div>

          {/* User Profile & Company Access Badge & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-200 pr-4 dark:border-slate-800">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.email}
                </div>
              </div>

              {currentUser.role === 'SUPERADMIN' ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  <Shield className="h-3.5 w-3.5" /> SUPER ADMIN
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: currentUser.companyColor || '#2563eb' }}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {currentUser.companyName} [{currentUser.companyCode}]
                </span>
              )}
            </div>

            {/* Logout Form */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnetti
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main CRM Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CRMContainer
          initialCompanies={companies}
          initialCustomers={customers}
          initialTransactions={transactions}
        />
      </main>
    </div>
  )
}
