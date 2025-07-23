# 🚀 Deployment Guide

## Quick Deploy to Vercel

### 1. One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akshitjain1/SSC-CGL-Prep-app&env=GOOGLE_GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20key%20required%20for%20AI%20features&envLink=https://makersuite.google.com/app/apikey)

### 2. Manual Deployment Steps

1. **Fork this repository** to your GitHub account

2. **Get Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for later use

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following:
     ```
     GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
     ```

5. **Redeploy**
   - Trigger a new deployment to apply environment variables
   - Your app will be live at your Vercel URL

### 3. Alternative Platforms

#### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in site settings

#### Railway
1. Connect your GitHub repository
2. Add environment variables
3. Railway will auto-deploy

#### Heroku
1. Create new Heroku app
2. Connect GitHub repository
3. Add environment variables in settings
4. Deploy from GitHub

### 4. Environment Variables

Required for production:
```env
GOOGLE_GEMINI_API_KEY=your_production_api_key
```

Optional:
```env
NEXT_PUBLIC_APP_NAME=SSC CGL Prep App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 5. Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Purchase a domain from any registrar
2. Add it in Vercel dashboard → Domains
3. Update DNS records as instructed

### 6. Performance Tips

- Enable Vercel Analytics for insights
- Use Vercel Edge Functions for better performance
- Configure caching headers if needed
- Monitor Core Web Vitals

### 7. Security Checklist

- ✅ API keys stored as environment variables
- ✅ .env files excluded from Git
- ✅ HTTPS enabled by default
- ✅ No sensitive data in client-side code

---

**Your SSC CGL Prep App will be live and ready for users! 🎉**
