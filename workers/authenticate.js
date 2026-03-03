// Cloudflare Worker for RepCheck.one - MINIMUM COST VERSION
// Uses Claude Haiku (cheapest model) + strict rate limiting

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://repcheck.one",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const origin = request.headers.get("Origin");
    if (origin !== "https://repcheck.one" && origin !== "http://localhost:3000") {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      const body = await request.json();
      
      if (!body.images || !body.category || !body.brand) {
        return jsonResponse({ error: "Missing required fields" }, 400, origin);
      }

      // Limit to 2 images max (reduces tokens significantly)
      const images = body.images.slice(0, 2);

      const imageContents = images.map(img => ({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType,
          data: img.base64
        }
      }));

      // Use Claude Haiku - 20x cheaper than Sonnet
      // Haiku: $0.25/1M input, $1.25/1M output
      // Sonnet: $3/1M input, $15/1M output
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: [
              ...imageContents,
              {
                type: "text", 
                text: `Authenticate this ${body.brand} ${body.category}. JSON only:
{"verdict":"LIKELY GENUINE"/"LIKELY REPLICA"/"INCONCLUSIVE","confidence":0-100,"summary":"1 sentence","details":[{"marker":"name","status":"pass"/"fail"/"unclear","note":"brief"}],"recommendations":["tip1"]}
Check: stitching, hardware, fonts, materials. Max 4 markers.`
              }
            ]
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
        return jsonResponse({ error: data.error.message }, 500, origin);
      }

      const text = data.content[0].text;
      let result;
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : fallbackResult();
      } catch (e) {
        result = fallbackResult();
      }

      return jsonResponse(result, 200, origin);

    } catch (error) {
      return jsonResponse({ error: "Service error" }, 500, "https://repcheck.one");
    }
  },
};

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "https://repcheck.one",
    },
  });
}

function fallbackResult() {
  return {
    verdict: "INCONCLUSIVE",
    confidence: 50,
    summary: "Could not complete analysis. Try clearer images.",
    details: [],
    recommendations: ["Upload higher resolution images"]
  };
}
