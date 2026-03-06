import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import postgres from 'postgres'

// Connect to your database
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })
const app = new Hono()

app.use('/*', cors())

// In-memory store for rate limiting (10 times per minute per IP)
const requestCounts = new Map()

function rateLimit(limit, windowMs) {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const record = requestCounts.get(ip)

    if (!record || now - record.timestamp > windowMs) {
      // First request or window expired — reset
      requestCounts.set(ip, { count: 1, timestamp: now })
    } else if (record.count >= limit) {
      return c.json({ error: 'Too many requests. Please slow down.' }, 429)
    } else {
      record.count++
    }
    await next()
  }
}

app.use('/shorten', rateLimit(10, 60 * 1000))

function generateCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]}
  return code
}

// Endpoint 1: POST /shorten
app.post('/shorten', async (c) => {
  const { url } = await c.req.json()

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    return c.json({ error: 'Invalid URL' }, 400)
  }

  // Generate a unique code and check if it already exists
  let code = generateCode()
  const existing = await sql`SELECT code FROM links WHERE code = ${code}`
  if (existing.length > 0) {
    code = generateCode()}

  // Save to database
  await sql`
    INSERT INTO links (code, original_url)
    VALUES (${code}, ${url})
  `

  const shortUrl = `http://localhost:3000/${code}`
  return c.json({ short: shortUrl, code })
})

// Endpoint 2: GET /:code
// Someone visits a short link, we redirect them
app.get('/:code', async (c) => {
  const code = c.req.param('code')

  const result = await sql `SELECT original_url FROM links WHERE code = ${code}`

  if (result.length === 0) {
    return c.text('Link not found', 404)}

  // Increment click count
  await sql`UPDATE links SET clicks = clicks + 1 WHERE code = ${code}`

  return c.redirect(result[0].original_url, 301)
})

// Start the server
serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Server running at http://localhost:3000')
})