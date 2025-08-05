import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as bcrypt from 'bcryptjs'

// Cloudflare Workers types
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement
  }
  
  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement
    first(): Promise<any>
    all(): Promise<{ results: any[] }>
    run(): Promise<any>
  }
  
  interface Fetcher {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>
  }
}

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

// Template Sharing API Routes

// Generate invite link for a template
app.post('/api/templates/share', async (c) => {
  // JWT Authentication
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    // Verify JWT token
    const tokenData = verifyJWT(token, c.env.JWT_SECRET)
    const userId = tokenData.id
    
    const { templateId, title, description, expiresIn, maxClones } = await c.req.json()
    
    console.log('Share request received:', { templateId, userId, title, description, expiresIn, maxClones })
    
    if (!title) {
      console.log('Missing required fields:', { title })
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // Verify user exists and has templates/resources to share
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first()
    
    console.log('User lookup result:', user)
    
    if (!user) {
      console.log('User not found for userId:', userId)
      return c.json({ success: false, error: 'User not found' }, 404)
    }
    
    // Check if user has any templates or JTBD resources to share
    const hasTemplates = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM onboarding_templates WHERE user_id = ?'
    ).bind(userId).first()
    
    const hasJTBDCategories = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM jtbd_categories WHERE user_id = ?'
    ).bind(userId).first()
    
    console.log('Content check:', { hasTemplates: hasTemplates.count, hasJTBDCategories: hasJTBDCategories.count })
    
    if (hasTemplates.count === 0 && hasJTBDCategories.count === 0) {
      console.log('No content to share for user:', userId)
      return c.json({ success: false, error: 'No templates or resources to share' }, 400)
    }
    
    // Generate unique invite token
    const inviteToken = crypto.randomUUID()
    
    // Calculate expiration date if specified
    let expiresAt: string | null = null
    if (expiresIn) {
      const now = new Date()
      expiresAt = new Date(now.getTime() + (expiresIn * 24 * 60 * 60 * 1000)).toISOString() // expiresIn is in days
    }
    
    // Create shared template record
    const shareId = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO shared_templates (id, template_id, owner_user_id, invite_token, title, description, expires_at, max_clones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(shareId, null, userId, inviteToken, title, description, expiresAt, maxClones).run()
    
    return c.json({ 
      success: true, 
      data: { 
        shareId, 
        inviteToken, 
        inviteUrl: `${new URL(c.req.url).origin}/invite/${inviteToken}`,
        title,
        description,
        expiresAt,
        maxClones
      } 
    })
  } catch (error) {
    console.error('JWT verification or share template error:', error)
    return c.json({ success: false, error: 'Failed to share template' }, 500)
  }
})

