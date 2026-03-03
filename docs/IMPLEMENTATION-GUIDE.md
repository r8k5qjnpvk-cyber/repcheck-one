# RepCheck.one — Complete Implementation Guide
## From Files → Live Website Making Money

---

## What You Have Right Now

| File | What It Is |
|------|-----------|
| `repcheck-one-complete.jsx` | Full React app (6 pages: Home, Forum, Token, Tools, Admin, Guides) |
| `repcheck-auth-database-v4-combined.js` | 2,002-line database with 1,270+ authentication data points, 58 brands, 145+ models |
| `repcheck3/` folder | Next.js project skeleton (partially set up) |

---

## PHASE 1: Get the Website Running Locally (30 mins)

### Step 1: Install Node.js on Your Computer

Go to https://nodejs.org and download the **LTS version** (green button). Install it. Open your terminal/command prompt and check it works:

```bash
node --version
npm --version
```

Both should show version numbers.

### Step 2: Create the Project Folder

Open terminal and run:

```bash
mkdir repcheck-one
cd repcheck-one
npx create-next-app@14 . --js --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```

When it asks questions, press Enter to accept defaults.

### Step 3: Install Extra Packages

```bash
npm install lucide-react
```

### Step 4: Set Up the File Structure

Your folder should look like this after setup:

```
repcheck-one/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   └── api/
│       └── auth/
│           └── route.js
├── lib/
│   └── authDatabase.js      ← paste combined database here
├── public/
│   └── (images go here later)
├── package.json
├── next.config.js
└── tailwind.config.js
```

### Step 5: Paste the Files

1. **Copy the entire contents** of `repcheck-auth-database-v4-combined.js` into `lib/authDatabase.js`
2. **Copy the entire contents** of `repcheck-one-complete.jsx` into `app/page.js`
   - Change the first line from `import { useState...` to:
   ```js
   "use client"
   import { useState, useEffect, useRef, useCallback } from "react"
   ```
   - Add at the very bottom of the file:
   ```js
   export default function Home() {
     return <App />
   }
   ```

### Step 6: Run It Locally

```bash
npm run dev
```

Open your browser and go to **http://localhost:3000**. You should see your RepCheck.one website.

---

## PHASE 2: Connect the Database to the Frontend (1-2 hours)

### Step 7: Create the Search API

Create the file `app/api/search/route.js`:

```javascript
import { AUTH_DATABASE } from '@/lib/authDatabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category') || 'all'
  
  if (!query || query.length < 2) {
    return Response.json({ results: [], message: 'Query too short' })
  }

  const results = []

  // Search through all categories
  const categories = category === 'all' 
    ? Object.keys(AUTH_DATABASE) 
    : [category]

  for (const cat of categories) {
    const catData = AUTH_DATABASE[cat]
    if (!catData?.brands) continue

    for (const [brandName, brandData] of Object.entries(catData.brands)) {
      if (!brandData.models) continue

      for (const [modelName, modelData] of Object.entries(brandData.models)) {
        const searchStr = `${brandName} ${modelName}`.toLowerCase()
        
        if (searchStr.includes(query) || query.split(' ').every(word => searchStr.includes(word))) {
          results.push({
            brand: brandName,
            model: modelName,
            category: cat,
            tier: brandData.tier || 'N/A',
            retail: modelData.retail || 'N/A',
            mostFakedBy: modelData.mostFakedBy || [],
            commonFlaws: modelData.commonFlaws || [],
            genuineMarkers: modelData.genuineMarkers || [],
            redditInsights: modelData.redditInsights || [],
            threadDensity: modelData.threadDensity || null,
            soundSignature: modelData.soundSignature || null,
          })
        }
      }
    }
  }

  return Response.json({ 
    results, 
    count: results.length,
    query 
  })
}
```

### Step 8: Connect Search to Frontend

In your `app/page.js`, find the search bar section and add a function to call the API:

