import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'https://vahaanxchange.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'VahaanXchange Backend'
  });
});

// API Routes
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
});

// Vehicle data endpoints
app.get('/api/vehicles/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || 'https://iaptxaruwnwqeukrjibq.supabase.co',
      process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcHR4YXJ1d253cWV1a3JqaWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTQ0NTQsImV4cCI6MjA2OTA5MDQ1NH0.VxJGls9WiYXIATCUHmlZ2VjbJJKgiRSzgx6cqXTfKa8'
    );
    
    const tableName = type === 'car' ? 'car_seller_listings' : 'bike_seller_listings';
    
    const { data: vehicle, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SEO/Meta data endpoint for social sharing
app.get('/api/meta/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || 'https://iaptxaruwnwqeukrjibq.supabase.co',
      process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcHR4YXJ1d253cWV1a3JqaWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTQ0NTQsImV4cCI6MjA2OTA5MDQ1NH0.VxJGls9WiYXIATCUHmlZ2VjbJJKgiRSzgx6cqXTfKa8'
    );
    
    const tableName = type === 'car' ? 'car_seller_listings' : 'bike_seller_listings';
    
    const { data: vehicle, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Get main image from vehicle photos
    const getMainImage = () => {
      if (vehicle.photos && typeof vehicle.photos === 'object') {
        const categoryOrder = ['exterior', 'interior', 'engine', 'dashboard', 'other'];
        
        for (const categoryName of categoryOrder) {
          const category = vehicle.photos[categoryName];
          if (Array.isArray(category) && category.length > 0) {
            return category[0];
          }
        }
      }
      return 'https://www.vahaanxchange.com/resource-uploads/a47ef4ec-4126-4237-8391-444437db8ec1.png';
    };
    
    const mainImage = getMainImage();
    const title = `${vehicle.year} ${vehicle.brand} ${vehicle.model} ${vehicle.variant || ''} - VahaanXchange`;
    const description = `${vehicle.fuel_type} | ${vehicle.kilometers_driven?.toLocaleString() || 'Low'} km | ₹${vehicle.sell_price?.toLocaleString() || 'Best Price'} | ${vehicle.seller_location_city || 'Available'}`;
    
    const metaData = {
      title,
      description,
      image: mainImage,
      url: `${process.env.FRONTEND_URL || 'https://vahaanxchange.vercel.app'}/used-${type}-details/${id}`,
      type: 'website'
    };
    
    res.json(metaData);
  } catch (error) {
    console.error('Error fetching meta data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SSR Endpoint for social media crawlers
app.get('/ssr/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Get meta data from internal API
    const baseUrl = req.protocol + '://' + req.get('host');
    const metaResponse = await fetch(`${baseUrl}/api/meta/${type}/${id}`);
    const metaData = await metaResponse.json();
    
    if (!metaData || metaData.error) {
      return res.status(404).send('Vehicle not found');
    }
    
    // Generate basic HTML with proper meta tags for social sharing
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaData.title}</title>
  <meta name="description" content="${metaData.description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${metaData.url}">
  <meta property="og:title" content="${metaData.title}">
  <meta property="og:description" content="${metaData.description}">
  <meta property="og:image" content="${metaData.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${metaData.url}">
  <meta property="twitter:title" content="${metaData.title}">
  <meta property="twitter:description" content="${metaData.description}">
  <meta property="twitter:image" content="${metaData.image}">
  
  <!-- WhatsApp -->
  <meta property="og:site_name" content="VahaanXchange">
  <meta property="og:locale" content="en_IN">
  
  <!-- Redirect to frontend -->
  <meta http-equiv="refresh" content="0; url=${metaData.url}">
  <script>
    // Immediate redirect for users
    if (typeof window !== 'undefined') {
      window.location.href = '${metaData.url}';
    }
  </script>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>${metaData.title}</h1>
    <p>${metaData.description}</p>
    <p>Redirecting to VahaanXchange...</p>
    <a href="${metaData.url}">Click here if you are not redirected automatically</a>
  </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      '/health',
      '/api/vehicles/:type/:id',
      '/api/meta/:type/:id',
      '/ssr/:type/:id'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VahaanXchange Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🎨 SSR endpoint: http://localhost:${PORT}/ssr`);
});

// For Vercel serverless functions
export default app;
