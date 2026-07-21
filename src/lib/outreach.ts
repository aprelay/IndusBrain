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
  "unclassified",
] as const;

const KEYWORD_MAP: [string, string[]][] = [
  ["construction", ["construct", "build", "builder", "contractor", "cement", "concrete", "roofing", "scaffold", "civil", "masonry", "renovat"]],
  ["real estate", ["realestate", "realty", "property", "properties", "estate", "housing", "homes", "apartment", "land"]],
  ["energy & solar", ["solar", "energy", "power", "renewab", "electric", "inverter", "battery", "grid", "wind"]],
  ["oil & gas", ["oil", "gas", "petrol", "lpg", "lng", "diesel", "fuel", "refinery", "drilling"]],
  ["agriculture", ["agro", "agri", "farm", "poultry", "fish", "aqua", "crop", "seed", "livestock", "harvest"]],
  ["food & beverage", ["food", "beverage", "brewery", "restaurant", "catering", "bakery", "kitchen", "drink", "snack"]],
  ["healthcare & pharma", ["health", "medic", "pharma", "clinic", "hospital", "dental", "care", "diagnostic", "lab"]],
  ["finance & fintech", ["bank", "finance", "fintech", "capital", "invest", "loan", "credit", "pay", "wallet", "fund", "wealth"]],
  ["insurance", ["insur", "assurance", "underwrit", "actuar"]],
  ["legal", ["law", "legal", "attorney", "solicitor", "barrister", "chambers", "advocate"]],
  ["logistics & transport", ["logistic", "shipping", "freight", "cargo", "courier", "delivery", "haulage", "transport", "trucking", "clearing", "forward"]],
  ["manufacturing", ["manufactur", "factory", "industrial", "plant", "production", "fabricat", "packaging", "plastic", "steel", "textile"]],
  ["mining", ["mining", "mineral", "quarry", "granite", "gold", "lithium", "ore"]],
  ["technology & ICT", ["tech", "software", "digital", "app", "cloud", "data", "cyber", "code", "web", "dev", "it", "ai", "smart"]],
  ["telecom", ["telecom", "mobile", "network", "broadband", "fiber", "5g", "gsm", "sim"]],
  ["education", ["school", "academy", "college", "university", "education", "learn", "training", "tutor", "edu"]],
  ["hospitality & tourism", ["hotel", "resort", "travel", "tour", "hospitality", "lodge", "suites", "vacation"]],
  ["retail & ecommerce", ["shop", "store", "retail", "market", "mall", "commerce", "buy", "sell", "trade", "mart"]],
  ["media & marketing", ["media", "marketing", "advert", "brand", "studio", "design", "print", "press", "tv", "radio", "film"]],
  ["automotive", ["auto", "motor", "car", "vehicle", "mechanic", "tyre", "tire", "spare"]],
  ["aviation", ["aviation", "airline", "airways", "flight", "aero", "airport"]],
  ["maritime", ["maritime", "marine", "vessel", "port", "shipyard", "naval", "offshore"]],
  ["engineering", ["engineer", "mechanical", "electrical", "hvac", "welding", "technical"]],
  ["security", ["security", "guard", "surveillance", "cctv", "alarm", "safety"]],
  ["environmental", ["environment", "waste", "recycl", "water", "sanitation", "green", "eco"]],
];

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
  let best = "unclassified";
  let bestScore = 0;
  for (const [industry, keywords] of KEYWORD_MAP) {
    let score = 0;
    for (const k of keywords) {
      if (k.length >= 3 && name.includes(k)) score += k.length;
      else if (k.length < 3) {
        // short tokens must match a whole hyphen-separated part
        if (name.split("-").includes(k)) score += 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = industry;
    }
  }
  return best;
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