// Get shared template details by invite token
app.get('/api/templates/shared/:token', async (c) => {
  const token = c.req.param('token')
  console.log('Shared template endpoint called with token:', token)
  
  try {
    const sharedTemplate = await c.env.DB.prepare(`
      SELECT 
        st.*,
        u.name as owner_name,
        u.email as owner_email
      FROM shared_templates st
      JOIN users u ON st.owner_user_id = u.id
      WHERE st.invite_token = ? AND st.is_active = 1
    `).bind(token).first()
    
    console.log('Database query result:', sharedTemplate)
    
    if (!sharedTemplate) {
      console.log('No shared template found for token:', token)
      return c.json({ success: false, error: 'Shared template not found or inactive' }, 404)
    }
    
    console.log('Found shared template:', {
      title: sharedTemplate.title,
      owner_user_id: sharedTemplate.owner_user_id,
      expires_at: sharedTemplate.expires_at
    })
    
    // Check if expired
    if (sharedTemplate.expires_at && new Date(sharedTemplate.expires_at) < new Date()) {
      return c.json({ success: false, error: 'Invite link has expired' }, 410)
    }
    
    // Check if max clones reached
    if (sharedTemplate.max_clones && sharedTemplate.clone_count >= sharedTemplate.max_clones) {
      return c.json({ success: false, error: 'Maximum number of clones reached' }, 410)
    }
    
    // Get the actual template data
    const { results: templateData } = await c.env.DB.prepare(
      'SELECT * FROM onboarding_templates WHERE user_id = ? ORDER BY period, created_at'
    ).bind(sharedTemplate.owner_user_id).all()
    
    // Get JTBD resources for the template owner
    const { results: jtbdCategories } = await c.env.DB.prepare(
      'SELECT * FROM jtbd_categories WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(sharedTemplate.owner_user_id).all()
    
    const jtbdWithResources = await Promise.all(
      jtbdCategories.map(async (category: any) => {
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
    
    return c.json({ 
      success: true, 
      data: {
        shareInfo: {
          title: sharedTemplate.title,
          description: sharedTemplate.description,
          ownerName: sharedTemplate.owner_name,
          ownerEmail: sharedTemplate.owner_email,
          cloneCount: sharedTemplate.clone_count,
          maxClones: sharedTemplate.max_clones,
          expiresAt: sharedTemplate.expires_at
        },
        templates: templateData,
        jtbdResources: jtbdWithResources
      }
    })
  } catch (error) {
    console.error('Get shared template error details:', {
      message: error.message,
      stack: error.stack,
      error: error
    })
    return c.json({ success: false, error: `Failed to fetch shared template: ${error.message}` }, 500)
  }
})

// Clone shared template to user's account
app.post('/api/templates/clone/:token', async (c) => {
  const token = c.req.param('token')
  console.log('Clone endpoint called with token:', token)
  
  let requestBody
  try {
    requestBody = await c.req.json()
    console.log('Request body:', requestBody)
  } catch (error) {
    console.error('Error parsing request body:', error)
    return c.json({ success: false, error: 'Invalid request body' }, 400)
  }
  
  const { userId, confirmed } = requestBody
  console.log('Extracted userId:', userId, 'confirmed:', confirmed)
  
  if (!userId) {
    console.error('No userId provided')
    return c.json({ success: false, error: 'User ID required' }, 400)
  }
  
  try {
    // Get shared template info
    const sharedTemplate = await c.env.DB.prepare(
      'SELECT * FROM shared_templates WHERE invite_token = ? AND is_active = 1'
    ).bind(token).first()
    
    if (!sharedTemplate) {
      return c.json({ success: false, error: 'Shared template not found or inactive' }, 404)
    }
    
    // Check if expired
    if (sharedTemplate.expires_at && new Date(sharedTemplate.expires_at) < new Date()) {
      return c.json({ success: false, error: 'Invite link has expired' }, 410)
    }
    
    // Check if max clones reached
    if (sharedTemplate.max_clones && sharedTemplate.clone_count >= sharedTemplate.max_clones) {
      return c.json({ success: false, error: 'Maximum number of clones reached' }, 410)
    }
    
    // Check if user is trying to clone their own template
    if (sharedTemplate.owner_user_id === userId) {
      return c.json({ success: false, error: 'Cannot clone your own template' }, 400)
    }
    
    // Check if user has existing data and needs confirmation
    if (!confirmed) {
      const { results: existingTemplates } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM onboarding_templates WHERE user_id = ?'
      ).bind(userId).all()
      
      const { results: existingJtbd } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM jtbd_categories WHERE user_id = ?'
      ).bind(userId).all()
      
      const hasExistingTemplates = existingTemplates[0]?.count > 0
      const hasExistingJtbd = existingJtbd[0]?.count > 0
      
      if (hasExistingTemplates || hasExistingJtbd) {
        return c.json({ 
          success: false, 
          requiresConfirmation: true,
          message: 'You already have existing templates and resource data. Cloning will add the shared content to your existing data.',
          existingData: {
            templates: hasExistingTemplates,
            jtbd: hasExistingJtbd
          }
        }, 200)
      }
    }
    
    // Get the original template data
    console.log('🔍 Retrieving templates for owner_user_id:', sharedTemplate.owner_user_id)
    const { results: originalTemplates } = await c.env.DB.prepare(
      'SELECT * FROM onboarding_templates WHERE user_id = ?'
    ).bind(sharedTemplate.owner_user_id).all()
    
    console.log('📋 Retrieved original templates:', {
      count: originalTemplates.length,
      templates: originalTemplates.map(t => ({ id: t.id, title: t.title, period: t.period }))
    })
    
    // Get the original JTBD data
    const { results: originalJtbdCategories } = await c.env.DB.prepare(
      'SELECT * FROM jtbd_categories WHERE user_id = ?'
    ).bind(sharedTemplate.owner_user_id).all()
    
    // Get user's existing templates to check for duplicates
    const { results: existingTemplates } = await c.env.DB.prepare(
      'SELECT * FROM onboarding_templates WHERE user_id = ?'
    ).bind(userId).all()
    
    // Clone templates with duplicate detection
    console.log('🔄 Starting template cloning process:', {
      originalCount: originalTemplates.length,
      existingCount: existingTemplates.length
    })
    let templatesAdded = 0
    let templatesSkipped = 0
    
    for (const template of originalTemplates) {
      // Check if template already exists (compare title and period)
      const isDuplicate = existingTemplates.some(existing => 
        existing.title === template.title && existing.period === template.period
      )
      
      if (isDuplicate) {
        console.log('Skipping duplicate template:', template.title)
        templatesSkipped++
        continue
      }
      
      const newId = crypto.randomUUID()
      console.log('✅ Adding new template:', {
        id: newId,
        userId,
        period: template.period,
        title: template.title,
        priority: template.priority,
        completed: false
      })
      
      const insertResult = await c.env.DB.prepare(
        'INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        newId, 
        userId, 
        template.period || null, 
        template.title || null, 
        template.priority || null, 
        false
      ).run()
      
      console.log('📝 Template insert result:', insertResult)
      templatesAdded++
    }
    
    // Get user's existing categories to enable smart merging
    const { results: existingCategories } = await c.env.DB.prepare(
      'SELECT * FROM jtbd_categories WHERE user_id = ?'
    ).bind(userId).all()
    
    // Smart category and resource merging
    console.log('Processing categories with smart merging:', originalJtbdCategories.length)
    let categoriesAdded = 0
    let categoriesMerged = 0
    let resourcesAdded = 0
    let resourcesSkipped = 0
    
    for (const category of originalJtbdCategories) {
      // Check if user already has a matching category (compare category name)
      const matchingCategory = existingCategories.find(existing => 
        existing.category === category.category
      )
      
      let targetCategoryId
      
      if (matchingCategory) {
        // Use existing category - keep user's version
        console.log('Found matching category, merging resources into:', matchingCategory.category)
        targetCategoryId = matchingCategory.id
        categoriesMerged++
      } else {
        // Create new category
        targetCategoryId = crypto.randomUUID()
        console.log('Creating new category:', {
          id: targetCategoryId,
          userId,
          category: category.category,
          job: category.job,
          situation: category.situation,
          outcome: category.outcome
        })
        
        await c.env.DB.prepare(
          'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          targetCategoryId, 
          userId, 
          category.category || null, 
          category.job || null, 
          category.situation || null, 
          category.outcome || null
        ).run()
        
        categoriesAdded++
      }
      
      // Get resources for this category
      const { results: resources } = await c.env.DB.prepare(
        'SELECT * FROM resources WHERE category_id = ?'
      ).bind(category.id).all()
      
      // Get existing resources in target category to check for duplicates
      const { results: existingResources } = await c.env.DB.prepare(
        'SELECT * FROM resources WHERE category_id = ?'
      ).bind(targetCategoryId).all()
      
      console.log('Processing resources for category:', resources.length)
      for (const resource of resources) {
        // Check if resource already exists (compare name and URL)
        const isDuplicateResource = existingResources.some(existing => 
          existing.name === resource.name && existing.url === resource.url
        )
        
        if (isDuplicateResource) {
          console.log('Skipping duplicate resource:', resource.name)
          resourcesSkipped++
          continue
        }
        
        const newResourceId = crypto.randomUUID()
        console.log('Adding resource to category:', {
          id: newResourceId,
          categoryId: targetCategoryId,
          name: resource.name,
          type: resource.type,
          url: resource.url
        })
        
        await c.env.DB.prepare(
          'INSERT INTO resources (id, category_id, name, type, url) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          newResourceId, 
          targetCategoryId, 
          resource.name || null, 
          resource.type || null, 
          resource.url || null
        ).run()
        
        resourcesAdded++
      }
    }
    
    // Increment clone count
    await c.env.DB.prepare(
      'UPDATE shared_templates SET clone_count = clone_count + 1 WHERE invite_token = ?'
    ).bind(token).run()
    
    // Create detailed success message
    const totalTemplatesProcessed = originalTemplates.length
    const totalCategoriesProcessed = originalJtbdCategories.length
    const totalResourcesProcessed = originalJtbdCategories.reduce((total, cat) => {
      // This is an approximation since we don't have the exact count here
      return total + (cat.resources?.length || 0)
    }, 0)
    
    console.log('📊 Final cloning results:', {
      totalTemplatesProcessed,
      templatesAdded,
      templatesSkipped,
      totalCategoriesProcessed,
      categoriesAdded,
      categoriesMerged,
      resourcesAdded,
      resourcesSkipped
    })
    
    let message = 'Content successfully merged into your account!'
    const details: string[] = []
    
    if (templatesAdded > 0) {
      details.push(`${templatesAdded} new template${templatesAdded === 1 ? '' : 's'} added`)
    }
    if (templatesSkipped > 0) {
      details.push(`${templatesSkipped} duplicate template${templatesSkipped === 1 ? '' : 's'} skipped`)
    }
    if (categoriesAdded > 0) {
      details.push(`${categoriesAdded} new categor${categoriesAdded === 1 ? 'y' : 'ies'} created`)
    }
    if (categoriesMerged > 0) {
      details.push(`${categoriesMerged} categor${categoriesMerged === 1 ? 'y' : 'ies'} merged with existing`)
    }
    if (resourcesAdded > 0) {
      details.push(`${resourcesAdded} new resource${resourcesAdded === 1 ? '' : 's'} added`)
    }
    if (resourcesSkipped > 0) {
      details.push(`${resourcesSkipped} duplicate resource${resourcesSkipped === 1 ? '' : 's'} skipped`)
    }
    
    if (details.length > 0) {
      message += ' ' + details.join(', ') + '.'
    }
    
    return c.json({ 
      success: true, 
      message: message,
      data: {
        templatesProcessed: totalTemplatesProcessed,
        templatesAdded: templatesAdded,
        templatesSkipped: templatesSkipped,
        categoriesProcessed: totalCategoriesProcessed,
        categoriesAdded: categoriesAdded,
        categoriesMerged: categoriesMerged,
        resourcesAdded: resourcesAdded,
        resourcesSkipped: resourcesSkipped
      }
    })
  } catch (error) {
    console.error('Clone template error details:', {
      message: error.message,
      stack: error.stack,
      error: error
    })
    return c.json({ success: false, error: `Failed to clone template: ${error.message}` }, 500)
  }
})

// Get user's shared templates
app.get('/api/templates/my-shares/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM shared_templates WHERE owner_user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    
    const sharesWithUrls = results.map((share: any) => ({
      ...share,
      inviteUrl: `${new URL(c.req.url).origin}/invite/${share.invite_token}`
    }))
    
    return c.json({ success: true, data: sharesWithUrls })
  } catch (error) {
    console.error('Get my shares error:', error)
    return c.json({ success: false, error: 'Failed to fetch shared templates' }, 500)
  }
})