```javascript
// Add this function inside your App component
async function searchDatabase(query) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    return data.results
  } catch (err) {
    console.error('Search failed:', err)
    return []
  }
}
```

Then wire it up to the search input's onChange or onSubmit handler to display results.

---

## PHASE 3: Deploy for Free on Vercel (15 mins)

### Step 9: Push Code to GitHub

1. Go to https://github.com and create an account (free)
2. Create a new repository called `repcheck-one`
3. In your terminal:

```bash
cd repcheck-one
git init
git add .
git commit -m "Initial RepCheck.one launch"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/repcheck-one.git
git push -u origin main
```

### Step 10: Deploy on Vercel (£0/month)

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your `repcheck-one` repository
4. Click **"Deploy"**
5. Wait 1-2 minutes — your site is now live at `repcheck-one.vercel.app`

### Step 11: Connect Your Custom Domain

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Type `repcheck.one`
3. Vercel gives you DNS records (usually 2 records)
4. Go to where you bought `repcheck.one` (e.g., Namecheap, GoDaddy)
5. Add the DNS records Vercel gave you
6. Wait 5-30 minutes for DNS to propagate
7. Site now live at **https://repcheck.one** with free SSL

**Cost so far: £0/month** (Vercel free tier gives you 100GB bandwidth)

---

## PHASE 4: Add Google AdSense (30 mins, start earning)

### Step 12: Apply for Google AdSense

1. Go to https://www.google.com/adsense/
2. Sign up with your Google account
3. Add your site URL: `repcheck.one`
4. Google reviews your site (takes 1-14 days)
5. Once approved, you get an **AdSense Publisher ID** (ca-pub-XXXXXXX)

### Step 13: Add Ad Code to Your Site

Create `app/components/AdBanner.js`:

```javascript
'use client'
import { useEffect } from 'react'

export default function AdBanner({ slot, format = 'auto' }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-YOUR_ID_HERE"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
```

Add the AdSense script to `app/layout.js`:

```javascript
import Script from 'next/script'

// Inside your <head> or body:
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID_HERE"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

Then place `<AdBanner slot="1234567890" />` wherever you want ads (between search results, in sidebar, footer etc).

**Expected earnings:** £5-30/day with decent traffic (authentication niche pays well — CPC is higher than average).

---

## PHASE 5: Add Affiliate Links (15 mins, start earning)

### Step 14: Sign Up for Affiliate Programs

| Program | Commission | Sign Up |
|---------|-----------|---------|
| Amazon Associates | 1-4% | https://affiliate-program.amazon.co.uk |
| eBay Partner Network | 1-4% | https://partnernetwork.ebay.co.uk |
| Chrono24 | Up to 3% per sale | https://www.chrono24.co.uk/info/affiliate.htm |
| StockX | 5-10% new users | https://stockx.com/affiliates |
| FARFETCH | 5-7% | Via Awin or ShareASale |
| Watchfinder | Contact directly | https://www.watchfinder.co.uk |
| Vestiaire Collective | 5-8% | Via CJ Affiliate |

### Step 15: Place Affiliate Links in Your Database Results

When showing authentication results, add a section like:

```
✅ Buy Verified Authentic:
  → [Brand] on Chrono24 (verified dealers) — YOUR_AFFILIATE_LINK
  → [Brand] on StockX (authenticated) — YOUR_AFFILIATE_LINK
  → [Brand] on Vestiaire (expert-checked) — YOUR_AFFILIATE_LINK
```

**Expected earnings:** £200-2,000/month depending on traffic and conversion.

---

## PHASE 6: Add User Database with Supabase (1-2 hours)

### Step 16: Set Up Supabase (Free Tier)

1. Go to https://supabase.com and create account
2. Create a new project (name it `repcheck`)
3. Note your **Project URL** and **anon key** from Settings → API

### Step 17: Install Supabase in Your Project

```bash
npm install @supabase/supabase-js
```

Create `lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

