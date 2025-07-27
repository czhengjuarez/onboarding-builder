interface Env {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API endpoints for Firebase config
    if (url.pathname === '/api/config') {
      const firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID,
        measurementId: env.FIREBASE_MEASUREMENT_ID
      };
      
      return new Response(JSON.stringify(firebaseConfig), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // Serve static assets using the ASSETS binding
    try {
      const asset = await env.ASSETS.fetch(request);
      
      // If asset found, return it with proper headers
      if (asset.status === 200) {
        const response = new Response(asset.body, {
          status: asset.status,
          statusText: asset.statusText,
          headers: {
            ...Object.fromEntries(asset.headers.entries()),
            'Cache-Control': 'public, max-age=86400'
          }
        });
        return response;
      }
    } catch (e) {
      console.error('Asset serving error:', e);
    }
    
    // For SPA routing, serve index.html for non-API routes
    if (!url.pathname.startsWith('/api/')) {
      try {
        const indexRequest = new Request(`${url.origin}/index.html`, {
          method: request.method,
          headers: request.headers
        });
        const indexAsset = await env.ASSETS.fetch(indexRequest);
        
        if (indexAsset.status === 200) {
          return new Response(indexAsset.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      } catch (e) {
        console.error('Index.html serving error:', e);
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