// Revoke/deactivate shared template
app.delete('/api/templates/share/:shareId', async (c) => {
  const shareId = c.req.param('shareId')
  const { userId } = await c.req.json()
  
  try {
    // Verify ownership before deactivating
    const result = await c.env.DB.prepare(
      'UPDATE shared_templates SET is_active = 0 WHERE id = ? AND owner_user_id = ?'
    ).bind(shareId, userId).run()
    
    if (result.changes === 0) {
      return c.json({ success: false, error: 'Shared template not found or access denied' }, 404)
    }
    
    return c.json({ success: true, message: 'Shared template deactivated' })
  } catch (error) {
    console.error('Revoke share error:', error)
    return c.json({ success: false, error: 'Failed to revoke shared template' }, 500)
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
      
      // Seed default templates and JTBD resources for new user
      await seedDefaultTemplates(userInfo.id, c.env.DB)
      await seedDefaultResources(userInfo.id, c.env.DB)
    }
    
    // Create JWT token using unified createJWT helper
    const jwtToken = createJWT(
      {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name
      },
      c.env.JWT_SECRET
    )
    
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
    // Verify JWT token using unified verifyJWT helper
    const tokenData = verifyJWT(token, c.env.JWT_SECRET)
    
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

// Helper function to verify JWT token (handles both Google OAuth and email/password formats)
const verifyJWT = (token: string, secret: string) => {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid token format')
  }
  
  const [header, payload, signature] = parts
  
  // Use the same signature format as createJWT function
  // createJWT uses: btoa(secret + encodedHeader + encodedPayload)
  // where header and payload are already base64 encoded
  const expectedSignature = btoa(secret + header + payload)
  
  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature')
  }
  
  // Decode and validate payload
  const tokenData = JSON.parse(atob(payload))
  
  // Check if token is expired
  if (Date.now() / 1000 > tokenData.exp) {
    throw new Error('Token expired')
  }
  
  return tokenData
}

