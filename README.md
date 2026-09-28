# Reelcast Studio - Social Media Video Publisher

A powerful multi-platform video management and scheduling application for creators to publish Instagram Reels, YouTube Shorts, and Facebook Reels simultaneously.

## Features
- **Multi-Platform Reel Publishing**: Instagram Reels, YouTube Shorts, and Facebook Reels.
- **AI Daily Social Tip**: Powered by Gemini 3.8 Flash (`gemini-3.8-flash`) to generate viral short-form hooks, CTAs, optimal posting windows, and hashtags based on your niche.
- **A/B Test Mode in CaptionEditor**: Write 50/50 split caption variants with randomized retention & engagement simulation in Performance Analytics.
- **Analytics & Reporting**: Interactive Recharts comparisons, CSV export, and print-ready PDF reports.
- **PWA & Android App Ready**: Configured for Google Play Store Trusted Web Activity (TWA).

---

## 🚀 Deploy to GitHub & Vercel in 3 Steps

### Step 1: Initialize Git Repository & Push to GitHub

In your local terminal inside the downloaded project folder:

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Reelcast Studio with Gemini AI & A/B Testing"

# Create a new repository on https://github.com/new, then run:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reelcast-studio.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your **GitHub** account and select the **`reelcast-studio`** repository.
3. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add Environment Variables in Vercel:
   - `GEMINI_API_KEY`: Your Google Gemini API key (optional for live AI queries; app includes curated fallbacks).
   - `PORT`: `3000` (if deploying full-stack Node.js)
5. Click **Deploy**.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server (Vite + Express backend proxy)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
