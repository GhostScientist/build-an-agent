# Deployment Guide

## Netlify Deployment

### Quick Deploy (GitHub Integration)

1. **Push to GitHub**: Make sure your changes are committed and pushed
2. **Connect to Netlify**: 
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository

3. **Build Settings** (should auto-detect from netlify.toml):
   - **Base directory**: `agent-workshop-app`
   - **Build command**: `npm run build` 
   - **Publish directory**: `agent-workshop-app/out`

### Manual Configuration (if needed)

If the `netlify.toml` doesn't auto-configure:

- **Site settings** → **Build & deploy** → **Build settings**
- Set the above values manually

### Environment Variables

No environment variables are needed for the basic deployment.

## Alternative: Manual Deploy

```bash
cd agent-workshop-app
npm run build
# Upload the 'out' folder to any static hosting service
```

## Testing

The app will be available at your Netlify URL (e.g., `https://your-app-name.netlify.app`)

## Features

- ✅ Static export (no server required)
- ✅ Client-side routing with redirects
- ✅ Responsive design
- ✅ Agent generation and download
- ✅ Modern UI with shadcn/ui design system