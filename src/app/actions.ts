'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { promises as fs } from 'fs'
import path from 'path'
import {
  getSession,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  UserSession,
} from '@/lib/auth'

export interface CustomerInput {
  companyId: string
  name: string
  email?: string
  phone?: string
  vatNumber?: string
  address?: string
  referredBy?: string
  notes?: string
  status?: string
}

export interface TransactionInput {
  companyId: string
  customerId?: string | null
  type: string // ENTRATA or USCITA
  category?: string
  amount: number
  description: string
  date?: Date | string
  paymentMethod?: string
}

// ----------------------------------------------------
// AUTH ACTIONS
// ----------------------------------------------------

export async function loginAction(formData: FormData) {
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'Email e password sono obbligatori.' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  })

  if (!user) {
    return { error: 'Credenziali non valide.' }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { error: 'Credenziali non valide.' }
  }

  const sessionPayload: UserSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    companyName: user.company?.name,
    companyCode: user.company?.code,
    companyColor: user.company?.color,
  }

  const token = await createSessionToken(sessionPayload)
  await setSessionCookie(token)

  revalidatePath('/')
  return { success: true }
}

export async function logoutAction() {
  await clearSessionCookie()
  revalidatePath('/')
}

export async function getCurrentUser() {
  return await getSession()
}

// ----------------------------------------------------
// COMPANY & CUSTOMER ACTIONS (WITH MULTI-TENANT CHECKS)
// ----------------------------------------------------

export async function getCompanies() {
  const session = await getSession()
  if (!session) return []

  if (session.role !== 'SUPERADMIN' && session.companyId) {
    return await prisma.company.findMany({
      where: { id: session.companyId },
      include: {
        _count: {
          select: { customers: true, transactions: true },
        },
      },
      orderBy: { code: 'asc' },
    })
  }

  return await prisma.company.findMany({
    include: {
      _count: {
        select: { customers: true, transactions: true },
      },
    },
    orderBy: { code: 'asc' },
  })
}

export async function getCustomers(companyIdFilter?: string, search?: string) {
  const session = await getSession()
  if (!session) return []

  const whereClause: any = {}

  if (session.role !== 'SUPERADMIN' && session.companyId) {
    whereClause.companyId = session.companyId
  } else if (companyIdFilter && companyIdFilter !== 'all') {
    whereClause.companyId = companyIdFilter
  }

  if (search && search.trim() !== '') {
    const query = search.trim()
    whereClause.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
      { vatNumber: { contains: query } },
      { phone: { contains: query } },
      { address: { contains: query } },
      { referredBy: { contains: query } },
    ]
  }

  return await prisma.customer.findMany({
    where: whereClause,
    include: {
      company: true,
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createCustomer(data: CustomerInput) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato. Effettua il login.')
  }

  if (!data.name || !data.companyId) {
    throw new Error('Nome cliente e azienda sono obbligatori')
  }

  const targetCompanyId =
    session.role !== 'SUPERADMIN' && session.companyId ? session.companyId : data.companyId

  const customer = await prisma.customer.create({
    data: {
      companyId: targetCompanyId,
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      vatNumber: data.vatNumber?.trim() || null,
      address: data.address?.trim() || null,
      referredBy: data.referredBy?.trim() || null,
      notes: data.notes?.trim() || null,
      status: data.status || 'ATTIVO',
    },
  })

  revalidatePath('/')
  return customer
}

export async function updateCustomer(id: string, data: Partial<CustomerInput>) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const existing = await prisma.customer.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Cliente non trovato')
  }

  if (session.role !== 'SUPERADMIN' && existing.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per modificare questo cliente.')
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      email: data.email !== undefined ? (data.email?.trim() || null) : undefined,
      phone: data.phone !== undefined ? (data.phone?.trim() || null) : undefined,
      vatNumber: data.vatNumber !== undefined ? (data.vatNumber?.trim() || null) : undefined,
      address: data.address !== undefined ? (data.address?.trim() || null) : undefined,
      referredBy: data.referredBy !== undefined ? (data.referredBy?.trim() || null) : undefined,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : undefined,
      ...(data.status && { status: data.status }),
    },
  })

  revalidatePath('/')
  return customer
}

export async function deleteCustomer(id: string) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const existing = await prisma.customer.findUnique({
    where: { id },
    include: { attachments: true },
  })

  if (!existing) {
    throw new Error('Cliente non trovato')
  }

  if (session.role !== 'SUPERADMIN' && existing.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per eliminare questo cliente.')
  }

  for (const att of existing.attachments) {
    try {
      const filePath = path.join(process.cwd(), 'public', att.fileUrl)
      await fs.unlink(filePath)
    } catch {
      // Ignore
    }
  }

  await prisma.customer.delete({
    where: { id },
  })
  revalidatePath('/')
}

// ----------------------------------------------------
// CUSTOMER ATTACHMENT ACTIONS
// ----------------------------------------------------

export async function uploadAttachment(customerId: string, formData: FormData) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) {
    throw new Error('Cliente non trovato')
  }

  if (session.role !== 'SUPERADMIN' && customer.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per allegare file a questo cliente.')
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    throw new Error('Nessun file selezionato')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })

  const fileExtension = path.extname(file.name)
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueFileName = `${Date.now()}_${sanitizedOriginalName}`
  const filePath = path.join(uploadsDir, uniqueFileName)

  await fs.writeFile(filePath, buffer)

  const fileUrl = `/uploads/${uniqueFileName}`

  const attachment = await prisma.attachment.create({
    data: {
      customerId,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type || fileExtension,
    },
  })

  revalidatePath('/')
  return attachment
}

