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
  const versionId = c.req.query('versionId')
  
  try {
    let query = 'SELECT * FROM onboarding_templates WHERE user_id = ?'
    let params = [userId]
    
    if (versionId) {
      query += ' AND version_id = ?'
      params.push(versionId)
    } else {
      // If no version specified, get data with null version_id (legacy data)
      query += ' AND version_id IS NULL'
    }
    
    query += ' ORDER BY period, created_at'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch templates' }, 500)
  }
})

app.post('/api/templates', async (c) => {
  const { userId, period, title, priority = 'medium', versionId } = await c.req.json()
  
  if (!userId || !period || !title) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO onboarding_templates (id, user_id, period, title, priority, version_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, period, title, priority, versionId || null).run()
    
    return c.json({ success: true, data: { id, userId, period, title, priority, completed: false, version_id: versionId } })
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
    
    const { templateId, title, description, expiresIn, maxClones, selectedVersionId } = await c.req.json()
    
    console.log('Share request received:', { templateId, userId, title, description, expiresIn, maxClones, selectedVersionId })
    
    if (!title || !selectedVersionId) {
      console.log('Missing required fields:', { title, selectedVersionId })
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
    
    // Check if user has any templates or JTBD resources to share from the selected version
    const hasTemplates = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM onboarding_templates WHERE user_id = ? AND version_id = ?'
    ).bind(userId, selectedVersionId).first()
    
    const hasJTBDCategories = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM jtbd_categories WHERE user_id = ? AND version_id = ?'
    ).bind(userId, selectedVersionId).first()
    
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
    
    // Create shared template record with version reference
    const shareId = crypto.randomUUID()
    console.log('🔍 CRITICAL DEBUG: About to insert shared template with version_id:', selectedVersionId, 'type:', typeof selectedVersionId)
    
    await c.env.DB.prepare(
      'INSERT INTO shared_templates (id, template_id, owner_user_id, invite_token, title, description, expires_at, max_clones, version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(shareId, null, userId, inviteToken, title, description, expiresAt, maxClones, selectedVersionId).run()
    
    console.log('✅ Shared template record created with ID:', shareId, 'and version_id:', selectedVersionId)
    
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
    
    console.log('🔍 Shared template record:', JSON.stringify(sharedTemplate, null, 2))
    console.log('🔍 CRITICAL DEBUG: version_id value:', sharedTemplate.version_id, 'type:', typeof sharedTemplate.version_id)
    console.log('🔍 CRITICAL DEBUG: Is version_id truthy?', !!sharedTemplate.version_id)
    
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
    
    // Get the original template data from the specific shared version only
    console.log('🔍 Getting templates for version:', sharedTemplate.version_id, 'from owner:', sharedTemplate.owner_user_id)
    
    // Check if version_id is null and handle accordingly
    let originalTemplates, originalJtbdCategories
    
    if (!sharedTemplate.version_id) {
      console.log('⚠️ WARNING: Shared template has no version_id! This is a legacy share - getting ALL templates from owner.')
      console.log('🔍 Falling back to get all templates from owner (legacy behavior)')
      
      // Legacy behavior: get all templates from owner (for old shared templates without version_id)
      const templatesResult = await c.env.DB.prepare(
        'SELECT * FROM onboarding_templates WHERE user_id = ?'
      ).bind(sharedTemplate.owner_user_id).all()
      originalTemplates = templatesResult.results
      
      const jtbdResult = await c.env.DB.prepare(
        'SELECT * FROM jtbd_categories WHERE user_id = ?'
      ).bind(sharedTemplate.owner_user_id).all()
      originalJtbdCategories = jtbdResult.results
      
    } else {
      console.log('✅ Version-specific share detected! Getting content from version:', sharedTemplate.version_id)
      
      // Version-specific behavior: get only content from the specified version
      const templatesResult = await c.env.DB.prepare(
        'SELECT * FROM onboarding_templates WHERE user_id = ? AND version_id = ?'
      ).bind(sharedTemplate.owner_user_id, sharedTemplate.version_id).all()
      originalTemplates = templatesResult.results
      
      const jtbdResult = await c.env.DB.prepare(
        'SELECT * FROM jtbd_categories WHERE user_id = ? AND version_id = ?'
      ).bind(sharedTemplate.owner_user_id, sharedTemplate.version_id).all()
      originalJtbdCategories = jtbdResult.results
    }
    
    console.log('🔍 Retrieved', originalTemplates?.length || 0, 'templates from version', sharedTemplate.version_id || 'ALL')
    console.log('🔍 Retrieved', originalJtbdCategories?.length || 0, 'JTBD categories from version', sharedTemplate.version_id || 'ALL')
    
    // Create a new version for the shared content instead of merging
    const newVersionId = crypto.randomUUID()
    const sharedVersionName = `Shared: ${sharedTemplate.title}`
    const sharedVersionDescription = `Cloned from shared template: ${sharedTemplate.description || 'No description'}`
    
    console.log('🎆 Creating new version for shared content:', {
      versionId: newVersionId,
      name: sharedVersionName,
      description: sharedVersionDescription
    })
    
    // Create the new version
    await c.env.DB.prepare(
      'INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      newVersionId,
      userId,
      sharedVersionName,
      sharedVersionDescription,
      0, // not default
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log('✅ New version created successfully')
    
    // Clone all templates into the new version (no duplicate detection needed)
    console.log('🔄 Cloning', originalTemplates.length, 'templates into new version')
    let templatesAdded = 0
    
    for (const template of originalTemplates) {
      const newId = crypto.randomUUID()
      console.log('Adding template to new version:', {
        id: newId,
        versionId: newVersionId,
        title: template.title,
        period: template.period
      })
      
      await c.env.DB.prepare(
        'INSERT INTO onboarding_templates (id, user_id, version_id, period, title, priority, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        newId, 
        userId,
        newVersionId,
        template.period || null, 
        template.title || null, 
        template.priority || null, 
        false,
        new Date().toISOString(),
        new Date().toISOString()
      ).run()
      
      templatesAdded++
    }
    
    // Clone all JTBD categories into the new version (no duplicate detection needed)
    console.log('🔄 Cloning', originalJtbdCategories.length, 'JTBD categories into new version')
    let categoriesAdded = 0
    let resourcesAdded = 0
    
    for (const category of originalJtbdCategories) {
      // Create new category in the new version
      const newCategoryId = crypto.randomUUID()
      console.log('Adding category to new version:', {
        id: newCategoryId,
        versionId: newVersionId,
        category: category.category
      })
      
      await c.env.DB.prepare(
        'INSERT INTO jtbd_categories (id, user_id, version_id, category, job, situation, outcome, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        newCategoryId, 
        userId,
        newVersionId,
        category.category || null, 
        category.job || null, 
        category.situation || null, 
        category.outcome || null,
        new Date().toISOString(),
        new Date().toISOString()
      ).run()
      
      categoriesAdded++
      
      // Get resources for this category and clone them into the new version
      console.log('🔍 About to query resources for category ID:', category.id)
      
      try {
        const { results: categoryResources } = await c.env.DB.prepare(
          'SELECT * FROM resources WHERE category_id = ?'
        ).bind(category.id).all()
        
        console.log('✅ Successfully retrieved', categoryResources.length, 'resources for category:', category.category)
        
        for (const resource of categoryResources) {
          const newResourceId = crypto.randomUUID()
          console.log('Adding resource to new version category:', {
            id: newResourceId,
            categoryId: newCategoryId,
            name: resource.name,
            type: resource.type
          })
          
          await c.env.DB.prepare(
            'INSERT INTO resources (id, category_id, name, type, url) VALUES (?, ?, ?, ?, ?)'
          ).bind(
            newResourceId,
            newCategoryId,
            resource.name || null,
            resource.type || null,
            resource.url || null
          ).run()
          
          resourcesAdded++
        }
      } catch (resourceError) {
        console.error('❌ Error querying/inserting resources:', resourceError)
        console.error('❌ Error details:', {
          message: resourceError.message,
          categoryId: category.id,
          newCategoryId: newCategoryId
        })
        // Continue without failing the entire operation
      }
    }
    
    // Update clone count
    await c.env.DB.prepare(
      'UPDATE shared_templates SET clone_count = clone_count + 1 WHERE invite_token = ?'
    ).bind(token).run()
    
    console.log('✅ Template cloning completed successfully!')
    console.log('📊 Summary:', {
      newVersionId,
      versionName: sharedVersionName,
      templatesAdded,
      categoriesAdded,
      resourcesAdded
    })
    
    return c.json({ 
      success: true, 
      message: `Successfully created new version "${sharedVersionName}" with ${templatesAdded} templates, ${categoriesAdded} categories, and ${resourcesAdded} resources`,
      data: {
        versionId: newVersionId,
        versionName: sharedVersionName,
        templatesAdded,
        categoriesAdded,
        resourcesAdded
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

// Delete shared template record completely (more specific route first)
app.delete('/api/templates/share/:shareId/delete', async (c) => {
  const shareId = c.req.param('shareId')
  const { userId } = await c.req.json()
  
  try {
    // Verify ownership before deleting
    const shareCheck = await c.env.DB.prepare(
      'SELECT id FROM shared_templates WHERE id = ? AND owner_user_id = ?'
    ).bind(shareId, userId).first()
    
    if (!shareCheck) {
      return c.json({ success: false, error: 'Shared template not found or access denied' }, 404)
    }
    
    // Delete the share record completely
    const result = await c.env.DB.prepare(
      'DELETE FROM shared_templates WHERE id = ? AND owner_user_id = ?'
    ).bind(shareId, userId).run()
    
    if (result.changes === 0) {
      return c.json({ success: false, error: 'Failed to delete shared template' }, 500)
    }
    
    console.log(`✅ Share record deleted: ${shareId} by user ${userId}`)
    return c.json({ success: true, message: 'Share record deleted permanently' })
  } catch (error) {
    console.error('❌ Delete share error:', error)
    return c.json({ success: false, error: 'Failed to delete shared template' }, 500)
  }
})

// Revoke/deactivate shared template (less specific route second)
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
  const versionId = c.req.query('versionId')
  
  try {
    // Get JTBD categories with their resources
    let query = 'SELECT * FROM jtbd_categories WHERE user_id = ?'
    let params = [userId]
    
    if (versionId) {
      query += ' AND version_id = ?'
      params.push(versionId)
    } else {
      // If no version specified, get data with null version_id (legacy data)
      query += ' AND version_id IS NULL'
    }
    
    query += ' ORDER BY created_at DESC'
    
    const { results: categories } = await c.env.DB.prepare(query).bind(...params).all()
    
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
  const { userId, category, job, situation, outcome, versionId } = await c.req.json()
  
  if (!userId || !category || !job || !situation || !outcome) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, category, job, situation, outcome, versionId || null).run()
    
    return c.json({ success: true, data: { id, userId, category, job, situation, outcome, resources: [], version_id: versionId } })
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

// Version management API endpoints
// Get all versions for a user
app.get('/api/versions/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  // JWT Authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM template_versions WHERE user_id = ? ORDER BY is_default DESC, created_at DESC'
    ).bind(userId).all()
    
    console.log('🔍 Loading versions for user:', userId)
    console.log('🔍 Found versions:', results?.length || 0)
    if (results && results.length > 0) {
      console.log('🔍 Version details:', JSON.stringify(results, null, 2))
    }
    
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error('Failed to load versions:', error)
    return c.json({ success: false, error: 'Failed to load versions' }, 500)
  }
})

// Create a new version
app.post('/api/versions', async (c) => {
  // JWT Authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const { userId, name, description, copyFromVersionId } = await c.req.json()
  
  console.log('🔍 Backend received version creation request:', {
    userId,
    name,
    description,
    copyFromVersionId
  });
  
  if (!userId || !name) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }
  
  try {
    const versionId = crypto.randomUUID()
    const isDefault = false // New versions are not default by default
    
    await c.env.DB.prepare(
      'INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).bind(versionId, userId, name, description || null, isDefault).run()
    
    // Copy data from existing version if specified
    if (copyFromVersionId) {
      console.log('🔄 COPYING DATA: from version', copyFromVersionId, 'to new version', versionId)
      console.log('🔄 copyFromVersionId type:', typeof copyFromVersionId, 'value:', copyFromVersionId)
      
      // Copy templates from the source version
      const { results: sourceTemplates } = await c.env.DB.prepare(
        'SELECT * FROM onboarding_templates WHERE user_id = ? AND version_id = ?'
      ).bind(userId, copyFromVersionId).all()
      
      for (const template of sourceTemplates) {
        const newTemplateId = crypto.randomUUID()
        await c.env.DB.prepare(
          'INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        ).bind(newTemplateId, userId, template.period, template.title, template.priority, template.completed, versionId).run()
      }
      
      // Copy JTBD categories from the source version
      const { results: sourceCategories } = await c.env.DB.prepare(
        'SELECT * FROM jtbd_categories WHERE user_id = ? AND version_id = ?'
      ).bind(userId, copyFromVersionId).all()
      
      for (const category of sourceCategories) {
        const newCategoryId = crypto.randomUUID()
        await c.env.DB.prepare(
          'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        ).bind(newCategoryId, userId, category.category, category.job, category.situation, category.outcome, versionId).run()
        
        // Copy resources for this category
        const { results: sourceResources } = await c.env.DB.prepare(
          'SELECT * FROM resources WHERE category_id = ?'
        ).bind(category.id).all()
        
        for (const resource of sourceResources) {
          const newResourceId = crypto.randomUUID()
          await c.env.DB.prepare(
            'INSERT INTO resources (id, category_id, name, type, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
          ).bind(newResourceId, newCategoryId, resource.name, resource.type, resource.url).run()
        }
      }
      
      console.log('Successfully copied data from version', copyFromVersionId, 'to', versionId)
    } else {
      // If no copyFromVersionId, seed with default templates and resources
      console.log('🌱🌱🌱 SEEDING BRANCH EXECUTED - Starting default seeding for version', versionId)
      console.log('🌱 User ID:', userId, 'Version ID:', versionId)
      
      try {
        console.log('🌱 About to call COMBINED seeding function...')
        
        // Skip all debug tests - go directly to proper seeding
        console.log('🌱 Starting proper default seeding (no debug tests)...')
        
        // Use the SAME working functions as new account seeding!
        console.log('🌱 Using the same seeding functions that work for new accounts...')
        
        // First seed templates using the working function
        await seedDefaultTemplates(userId, c.env.DB, versionId)
        console.log('✅ Templates seeded successfully')
        
        // Now seed resources using the SAME function that works for new accounts
        console.log('🔍 About to call seedDefaultResources with userId:', userId, 'versionId:', versionId)
        await seedDefaultResources(userId, c.env.DB, versionId)
        console.log('✅ Resources seeded successfully')
        
        // Let's verify what was actually created
        const createdCategories = await c.env.DB.prepare(
          'SELECT id, category, version_id FROM jtbd_categories WHERE user_id = ? AND version_id = ?'
        ).bind(userId, versionId).all()
        console.log('🔍 Verification: Created categories for this version:', createdCategories.results?.length || 0)
        if (createdCategories.results) {
          createdCategories.results.forEach((cat: any) => {
            console.log('🔍 Category:', cat.category, 'ID:', cat.id, 'Version:', cat.version_id)
          })
        }
        
        console.log('🎉🎉 SEEDING COMPLETED using working new account functions!')
        
        console.log('✅✅✅ ALL SEEDING COMPLETED for version', versionId)
      } catch (seedError) {
        console.error('❌❌❌ SEEDING ERROR:', seedError)
        console.error('❌ Error details:', JSON.stringify(seedError, null, 2))
      }
    }
    
    // Return the created version
    const newVersion = await c.env.DB.prepare(
      'SELECT * FROM template_versions WHERE id = ?'
    ).bind(versionId).first()
    
    return c.json({ success: true, data: newVersion })
  } catch (error) {
    console.error('Failed to create version:', error)
    return c.json({ success: false, error: 'Failed to create version' }, 500)
  }
})

// Update a version
app.put('/api/versions/:versionId', async (c) => {
  const versionId = c.req.param('versionId')
  
  // JWT Authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const { name, description } = await c.req.json()
  
  if (!name) {
    return c.json({ success: false, error: 'Name is required' }, 400)
  }
  
  try {
    await c.env.DB.prepare(
      'UPDATE template_versions SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, description || null, versionId).run()
    
    // Return the updated version
    const updatedVersion = await c.env.DB.prepare(
      'SELECT * FROM template_versions WHERE id = ?'
    ).bind(versionId).first()
    
    return c.json({ success: true, data: updatedVersion })
  } catch (error) {
    console.error('Failed to update version:', error)
    return c.json({ success: false, error: 'Failed to update version' }, 500)
  }
})

// Delete a version
app.delete('/api/versions/:versionId', async (c) => {
  const versionId = c.req.param('versionId')
  
  // JWT Authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  try {
    // Check if this is the default version
    const version = await c.env.DB.prepare(
      'SELECT * FROM template_versions WHERE id = ?'
    ).bind(versionId).first()
    
    if (!version) {
      return c.json({ success: false, error: 'Version not found' }, 404)
    }
    
    if (version.is_default) {
      return c.json({ success: false, error: 'Cannot delete the default version' }, 400)
    }
    
    // Delete the version (this will cascade delete related data due to foreign key constraints)
    await c.env.DB.prepare('DELETE FROM template_versions WHERE id = ?').bind(versionId).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete version:', error)
    return c.json({ success: false, error: 'Failed to delete version' }, 500)
  }
})

// Set a version as default
app.post('/api/versions/:versionId/set-default', async (c) => {
  const versionId = c.req.param('versionId')
  
  // JWT Authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  try {
    // Get the version to find the user_id
    const version = await c.env.DB.prepare(
      'SELECT * FROM template_versions WHERE id = ?'
    ).bind(versionId).first()
    
    if (!version) {
      return c.json({ success: false, error: 'Version not found' }, 404)
    }
    
    // First, unset all other versions as default for this user
    await c.env.DB.prepare(
      'UPDATE template_versions SET is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(version.user_id).run()
    
    // Then set this version as default
    await c.env.DB.prepare(
      'UPDATE template_versions SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(versionId).run()
    
    // Return the updated version
    const updatedVersion = await c.env.DB.prepare(
      'SELECT * FROM template_versions WHERE id = ?'
    ).bind(versionId).first()
    
    return c.json({ success: true, data: updatedVersion })
  } catch (error) {
    console.error('Failed to set default version:', error)
    return c.json({ success: false, error: 'Failed to set default version' }, 500)
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
  console.log('🔐 [OAuth] Starting Google OAuth flow')
  
  try {
    const origin = new URL(c.req.url).origin
    const redirectUri = `${origin}/api/auth/google/callback`
    console.log('🔗 [OAuth] Origin:', origin)
    console.log('🔗 [OAuth] Redirect URI:', redirectUri)
    
    // Verify environment variables are present
    if (!c.env.GOOGLE_CLIENT_ID) {
      console.error('❌ [OAuth] GOOGLE_CLIENT_ID is not configured')
      return c.redirect('/?error=oauth_config_missing')
    }
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    
    googleAuthUrl.searchParams.set('client_id', c.env.GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('access_type', 'offline')
    
    console.log('✅ [OAuth] Redirecting to Google OAuth URL')
    console.log('🔗 [OAuth] Google URL:', googleAuthUrl.toString())
    
    return c.redirect(googleAuthUrl.toString())
  } catch (error) {
    console.error('❌ [OAuth] Error in Google OAuth initiation:', error)
    return c.redirect('/?error=oauth_init_failed')
  }
})

// Config endpoint to provide Google Client ID to frontend
app.get('/api/auth/config', async (c) => {
  return c.json({
    googleClientId: c.env.GOOGLE_CLIENT_ID
  })
})

app.get('/api/auth/google/callback', async (c) => {
  console.log('🔄 [OAuth] Processing Google OAuth callback')
  
  const code = c.req.query('code')
  const error = c.req.query('error')
  const state = c.req.query('state')
  
  console.log('📥 [OAuth] Callback parameters:', { 
    hasCode: !!code, 
    error: error || 'none', 
    state: state || 'none' 
  })
  
  if (error) {
    console.error('❌ [OAuth] Google returned error:', error)
    return c.redirect(`/?error=auth_failed&details=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    console.error('❌ [OAuth] No authorization code received')
    return c.redirect('/?error=auth_failed&details=no_code')
  }
  
  try {
    const origin = new URL(c.req.url).origin
    const redirectUri = `${origin}/api/auth/google/callback`
    console.log('🔗 [OAuth] Token exchange redirect URI:', redirectUri)
    
    // Verify environment variables
    if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
      console.error('❌ [OAuth] Missing Google OAuth credentials')
      return c.redirect('/?error=oauth_config_missing')
    }
    
    console.log('🔄 [OAuth] Exchanging code for tokens...')
    
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
    
    console.log('📊 [OAuth] Token response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ [OAuth] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      return c.redirect(`/?error=token_failed&status=${tokenResponse.status}`)
    }
    
    const tokens = await tokenResponse.json() as any
    console.log('🎟️ [OAuth] Token exchange successful, access_token present:', !!tokens.access_token)
    
    if (!tokens.access_token) {
      console.error('❌ [OAuth] No access token in response:', tokens)
      return c.redirect('/?error=token_failed&details=no_access_token')
    }
    
    // Get user info from Google
    console.log('👤 [OAuth] Fetching user info from Google...')
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
    
    console.log('📊 [OAuth] User info response status:', userResponse.status)
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('❌ [OAuth] Failed to fetch user info:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      })
      return c.redirect(`/?error=userinfo_failed&status=${userResponse.status}`)
    }
    
    const userInfo = await userResponse.json() as any
    console.log('✅ [OAuth] User info retrieved:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      hasPicture: !!userInfo.picture
    })
    
    // Check if user exists, if not create new user
    console.log('🔍 [OAuth] Checking if user exists in database...')
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ? OR email = ?'
    ).bind(userInfo.id, userInfo.email).first()
    
    if (user) {
      console.log('🔄 [OAuth] Updating existing user:', user.id)
      try {
        await c.env.DB.prepare(
          'UPDATE users SET name = ?, profile_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(userInfo.name, userInfo.picture, user.id).run()
        console.log('✅ [OAuth] User updated successfully')
      } catch (dbError) {
        console.error('❌ [OAuth] Failed to update user:', dbError)
        return c.redirect('/?error=db_update_failed')
      }
    } else {
      console.log('🆕 [OAuth] Creating new user:', userInfo.id)
      try {
        await c.env.DB.prepare(
          'INSERT INTO users (id, email, name, profile_image_url) VALUES (?, ?, ?, ?)'
        ).bind(userInfo.id, userInfo.email, userInfo.name, userInfo.picture).run()
        console.log('✅ [OAuth] New user created successfully')
        user = { id: userInfo.id, email: userInfo.email, name: userInfo.name, profile_image_url: userInfo.picture }
        
        // Create default version for new user first
        const defaultVersionId = crypto.randomUUID()
        console.log('🌱 [OAuth] Creating default version for new user:', userInfo.id, 'with version ID:', defaultVersionId)
        
        await c.env.DB.prepare(
          'INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          defaultVersionId,
          userInfo.id,
          'Base version',
          'My starter version',
          1, // is_default = true
          new Date().toISOString(),
          new Date().toISOString()
        ).run()
        
        console.log('✅ [OAuth] Default version created successfully')
        
        // Now seed default templates and JTBD resources into the default version
        console.log('🌱 [OAuth] Seeding default content into default version...')
        await seedDefaultTemplates(userInfo.id, c.env.DB, defaultVersionId)
        await seedDefaultResources(userInfo.id, c.env.DB, defaultVersionId)
        console.log('✅ [OAuth] Default content seeded into default version')
      } catch (dbError) {
        console.error('❌ [OAuth] Failed to create new user or seed content:', dbError)
        return c.redirect('/?error=db_create_failed')
      }
    }
    
    // Create JWT token using unified createJWT helper (include profile picture)
    console.log('🎟️ [OAuth] Creating JWT token...')
    try {
      const jwtToken = createJWT(
        {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
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
      
      console.log('✅ [OAuth] JWT token created successfully, redirecting to app...')
      // Redirect back to app with token and user data (matching find-strengths-auth pattern)
      return c.redirect(`/?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify(userData))}`)
    } catch (jwtError) {
      console.error('❌ [OAuth] Failed to create JWT token:', jwtError)
      return c.redirect('/?error=jwt_creation_failed')
    }
    
  } catch (error) {
    console.error('❌ [OAuth] Unexpected error in OAuth callback:', error)
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

// Combined function to seed both templates and resources together
const seedDefaultData = async (userId: string, db: D1Database, versionId?: string) => {
  console.log('🌱🌱 Starting COMBINED seeding for user', userId, 'version', versionId)
  
  // TEMPLATES SEEDING (we know this works)
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
    { period: 'firstWeek', title: 'Join relevant team channels and meetings', priority: 'medium' },
    { period: 'firstWeek', title: 'Complete security and compliance training', priority: 'high' },
    
    // Second Week
    { period: 'secondWeek', title: 'Shadow team members on key processes', priority: 'high' },
    { period: 'secondWeek', title: 'Review current projects and roadmap', priority: 'medium' },
    { period: 'secondWeek', title: 'Set up 1:1s with cross-functional partners', priority: 'medium' },
    { period: 'secondWeek', title: 'Complete product and domain training', priority: 'high' },
    
    // Third Week
    { period: 'thirdWeek', title: 'Take on first small project or task', priority: 'high' },
    { period: 'thirdWeek', title: 'Provide feedback on onboarding process', priority: 'low' },
    
    // First Month
    { period: 'firstMonth', title: 'Complete 30-day check-in with manager', priority: 'high' },
    { period: 'firstMonth', title: 'Set goals for next 60 days', priority: 'medium' }
  ]

  // RESOURCES SEEDING (the problematic part) - Use unique UUIDs to avoid constraint violations
  const defaultCategories = [
    {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      category: 'Research & Strategy',
      job: 'make informed design decisions',
      situation: 'access to user research and data',
      outcome: 'create user-centered designs',
      resources: [
        { name: 'User Research Repository', type: 'database', url: '#' },
        { name: 'Analytics Dashboard', type: 'tool', url: '#' },
        { name: 'Design Principles Guide', type: 'guide', url: '#' }
      ]
    }
  ]

  try {
    console.log('🌱 Step 1: Seeding', defaultTemplates.length, 'templates...')
    
    // Insert default templates
    for (const template of defaultTemplates) {
      const templateId = crypto.randomUUID()
      await db.prepare(
        'INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      ).bind(
        templateId,
        userId,
        template.period,
        template.title,
        template.priority,
        false,
        versionId || null
      ).run()
    }
    
    console.log('✅ Templates seeded successfully!')
    console.log('🌱 Step 2: Seeding', defaultCategories.length, 'JTBD categories and resources...')
    
    // Insert JTBD categories and resources
    for (const category of defaultCategories) {
      console.log('🌱 Creating category:', category.category)
      
      await db.prepare(
        'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      ).bind(category.id, userId, category.category, category.job, category.situation, category.outcome, versionId || null).run()
      
      console.log('✅ Category created:', category.category)
      
      // Insert resources for each category
      for (let i = 0; i < category.resources.length; i++) {
        const resource = category.resources[i]
        const resourceId = `res_${userId}_${category.id}_${i + 1}`
        
        console.log('🌱 Creating resource:', resource.name, 'for category:', category.category)
        
        await db.prepare(
          'INSERT INTO resources (id, category_id, name, type, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        ).bind(resourceId, category.id, resource.name, resource.type, resource.url).run()
        
        console.log('✅ Resource created:', resource.name)
      }
    }
    
    console.log('🎉🎉 COMBINED SEEDING COMPLETED SUCCESSFULLY!')
    console.log(`✅ Seeded ${defaultTemplates.length} templates and ${defaultCategories.length} JTBD categories with resources`)
    
  } catch (error) {
    console.error('❌❌ COMBINED SEEDING ERROR:', error)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    throw error
  }
}

// Helper function to seed default JTBD resources for new users
const seedDefaultTemplates = async (userId: string, db: D1Database, versionId?: string) => {
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
        'INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      ).bind(
        templateId,
        userId,
        template.period,
        template.title,
        template.priority,
        false,
        versionId || null
      ).run()
    }
    
    console.log(`✅ Successfully seeded ${defaultTemplates.length} default templates for user ${userId}`)
  } catch (error) {
    console.error('❌ Error seeding default templates:', error)
    throw error
  }
}

const seedDefaultResources = async (userId: string, db: D1Database, versionId?: string) => {
  const defaultCategories = [
    {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
    console.log('🔍 Starting to seed', defaultCategories.length, 'JTBD categories for user', userId, 'version', versionId)
    
    // Insert JTBD categories
    for (const category of defaultCategories) {
      console.log('🔍 Inserting JTBD category:', category.category, 'with ID:', category.id)
      
      await db.prepare(
        'INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      ).bind(category.id, userId, category.category, category.job, category.situation, category.outcome, versionId || null).run()
      
      console.log('✅ Successfully inserted JTBD category:', category.category)
      
      // Insert resources for each category
      console.log('🔍 Inserting', category.resources.length, 'resources for category:', category.category)
      
      for (let i = 0; i < category.resources.length; i++) {
        const resource = category.resources[i]
        const resourceId = `res_${userId}_${category.id}_${i + 1}`
        
        console.log('🔍 Inserting resource:', resource.name, 'with ID:', resourceId, 'for category ID:', category.id)
        
        await db.prepare(
          'INSERT INTO resources (id, category_id, name, type, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        ).bind(resourceId, category.id, resource.name, resource.type, resource.url).run()
        
        console.log('✅ Successfully inserted resource:', resource.name)
      }
    }
    console.log(`✅ Successfully seeded ${defaultCategories.length} JTBD categories and resources for user ${userId} in version ${versionId}`)
  } catch (error) {
    console.error('❌ Error seeding default resources:', error)
    console.error('❌ Full error details:', JSON.stringify(error, null, 2))
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
    
    // Create default version for new user first
    const defaultVersionId = crypto.randomUUID()
    console.log('🌱 Creating default version for new email user:', userId, 'with version ID:', defaultVersionId)
    
    await c.env.DB.prepare(
      'INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      defaultVersionId,
      userId,
      'Base version',
      'My starter version',
      1, // is_default = true
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log('✅ Default version created successfully for email user')
    
    // Now seed default templates and JTBD resources into the default version
    console.log('🌱 Seeding default content into default version for email user...')
    await seedDefaultTemplates(userId, c.env.DB, defaultVersionId)
    await seedDefaultResources(userId, c.env.DB, defaultVersionId)
    console.log('✅ Default content seeded into default version for email user')
    
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
    
    // Check if user has any versions, if not create default version (for existing users)
    const existingVersions = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM template_versions WHERE user_id = ?'
    ).bind(user.id).first() as any
    
    if (existingVersions.count === 0) {
      console.log('🌱 [Email Login] Creating default version for existing user:', user.id)
      
      const defaultVersionId = crypto.randomUUID()
      await c.env.DB.prepare(
        'INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        defaultVersionId,
        user.id,
        'Base version',
        'My starter version',
        1, // is_default = true
        new Date().toISOString(),
        new Date().toISOString()
      ).run()
      
      console.log('✅ [Email Login] Default version created successfully')
      
      // Seed default templates and JTBD resources into the default version
      console.log('🌱 [Email Login] Seeding default content into default version...')
      await seedDefaultTemplates(user.id, c.env.DB, defaultVersionId)
      await seedDefaultResources(user.id, c.env.DB, defaultVersionId)
      console.log('✅ [Email Login] Default content seeded into default version')
    }
    
    // Generate JWT token (include profile picture)
    const token = createJWT(
      { id: user.id, email: user.email, name: user.name, picture: user.profile_image_url },
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
