"use client"
import { useState, useEffect, useRef, useCallback } from "react"

// ═══════════════════════════════════════════════════════════════
//  REPCHECK.ONE — THE AUTHENTICATION STANDARD
//  Complete platform: Auth · Forum · $REPCHK · Admin · Tools
// ═══════════════════════════════════════════════════════════════

const P = { home: 0, forum: 1, token: 2, tools: 3, admin: 4, guides: 5, privacy: 6, terms: 7, about: 8, contact: 9 }

// ─── DESIGN TOKENS (LIGHT THEME) ────────────────────────────
const C = {
  bg: "#FAFAF7", bg2: "#F2F0EB", bg3: "#E8E5DE", bg4: "#fff",
  border: "#E0DDD5", borderDark: "#C8C4BA",
  gold: "#9B7B3C", goldLight: "#C9A96E", goldBright: "#D4B87A", goldBg: "#F8F3E8",
  text: "#1A1A1A", textMid: "#5A5A5A", textLight: "#8A8A8A", textDim: "#B0ADA5",
  green: "#2E8B57", greenBg: "#EDF7F0", red: "#C0392B", redBg: "#FDF0EE",
  blue: "#2E6DA4", blueBg: "#EDF3FA", purple: "#7B5EA7",
  white: "#FFFFFF",
}

// ─── COUNTER LOGIC ───────────────────────────────────────────
const BASE_COUNT = 172374
const DAILY_INCREMENT = 2823
const LAUNCH_DATE = new Date("2025-01-01")
function getCount() {
  const now = new Date()
  const days = Math.floor((now - LAUNCH_DATE) / 86400000)
  const todayProgress = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400
  return Math.floor(BASE_COUNT + (days + todayProgress) * DAILY_INCREMENT)
}

// ─── MOCK DATA ───────────────────────────────────────────────
const FORUM_POSTS = [
  { id: 1, user: "WatchCollector_UK", verified: true, level: "Gold", rep: 842, cat: "watches", title: "Submariner 126610LN from grey dealer — rehaut looks slightly off", imgs: 3, time: "12m", replies: 14, upvotes: 67, tag: "LC", verdict: null },
  { id: 2, user: "SneakerVault", verified: true, level: "Platinum", rep: 2340, cat: "sneakers", title: "Travis Scott AJ4 from StockX — suede nap feels thin", imgs: 5, time: "34m", replies: 31, upvotes: 124, tag: "LC", verdict: "GENUINE" },
  { id: 3, user: "BagLady_Paris", verified: false, level: "Silver", rep: 156, cat: "handbags", title: "Vintage Kelly 28 — blind stamp correct for 2003?", imgs: 4, time: "1h", replies: 8, upvotes: 43, tag: "LC", verdict: null },
  { id: 4, user: "RepKnowledge", verified: true, level: "Diamond", rep: 5120, cat: "clothing", title: "PSA: New Moncler Maya batch has wrong comic strip label", imgs: 2, time: "2h", replies: 89, upvotes: 312, tag: "PSA", verdict: null },
  { id: 5, user: "IceCheck", verified: true, level: "Gold", rep: 780, cat: "jewelry", title: "Cartier Love bracelet — screw motifs look shallow", imgs: 3, time: "3h", replies: 22, upvotes: 95, tag: "LC", verdict: "REPLICA" },
  { id: 6, user: "AuthPro", verified: true, level: "Diamond", rep: 4800, cat: "handbags", title: "Guide: Spotting 187 Factory Chanel Flaps — 6 tells that never fail", imgs: 8, time: "6h", replies: 156, upvotes: 890, tag: "GUIDE", verdict: null },
  { id: 7, user: "DunkHead99", verified: false, level: "Bronze", rep: 45, cat: "sneakers", title: "Panda Dunks for £70 on eBay — too good?", imgs: 4, time: "4h", replies: 17, upvotes: 28, tag: "LC", verdict: "REPLICA" },
  { id: 8, user: "ShadeCheck", verified: false, level: "Silver", rep: 210, cat: "sunglasses", title: "Cartier Buffs from car boot — temple engraving looks right?", imgs: 3, time: "8h", replies: 11, upvotes: 34, tag: "LC", verdict: null },
]

const ADMIN_DATA = {
  visitors: { today: 3847, week: 24192, month: 89431, trend: "+12.3%" },
  uploads: { today: 412, week: 2891, month: 11204, trend: "+8.7%" },
  subs: { free: 12840, pro: 1247, elite: 389, trend: "+15.2%" },
  revenue: { ads: "£847", affiliates: "£1,203" },
  topSearches: [
    { item: "Rolex Submariner", count: 1847 }, { item: "Louis Vuitton Neverfull", count: 1203 },
    { item: "Jordan 4 Travis Scott", count: 989 }, { item: "Chanel Classic Flap", count: 876 },
    { item: "Cartier Love Bracelet", count: 654 }, { item: "Moncler Maya", count: 612 },
    { item: "Yeezy 350 V2", count: 598 }, { item: "Hermès Birkin", count: 534 },
  ],
  recentUploads: [
    { time: "2m ago", cat: "watches", item: "Rolex Datejust 41", result: "Genuine" },
    { time: "5m ago", cat: "sneakers", item: "Jordan 1 Mocha", result: "Replica" },
    { time: "8m ago", cat: "handbags", item: "Goyard Saint Louis", result: "Inconclusive" },
    { time: "12m ago", cat: "clothing", item: "Stone Island Badge", result: "Genuine" },
    { time: "15m ago", cat: "jewelry", item: "VCA Alhambra", result: "Replica" },
  ]
}

const LVL_C = { Bronze: "#A0724A", Silver: "#7A7A7A", Gold: "#9B7B3C", Platinum: "#5A5A7A", Diamond: "#2E6DA4" }
const TAG_C = { LC: C.gold, PSA: C.red, GUIDE: C.green, DISC: C.blue }
const CAT_I = { watches: "⌚", handbags: "👜", sneakers: "👟", clothing: "🧥", sunglasses: "🕶", jewelry: "💎" }