Create `.env.local` in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 18: Create Database Tables

In Supabase dashboard → SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  rep_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authentication checks (forum posts)
CREATE TABLE auth_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL,
  verdict TEXT CHECK (verdict IN ('genuine', 'replica', 'inconclusive', NULL)),
  images TEXT[],
  description TEXT,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on auth checks
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_id UUID REFERENCES auth_checks(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT
);
```

**Cost: £0/month** (Supabase free tier: 500MB database, 1GB storage, 2M edge function calls)

---

## PHASE 7: Add Paid Subscriptions with Stripe (1-2 hours)

### Step 19: Set Up Stripe

1. Go to https://stripe.com and create an account
2. Get your **Publishable Key** and **Secret Key** from Dashboard → Developers → API Keys
3. Create 2 products in Stripe Dashboard → Products:
   - **RepCheck Pro** — £9.99/month
   - **RepCheck Elite** — £24.99/month

```bash
npm install stripe @stripe/stripe-js
```

Add to `.env.local`:

```
STRIPE_SECRET_KEY=sk_live_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ELITE_PRICE_ID=price_xxxxx
```

### Step 20: Create Checkout API

Create `app/api/checkout/route.js`:

```javascript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const { priceId, userId } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/token`,
    metadata: { userId },
  })

  return Response.json({ url: session.url })
}
```

Then on your pricing page, when someone clicks "Subscribe":

```javascript
async function handleSubscribe(plan) {
  const priceId = plan === 'pro' 
    ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
    : process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId: currentUser.id })
  })
  
  const { url } = await res.json()
  window.location.href = url  // redirects to Stripe checkout
}
```

**Stripe takes 1.4% + 20p per transaction.**

---

## PHASE 8: Launch $REPCHK Token on Solana (15 mins, £3-5)

### Step 21: Create a Solana Wallet

1. Install **Phantom Wallet** browser extension from https://phantom.app
2. Create a new wallet — **SAVE YOUR SEED PHRASE SECURELY**
3. Buy a tiny amount of SOL (0.05 SOL ≈ £5) — you can buy via MoonPay inside Phantom

### Step 22: Launch Token via pump.fun

1. Go to https://pump.fun
2. Connect your Phantom wallet
3. Fill in:
   - **Name:** RepCheck
   - **Ticker:** REPCHK
   - **Description:** Utility token for RepCheck.one — the luxury authentication standard
   - **Image:** Upload your RepCheck logo
4. Pay the creation fee (~0.01 SOL)
5. Your token is now live on Solana
6. Note the **token contract address** — this is your token's ID

### Step 23: Add Token Info to Your Site

Update the Token page in your app to show the real contract address and link to DEX trading (Raydium/Jupiter).

**Cost: ~£3-5 total.**

---

## PHASE 9: Optional — Run a Home Server for Free AI (advanced)

### Step 24: Set Up Your Home PC as a Server

Only do this if you want to run a local AI model to save on API costs.

**Minimum specs:** 16GB RAM, NVIDIA GPU with 8GB+ VRAM (RTX 3060 ideal budget choice)

```bash
# Install Ubuntu Server (or use your existing Linux/Windows PC)
# Install Ollama (easiest way to run local AI)
curl -fsSL https://ollama.com/install.sh | sh

# Download a model
ollama pull llama3.1:8b    # 4.7GB, runs on 8GB VRAM
# OR for better quality:
ollama pull mistral:7b      # 4.1GB

# Test it
ollama run llama3.1:8b "Is this a genuine Rolex Submariner tell: the cyclops magnification is only 1.5x instead of 2.5x?"
```

### Step 25: Expose Your Home Server (Free)

Use Cloudflare Tunnel to make your home server accessible without port forwarding:

```bash
# Install cloudflared
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate with Cloudflare (you need a free Cloudflare account)
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create repcheck

# Run the tunnel (maps your local port 3000 to the internet)
cloudflared tunnel route dns repcheck api.repcheck.one
cloudflared tunnel run --url http://localhost:11434 repcheck
```