// Helper function to seed default JTBD resources for new users
const seedDefaultTemplates = async (userId: string, db: D1Database) => {
  const defaultTemplates = [
    // First Day
    { period: 'firstDay', title: 'Complete IT setup and access accounts', priority: 'high' },
    { period: 'firstDay', title: 'Meet your direct manager and team', priority: 'high' },
    { period: 'firstDay', title: 'Review job description and expectations', priority: 'high' },
    { period: 'firstDay', title: 'Complete required HR paperwork', priority: 'medium' },
    { period: 'firstDay', title: 'Take office tour and locate key areas', priority: 'medium' },
    
    // First Week
    { period: 'firstWeek', title: 'Schedule 1:1s with key stakeholders', priority: 'high' },
    { period: 'firstWeek', title: 'Review company handbook and policies', priority: 'medium' },
    { period: 'firstWeek', title: 'Set up development environment', priority: 'high' },
    { period: 'firstWeek', title: 'Join relevant Slack channels and meetings', priority: 'medium' },
    { period: 'firstWeek', title: 'Complete security and compliance training', priority: 'medium' },
    
    // Second Week
    { period: 'secondWeek', title: 'Shadow team members on current projects', priority: 'high' },
    { period: 'secondWeek', title: 'Review codebase and documentation', priority: 'high' },
    { period: 'secondWeek', title: 'Attend team retrospective and planning', priority: 'medium' },
    
    // Third Week
    { period: 'thirdWeek', title: 'Take on first small project or task', priority: 'high' },
    { period: 'thirdWeek', title: 'Provide feedback on onboarding process', priority: 'low' },
    
    // First Month
    { period: 'firstMonth', title: 'Complete 30-day check-in with manager', priority: 'high' },
    { period: 'firstMonth', title: 'Set goals for next 60 days', priority: 'medium' }
  ]

  try {
    // Insert default templates
    for (const template of defaultTemplates) {
      const templateId = crypto.randomUUID()
      await db.prepare(
        'INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        templateId,
        userId,
        template.period,
        template.title,
        template.priority,
        false
      ).run()
    }
    
    console.log(`✅ Successfully seeded ${defaultTemplates.length} default templates for user ${userId}`)
  } catch (error) {
    console.error('❌ Error seeding default templates:', error)
    throw error
  }
}