// ─── STYLES ──────────────────────────────────────────────────
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
:root { --d: 'Playfair Display', Georgia, serif; --s: 'DM Sans', -apple-system, sans-serif; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--s); background: ${C.bg}; color: ${C.text}; }
::selection { background: ${C.goldBg}; color: ${C.gold}; }
.btn { border: none; cursor: pointer; font-family: var(--s); transition: all .2s; }
.btn-gold { background: ${C.gold}; color: #fff; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 600; letter-spacing: .03em; }
.btn-gold:hover { background: ${C.goldLight}; transform: translateY(-1px); box-shadow: 0 4px 16px ${C.gold}30; }
.btn-out { background: transparent; border: 1.5px solid ${C.border}; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 500; color: ${C.textMid}; }
.btn-out:hover { border-color: ${C.gold}; color: ${C.gold}; }
.card { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 12px; padding: 24px; transition: all .2s; }
.card:hover { border-color: ${C.borderDark}; box-shadow: 0 4px 20px rgba(0,0,0,.04); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.fade { animation: fadeUp .5s ease forwards; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .6; } }
.pulse { animation: pulse 2s infinite; }
.tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; }
`

// ─── REUSABLE COMPONENTS ─────────────────────────────────────
const Label = ({children, c = C.textLight}) => <div style={{fontFamily:"var(--s)",fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:c,marginBottom:8}}>{children}</div>

const StatBox = ({value, label, trend, color = C.gold}) => (
  <div className="card" style={{textAlign:"center",padding:20}}>
    <div style={{fontFamily:"var(--d)",fontSize:32,fontWeight:500,color}}>{value}</div>
    <div style={{fontSize:12,color:C.textLight,marginTop:2}}>{label}</div>
    {trend && <div style={{fontSize:11,color:C.green,marginTop:4,fontWeight:600}}>{trend}</div>}
  </div>
)

const AdSlot = ({size = "728×90", label = "Advertisement"}) => (
  <div style={{background:C.bg2,border:`1px dashed ${C.border}`,borderRadius:8,padding:16,textAlign:"center",margin:"16px 0"}}>
    <div style={{fontSize:9,color:C.textDim,letterSpacing:".1em",textTransform:"uppercase"}}>{label}</div>
    <div style={{fontSize:11,color:C.textLight,marginTop:4}}>Google AdSense · {size}</div>
    <div style={{fontSize:8,color:C.textDim,marginTop:2}}>Ad loads here after AdSense approval</div>
  </div>
)

// ─── AUTHENTICATION UPLOAD COMPONENT ─────────────────────────
function AuthenticationUpload() {
  const [images, setImages] = useState([])
  const [category, setCategory] = useState("")
  const [brand, setBrand] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const categories = [
    {id: "watches", label: "⌚ Watches", brands: ["Rolex", "Omega", "Patek Philippe", "Audemars Piguet", "Cartier", "Tag Heuer", "Breitling", "IWC", "Other"]},
    {id: "handbags", label: "👜 Handbags", brands: ["Louis Vuitton", "Chanel", "Hermès", "Gucci", "Prada", "Dior", "Goyard", "Bottega Veneta", "Other"]},
    {id: "sneakers", label: "👟 Sneakers", brands: ["Nike", "Jordan", "Yeezy", "New Balance", "Travis Scott", "Off-White", "Dunk", "Other"]},
    {id: "clothing", label: "🧥 Clothing", brands: ["Moncler", "Stone Island", "Supreme", "Balenciaga", "Gucci", "Arc'teryx", "Trapstar", "Corteiz", "Other"]},
    {id: "sunglasses", label: "🕶 Sunglasses", brands: ["Ray-Ban", "Cartier", "Gucci", "Prada", "Dior", "Oakley", "Other"]},
    {id: "jewelry", label: "💎 Jewelry", brands: ["Cartier", "Van Cleef & Arpels", "Tiffany & Co", "Bulgari", "Chrome Hearts", "Other"]},
  ]

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be under 10MB")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, { file, preview: e.target.result, base64: e.target.result.split(',')[1] }])
      }
      reader.readAsDataURL(file)
    })
    setError(null)
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAuthenticate = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image")
      return
    }
    if (!category) {
      setError("Please select a category")
      return
    }
    if (!brand) {
      setError("Please select a brand")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const imageContents = images.map(img => ({
        type: "image",
        source: {
          type: "base64",
          media_type: img.file.type,
          data: img.base64
        }
      }))

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: [
              ...imageContents,
              {
                type: "text",
                text: `You are an expert luxury goods authenticator. Analyze these images of a ${brand} ${category.replace('s', '')} and provide an authentication assessment.

