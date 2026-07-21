export const OUTREACH_INDUSTRIES = [
  "construction",
  "real estate",
  "energy & solar",
  "oil & gas",
  "agriculture",
  "food & beverage",
  "healthcare & pharma",
  "finance & fintech",
  "insurance",
  "legal",
  "logistics & transport",
  "manufacturing",
  "mining",
  "technology & ICT",
  "telecom",
  "education",
  "hospitality & tourism",
  "retail & ecommerce",
  "media & marketing",
  "automotive",
  "aviation",
  "maritime",
  "engineering",
  "security",
  "environmental",
  "non-profit",
  "professional services",
  "unclassified",
] as const;

const KEYWORD_MAP: [string, string[]][] = [
  ["construction", ["construct", "build", "builder", "contractor", "cement", "concrete", "roofing", "roof", "scaffold", "civil", "masonry", "renovat", "remodel", "drywall", "plumb", "painting", "painter", "flooring", "tiling", "tiles", "carpentry", "carpenter", "joinery", "glazing", "paving", "excavat", "demolition", "insulation", "fencing", "decking", "landscap", "kitchens", "bathrooms", "extension", "basement", "foundation", "brick", "stone", "granite", "marble", "gutter", "siding", "windows", "doors", "garage", "handyman", "restoration", "waterproof", "plaster", "screed", "aggregate", "quantity", "surveyor", "architect"]],
  ["real estate", ["realestate", "realty", "realtor", "property", "properties", "estate", "housing", "homes", "home", "house", "apartment", "land", "lettings", "rental", "rentals", "lease", "mortgage", "broker", "residence", "residential", "villas", "condo", "duplex", "acres", "plots", "developer", "development"]],
  ["energy & solar", ["solar", "energy", "power", "renewab", "electric", "inverter", "battery", "batteries", "grid", "wind", "hydro", "geothermal", "photovoltaic", "panel", "turbine", "generator", "volt", "watt", "utility", "utilities", "charging", "biomass", "biogas"]],
  ["oil & gas", ["oil", "gas", "petrol", "petroleum", "lpg", "lng", "diesel", "fuel", "refinery", "drilling", "rig", "pipeline", "upstream", "downstream", "lubricant", "kerosene", "bunker", "exploration"]],
  ["agriculture", ["agro", "agri", "farm", "farms", "farming", "farmer", "poultry", "fish", "fishery", "aqua", "crop", "crops", "seed", "seeds", "livestock", "harvest", "dairy", "cattle", "ranch", "orchard", "greenhouse", "irrigation", "fertilizer", "grain", "maize", "cassava", "cocoa", "palm", "rice", "vegetable", "organic", "agric", "hatchery", "feed", "veterinar", "apiary", "honey", "garden", "nursery", "horticulture"]],
  ["food & beverage", ["food", "foods", "beverage", "brewery", "brewing", "restaurant", "catering", "caterer", "bakery", "baker", "kitchen", "drink", "drinks", "snack", "cafe", "coffee", "tea", "pizza", "burger", "grill", "chef", "cuisine", "eatery", "juice", "winery", "wine", "distillery", "chocolat", "confection", "dining", "meal", "meals", "spice", "flavor", "flavour", "gourmet", "bistro", "pub", "bar", "lounge", "shawarma", "buka"]],
  ["healthcare & pharma", ["health", "medic", "medical", "pharma", "pharmacy", "clinic", "hospital", "dental", "dentist", "care", "diagnostic", "lab", "labs", "doctor", "nurse", "nursing", "surgery", "surgical", "therapy", "therapist", "physio", "wellness", "optic", "optical", "vision", "eye", "skin", "derma", "fertility", "maternity", "ambulance", "vaccine", "biotech", "rehab", "psychiatr", "psycholog", "counsel", "chiro", "ortho", "cardio", "pediatr", "oncolog", "radiolog"]],
  ["finance & fintech", ["bank", "banking", "finance", "financial", "fintech", "capital", "invest", "investment", "loan", "loans", "credit", "pay", "payment", "wallet", "fund", "funds", "funding", "wealth", "money", "cash", "forex", "trading", "trader", "stock", "equity", "asset", "pension", "savings", "micro", "lending", "lender", "remit", "crypto", "bitcoin", "blockchain", "accounting", "accountant", "audit", "tax", "bookkeep", "payroll", "treasury", "mutual"]],
  ["insurance", ["insur", "assurance", "underwrit", "actuar", "indemnity", "coverage", "claims", "policy", "reinsurance", "takaful"]],
  ["legal", ["law", "laws", "lawyer", "legal", "attorney", "solicitor", "barrister", "chambers", "advocate", "notary", "litigation", "paralegal", "juris", "counsel", "llp", "conveyanc"]],
  ["logistics & transport", ["logistic", "shipping", "freight", "cargo", "courier", "delivery", "deliver", "haulage", "transport", "trucking", "truck", "clearing", "forwarding", "forwarder", "express", "parcel", "dispatch", "movers", "moving", "relocation", "warehouse", "warehousing", "storage", "supplychain", "fleet", "transit", "rail", "bus", "taxi", "ride", "customs"]],
  ["manufacturing", ["manufactur", "factory", "industrial", "industries", "plant", "production", "fabricat", "packaging", "plastic", "plastics", "steel", "textile", "garment", "apparel", "furniture", "foam", "paper", "pulp", "chemical", "chemicals", "paint", "paints", "glass", "ceramic", "aluminium", "aluminum", "metal", "metals", "foundry", "mould", "mold", "machining", "assembly", "processing", "mill", "mills", "printing", "extrusion", "polymer", "rubber", "leather", "footwear", "cosmetic", "soap", "detergent", "toiletries"]],
  ["mining", ["mining", "mineral", "minerals", "quarry", "quarries", "gold", "lithium", "ore", "coal", "gemstone", "diamond", "tin", "zinc", "cobalt", "barite", "gypsum", "limestone", "excavation", "dredging", "geolog"]],
  ["technology & ICT", ["tech", "technology", "software", "digital", "apps", "cloud", "data", "cyber", "code", "coding", "webdesign", "webdev", "website", "hosting", "server", "devops", "ai", "smart", "robot", "automation", "analytics", "crm", "erp", "saas", "startup", "innovation", "computing", "computer", "laptop", "gadget", "iot", "api", "platform", "systems", "solutions", "informatics", "itservices", "consult"]],
  ["telecom", ["telecom", "telco", "mobile", "network", "networks", "broadband", "fiber", "fibre", "5g", "gsm", "sim", "wireless", "satellite", "isp", "voip", "connectivity", "antenna", "tower"]],
  ["education", ["school", "schools", "academy", "academies", "college", "university", "education", "educat", "learn", "learning", "training", "tutor", "tutoring", "edu", "course", "courses", "coaching", "montessori", "kindergarten", "nursery", "preschool", "institute", "campus", "exam", "scholar", "student", "teach", "classroom", "elearning", "bootcamp", "stem"]],
  ["hospitality & tourism", ["hotel", "hotels", "resort", "resorts", "travel", "tour", "tours", "tourism", "hospitality", "lodge", "lodging", "suites", "vacation", "holiday", "booking", "guesthouse", "hostel", "motel", "bnb", "airbnb", "safari", "cruise", "excursion", "getaway", "trip", "visa", "event", "events", "wedding", "party", "venue", "conference"]],
  ["retail & ecommerce", ["shop", "shopping", "store", "stores", "retail", "market", "mall", "commerce", "ecommerce", "buy", "sell", "trade", "trading", "mart", "boutique", "fashion", "clothing", "wear", "shoes", "bags", "jewelry", "jewellery", "accessories", "grocery", "supermarket", "wholesale", "distributor", "supplies", "supplier", "merchandise", "outlet", "deals", "discount", "gift", "gifts", "toys", "beauty", "salon", "spa", "barber", "perfume", "watches", "phones", "electronics"]],
  ["media & marketing", ["media", "marketing", "advert", "advertising", "brand", "branding", "studio", "design", "designs", "creative", "agency", "print", "printing", "press", "tv", "radio", "film", "films", "video", "photo", "photography", "graphics", "animation", "production", "entertainment", "music", "records", "podcast", "blog", "news", "magazine", "publisher", "publishing", "seo", "socialmedia", "influencer", "pr", "communications", "content", "campaign", "billboard", "signage"]],
  ["automotive", ["auto", "autos", "motor", "motors", "car", "cars", "vehicle", "vehicles", "mechanic", "tyre", "tyres", "tire", "tires", "spare", "spares", "garage", "dealership", "dealer", "automobile", "towing", "detailing", "bodyshop", "autoparts", "motorcycle", "bike", "scooter", "drive", "driving", "rentacar", "carhire"]],
  ["aviation", ["aviation", "airline", "airlines", "airways", "flight", "flights", "aero", "airport", "aircraft", "charter", "pilot", "drone", "helicopter", "hangar", "aerospace"]],
  ["maritime", ["maritime", "marine", "vessel", "vessels", "port", "ports", "shipyard", "naval", "offshore", "boat", "boats", "yacht", "dock", "stevedor", "seafarer", "tug", "barge", "anchor"]],
  ["engineering", ["engineer", "engineers", "engineering", "mechanical", "electrical", "hvac", "welding", "welder", "technical", "automation", "instrumentation", "calibration", "machinery", "machines", "equipment", "tools", "pumps", "valves", "bearings", "hydraulic", "pneumatic", "crane", "forklift", "borehole", "geotech"]],
  ["security", ["security", "secure", "guard", "guards", "surveillance", "cctv", "alarm", "alarms", "safety", "protection", "protect", "defence", "defense", "escort", "patrol", "locksmith", "tracking", "tracker"]],
  ["environmental", ["environment", "environmental", "waste", "recycl", "water", "sanitation", "green", "eco", "cleaning", "cleaner", "cleaners", "fumigation", "pest", "sewage", "drainage", "borehole", "climate", "carbon", "sustainab", "conservation", "forestry", "tree", "landfill", "compost"]],
];