Now your local Ollama AI is available at `api.repcheck.one` — **£0 per query** instead of paying per API call.

**Electricity cost: £30-50/month** for a mid-range PC running 24/7.

---

## PHASE 10: SEO & Marketing (ongoing)

### Step 26: Basic SEO Setup

Update `app/layout.js` metadata:

```javascript
export const metadata = {
  title: 'RepCheck.one — Free Luxury Authentication | Spot Fake Designer Items',
  description: 'Authenticate Rolex, Louis Vuitton, Chanel, Jordan, Moncler and 50+ luxury brands. Free database of 1,270+ counterfeit tells from Reddit, expert forums and authentication guides.',
  keywords: 'fake vs real, authentication, legit check, replica, Rolex, Louis Vuitton, Chanel, Jordan, Gucci, Moncler, Stone Island',
  openGraph: {
    title: 'RepCheck.one — The Authentication Standard',
    description: 'Free luxury authentication with 1,270+ tells across 58 brands',
    url: 'https://repcheck.one',
    siteName: 'RepCheck.one',
    type: 'website',
  },
}
```

### Step 27: Create SEO Pages for Each Brand

For every brand in your database, create a page like `app/guides/[brand]/page.js` that generates from the database. This gives you 58+ indexed pages targeting searches like:

- "how to spot fake Rolex Submariner"
- "Louis Vuitton Neverfull fake vs real"
- "is my Moncler jacket real"

These are **high-traffic, high-intent searches** with good ad revenue.

### Step 28: Post Content

- **Reddit:** Share helpful authentication tips on r/Watches, r/streetwear, r/fashion (don't spam — provide value first)
- **TikTok/Instagram Reels:** Short "fake vs real" comparison videos get millions of views
- **YouTube:** "How to spot a fake [brand]" videos — embed your site link
- **Google Ads:** Optional — target "fake vs real [brand]" keywords

---

## Cost Summary

| Item | Monthly Cost |
|------|-------------|
| Vercel hosting | **£0** |
| Supabase database | **£0** |
| Cloudflare DNS + tunnel | **£0** |
| Domain (repcheck.one) | ~**£1/month** (£10-12/year) |
| Stripe fees | 1.4% + 20p per transaction |
| Solana token launch | **£3-5 one-time** |
| Home server electricity (optional) | **£30-50** |
| **TOTAL (without home server)** | **~£1/month** |
| **TOTAL (with home server)** | **~£31-51/month** |

---

## Revenue Streams

| Stream | Expected Monthly |
|--------|-----------------|
| Google AdSense | £150-900 (depends on traffic) |
| Affiliate links (Chrono24, StockX etc) | £200-2,000 |
| Pro subscriptions (£9.99/mo) | £500-5,000 |
| Elite subscriptions (£24.99/mo) | £250-2,500 |
| $REPCHK token transaction fees | Variable |

---

## Priority Order (What to Do First)

1. ✅ **Phase 1** — Get site running locally (30 mins)
2. ✅ **Phase 2** — Connect database to frontend (1-2 hrs)
3. ✅ **Phase 3** — Deploy to Vercel for free (15 mins)
4. ✅ **Phase 4** — Apply for AdSense (30 mins — start earning while building)
5. ✅ **Phase 5** — Add affiliate links (15 mins)
6. ⬜ **Phase 10** — SEO pages + marketing (do this early for organic traffic)
7. ⬜ **Phase 6** — Supabase for user accounts (1-2 hrs)
8. ⬜ **Phase 7** — Stripe subscriptions (1-2 hrs)
9. ⬜ **Phase 8** — Token launch (15 mins)
10. ⬜ **Phase 9** — Home server (only if traffic justifies AI costs)

**Total time to a live, money-making site: ~4-6 hours of work.**
