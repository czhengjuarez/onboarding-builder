import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as bcrypt from 'bcryptjs'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend requests
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// API Routes for onboarding templates
app.get('/api/templates/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM onboarding_templates WHERE user_id = ? ORDER BY period, created_at'
    ).bind(userId).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch templates' }, 500)
  }
})

app.post('/api/templates', async (c) => {
  const { userId, period, title, priority = 'medium' } = await c.req.json()
  
  if (!userId || !period || !title) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO onboarding_templates (id, user_id, period, title, priority) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, userId, period, title, priority).run()
    
    return c.json({ success: true, data: { id, userId, period, title, priority, completed: false } })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create template' }, 500)
  }
})

app.put('/api/templates/:id', async (c) => {
  const id = c.req.param('id')
  const { title, completed, priority } = await c.req.json()
  
  try {
    await c.env.DB.prepare(
      'UPDATE onboarding_templates SET title = ?, completed = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(title, completed, priority, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update template' }, 500)
  }
})

app.delete('/api/templates/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.DB.prepare('DELETE FROM onboarding_templates WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete template' }, 500)
  }
})

// API Routes for JTBD categories and resources
app.get('/api/jtbd/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  try {
    // Get JTBD categories with their resources
    const { results: categories } = await c.env.DB.prepare(
      'SELECT * FROM jtbd_categories WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    
    // Get resources for each category
    const categoriesWithResources = await Promise.all(
      categories.map(async (category: any) => {
        const { results: resources } = await c.env.DB.prepare(
          'SELECT * FROM resources WHERE category_id = ? ORDER BY created_at'
        ).bind(category.id).all()
        
        return {
          id: category.id,
          category: category.category,
          job: category.job,
          situation: category.situation,
          outcome: category.outcome,
          resources: resources
        }
      })
    )
    
    return c.json({ success: true, data: categoriesWithResources })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch JTBD resources' }, 500)
  }
})

app.post('/api/jtbd', async (c) => {
  const { userId, category, job, situation, outcome } = await c.req.json()
  
  if (!userId || !category || !job || !situation || !outcome) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, category, job, situation, outcome).run()
    
    return c.json({ success: true, data: { id, userId, category, job, situation, outcome, resources: [] } })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create JTBD category' }, 500)
  }
})

app.post('/api/jtbd/:categoryId/resources', async (c) => {
  const categoryId = c.req.param('categoryId')
  const { name, type, url } = await c.req.json()
  
  if (!name || !type || !url) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO resources (id, category_id, name, type, url) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, categoryId, name, type, url).run()
    
    return c.json({ success: true, data: { id, categoryId, name, type, url } })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create resource' }, 500)
  }
})

app.delete('/api/jtbd/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    // Delete the category and its resources (CASCADE should handle this)
    await c.env.DB.prepare('DELETE FROM jtbd_categories WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete JTBD category' }, 500)
  }
})

app.delete('/api/jtbd/resources/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.DB.prepare('DELETE FROM resources WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete resource' }, 500)
  }
})

// User management
app.post('/api/users', async (c) => {
  const { id, email, name, profileImageUrl } = await c.req.json()
  
  if (!id || !email || !name) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO users (id, email, name, profile_image_url, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(id, email, name, profileImageUrl).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create/update user' }, 500)
  }
})

// Authentication endpoints
app.get('/api/auth/google', async (c) => {
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  
  googleAuthUrl.searchParams.set('client_id', c.env.GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  
  return c.redirect(googleAuthUrl.toString())
})

// Config endpoint to provide Google Client ID to frontend
app.get('/api/auth/config', async (c) => {
  return c.json({
    googleClientId: c.env.GOOGLE_CLIENT_ID
  })
})

app.get('/api/auth/google/callback', async (c) => {
  const code = c.req.query('code')
  const error = c.req.query('error')
  
  if (error || !code) {
    return c.redirect('/?error=auth_failed')
  }
  
  try {
    const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })
    
    const tokens = await tokenResponse.json() as any
    
    if (!tokens.access_token) {
      return c.redirect('/?error=token_failed')
    }
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
    
    const userInfo = await userResponse.json() as any
    
    // Check if user exists, if not create new user
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ? OR email = ?'
    ).bind(userInfo.id, userInfo.email).first()
    
    if (user) {
      // Update existing user
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, profile_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(userInfo.name, userInfo.picture, user.id).run()
    } else {
      // Create new user
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, profile_image_url) VALUES (?, ?, ?, ?)'
      ).bind(userInfo.id, userInfo.email, userInfo.name, userInfo.picture).run()
      user = { id: userInfo.id, email: userInfo.email, name: userInfo.name, profile_image_url: userInfo.picture }
    }
    
    // Create JWT token (simplified for Cloudflare Workers)
    const tokenPayload = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }
    
    // Simple JWT-like token for Cloudflare Workers (in production, use proper JWT library)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify(tokenPayload))
    const signature = btoa(c.env.JWT_SECRET + header + payload) // Simplified signature
    const jwtToken = `${header}.${payload}.${signature}`
    
    // Prepare user data for URL
    const userData = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    }
    
    // Redirect back to app with token and user data (matching find-strengths-auth pattern)
    return c.redirect(`/?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify(userData))}`)
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.redirect('/?error=auth_error')
  }
})

