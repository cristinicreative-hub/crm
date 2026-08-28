'use client'

import { useState } from 'react'
import { Lock, Mail, Building2, LogIn, AlertCircle, Sparkles } from 'lucide-react'
import { loginAction } from '@/app/actions'

export default function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    const res = await loginAction(formData)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      window.location.reload()
    }
  }

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/30 mb-4">
            4
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Accesso CRM Aziendale
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Inserisci le tue credenziali per accedere al CRM della tua azienda.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-950/60 p-3 text-sm text-red-400 border border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email aziendale
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="nome@azienda.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Accesso in corso...' : 'Accedi al CRM'}
            </button>
          </form>

          {/* Quick Demo Logins per Company */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Demo Quick Login (4 Aziende):
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@epikasia.it')}
                className="flex items-center gap-2 rounded-xl border border-blue-900/50 bg-blue-950/40 p-2.5 text-left text-blue-300 hover:bg-blue-900/60 transition"
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="truncate">
                  <div className="font-bold truncate">EPIKASIA SRL</div>
                  <div className="text-[10px] text-slate-400 truncate">AZ-01</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@asch.it')}
                className="flex items-center gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-2.5 text-left text-emerald-300 hover:bg-emerald-900/60 transition"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <div className="truncate">
                  <div className="font-bold truncate">ASCH ADVISORY</div>
                  <div className="text-[10px] text-slate-400 truncate">AZ-02</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@chlucoche.it')}
                className="flex items-center gap-2 rounded-xl border border-amber-900/50 bg-amber-950/40 p-2.5 text-left text-amber-300 hover:bg-amber-900/60 transition"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="truncate">
                  <div className="font-bold truncate">CHLU COCHE</div>
                  <div className="text-[10px] text-slate-400 truncate">AZ-03</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@equipeauto.it')}
                className="flex items-center gap-2 rounded-xl border border-purple-900/50 bg-purple-950/40 p-2.5 text-left text-purple-300 hover:bg-purple-900/60 transition"
              >
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="truncate">
                  <div className="font-bold truncate">EQUIPE AUTOMOTIVE</div>
                  <div className="text-[10px] text-slate-400 truncate">AZ-04</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin@crm.it')}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              Accedi come SuperAdmin (Tutte le 4 Aziende)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
