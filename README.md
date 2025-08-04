# VahaanXchange Backend

A standalone Express.js backend server for handling SSR (Server-Side Rendering) and API endpoints for VahaanXchange vehicle platform. This backend is specifically designed to enable proper social media sharing previews (WhatsApp, Facebook, Twitter) by serving dynamic meta tags.

## Features

- 🚗 **Vehicle API**: REST endpoints for car and bike data
- 🎨 **SSR Support**: Server-side rendering for social media crawlers
- 📱 **Social Sharing**: Dynamic Open Graph meta tags for WhatsApp/Facebook previews
- 🔒 **Security**: Helmet.js security headers and CORS protection
- 📊 **Performance**: Compression and optimized responses
- 🗄️ **Database**: Supabase integration for vehicle data

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and health information.

### Vehicle Data
```
GET /api/vehicles/:type/:id
```
- `type`: "car" or "bike"  
- `id`: Vehicle ID from database
- Returns complete vehicle information

### Meta Data for Social Sharing
```
GET /api/meta/:type/:id
```
- `type`: "car" or "bike"
- `id`: Vehicle ID from database  
- Returns structured meta data for social platforms

### SSR for Social Media Crawlers
```
GET /ssr/:type/:id
```
- `type`: "car" or "bike"
- `id`: Vehicle ID from database
- Returns full HTML page with proper meta tags
- Auto-redirects users to frontend

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server  
npm start
```

## Deployment on Render

1. **Create New Web Service** on Render
2. **Connect Repository** containing this backend folder
3. **Configure Build & Deploy**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if backend is in subfolder)
4. **Add Environment Variables** in Render dashboard
5. **Deploy** and get your backend URL

## Frontend Integration

Update your frontend to use the backend SSR URLs for social sharing:

### For WhatsApp/Social Media Sharing
Instead of sharing:
```
https://your-frontend.com/used-car-details/123
```

Share the SSR endpoint:
```  
https://your-backend.onrender.com/ssr/car/123
```

This ensures social media crawlers get proper meta tags while users get redirected to your frontend.

### API Integration
```javascript
// Fetch vehicle data from backend
const response = await fetch(`${BACKEND_URL}/api/vehicles/car/123`);
const { vehicle } = await response.json();

// Get meta data for sharing
const metaResponse = await fetch(`${BACKEND_URL}/api/meta/car/123`);
const metaData = await metaResponse.json();
```

## How It Works

1. **Social Media Crawler** hits `/ssr/car/123`
2. **Backend** fetches vehicle data from Supabase
3. **Generates HTML** with proper Open Graph meta tags
4. **Crawler reads meta tags** for preview generation
5. **Real users get redirected** to frontend via meta refresh

## Architecture Benefits

- ✅ **Separation of Concerns**: Backend handles SSR, frontend handles UI
- ✅ **Platform Flexibility**: Deploy backend and frontend independently  
- ✅ **Performance**: Fast API responses with caching potential
- ✅ **SEO Ready**: Proper meta tags for social media platforms
- ✅ **Scalable**: Can handle high traffic for social sharing

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update `FRONTEND_URL` in environment variables
2. **Database Errors**: Verify Supabase credentials in `.env`
3. **Port Conflicts**: Change `PORT` in environment variables
4. **Meta Tags Not Working**: Check if social media platforms can access your backend URL

### Testing Social Sharing

- **WhatsApp**: Share the SSR URL and check preview
- **Facebook**: Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## License

This project is part of VahaanXchange platform.