app.get('/api/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    // Parse JWT token (simplified verification)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return c.json({ error: 'Invalid token format' }, 401)
    }
    
    const [header, payload, signature] = parts
    
    // Verify signature (simplified)
    const expectedSignature = btoa(c.env.JWT_SECRET + header + payload)
    if (signature !== expectedSignature) {
      return c.json({ error: 'Invalid token signature' }, 401)
    }
    
    // Decode payload
    const tokenData = JSON.parse(atob(payload))
    
    // Check if token is expired
    if (Date.now() / 1000 > tokenData.exp) {
      return c.json({ error: 'Token expired' }, 401)
    }
    
    // Verify user exists in database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(tokenData.id).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.profile_image_url
      }
    })
    
  } catch (error) {
    console.error('Token verification error:', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// Helper function to generate user ID
const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Helper function to create JWT token
const createJWT = (payload: any, secret: string) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (7 * 24 * 60 * 60) // 7 days
  
  const tokenPayload = { ...payload, iat: now, exp }
  
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(tokenPayload))
  const signature = btoa(secret + encodedHeader + encodedPayload)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Register new user with email/password
app.post('/api/auth/register', async (c) => {
  const { email, password, name } = await c.req.json()
  
  if (!email || !password || !name) {
    return c.json({ error: 'Email, password, and name are required' }, 400)
  }
  
  try {
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first() as any
    
    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400)
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Create user
    const userId = generateUserId()
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)'
    ).bind(userId, email, name, passwordHash).run()
    
    // Generate JWT token
    const token = createJWT(
      { id: userId, email, name },
      c.env.JWT_SECRET
    )
    
    return c.json({
      token,
      user: { id: userId, email, name }
    }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Login user with email/password
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }
  
  try {
    // Find user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first() as any
    
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    // Check password (handle case where user has no password - OAuth only)
    if (!user.password_hash) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash as string)
    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    // Generate JWT token
    const token = createJWT(
      { id: user.id, email: user.email, name: user.name },
      c.env.JWT_SECRET
    )
    
    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.profile_image_url
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete user account and all associated data
app.delete('/api/auth/delete-account', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    // Parse and verify JWT token
    const parts = token.split('.')
    if (parts.length !== 3) {
      return c.json({ error: 'Invalid token format' }, 401)
    }
    
    const [header, payload, signature] = parts
    const expectedSignature = btoa(c.env.JWT_SECRET + header + payload)
    if (signature !== expectedSignature) {
      return c.json({ error: 'Invalid token signature' }, 401)
    }
    
    const tokenData = JSON.parse(atob(payload))
    
    if (Date.now() / 1000 > tokenData.exp) {
      return c.json({ error: 'Token expired' }, 401)
    }
    
    const userId = tokenData.id
    
    // Delete user's onboarding templates
    await c.env.DB.prepare(
      'DELETE FROM onboarding_templates WHERE user_id = ?'
    ).bind(userId).run()
    
    // Delete user's JTBD resources (will cascade to delete from jtbd_category_resources)
    await c.env.DB.prepare(
      'DELETE FROM resources WHERE user_id = ?'
    ).bind(userId).run()
    
    // Delete user's JTBD categories
    await c.env.DB.prepare(
      'DELETE FROM jtbd_categories WHERE user_id = ?'
    ).bind(userId).run()
    
    // Delete the user account
    await c.env.DB.prepare(
      'DELETE FROM users WHERE id = ?'
    ).bind(userId).run()
    
    return c.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Serve static files for all non-API routes
app.get('*', async (c) => {
  const url = new URL(c.req.url)
  
  // Try to fetch the static asset
  const response = await c.env.ASSETS.fetch(c.req.url)
  
  if (response.status === 404) {
    // If asset not found, serve index.html for SPA routing
    const indexUrl = new URL('/index.html', url.origin)
    return c.env.ASSETS.fetch(indexUrl.toString())
  }
  
  return response
})

export default app