const GENERIC_TOKENS = new Set([
  "the", "and", "for", "group", "global", "international", "world", "best", "top",
  "pro", "plus", "one", "first", "prime", "elite", "royal", "star", "gold", "new",
  "my", "your", "our", "get", "go", "hub", "zone", "spot", "point", "place",
  "online", "official", "nigeria", "naija", "lagos", "abuja", "africa", "usa", "uk",
  "ltd", "llc", "inc", "co", "company", "enterprises", "ventures", "services",
  "service", "limited", "solutions", "concepts", "resources", "holdings",
]);

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/;

export function normalizeDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  if (!d) return null;
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
  if (d.length > 253 || !DOMAIN_RE.test(d)) return null;
  return d;
}

export function classifyDomain(domain: string): string {
  const name = domain.split(".")[0];
  const parts = name.split("-").filter((p) => !GENERIC_TOKENS.has(p));
  const hay = parts.join("-");
  let best = "unclassified";
  let bestScore = 0;
  for (const [industry, keywords] of KEYWORD_MAP) {
    let score = 0;
    for (const k of keywords) {
      if (k.length >= 4) {
        if (hay.includes(k)) score += k.length;
      } else if (parts.includes(k)) {
        score += k.length + 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = industry;
    }
  }
  return best;
}

const AI_BATCH_SIZE = 80;

export async function classifyDomainsWithAI(
  domains: string[]
): Promise<{ results: Map<string, string>; attempted: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const result = new Map<string, string>();
  const attempted: string[] = [];
  if (!apiKey || domains.length === 0) return { results: result, attempted };
  const industries = OUTREACH_INDUSTRIES.filter((i) => i !== "unclassified");
  for (let i = 0; i < domains.length; i += AI_BATCH_SIZE) {
    const batch = domains.slice(i, i + AI_BATCH_SIZE);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert at recognizing companies from their website domains. Many are real companies you know from your training data — recall who they are. Allowed industries (use these labels EXACTLY): ${industries.join(", ")}. For each domain, if you recognize the company or can infer from words/abbreviations in any language, give that industry. Only respond "unclassified" if you genuinely have no idea. Respond with JSON: {"classifications": [{"domain": string, "industry": string}, ...]} covering every input domain.`,
            },
            { role: "user", content: batch.join("\n") },
          ],
          response_format: { type: "json_object" },
          temperature: 0,
        }),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;
      const parsed = JSON.parse(content) as {
        classifications?: { domain?: unknown; industry?: unknown }[];
      };
      attempted.push(...batch);
      const allowed = new Set<string>(OUTREACH_INDUSTRIES);
      for (const c of parsed.classifications || []) {
        if (
          typeof c.domain === "string" &&
          typeof c.industry === "string" &&
          allowed.has(c.industry) &&
          batch.includes(c.domain)
        ) {
          result.set(c.domain, c.industry);
        }
      }
    } catch {
      // skip failed batch; caller reports remaining
    }
  }
  return { results: result, attempted };
}

export function parseDomainList(
  text: string,
  forcedIndustry?: string
): { domain: string; industry: string }[] {
  const seen = new Set<string>();
  const out: { domain: string; industry: string }[] = [];
  for (const line of text.split(/\r?\n/)) {
    // CSV: take the first cell; TXT: whole line
    const cell = line.split(",")[0].replace(/^["']|["']$/g, "");
    const domain = normalizeDomain(cell);
    if (!domain || seen.has(domain)) continue;
    seen.add(domain);
    out.push({
      domain,
      industry: forcedIndustry || classifyDomain(domain),
    });
  }
  return out;
}