export async function deleteAttachment(attachmentId: string) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { customer: true },
  })

  if (!attachment) {
    throw new Error('Allegato non trovato')
  }

  if (session.role !== 'SUPERADMIN' && attachment.customer.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per eliminare questo allegato.')
  }

  try {
    const filePath = path.join(process.cwd(), 'public', attachment.fileUrl)
    await fs.unlink(filePath)
  } catch {
    // Ignore
  }

  await prisma.attachment.delete({
    where: { id: attachmentId },
  })

  revalidatePath('/')
}

// ----------------------------------------------------
// FINANCIAL TRANSACTIONS ACTIONS (ENTRATE & USCITE)
// ----------------------------------------------------

export async function getTransactions(
  companyIdFilter?: string,
  typeFilter?: string,
  search?: string
) {
  const session = await getSession()
  if (!session) return []

  const whereClause: any = {}

  if (session.role !== 'SUPERADMIN' && session.companyId) {
    whereClause.companyId = session.companyId
  } else if (companyIdFilter && companyIdFilter !== 'all') {
    whereClause.companyId = companyIdFilter
  }

  if (typeFilter && typeFilter !== 'ALL') {
    whereClause.type = typeFilter
  }

  if (search && search.trim() !== '') {
    const query = search.trim()
    whereClause.OR = [
      { description: { contains: query } },
      { category: { contains: query } },
      { paymentMethod: { contains: query } },
      { customer: { name: { contains: query } } },
    ]
  }

  return await prisma.transaction.findMany({
    where: whereClause,
    include: {
      company: true,
      customer: true,
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { date: 'desc' },
  })
}

export async function createTransaction(data: TransactionInput) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato.')
  }

  if (!data.amount || !data.description || !data.type || !data.companyId) {
    throw new Error('Importo, descrizione, tipo ed azienda sono obbligatori.')
  }

  const targetCompanyId =
    session.role !== 'SUPERADMIN' && session.companyId ? session.companyId : data.companyId

  const transaction = await prisma.transaction.create({
    data: {
      companyId: targetCompanyId,
      customerId: data.customerId || null,
      type: data.type,
      category: data.category?.trim() || null,
      amount: Number(data.amount),
      description: data.description.trim(),
      date: data.date ? new Date(data.date) : new Date(),
      paymentMethod: data.paymentMethod?.trim() || null,
    },
  })

  revalidatePath('/')
  return transaction
}

export async function updateTransaction(id: string, data: Partial<TransactionInput>) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const existing = await prisma.transaction.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Transazione non trovata')
  }

  if (session.role !== 'SUPERADMIN' && existing.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per modificare questa transazione.')
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      customerId: data.customerId !== undefined ? (data.customerId || null) : undefined,
      ...(data.type && { type: data.type }),
      category: data.category !== undefined ? (data.category?.trim() || null) : undefined,
      ...(data.amount !== undefined && { amount: Number(data.amount) }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.date && { date: new Date(data.date) }),
      paymentMethod: data.paymentMethod !== undefined ? (data.paymentMethod?.trim() || null) : undefined,
    },
  })

  revalidatePath('/')
  return transaction
}

export async function deleteTransaction(id: string) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { attachments: true },
  })

  if (!existing) {
    throw new Error('Transazione non trovata')
  }

  if (session.role !== 'SUPERADMIN' && existing.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per eliminare questa transazione.')
  }

  for (const att of existing.attachments) {
    try {
      const filePath = path.join(process.cwd(), 'public', att.fileUrl)
      await fs.unlink(filePath)
    } catch {
      // Ignore
    }
  }

  await prisma.transaction.delete({
    where: { id },
  })

  revalidatePath('/')
}

export async function uploadTransactionAttachment(transactionId: string, formData: FormData) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!tx) {
    throw new Error('Transazione non trovata')
  }

  if (session.role !== 'SUPERADMIN' && tx.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per allegare file a questa transazione.')
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    throw new Error('Nessun file selezionato')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })

  const fileExtension = path.extname(file.name)
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueFileName = `tx_${Date.now()}_${sanitizedOriginalName}`
  const filePath = path.join(uploadsDir, uniqueFileName)

  await fs.writeFile(filePath, buffer)

  const fileUrl = `/uploads/${uniqueFileName}`

  const attachment = await prisma.transactionAttachment.create({
    data: {
      transactionId,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type || fileExtension,
    },
  })

  revalidatePath('/')
  return attachment
}

export async function deleteTransactionAttachment(attachmentId: string) {
  const session = await getSession()
  if (!session) {
    throw new Error('Non autorizzato')
  }

  const attachment = await prisma.transactionAttachment.findUnique({
    where: { id: attachmentId },
    include: { transaction: true },
  })

  if (!attachment) {
    throw new Error('Allegato non trovato')
  }

  if (session.role !== 'SUPERADMIN' && attachment.transaction.companyId !== session.companyId) {
    throw new Error('Non disponi dei permessi per eliminare questo allegato.')
  }

  try {
    const filePath = path.join(process.cwd(), 'public', attachment.fileUrl)
    await fs.unlink(filePath)
  } catch {
    // Ignore
  }

  await prisma.transactionAttachment.delete({
    where: { id: attachmentId },
  })

  revalidatePath('/')
}
