import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.transactionAttachment.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.user.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.company.deleteMany()

  // 1. Create the 4 companies
  const comp1 = await prisma.company.create({
    data: {
      name: 'EPIKASIA SRL',
      code: 'AZ-01',
      color: '#2563eb', // Blue
      description: 'Consulenza aziendale e servizi',
    },
  })

  const comp2 = await prisma.company.create({
    data: {
      name: 'ASCH ADVISORY',
      code: 'AZ-02',
      color: '#059669', // Emerald
      description: 'Advisory finanziario e strategico',
    },
  })

  const comp3 = await prisma.company.create({
    data: {
      name: 'CHLU COCHE',
      code: 'AZ-03',
      color: '#d97706', // Amber
      description: 'Servizi e mobilità',
    },
  })

  const comp4 = await prisma.company.create({
    data: {
      name: 'EQUIPE AUTOMOTIVE',
      code: 'AZ-04',
      color: '#7c3aed', // Violet
      description: 'Settore automotive e flotte',
    },
  })

  // Hash password for users
  const defaultPasswordHash = await bcrypt.hash('password123', 10)

  // 2. Create Users for each company & a Superadmin
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@epikasia.it',
        password: defaultPasswordHash,
        name: 'Admin Epikasia',
        role: 'ADMIN',
        companyId: comp1.id,
      },
      {
        email: 'admin@asch.it',
        password: defaultPasswordHash,
        name: 'Admin Asch Advisory',
        role: 'ADMIN',
        companyId: comp2.id,
      },
      {
        email: 'admin@chlucoche.it',
        password: defaultPasswordHash,
        name: 'Admin Chlu Coche',
        role: 'ADMIN',
        companyId: comp3.id,
      },
      {
        email: 'admin@equipeauto.it',
        password: defaultPasswordHash,
        name: 'Admin Equipe Automotive',
        role: 'ADMIN',
        companyId: comp4.id,
      },
      {
        email: 'superadmin@crm.it',
        password: defaultPasswordHash,
        name: 'Amministratore Generale',
        role: 'SUPERADMIN',
        companyId: null,
      },
    ],
  })

  // 3. Create Demo Customers for EACH company
  // EPIKASIA SRL Customers
  const custEpikasia1 = await prisma.customer.create({
    data: {
      companyId: comp1.id,
      name: 'Rossi Costruzioni S.r.l.',
      email: 'info@rossicostruzioni.it',
      phone: '+39 02 1234567',
      vatNumber: 'IT01234567890',
      address: 'Via Roma 10, Milano',
      referredBy: 'Dott. Studio Bianchi',
      notes: 'Consulenza aziendale continuativa',
      status: 'ATTIVO',
    },
  })
  const custEpikasia2 = await prisma.customer.create({
    data: {
      companyId: comp1.id,
      name: 'Milano Tech Hub S.p.A.',
      email: 'amministrazione@milanotech.it',
      phone: '+39 02 9876543',
      vatNumber: 'IT09876543211',
      address: 'Corso Buenos Aires 45, Milano',
      referredBy: 'Ing. Ferrari',
      notes: 'Richiesta revisione processi gestionali',
      status: 'POTENZIALE',
    },
  })

  // ASCH ADVISORY Customers
  const custAsch1 = await prisma.customer.create({
    data: {
      companyId: comp2.id,
      name: 'Studio Legale Verdi & Partners',
      email: 'contatti@verdistudio.it',
      phone: '+39 06 5554321',
      vatNumber: 'IT05554321098',
      address: 'Piazza Navona 12, Roma',
      referredBy: 'Avv. De Luca',
      notes: 'Advisory finanziario annuale',
      status: 'ATTIVO',
    },
  })
  const custAsch2 = await prisma.customer.create({
    data: {
      companyId: comp2.id,
      name: 'Capitale Nord Investimenti',
      email: 'finance@capitalenord.it',
      phone: '+39 011 4433221',
      vatNumber: 'IT04433221122',
      address: 'Via Po 8, Torino',
      referredBy: 'Dott.ssa Moretti',
      notes: 'Operazione M&A e Due Diligence',
      status: 'ATTIVO',
    },
  })

  // CHLU COCHE Customers
  const custChlu1 = await prisma.customer.create({
    data: {
      companyId: comp3.id,
      name: 'EuroTransport Group S.r.l.',
      email: 'logistica@eurotransport.eu',
      phone: '+39 045 778899',
      vatNumber: 'IT07788990011',
      address: 'Viale Lavoro 8, Verona',
      referredBy: 'Marco Santini',
      notes: 'Gestione flotta e mobilità executive',
      status: 'ATTIVO',
    },
  })
  const custChlu2 = await prisma.customer.create({
    data: {
      companyId: comp3.id,
      name: 'Hotel Mirage Luxury',
      email: 'direzione@hotelmirage.it',
      phone: '+39 041 332211',
      vatNumber: 'IT03322110099',
      address: 'Riva degli Schiavoni 20, Venezia',
      referredBy: 'Direttore Conti',
      notes: 'Servizio navetta VIP ed eventi',
      status: 'ATTIVO',
    },
  })

  // EQUIPE AUTOMOTIVE Customers
  const custEquipe1 = await prisma.customer.create({
    data: {
      companyId: comp4.id,
      name: 'Autonoleggio Bellavista',
      email: 'info@autonoleggiobellavista.it',
      phone: '+39 081 443322',
      vatNumber: 'IT04433221100',
      address: 'Via Posillipo 100, Napoli',
      referredBy: 'Gennaro Russo',
      notes: 'Manutenzione e fornitura veicoli commerciali',
      status: 'ATTIVO',
    },
  })
  const custEquipe2 = await prisma.customer.create({
    data: {
      companyId: comp4.id,
      name: 'Fleet Logistics Sud',
      email: 'flotta@fleetlogistics.it',
      phone: '+39 080 554433',
      vatNumber: 'IT05544332211',
      address: 'Zona Industriale Macchia, Bari',
      referredBy: 'Ing. Romano',
      notes: 'Contratto per assistenza tecnica 24/7',
      status: 'ATTIVO',
    },
  })

  // 4. Create Demo Transactions (Entrate & Uscite) for ALL 4 companies
  await prisma.transaction.createMany({
    data: [
      // EPIKASIA SRL
      {
        companyId: comp1.id,
        customerId: custEpikasia1.id,
        type: 'ENTRATA',
        category: 'Fatturazione',
        amount: 5400.0,
        description: 'Fattura n. 14/2026 - Consulenza Strategica e Processi',
        date: new Date('2026-08-15'),
        paymentMethod: 'Bonifico',
      },
      {
        companyId: comp1.id,
        customerId: custEpikasia2.id,
        type: 'ENTRATA',
        category: 'Consulenza',
        amount: 2200.0,
        description: 'Acconto Audit Gestionale Milano Tech',
        date: new Date('2026-08-10'),
        paymentMethod: 'Bonifico',
      },
      {
        companyId: comp1.id,
        type: 'USCITA',
        category: 'Tasse',
        amount: 1150.0,
        description: 'Imposte e Contributi F24 Mese di Luglio',
        date: new Date('2026-08-16'),
        paymentMethod: 'RID',
      },
      {
        companyId: comp1.id,
        type: 'USCITA',
        category: 'Consulenza',
        amount: 650.0,
        description: 'Server Cloud & Piattaforme Software API',
        date: new Date('2026-08-18'),
        paymentMethod: 'Carta',
      },

      // ASCH ADVISORY
      {
        companyId: comp2.id,
        customerId: custAsch1.id,
        type: 'ENTRATA',
        category: 'Fatturazione',
        amount: 14500.0,
        description: 'Fattura n. 32/2026 - Advisory Finanziario Anno 2026',
        date: new Date('2026-08-12'),
        paymentMethod: 'Bonifico',
      },
      {
        companyId: comp2.id,
        customerId: custAsch2.id,
        type: 'ENTRATA',
        category: 'Consulenza',
        amount: 8800.0,
        description: 'Parere di Stima M&A Capitale Nord',
        date: new Date('2026-08-20'),
        paymentMethod: 'Bonifico',
      },
      {
        companyId: comp2.id,
        type: 'USCITA',
        category: 'Stipendi',
        amount: 4500.0,
        description: 'Stipendi Collaboratori e Senior Advisor',
        date: new Date('2026-08-01'),
        paymentMethod: 'Bonifico',
      },

      // CHLU COCHE
      {
        companyId: comp3.id,
        customerId: custChlu1.id,
        type: 'ENTRATA',
        category: 'Noleggio',
        amount: 7200.0,
        description: 'Incasso Servizi Mobilità EuroTransport',
        date: new Date('2026-08-21'),
        paymentMethod: 'RID',
      },
      {
        companyId: comp3.id,
        customerId: custChlu2.id,
        type: 'ENTRATA',
        category: 'Noleggio',
        amount: 3900.0,
        description: 'Servizio Navetta VIP Hotel Mirage',
        date: new Date('2026-08-22'),
        paymentMethod: 'Bonifico',
      },
      {
        companyId: comp3.id,
        type: 'USCITA',
        category: 'Fornitore',
        amount: 1800.0,
        description: 'Carburante e Pedaggi Autostradali Flotta',
        date: new Date('2026-08-23'),
        paymentMethod: 'Carta',
      },

      // EQUIPE AUTOMOTIVE
      {
        companyId: comp4.id,
        customerId: custEquipe1.id,
        type: 'ENTRATA',
        category: 'Fatturazione',
        amount: 18500.0,
        description: 'Fattura n. 77/2026 - Fornitura e Allestimento Veicoli',
        date: new Date('2026-08-19'),
        paymentMethod: 'Bonifico',
      },
      {
        companyId: comp4.id,
        customerId: custEquipe2.id,
        type: 'ENTRATA',
        category: 'Fatturazione',
        amount: 6400.0,
        description: 'Canone Manutenzione Programmata Flotta Sud',
        date: new Date('2026-08-23'),
        paymentMethod: 'RID',
      },
      {
        companyId: comp4.id,
        type: 'USCITA',
        category: 'Fornitore',
        amount: 5100.0,
        description: 'Ricambi Originali e Tagliandi Officina',
        date: new Date('2026-08-24'),
        paymentMethod: 'Bonifico',
      },
    ],
  })

  console.log('Database re-seeded with demo customers & transactions for all 4 companies successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