const seedDefaultResources = async (userId: string, db: D1Database) => {
  const defaultCategories = [
    {
      id: `jtbd_${userId}_1`,
      category: 'Design Tools & Systems',
      job: 'create consistent designs',
      situation: 'access to design systems and tools',
      outcome: 'work efficiently and maintain brand consistency',
      resources: [
        { name: 'Figma Component Library', type: 'tool', url: '#' },
        { name: 'Design System Documentation', type: 'article', url: '#' },
        { name: 'Brand Guidelines', type: 'guide', url: '#' }
      ]
    },
    {
      id: `jtbd_${userId}_2`,
      category: 'Process & Workflow',
      job: 'understand our design process',
      situation: 'clear workflow documentation',
      outcome: 'collaborate effectively with my team',
      resources: [
        { name: 'Design Process Playbook', type: 'guide', url: '#' },
        { name: 'Critique Guidelines', type: 'guide', url: '#' },
        { name: 'Handoff Checklist', type: 'tool', url: '#' }
      ]
    },
    {
      id: `jtbd_${userId}_3`,
      category: 'Research & Strategy',
      job: 'make informed design decisions',
      situation: 'access to user research and strategy docs',
      outcome: 'design with user needs in mind',
      resources: [
        { name: 'User Research Repository', type: 'tool', url: '#' },
        { name: 'Question Bank', type: 'guide', url: '#' },
        { name: 'Usability Testing Templates', type: 'tool', url: '#' }
      ]
    }
  ]

  try {
    // Insert JTBD categories
    for (const category of defaultCategories) {
      await db.prepare(
        'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(category.id, userId, category.category, category.job, category.situation, category.outcome).run()
      
      // Insert resources for each category
      for (let i = 0; i < category.resources.length; i++) {
        const resource = category.resources[i]
        const resourceId = `res_${userId}_${category.id}_${i + 1}`
        await db.prepare(
          'INSERT INTO resources (id, category_id, name, type, url) VALUES (?, ?, ?, ?, ?)'
        ).bind(resourceId, category.id, resource.name, resource.type, resource.url).run()
      }
    }
  } catch (error) {
    console.error('Error seeding default resources:', error)
    // Don't throw error - user creation should still succeed even if seeding fails
  }
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
    
    // Seed default templates and JTBD resources for new user
    await seedDefaultTemplates(userId, c.env.DB)
    await seedDefaultResources(userId, c.env.DB)
    
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
    // Verify JWT token using unified verifyJWT helper
    const tokenData = verifyJWT(token, c.env.JWT_SECRET)
    
    // Verify user exists in database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(tokenData.id).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }
    
    const userId = tokenData.id
    
    // Delete user's onboarding templates
    await c.env.DB.prepare(
      'DELETE FROM onboarding_templates WHERE user_id = ?'
    ).bind(userId).run()
    
    // Delete user's JTBD resources (resources are linked to categories, so we delete categories first which will cascade)
    // First delete all resources that belong to this user's categories
    await c.env.DB.prepare(
      'DELETE FROM resources WHERE category_id IN (SELECT id FROM jtbd_categories WHERE user_id = ?)'
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
