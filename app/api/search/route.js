// app/api/search/route.js
// Searches the authentication database and returns matching products

import { AUTH_DATABASE } from '@/lib/authDatabase'

// Required for Cloudflare Pages
export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category') || 'all'

  if (!query || query.length < 2) {
    return Response.json({ results: [], message: 'Query too short' })
  }

  const results = []

  // Search through all categories in the database
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