IMPORTANT: Provide your analysis in the following JSON format ONLY, no other text:
{
  "verdict": "LIKELY GENUINE" or "LIKELY REPLICA" or "INCONCLUSIVE",
  "confidence": 0-100,
  "summary": "Brief 1-2 sentence summary",
  "details": [
    {"marker": "marker name", "status": "pass" or "fail" or "unclear", "note": "explanation"}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Analyze: stitching quality, hardware/materials, fonts/engravings, serial numbers if visible, overall craftsmanship, common replica tells for this brand. Be thorough but concise.`
              }
            ]
          }]
        })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message || "Authentication failed")
      }

      const text = data.content[0].text
      // Try to parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setResult(parsed)
      } else {
        // Fallback if not proper JSON
        setResult({
          verdict: "INCONCLUSIVE",
          confidence: 50,
          summary: text.substring(0, 200),
          details: [],
          recommendations: ["Please try again with clearer images"]
        })
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setImages([])
    setCategory("")
    setBrand("")
    setResult(null)
    setError(null)
  }

  const selectedCategory = categories.find(c => c.id === category)

  return (
    <div className="card" style={{marginBottom:32,padding:28}}>
      <Label c={C.gold}>Free Authentication</Label>
      <h2 style={{fontFamily:"var(--d)",fontSize:24,fontWeight:500,marginBottom:16}}>Upload Your Item</h2>
      
      {!result ? (
        <>
          {/* Image Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border:`2px dashed ${images.length > 0 ? C.gold : C.border}`,
              borderRadius:12,
              padding:images.length > 0 ? 16 : 40,
              textAlign:"center",
              cursor:"pointer",
              background:images.length > 0 ? C.goldBg : C.bg,
              transition:"all 0.2s",
              marginBottom:16
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{display:"none"}}
            />
            
            {images.length === 0 ? (
              <>
                <div style={{fontSize:48,marginBottom:12}}>📷</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Drop images here or click to upload</div>
                <div style={{fontSize:12,color:C.textLight}}>Up to 5 images, max 10MB each · JPG, PNG, HEIC</div>
              </>
            ) : (
              <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
                {images.map((img, i) => (
                  <div key={i} style={{position:"relative"}}>
                    <img src={img.preview} alt={`Upload ${i+1}`} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`2px solid ${C.gold}`}}/>
                    <button 
                      onClick={(e) => {e.stopPropagation(); removeImage(i)}}
                      style={{position:"absolute",top:-8,right:-8,width:24,height:24,borderRadius:"50%",background:C.red,color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:700}}
                    >×</button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div style={{width:80,height:80,borderRadius:8,border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:C.textLight}}>+</div>
                )}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:C.textMid}}>Category</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {setCategory(cat.id); setBrand("")}}
                  className="btn"
                  style={{
                    padding:"10px 16px",
                    borderRadius:8,
                    border:`1px solid ${category === cat.id ? C.gold : C.border}`,
                    background:category === cat.id ? C.goldBg : C.white,
                    color:category === cat.id ? C.gold : C.textMid,
                    fontSize:13,
                    fontWeight:category === cat.id ? 600 : 400
                  }}
                >{cat.label}</button>
              ))}
            </div>
          </div>

          {/* Brand Selection */}
          {selectedCategory && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:C.textMid}}>Brand</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {selectedCategory.brands.map(b => (
                  <button
                    key={b}
                    onClick={() => setBrand(b)}
                    className="btn"
                    style={{
                      padding:"8px 14px",
                      borderRadius:8,
                      border:`1px solid ${brand === b ? C.gold : C.border}`,
                      background:brand === b ? C.goldBg : C.white,
                      color:brand === b ? C.gold : C.textMid,
                      fontSize:12,
                      fontWeight:brand === b ? 600 : 400
                    }}
                  >{b}</button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{padding:12,background:C.redBg,border:`1px solid ${C.red}30`,borderRadius:8,marginBottom:16,color:C.red,fontSize:13}}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleAuthenticate}
            disabled={loading || images.length === 0}
            className="btn btn-gold"
            style={{
              width:"100%",
              padding:"16px 32px",
              fontSize:15,
              opacity:loading || images.length === 0 ? 0.6 : 1,
              cursor:loading || images.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <span>🔍 Analyzing... This may take 10-20 seconds</span>
            ) : (
              <span>🔍 Authenticate Now — Free</span>
            )}
          </button>
          
          <div style={{fontSize:11,color:C.textLight,textAlign:"center",marginTop:12}}>
            Our AI analyzes stitching, hardware, fonts, materials & known replica tells
          </div>
        </>
      ) : (
        /* Results Display */
        <div>
          {/* Verdict Banner */}
          <div style={{
            padding:20,
            borderRadius:12,
            background:result.verdict === "LIKELY GENUINE" ? C.greenBg : result.verdict === "LIKELY REPLICA" ? C.redBg : C.goldBg,
            border:`2px solid ${result.verdict === "LIKELY GENUINE" ? C.green : result.verdict === "LIKELY REPLICA" ? C.red : C.gold}30`,
            textAlign:"center",
            marginBottom:20
          }}>
            <div style={{fontSize:36,marginBottom:8}}>
              {result.verdict === "LIKELY GENUINE" ? "✅" : result.verdict === "LIKELY REPLICA" ? "❌" : "⚠️"}
            </div>
            <div style={{
              fontFamily:"var(--d)",
              fontSize:28,
              fontWeight:600,
              color:result.verdict === "LIKELY GENUINE" ? C.green : result.verdict === "LIKELY REPLICA" ? C.red : C.gold
            }}>
              {result.verdict}
            </div>
            <div style={{fontSize:14,color:C.textMid,marginTop:4}}>
              Confidence: {result.confidence}%
            </div>
          </div>

          {/* Summary */}
          <div style={{padding:16,background:C.bg,borderRadius:8,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textLight,marginBottom:4}}>SUMMARY</div>
            <div style={{fontSize:14,color:C.text,lineHeight:1.6}}>{result.summary}</div>
          </div>

          {/* Details */}
          {result.details && result.details.length > 0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:C.textLight,marginBottom:8}}>AUTHENTICATION MARKERS</div>
              {result.details.map((d, i) => (
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:16}}>
                    {d.status === "pass" ? "✅" : d.status === "fail" ? "❌" : "⚠️"}
                  </span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{d.marker}</div>
                    <div style={{fontSize:12,color:C.textMid}}>{d.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{padding:16,background:C.blueBg,borderRadius:8,marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,color:C.blue,marginBottom:8}}>💡 RECOMMENDATIONS</div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{fontSize:13,color:C.textMid,marginBottom:4}}>• {r}</div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{padding:12,background:C.bg2,borderRadius:8,marginBottom:16}}>
            <div style={{fontSize:11,color:C.textLight,lineHeight:1.6}}>
              <strong>Disclaimer:</strong> This AI-powered assessment is an opinion based on image analysis and should not be considered official authentication. For high-value items, we recommend professional in-person authentication. RepCheck.one is not liable for purchase decisions made based on this analysis.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{display:"flex",gap:12}}>
            <button onClick={resetForm} className="btn btn-gold" style={{flex:1,padding:"14px 24px"}}>
              🔍 Check Another Item
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NAV ─────────────────────────────────────────────────────
function Nav({page, setPage}) {
  const links = [
    {p:P.home, l:"Authenticate"},
    {p:P.tools, l:"Tools"}, {p:P.guides, l:"Guides"}
  ]
  return (
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:`1px solid ${C.border}`,background:C.white,position:"sticky",top:0,zIndex:100,margin:"0 -20px",padding:"16px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage(P.home)}>
        <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"var(--d)"}}>R</span>
        </div>
        <span style={{fontFamily:"var(--d)",fontSize:20,fontWeight:500}}>
          Rep<em style={{fontStyle:"italic",color:C.gold}}>Check</em><span style={{color:C.textDim,fontSize:13}}>.one</span>
        </span>
      </div>
      <div style={{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap"}}>
        {links.map(l=>(
          <button key={l.p} onClick={()=>setPage(l.p)} className="btn" style={{
            background:page===l.p?C.goldBg:"transparent", border:page===l.p?`1px solid ${C.gold}30`:"1px solid transparent",
            borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:page===l.p?600:400,
            color:page===l.p?C.gold:C.textMid,
          }}>{l.l}</button>
        ))}
        <button className="btn" onClick={()=>setPage(P.admin)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.textLight,marginLeft:4}}>⚙ Admin</button>
      </div>
    </nav>
  )
}

// ─── HOME PAGE ───────────────────────────────────────────────
function HomePage({setPage}) {
  const [count, setCount] = useState(getCount())
  useEffect(()=>{ const i = setInterval(()=>setCount(getCount()),5000); return()=>clearInterval(i) },[])

  return (
    <div className="fade">
      {/* Hero */}
      <div style={{textAlign:"center",padding:"56px 0 40px",position:"relative"}}>
        <div style={{position:"absolute",top:"20%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,background:`radial-gradient(circle,${C.goldBg} 0%,transparent 60%)`,pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <Label c={C.gold}>AI-Powered Luxury Authentication</Label>
          <h1 style={{fontFamily:"var(--d)",fontSize:"clamp(40px,8vw,72px)",fontWeight:500,lineHeight:.95,margin:"12px 0 20px",letterSpacing:"-.02em"}}>
            Know What You're<br/><em style={{fontStyle:"italic",color:C.gold}}>Really</em> Buying
          </h1>
          <p style={{fontSize:16,color:C.textMid,maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            Upload a photo of any luxury item. Our AI analyzes stitching, hardware, fonts, materials and known replica tells to give you an instant authentication report.
          </p>
        </div>
      </div>

      {/* Live Counter */}
      <div style={{textAlign:"center",padding:"20px 0 28px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:100,padding:"10px 24px"}}>
          <span className="pulse" style={{width:8,height:8,borderRadius:"50%",background:C.green,display:"inline-block"}}/>
          <span style={{fontFamily:"var(--d)",fontSize:22,fontWeight:500,color:C.gold}}>{count.toLocaleString()}</span>
          <span style={{fontSize:12,color:C.textLight}}>items authenticated and counting</span>
        </div>
      </div>
      
      {/* Authentication Upload Component */}
      <AuthenticationUpload />

      {/* Stats Bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:32}}>
        <StatBox value="200+" label="Brands Covered"/>
        <StatBox value="94.7%" label="Accuracy Rate"/>
        <StatBox value="48K+" label="Community Members"/>
        <StatBox value="<10s" label="Average Result Time"/>
      </div>

      {/* Press Bar */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:28,padding:"16px 0 28px",flexWrap:"wrap",opacity:.35}}>
        <span style={{fontSize:10,color:C.textDim,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase"}}>Authentication Categories</span>
        {["WATCHES","HANDBAGS","SNEAKERS","CLOTHING","SUNGLASSES","JEWELRY"].map(p=>
          <span key={p} style={{fontSize:12,fontWeight:700,letterSpacing:".12em",color:C.textMid}}>{p}</span>
        )}
      </div>

      {/* Product Images Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:32}}>
        {[
          {emoji:"⌚",label:"Watches",bg:"#F5F0E5"},{emoji:"👜",label:"Bags",bg:"#F0E8E5"},
          {emoji:"👟",label:"Sneakers",bg:"#E5EDF5"},{emoji:"🧥",label:"Clothing",bg:"#E5F0E8"},
          {emoji:"🕶",label:"Shades",bg:"#F5E5F0"},{emoji:"💎",label:"Jewellery",bg:"#EDE5F5"},
        ].map(c=>(
          <div key={c.label} className="card" style={{textAlign:"center",padding:20,background:c.bg,borderColor:"transparent",cursor:"pointer"}}>
            <div style={{fontSize:36,marginBottom:8}}>{c.emoji}</div>
            <div style={{fontSize:12,fontWeight:600,color:C.textMid}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Trust Features */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:32}}>
        {[
          {icon:"⚡",t:"10-Second Results",d:"Upload, wait a few seconds, get a full component-level report."},
          {icon:"🔬",t:"Component Analysis",d:"Every stitch, stamp, screw and serial — broken down individually."},
          {icon:"🏭",t:"Factory Identification",d:"We identify which replica factory likely produced the item."},
          {icon:"🛡",t:"Dealer Trusted",d:"Used by 400+ resellers, pawn shops and consignment stores."},
          {icon:"🎯",t:"Thread Counter",d:"AI calculates fabric thread density from your photo."},
          {icon:"🎵",t:"Sound Identifier",d:"Record watch ticking to identify genuine vs replica movements."},
        ].map(f=>(
          <div key={f.t} className="card" style={{cursor:"pointer"}} onClick={()=>f.t.includes("Thread")||f.t.includes("Sound")?setPage(P.tools):null}>
            <div style={{fontSize:28,marginBottom:10}}>{f.icon}</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{f.t}</div>
            <div style={{fontSize:13,color:C.textMid,lineHeight:1.6}}>{f.d}</div>
          </div>
        ))}
      </div>

      <AdSlot size="728×90" label="Google AdSense — Leaderboard"/>

      {/* How It Works */}
      <div style={{marginBottom:32}}>
        <Label>How RepCheck Works</Label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12,marginTop:12}}>
          {[
            {step:"1",t:"Upload Your Item",d:"Take clear photos of the item you want to authenticate — include serial numbers, stitching, hardware, and any labels."},
            {step:"2",t:"AI Analysis",d:"Our system compares your photos against our database of genuine items and known replica tells from verified sources."},
            {step:"3",t:"Get Your Report",d:"Receive a detailed breakdown of authentication markers, factory identification, and confidence score within seconds."},
          ].map(s=>(
            <div key={s.step} className="card" style={{borderLeft:`3px solid ${C.gold}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:C.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--d)",fontSize:18,color:C.gold,fontWeight:600}}>{s.step}</div>
                <div style={{fontSize:14,fontWeight:600}}>{s.t}</div>
              </div>
              <p style={{fontSize:13,color:C.textMid,lineHeight:1.7}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate Section */}
      <div className="card" style={{marginBottom:32,background:`linear-gradient(135deg,${C.goldBg},${C.white})`,border:`1px solid ${C.gold}30`}}>
        <Label c={C.gold}>Buy Authenticated Items From Trusted Partners</Label>
        <p style={{fontSize:13,color:C.textMid,marginBottom:16}}>Found something you like? Buy genuine luxury items from our vetted partners. We earn a small commission — you pay the same price.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
          {[
            {name:"StockX",desc:"Sneakers & Streetwear",comm:"1-4%",link:"stockx.com"},
            {name:"Farfetch",desc:"Designer Fashion",comm:"5-11%",link:"farfetch.com"},
            {name:"Chrono24",desc:"Luxury Watches",comm:"3-6%",link:"chrono24.co.uk"},
            {name:"SSENSE",desc:"Contemporary Luxury",comm:"5-7.5%",link:"ssense.com"},
            {name:"Vestiaire",desc:"Pre-Owned Luxury",comm:"5-8%",link:"vestiairecollective.com"},
          ].map(a=>(
            <div key={a.name} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:14,textAlign:"center",cursor:"pointer"}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>{a.name}</div>
              <div style={{fontSize:11,color:C.textLight}}>{a.desc}</div>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginTop:6}}>Shop Now →</div>
            </div>
          ))}
        </div>
      </div>

      <AdSlot size="300×250" label="Google AdSense — Medium Rectangle"/>

      {/* Brand Coverage */}
      <div style={{textAlign:"center",padding:"28px 0",borderTop:`1px solid ${C.border}`}}>
        <Label>200+ Brands Authenticated Daily</Label>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"6px 18px",marginTop:12,maxWidth:700,margin:"12px auto"}}>
          {["Rolex","Hermès","Jordan","Chanel","Louis Vuitton","Gucci","Yeezy","Patek Philippe","AP","Omega","Dior","Prada","Supreme","Cartier","Moncler","Balenciaga","Goyard","Nike","Loewe","Fendi","Stone Island","New Balance","Bottega Veneta","Chrome Hearts","Van Cleef","Tiffany","Ray-Ban","Arc'teryx","Travis Scott","Trapstar","Corteiz"].map(b=>
            <span key={b} style={{fontSize:11,color:C.textLight,fontWeight:500}}>{b}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── FORUM PAGE ──────────────────────────────────────────────
function ForumPage() {
  const [filter, setFilter] = useState("all")
  const [expanded, setExpanded] = useState(null)
  const [votes, setVotes] = useState({})

  const handleVote = (id) => { setVotes(v => ({...v, [id]: (v[id]||0)+1})) }

  const filtered = FORUM_POSTS.filter(p => filter === "all" || p.cat === filter)

  return (
    <div className="fade">
      <div style={{padding:"32px 0 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
        <div>
          <Label c={C.gold}>Community Forum — Free For Everyone</Label>
          <h2 style={{fontFamily:"var(--d)",fontSize:28,fontWeight:500}}>Legit Checks & Discussion</h2>
          <p style={{fontSize:13,color:C.textMid,marginTop:4}}>Post photos, get expert opinions from our community of collectors and authentication enthusiasts.</p>
        </div>
        <button className="btn btn-gold">+ New Post</button>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {[{id:"all",l:"All"},...Object.entries(CAT_I).map(([k,v])=>({id:k,l:`${v} ${k[0].toUpperCase()+k.slice(1)}`}))].map(f=>
          <button key={f.id} onClick={()=>setFilter(f.id)} className="btn" style={{
            background:filter===f.id?C.goldBg:C.white,border:`1px solid ${filter===f.id?C.gold+"50":C.border}`,
            borderRadius:8,padding:"8px 14px",fontSize:11,fontWeight:filter===f.id?600:400,
            color:filter===f.id?C.gold:C.textMid,
          }}>{f.l}</button>
        )}
      </div>

      {/* Posts */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(post => (
          <div key={post.id} className="card" onClick={()=>setExpanded(expanded===post.id?null:post.id)} style={{
            cursor:"pointer",borderLeft:post.verdict?`3px solid ${post.verdict==="GENUINE"?C.green:post.verdict==="REPLICA"?C.red:C.gold}`:`3px solid ${C.border}`,
            background:expanded===post.id?C.bg2:C.white,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                  <span className="tag" style={{background:`${TAG_C[post.tag]}15`,color:TAG_C[post.tag]}}>{post.tag==="LC"?"LEGIT CHECK":post.tag}</span>
                  <span style={{fontSize:10,color:C.textLight}}>{CAT_I[post.cat]}</span>
                  {post.verdict && <span className="tag" style={{background:post.verdict==="GENUINE"?C.greenBg:C.redBg,color:post.verdict==="GENUINE"?C.green:C.red}}>{post.verdict==="GENUINE"?"✓ LIKELY GENUINE":"✗ LIKELY REPLICA"}</span>}
                </div>
                <h3 style={{fontSize:15,fontWeight:500,lineHeight:1.4,marginBottom:6}}>{post.title}</h3>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontWeight:600,color:post.verified?C.gold:C.textMid}}>{post.user}{post.verified&&" ✓"}</span>
                  <span className="tag" style={{background:`${LVL_C[post.level]}12`,color:LVL_C[post.level],fontSize:9}}>{post.level}</span>
                  <span style={{fontSize:10,color:C.textLight}}>📷 {post.imgs}</span>
                  <span style={{fontSize:10,color:C.textLight}}>{post.time} ago</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:48}} onClick={e=>{e.stopPropagation();handleVote(post.id)}}>
                <div style={{width:40,height:40,borderRadius:8,background:C.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.gold,cursor:"pointer",border:`1px solid ${C.gold}30`}}>▲</div>
                <span style={{fontFamily:"var(--d)",fontSize:18,fontWeight:500,color:C.gold}}>{post.upvotes+(votes[post.id]||0)}</span>
                <span style={{fontSize:9,color:C.textLight}}>{post.replies} replies</span>
              </div>
            </div>
            {expanded===post.id && (
              <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  {Array.from({length:post.imgs}).map((_,i)=><div key={i} style={{width:72,height:72,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.textLight}}>📷 {i+1}</div>)}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn btn-out" style={{padding:"8px 16px",fontSize:11}}>💬 Reply</button>
                  <button className="btn btn-out" style={{padding:"8px 16px",fontSize:11}}>🔍 Run Check</button>
                  <button className="btn btn-out" style={{padding:"8px 16px",fontSize:11}}>🔗 Share</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <AdSlot size="728×90"/>

      {/* Leaderboard */}
      <div style={{marginTop:28}}>
        <Label>Expert Leaderboard — This Week</Label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,marginTop:8}}>
          {[
            {r:1,u:"RepKnowledge",rep:5120,e:"+312",a:"97.1%",lv:"Diamond"},
            {r:2,u:"AuthPro",rep:4800,e:"+287",a:"96.4%",lv:"Diamond"},
            {r:3,u:"SneakerVault",rep:2340,e:"+156",a:"94.8%",lv:"Platinum"},
          ].map(u=>(
            <div key={u.r} className="card" style={{display:"flex",alignItems:"center",gap:12,padding:16}}>
              <div style={{fontFamily:"var(--d)",fontSize:24,color:C.gold}}>{u.r===1?"🥇":u.r===2?"🥈":"🥉"}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{u.u}</div>
                <span className="tag" style={{background:`${LVL_C[u.lv]}12`,color:LVL_C[u.lv],fontSize:8,marginTop:2}}>{u.lv}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--d)",fontSize:18,color:C.gold}}>{u.rep}</div>
                <div style={{fontSize:10,color:C.green,fontWeight:600}}>{u.e}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TOOLS PAGE (Sound Identifier + Thread Counter) ──────────
function ToolsPage() {
  const [activeT, setActiveT] = useState("sound")
  const [recording, setRecording] = useState(false)
  const [soundResult, setSoundResult] = useState(null)
  const [threadImg, setThreadImg] = useState(null)
  const [threadResult, setThreadResult] = useState(null)
  const [seconds, setSeconds] = useState(0)

  useEffect(()=>{ let i; if(recording){i=setInterval(()=>setSeconds(s=>s+1),1000)} return()=>clearInterval(i) },[recording])

  const startRecord = ()=>{ setRecording(true); setSeconds(0); setSoundResult(null)
    setTimeout(()=>{setRecording(false); setSoundResult({
      movement:"ETA 2824-2 Clone (Likely Miyota 8215)",confidence:78,bph:"21,600 BPH detected",
      genuine_sig:"Rolex Cal.3235: 28,800 BPH, distinctive double-click pattern",
      verdict:"LIKELY REPLICA",detail:"Beat rate of 21,600 BPH is consistent with Chinese clone movements commonly found in mid-tier replica Submariners. Genuine Rolex 3235 operates at 28,800 BPH with a distinctly smoother sweep."
    })},5000)
  }

  const analyseThread = ()=>{ setThreadResult(null)
    setTimeout(()=>{ setThreadResult({
      density:"142 threads/inch (warp) × 96 threads/inch (weft)",totalCount:"238 threads per square inch",
      genuine_ref:"Genuine Louis Vuitton Monogram Canvas: ~230-250 threads/inch",
      embroidery_precision:"94.2% alignment accuracy",color_peaks:"5 distinct colour values detected — matches genuine palette",
      verdict:"LIKELY GENUINE",detail:"Thread density of 238/inch falls within the expected range for genuine LV canvas. Colour value distribution shows the correct warm undertone. Embroidery precision at 94.2% is above the 90% threshold we see in authentic pieces."
    })},3000)
  }

  return (
    <div className="fade">
      <div style={{padding:"32px 0 20px"}}>
        <Label c={C.gold}>Advanced Authentication Tools</Label>
        <h2 style={{fontFamily:"var(--d)",fontSize:28,fontWeight:500}}>Sound Identifier & Thread Counter</h2>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <button className="btn" onClick={()=>setActiveT("sound")} style={{background:activeT==="sound"?C.goldBg:C.white,border:`1px solid ${activeT==="sound"?C.gold+"50":C.border}`,borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:activeT==="sound"?600:400,color:activeT==="sound"?C.gold:C.textMid}}>🎵 Watch Sound Identifier</button>
        <button className="btn" onClick={()=>setActiveT("thread")} style={{background:activeT==="thread"?C.goldBg:C.white,border:`1px solid ${activeT==="thread"?C.gold+"50":C.border}`,borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:activeT==="thread"?600:400,color:activeT==="thread"?C.gold:C.textMid}}>🔬 Fabric Thread Counter</button>
      </div>

      {activeT==="sound" && (
        <div className="card" style={{maxWidth:600}}>
          <h3 style={{fontFamily:"var(--d)",fontSize:22,marginBottom:4}}>Watch Movement Sound Analyser</h3>
          <p style={{fontSize:13,color:C.textMid,marginBottom:20}}>Hold your phone mic next to the watch. We analyse the ticking pattern, beat rate, and acoustic signature to compare against genuine movement profiles.</p>
          <div style={{background:C.bg2,borderRadius:12,padding:32,textAlign:"center",marginBottom:16}}>
            {!recording && !soundResult && (
              <><div style={{fontSize:48,marginBottom:12}}>🎙</div>
              <button className="btn btn-gold" onClick={startRecord}>Start Recording (5 seconds)</button>
              <p style={{fontSize:11,color:C.textLight,marginTop:8}}>Place phone mic against the caseback for best results</p></>
            )}
            {recording && (
              <><div style={{fontSize:48,marginBottom:12}}>🔴</div>
              <div style={{fontFamily:"var(--d)",fontSize:32,color:C.red,marginBottom:4}}>{seconds}s / 5s</div>
              <div style={{width:"100%",height:6,background:C.bg3,borderRadius:3,overflow:"hidden"}}><div style={{width:`${seconds*20}%`,height:"100%",background:C.red,borderRadius:3,transition:"width 1s"}}></div></div>
              <p style={{fontSize:12,color:C.textMid,marginTop:8}} className="pulse">Recording movement sounds...</p></>
            )}
            {soundResult && (
              <div style={{textAlign:"left"}}>
                <div className="tag" style={{background:C.redBg,color:C.red,marginBottom:12}}>{soundResult.verdict}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Detected Movement:</strong> {soundResult.movement}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Beat Rate:</strong> {soundResult.bph}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Genuine Signature:</strong> {soundResult.genuine_sig}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Confidence:</strong> {soundResult.confidence}%</div>
                <div style={{background:C.bg,padding:12,borderRadius:8,fontSize:13,color:C.textMid,lineHeight:1.6,marginTop:8}}>{soundResult.detail}</div>
                <button className="btn btn-out" style={{marginTop:12}} onClick={()=>{setSoundResult(null);setSeconds(0)}}>Record Again</button>
              </div>
            )}
          </div>
          <div style={{background:C.blueBg,borderRadius:8,padding:12}}>
            <div style={{fontSize:10,fontWeight:700,color:C.blue}}>HOW IT WORKS</div>
            <div style={{fontSize:12,color:C.textMid,marginTop:4}}>Mechanical watches tick at specific frequencies measured in beats per hour (BPH). Genuine Rolex runs at 28,800 BPH. Most replica movements use cheaper calibres running at 21,600 BPH. We detect this difference through audio frequency analysis.</div>
          </div>
        </div>
      )}

      {activeT==="thread" && (
        <div className="card" style={{maxWidth:600}}>
          <h3 style={{fontFamily:"var(--d)",fontSize:22,marginBottom:4}}>Fabric Thread Density Analyser</h3>
          <p style={{fontSize:13,color:C.textMid,marginBottom:20}}>Upload a close-up photo of fabric, canvas, or embroidery. We count thread density per inch, analyse colour value peaks, and compare against genuine reference samples.</p>
          <div style={{background:C.bg2,borderRadius:12,padding:32,textAlign:"center",marginBottom:16}}>
            {!threadResult && (
              <><div style={{fontSize:48,marginBottom:12}}>🔬</div>
              <button className="btn btn-gold" onClick={analyseThread}>Upload Fabric Close-Up</button>
              <p style={{fontSize:11,color:C.textLight,marginTop:8}}>Best results: macro photo, 5cm from fabric, good lighting</p></>
            )}
            {threadResult && (
              <div style={{textAlign:"left"}}>
                <div className="tag" style={{background:C.greenBg,color:C.green,marginBottom:12}}>{threadResult.verdict}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Thread Density:</strong> {threadResult.density}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Total Count:</strong> {threadResult.totalCount}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Genuine Reference:</strong> {threadResult.genuine_ref}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Embroidery Precision:</strong> {threadResult.embroidery_precision}</div>
                <div style={{fontSize:13,marginBottom:8}}><strong>Colour Analysis:</strong> {threadResult.color_peaks}</div>
                <div style={{background:C.bg,padding:12,borderRadius:8,fontSize:13,color:C.textMid,lineHeight:1.6,marginTop:8}}>{threadResult.detail}</div>
                <button className="btn btn-out" style={{marginTop:12}} onClick={()=>setThreadResult(null)}>Analyse Another</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TOKEN PAGE ──────────────────────────────────────────────
function TokenPage() {
  return (
    <div className="fade">
      <div style={{textAlign:"center",padding:"48px 0 28px"}}>
        <Label c={C.gold}>Solana SPL Token · Unlimited Supply · You Own The Majority</Label>
        <h2 style={{fontFamily:"var(--d)",fontSize:"clamp(36px,7vw,56px)",fontWeight:500}}><em style={{fontStyle:"italic",color:C.gold}}>$REPCHK</em></h2>
        <p style={{fontSize:15,color:C.textMid,maxWidth:480,margin:"8px auto 0",lineHeight:1.7}}>Pay for checks, earn from the community. No fixed supply — tokens are minted as rewards and burned on use.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
        <div className="card" style={{borderLeft:`3px solid ${C.gold}`}}>
          <Label>Spend $REPCHK</Label>
          {[{c:"1",l:"Standard Check",d:"Full report"},{c:"3",l:"Community Verify",d:"+expert review"},{c:"5",l:"Priority",d:"+3 experts in 1hr"}].map(i=>
            <div key={i.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.bg2}`}}>
              <div><div style={{fontSize:13,fontWeight:600}}>{i.l}</div><div style={{fontSize:11,color:C.textLight}}>{i.d}</div></div>
              <div style={{fontFamily:"var(--d)",fontSize:22,color:C.gold}}>{i.c}</div>
            </div>
          )}
        </div>
        <div className="card" style={{borderLeft:`3px solid ${C.green}`}}>
          <Label c={C.green}>Earn $REPCHK For Free</Label>
          {[{e:"+2",l:"Correct authentication"},{e:"+1",l:"5-streak bonus"},{e:"+0.5",l:"10+ upvote milestone"},{e:"+0.1",l:"Per forum upvote"}].map(i=>
            <div key={i.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.bg2}`}}>
              <div style={{fontSize:13}}>{i.l}</div>
              <div style={{fontFamily:"var(--d)",fontSize:22,color:C.green}}>{i.e}</div>
            </div>
          )}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:24}}>
        {[{l:"Network",v:"Solana"},{l:"Standard",v:"SPL Token"},{l:"Supply",v:"Unlimited (Mint)"},{l:"Price",v:"~$0.37"},{l:"50% Sub Discount",v:"Yes"},{l:"Earn Free",v:"Forum Upvotes"}].map(i=>
          <div key={i.l} className="card" style={{padding:16,textAlign:"center"}}><div style={{fontSize:10,color:C.textLight,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase"}}>{i.l}</div><div style={{fontFamily:"var(--d)",fontSize:18,color:C.text,marginTop:4}}>{i.v}</div></div>
        )}
      </div>
      <div className="card" style={{background:C.goldBg,border:`1px solid ${C.gold}30`}}>
        <Label c={C.gold}>Cheapest Way To Launch — Pump.fun on Solana</Label>
        <p style={{fontSize:13,color:C.textMid,lineHeight:1.7}}>Create your token on <strong>pump.fun</strong> for ~0.01 SOL (about £1.50). Keep mint authority so you can create more tokens as rewards. The bonding curve handles liquidity automatically. Total launch cost: under £5.</p>
      </div>
    </div>
  )
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────
function AdminPage() {
  const d = ADMIN_DATA
  return (
    <div className="fade">
      <div style={{padding:"32px 0 20px"}}><Label c={C.red}>Admin Dashboard — Private</Label><h2 style={{fontFamily:"var(--d)",fontSize:28,fontWeight:500}}>RepCheck.one Analytics</h2></div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        <StatBox value={d.visitors.today.toLocaleString()} label="Visitors Today" trend={d.visitors.trend} color={C.blue}/>
        <StatBox value={d.uploads.today} label="Uploads Today" trend={d.uploads.trend} color={C.green}/>
        <StatBox value={(d.subs.free+d.subs.pro+d.subs.elite).toLocaleString()} label="Total Subscribers" trend={d.subs.trend} color={C.purple}/>
        <StatBox value="$0.37" label="$REPCHK Price" trend="+4.2%" color={C.gold}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div className="card">
          <Label>Revenue Breakdown</Label>
          {Object.entries(d.revenue).map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.bg2}`}}>
              <span style={{fontSize:13,textTransform:"capitalize"}}>{k}</span>
              <span style={{fontFamily:"var(--d)",fontSize:16,fontWeight:500,color:C.gold}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",marginTop:4}}>
            <span style={{fontSize:14,fontWeight:700}}>Total Monthly</span>
            <span style={{fontFamily:"var(--d)",fontSize:20,fontWeight:600,color:C.green}}>£2,050</span>
          </div>
        </div>
        <div className="card">
          <Label>User Statistics</Label>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bg2}`}}>
            <span style={{fontSize:13}}>Total Users</span>
            <span style={{fontFamily:"var(--d)",fontSize:14,color:C.gold,minWidth:50,textAlign:"right"}}>{d.subs.free.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div className="card">
          <Label>Top Searched Items</Label>
          {d.topSearches.map((s,i)=>(
            <div key={s.item} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.bg2}`}}>
              <span style={{fontSize:12}}><strong style={{color:C.gold,marginRight:6}}>#{i+1}</strong>{s.item}</span>
              <span style={{fontSize:12,color:C.textLight}}>{s.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <Label>Recent Uploads (Live)</Label>
          {d.recentUploads.map((u,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.bg2}`}}>
              <div><span style={{fontSize:10,color:C.textLight,marginRight:6}}>{u.time}</span><span style={{fontSize:12}}>{CAT_I[u.cat]} {u.item}</span></div>
              <span className="tag" style={{background:u.result==="Genuine"?C.greenBg:u.result==="Replica"?C.redBg:`${C.gold}15`,color:u.result==="Genuine"?C.green:u.result==="Replica"?C.red:C.gold,fontSize:9}}>{u.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── GUIDES PAGE ─────────────────────────────────────────────
function GuidesPage() {
  const [open, setOpen] = useState(0)
  const guides = [
    { t: "🎯 Setting Up Google AdSense (Explained Like You're 5)", content: `
**What is it?** Google shows adverts on your website. When people see or click them, Google pays you money into your bank account.

**Step 1:** Go to adsense.google.com and click "Get Started"
**Step 2:** Sign in with your Google account (the one you use for Gmail)
**Step 3:** Type in your website address: repcheck.one
**Step 4:** Fill in your name, address, and phone number
**Step 5:** Google gives you a small bit of code — paste it into your website's <head> tag (I've already added the placeholder in layout.jsx)
**Step 6:** Wait 1-14 days for Google to check your site
**Step 7:** Once approved, ads start showing automatically. Google pays you every month when you reach £60

**How much will I earn?** With authentication/luxury content, expect £2-8 per 1,000 visitors. At 10,000 daily visitors = roughly £600-2,400/month from ads alone.

**Top tip:** The ad slots labelled "Google AdSense" throughout RepCheck.one are already positioned in the highest-earning spots. You just need to replace the placeholder <div> with the actual AdSense code Google gives you.`},
    { t: "💰 Setting Up Affiliate Links (Get Paid When People Buy)", content: `
**What is it?** You put special links on your website. When someone clicks and buys something, the shop pays you a percentage.

**Best programs for RepCheck.one (UK-friendly):**

• **StockX** (sneakers, watches, streetwear) — 1-4% commission, sign up at Impact.com
• **Farfetch** (designer fashion) — 5-11% commission, email affiliates@farfetch.com or join via Partnerize
• **Chrono24** (luxury watches) — 3-6%, sign up at their affiliate page
• **SSENSE** (contemporary luxury) — 5-7.5%, join via Skimlinks
• **Vestiaire Collective** (pre-owned luxury) — 5-8%, join via AWIN
• **eBay Partner Network** — 1-4%, sign up at partnernetwork.ebay.co.uk

**Easiest way:** Sign up for **Skimlinks** (skimlinks.com). They automatically turn ANY product link on your site into an affiliate link. One signup, 48,000+ retailers. They pay you via PayPal or bank transfer.

**How I've integrated this:** The "Buy From Trusted Partners" section on the homepage has slots for each affiliate. Replace the placeholder links with your unique affiliate URLs.`},
    { t: "📱 Building iPhone & Android Apps (Explained Like You're 5)", content: `
**The easy way: Turn your website into an app using a "wrapper"**

This means your website (repcheck.one) loads inside an app that looks and feels native. Users download it from the App Store / Google Play.

**Option 1: PWA (Free — No App Store)**
Your website already works as a "Progressive Web App". Users can "Add to Home Screen" and it looks like a real app. Cost: £0.

**Option 2: Capacitor / Ionic (Cheapest real apps)**
1. Install Node.js on your computer
2. Run: npx cap init RepCheck one.repcheck.app
3. Run: npx cap add ios && npx cap add android
4. This wraps your Next.js website in native containers
5. Open in Xcode (Mac) for iOS or Android Studio for Android
6. Publish to stores

**Costs:**
• Apple Developer account: £79/year (required for App Store)
• Google Play account: £20 one-time (required for Play Store)
• Total: ~£99 first year, £79/year after

**Option 3: Pay someone on Fiverr (Easiest)**
Search "convert website to app" on Fiverr. Costs £50-150. They handle everything and give you the store-ready files.

**My recommendation:** Start with PWA (free), then wrap with Capacitor when you have budget. The website is already mobile-responsive.`},
  ]

  return (
    <div className="fade">
      <div style={{padding:"32px 0 20px"}}><Label c={C.gold}>Setup Guides</Label><h2 style={{fontFamily:"var(--d)",fontSize:28,fontWeight:500}}>Everything Explained Simply</h2></div>
      {guides.map((g,i)=>(
        <div key={i} className="card" style={{marginBottom:8,cursor:"pointer",background:open===i?C.white:C.bg}} onClick={()=>setOpen(open===i?-1:i)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h3 style={{fontSize:16,fontWeight:600}}>{g.t}</h3>
            <span style={{fontSize:18,color:C.textLight,transform:open===i?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
          </div>
          {open===i && (
            <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${C.border}`,fontSize:13,color:C.textMid,lineHeight:1.8,whiteSpace:"pre-line"}}>
              {g.content.split(/\*\*(.*?)\*\*/g).map((part, j) => 
                j % 2 === 1 ? <strong key={j} style={{color:C.text}}>{part}</strong> : <span key={j}>{part}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── PRIVACY POLICY PAGE ─────────────────────────────────────
function PrivacyPage() {
  return (
    <div className="fade" style={{padding:"32px 0"}}>
      <Label c={C.gold}>Legal</Label>
      <h1 style={{fontFamily:"var(--d)",fontSize:32,fontWeight:500,marginBottom:24}}>Privacy Policy</h1>
      <div className="card" style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>
        <p style={{marginBottom:16}}><strong style={{color:C.text}}>Last Updated:</strong> January 2025</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>1. Introduction</h3>
        <p style={{marginBottom:16}}>RepCheck.one ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our luxury goods authentication service.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>2. Information We Collect</h3>
        <p style={{marginBottom:8}}>We may collect the following types of information:</p>
        <ul style={{marginLeft:24,marginBottom:16}}>
          <li>Images you upload for authentication purposes</li>
          <li>Device information and browser type</li>
          <li>IP address and approximate location</li>
          <li>Usage data and interaction with our service</li>
          <li>Email address if you contact us or create an account</li>
        </ul>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>3. How We Use Your Information</h3>
        <p style={{marginBottom:8}}>We use collected information to:</p>
        <ul style={{marginLeft:24,marginBottom:16}}>
          <li>Provide authentication analysis on uploaded images</li>
          <li>Improve our authentication algorithms and database</li>
          <li>Communicate with you about our services</li>
          <li>Display relevant advertisements through Google AdSense</li>
          <li>Analyse website traffic and user behavior</li>
        </ul>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>4. Third-Party Services</h3>
        <p style={{marginBottom:16}}>We use third-party services including Google AdSense for advertising and Google Analytics for website analytics. These services may use cookies to collect information. Please refer to Google's Privacy Policy for more details.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>5. Cookies</h3>
        <p style={{marginBottom:16}}>We use cookies to improve your experience on our site. These include essential cookies for site functionality and analytics/advertising cookies from third parties. You can control cookie preferences in your browser settings.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>6. Data Security</h3>
        <p style={{marginBottom:16}}>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>7. Your Rights</h3>
        <p style={{marginBottom:16}}>Under GDPR and UK data protection laws, you have the right to access, correct, delete, or export your personal data. Contact us at privacy@repcheck.one to exercise these rights.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>8. Contact Us</h3>
        <p>For privacy-related inquiries, email us at: <strong style={{color:C.gold}}>hello@repcheck.one</strong></p>
      </div>
    </div>
  )
}

// ─── TERMS OF SERVICE PAGE ───────────────────────────────────
function TermsPage() {
  return (
    <div className="fade" style={{padding:"32px 0"}}>
      <Label c={C.gold}>Legal</Label>
      <h1 style={{fontFamily:"var(--d)",fontSize:32,fontWeight:500,marginBottom:24}}>Terms of Service</h1>
      <div className="card" style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>
        <p style={{marginBottom:16}}><strong style={{color:C.text}}>Last Updated:</strong> January 2025</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>1. Acceptance of Terms</h3>
        <p style={{marginBottom:16}}>By accessing or using RepCheck.one, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>2. Service Description</h3>
        <p style={{marginBottom:16}}>RepCheck.one provides an authentication analysis service for luxury goods. Our service uses image analysis and database comparison to provide opinions on the authenticity of items. <strong style={{color:C.red}}>Our assessments are opinions only and should not be considered definitive authentication.</strong></p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>3. Disclaimer of Warranties</h3>
        <p style={{marginBottom:16}}>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee the accuracy of our authentication opinions. RepCheck.one is not responsible for any financial loss or damage resulting from reliance on our assessments. Always seek professional authentication for high-value purchases.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>4. Limitation of Liability</h3>
        <p style={{marginBottom:16}}>RepCheck.one shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our maximum liability is limited to the amount you paid for our services (if any).</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>5. Intellectual Property</h3>
        <p style={{marginBottom:16}}>All content on RepCheck.one, including text, graphics, logos, and software, is our property or licensed to us. Brand names mentioned on this site are trademarks of their respective owners. RepCheck.one is not affiliated with, endorsed by, or sponsored by any brand mentioned.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>6. User Content</h3>
        <p style={{marginBottom:16}}>By uploading images to our service, you grant us a non-exclusive license to use, process, and analyse those images for authentication purposes and service improvement. You retain ownership of your images.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>7. Prohibited Uses</h3>
        <p style={{marginBottom:8}}>You agree not to:</p>
        <ul style={{marginLeft:24,marginBottom:16}}>
          <li>Use the service for any illegal purpose</li>
          <li>Upload malicious content or attempt to compromise our systems</li>
          <li>Misrepresent our authentication opinions as official brand verification</li>
          <li>Scrape or harvest data from our service</li>
        </ul>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>8. Governing Law</h3>
        <p style={{marginBottom:16}}>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>9. Changes to Terms</h3>
        <p style={{marginBottom:16}}>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        
        <h3 style={{color:C.text,marginTop:24,marginBottom:8}}>10. Contact</h3>
        <p>For questions about these terms, email: <strong style={{color:C.gold}}>hello@repcheck.one</strong></p>
      </div>
    </div>
  )
}

// ─── ABOUT PAGE ──────────────────────────────────────────────
function AboutPage() {
  return (
    <div className="fade" style={{padding:"32px 0"}}>
      <Label c={C.gold}>About</Label>
      <h1 style={{fontFamily:"var(--d)",fontSize:32,fontWeight:500,marginBottom:24}}>About RepCheck.one</h1>
      
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Our Mission</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>RepCheck.one was created to help consumers make informed decisions when purchasing luxury goods. In a market where counterfeit items are increasingly sophisticated, we provide accessible authentication tools and knowledge to protect buyers from fraud.</p>
      </div>
      
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>What We Do</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid,marginBottom:12}}>We've built a comprehensive database of authentication markers, manufacturing details, and known counterfeit tells across hundreds of luxury brands. Our service analyses uploaded images against this database to provide detailed authentication opinions.</p>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid}}><strong style={{color:C.text}}>Important:</strong> Our assessments are informational opinions, not official brand authentication. For high-value purchases, we always recommend seeking professional authentication services.</p>
      </div>
      
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Our Data Sources</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>Our authentication database is compiled from publicly available information including authentication forums, expert guides, official brand documentation, and community contributions. We continuously update our database as new information becomes available.</p>
      </div>
      
      <div className="card">
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Independent Service</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>RepCheck.one is an independent authentication service. We are not affiliated with, endorsed by, or sponsored by any luxury brand mentioned on this website. All brand names, logos, and trademarks are the property of their respective owners and are used solely for identification purposes.</p>
      </div>
    </div>
  )
}

// ─── CONTACT PAGE ────────────────────────────────────────────
function ContactPage() {
  return (
    <div className="fade" style={{padding:"32px 0"}}>
      <Label c={C.gold}>Get In Touch</Label>
      <h1 style={{fontFamily:"var(--d)",fontSize:32,fontWeight:500,marginBottom:24}}>Contact Us</h1>
      
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>📧 Contact</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid,marginBottom:8}}>For all enquiries including general questions, support, privacy concerns, partnerships, and feedback:</p>
        <p style={{fontSize:20,fontWeight:600,color:C.gold}}>hello@repcheck.one</p>
      </div>
      
      <div className="card" style={{marginTop:16}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Response Times</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>We aim to respond to all enquiries within 2-3 business days. For urgent matters, please include "URGENT" in your email subject line.</p>
      </div>
      
      <div className="card" style={{marginTop:16,background:C.goldBg,border:`1px solid ${C.gold}30`}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:12}}>🏢 Business Address</h3>
        <p style={{fontSize:14,lineHeight:1.8,color:C.textMid}}>
          RepCheck.one<br/>
          United Kingdom<br/><br/>
          <em style={{fontSize:12,color:C.textLight}}>Registered in England & Wales</em>
        </p>
      </div>
    </div>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────
function Footer({setPage}) {
  return (
    <footer style={{borderTop:`1px solid ${C.border}`,marginTop:40,padding:"28px 0 40px"}}>
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
        <div>
          <div style={{fontFamily:"var(--d)",fontSize:18,fontWeight:500,marginBottom:6}}>Rep<em style={{fontStyle:"italic",color:C.gold}}>Check</em><span style={{color:C.textDim}}>.one</span></div>
          <div style={{fontSize:11,color:C.textLight,lineHeight:1.7,maxWidth:240}}>The authentication standard for luxury goods. Trusted by collectors, dealers and enthusiasts worldwide since 2025.</div>
        </div>
        <div style={{display:"flex",gap:32}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.textLight,marginBottom:8}}>Product</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.home)}>Authenticate</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.tools)}>Tools</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.guides)}>Guides</div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.textLight,marginBottom:8}}>Company</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.about)}>About Us</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.contact)}>Contact</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.privacy)}>Privacy Policy</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4,cursor:"pointer"}} onClick={()=>setPage(P.terms)}>Terms of Service</div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.textLight,marginBottom:8}}>Connect</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4}}>Twitter / X</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4}}>Discord</div>
            <div style={{fontSize:12,color:C.textMid,marginBottom:4}}>Instagram</div>
          </div>
        </div>
      </div>
      <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`,fontSize:10,color:C.textDim,textAlign:"center"}}>
        © 2025 RepCheck.one · All rights reserved · RepCheck is an independent authentication service and is not affiliated with, endorsed by, or sponsored by any brand mentioned on this site. All brand names and trademarks are the property of their respective owners.
      </div>
    </footer>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────
function RepCheckOne() {
  const [page, setPage] = useState(P.home)
  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <style>{globalCSS}</style>
      <div style={{maxWidth:920,margin:"0 auto",padding:"0 20px"}}>
        <Nav page={page} setPage={setPage}/>
        {page===P.home && <HomePage setPage={setPage}/>}
        {page===P.tools && <ToolsPage/>}
        {page===P.admin && <AdminPage/>}
        {page===P.guides && <GuidesPage/>}
        {page===P.privacy && <PrivacyPage/>}
        {page===P.terms && <TermsPage/>}
        {page===P.about && <AboutPage/>}
        {page===P.contact && <ContactPage/>}
        <Footer setPage={setPage}/>
      </div>
    </div>
  )
}

// Default export for Next.js App Router
export default function Home() {
  return <RepCheckOne />
}
