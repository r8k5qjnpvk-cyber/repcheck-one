# RepCheck.one — The Authentication Standard

Luxury item authentication platform with 1,270+ counterfeit detection data points across 58 brands and 145+ models.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Run locally
npm run dev

# 4. Open http://localhost:3000
```

## Project Structure

```
repcheck-one/
├── app/
│   ├── layout.js              ← SEO metadata + AdSense script
│   ├── page.js                ← Main React app (all 6 pages)
│   ├── globals.css            ← Global styles
│   └── api/
│       └── search/
│           └── route.js       ← Database search API endpoint
├── lib/
│   ├── authDatabase.js        ← Master database (2,002 lines, 1,270+ tells)
│   └── authDatabase_v4_expansion.js ← v4 expansion data
├── docs/
│   └── IMPLEMENTATION-GUIDE.md ← Full 10-phase deployment guide
├── .env.example               ← Environment variables template
├── package.json
└── next.config.js
```

## Database Coverage

| Category | Brands | Models | Data Points |
|----------|--------|--------|-------------|
| Watches | 12 | 30+ | 200+ |
| Handbags | 14 | 35+ | 250+ |
| Sneakers | 8 | 25+ | 200+ |
| Clothing | 12 | 25+ | 200+ |
| Sunglasses | 5 | 8+ | 50+ |
| Jewelry | 5 | 15+ | 100+ |
| Belts | 3 | 5+ | 80+ |
| Outerwear | 3 | 5+ | 60+ |
| **TOTAL** | **58** | **145+** | **1,270+** |

## Deployment

See `docs/IMPLEMENTATION-GUIDE.md` for the full step-by-step guide covering:
- Phase 1-3: Local dev → Vercel deployment (free)
- Phase 4-5: AdSense + affiliate revenue
- Phase 6-7: Supabase database + Stripe subscriptions
- Phase 8: $REPCHK Solana token launch
- Phase 9: Optional home server for free AI
- Phase 10: SEO + marketing

## Monthly Costs

| With free tiers only | With home server |
|---------------------|-----------------|
| ~£1/month | ~£31-51/month |

## Revenue Streams

- Google AdSense
- Affiliate links (Chrono24, StockX, FARFETCH, Vestiaire)
- Pro subscriptions (£9.99/mo)
- Elite subscriptions (£24.99/mo)
- $REPCHK token economy

# RepCheck.one
