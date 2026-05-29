const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: false
}))

app.use(express.json())

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fandresenanatolo@gmail.com',
    pass: process.env.GMAIL_PASS || 'qnhc byir kxvy netc',
  },
})

const bookings = []

//  TEST ROUTE 
app.get('/', (req, res) => {
  res.json({ message: 'Backend Fandresena Hotel tourne !' })
})

//  RESERVATION 
app.post('/booking', async (req, res) => {
  const { name, email, checkin, checkout, guests, hotel_id, hotel_name, total_price } = req.body

  if (!name || !email || !checkin || !checkout || !hotel_id) {
    return res.status(400).json({ success: false, message: 'Donnees manquantes' })
  }

  const booking = {
    id: bookings.length + 1,
    name, email, checkin, checkout,
    guests, hotel_id, hotel_name, total_price,
    created_at: new Date().toISOString()
  }
  bookings.push(booking)
  console.log('Nouvelle reservation:', booking)

  try {
    // EMAIL AU PROPRIETAIRE
    await transporter.sendMail({
      from: 'fandresenanatolo@gmail.com',
      to: 'fandresenanatolo@gmail.com',
      subject: `🏨 Nouvelle reservation — ${hotel_name}`,
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;background:#0f172a;color:#f8fafc;padding:30px;border-radius:16px">
          <h1 style="color:#60a5fa;text-align:center">🏨 Fandresena Hotel</h1>
          <h2 style="color:#f8fafc;text-align:center">Nouvelle reservation confirmee</h2>
          <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0">
            <p><strong style="color:#94a3b8">Client :</strong> ${name}</p>
            <p><strong style="color:#94a3b8">Email :</strong> ${email}</p>
            <p><strong style="color:#94a3b8">Hotel :</strong> ${hotel_name}</p>
            <p><strong style="color:#94a3b8">Arrivee :</strong> ${checkin}</p>
            <p><strong style="color:#94a3b8">Depart :</strong> ${checkout}</p>
            <p><strong style="color:#94a3b8">Voyageurs :</strong> ${guests}</p>
            <p style="font-size:20px;color:#22c55e"><strong>Total : $${total_price}</strong></p>
          </div>
        </div>
      `,
    })

    // EMAIL AU CLIENT
    await transporter.sendMail({
      from: 'fandresenanatolo@gmail.com',
      to: email,
      subject: `✅ Confirmation reservation — ${hotel_name}`,
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;background:#0f172a;color:#f8fafc;padding:30px;border-radius:16px">
          <h1 style="color:#60a5fa;text-align:center">🏨 Fandresena Hotel</h1>
          <h2 style="color:#22c55e;text-align:center">✅ Reservation confirmee !</h2>
          <p style="text-align:center;color:#94a3b8">Bonjour <strong style="color:#f8fafc">${name}</strong></p>
          <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0">
            <p><strong style="color:#94a3b8">Hotel :</strong> ${hotel_name}</p>
            <p><strong style="color:#94a3b8">Arrivee :</strong> ${checkin}</p>
            <p><strong style="color:#94a3b8">Depart :</strong> ${checkout}</p>
            <p><strong style="color:#94a3b8">Voyageurs :</strong> ${guests}</p>
            <p style="font-size:20px;color:#22c55e"><strong>Total : $${total_price}</strong></p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:13px">
            WhatsApp : 034 260 3832 | Email : fandresenanatolo@gmail.com
          </p>
        </div>
      `,
    })

    res.json({ success: true, message: 'Reservation confirmee et emails envoyes !' })

  } catch (err) {
    console.error('Erreur email:', err.message)
    res.json({ success: true, message: 'Reservation enregistree !' })
  }
})

//  CONTACT 
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Donnees manquantes' })
  }

  try {
    await transporter.sendMail({
      from: 'fandresenanatolo@gmail.com',
      to: 'fandresenanatolo@gmail.com',
      subject: `📩 Message de ${name}`,
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;background:#0f172a;color:#f8fafc;padding:30px;border-radius:16px">
          <h1 style="color:#60a5fa;text-align:center">🏨 Fandresena Hotel</h1>
          <h2 style="color:#f8fafc">Nouveau message de contact</h2>
          <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0">
            <p><strong style="color:#94a3b8">Nom :</strong> ${name}</p>
            <p><strong style="color:#94a3b8">Email :</strong> ${email}</p>
            <p><strong style="color:#94a3b8">Message :</strong><br>${message}</p>
          </div>
        </div>
      `,
    })
    res.json({ success: true, message: 'Message envoye !' })
  } catch (err) {
    console.error('Erreur email:', err.message)
    res.status(500).json({ success: false, message: 'Erreur envoi email' })
  }
})

// ── LISTE RESERVATIONS 
app.get('/bookings', (req, res) => {
  res.json(bookings)
})

app.listen(PORT, () => {
  console.log(`✅ Backend tourne sur le port ${PORT}`)
})