import { IndustryTemplate, Phase, Regulator, Stakeholder } from "@/lib/types";

interface ExtraSpec {
  id: string;
  name: string;
  isicCode: string;
  keywords: string[];
  summary: string;
  regulators: Regulator[];
  risks: string[];
  paymentPoints: string[];
  specialists: {
    design: Stakeholder[];
    implementation: Stakeholder[];
    operations?: Stakeholder[];
  };
  approvalsDeliverables: string[];
  importHeavy?: boolean;
}

const VERIFIED = "2026-07";

function lawyer(scope: string): Stakeholder {
  return {
    role: "Commercial Lawyer",
    category: "Legal",
    responsibility: `Contract drafting/review, due diligence and regulatory advice for ${scope}.`,
    whenEngaged: "Before signing any contract",
    typicalCost: "Fixed fee or 0.5-2% of contract value",
  };
}

function importPhase(): Phase {
  return {
    name: "4. Procurement & Importation",
    description:
      "Equipment and inputs not manufactured locally are sourced, imported, cleared and delivered to site.",
    typicalDuration: "6-16 weeks",
    stakeholders: [
      {
        role: "Importer / Procurement Agent",
        category: "Procurement",
        responsibility: "Source equipment abroad, negotiate with OEMs, manage Form M and LC process.",
        whenEngaged: "After specifications are final",
        typicalCost: "2-5% of equipment value",
      },
      {
        role: "Licensed Clearing Agent",
        category: "Logistics",
        responsibility: "Customs clearance, PAAR processing, duty payment, SONCAP/NAFDAC clearance where applicable.",
        whenEngaged: "On shipment arrival",
        typicalCost: "Agency fees + statutory duties",
      },
      {
        role: "Freight Forwarder / Haulage",
        category: "Logistics",
        responsibility: "International shipping, port handling and inland haulage to site.",
        whenEngaged: "From factory dispatch to site delivery",
      },
    ],
    deliverables: ["Form M / PAAR", "Customs release", "Equipment delivered to site"],
  };
}

function buildTemplate(s: ExtraSpec): IndustryTemplate {
  const phases: Phase[] = [
    {
      name: "1. Legal & Feasibility",
      description:
        "Legal review, land/premises rights, company/permit checks and a feasibility study before any commitment.",
      typicalDuration: "2-8 weeks",
      stakeholders: [
        lawyer(s.name.toLowerCase()),
        {
          role: "Feasibility Consultant",
          category: "Advisory",
          responsibility: "Market study, demand analysis, technical and financial feasibility report.",
          whenEngaged: "At project inception",
        },
        {
          role: "Licensed Surveyor",
          category: "Engineering",
          responsibility: "Site/land survey, title verification support, layout mapping.",
          whenEngaged: "Before land or premises commitment",
        },
      ],
      deliverables: ["Feasibility report", "Executed contracts", "Land/premises rights confirmation"],
    },
    {
      name: "2. Financing & Insurance",
      description: "Funding is structured and risks are insured before major spending starts.",
      typicalDuration: "4-12 weeks",
      stakeholders: [
        {
          role: "Commercial Bank / DFI",
          category: "Finance",
          responsibility: "Term loans, working capital, LCs for imports (e.g. BOI, NEXIM, commercial banks).",
          whenEngaged: "After feasibility is bankable",
          typicalCost: "Interest + arrangement fees 1-2%",
        },
        {
          role: "Insurance Broker / Underwriter",
          category: "Insurance",
          responsibility: "Asset, construction-all-risk, marine cargo and liability cover.",
          whenEngaged: "Before construction/shipment",
          typicalCost: "0.3-1.5% of insured value per year",
        },
      ],
      deliverables: ["Approved facility / term sheet", "Insurance policies", "Financial model"],
    },
    {
      name: "3. Regulatory Approvals & Permits",
      description: "All licences, permits and registrations required to build and operate are obtained.",
      typicalDuration: "4-16 weeks",
      stakeholders: [
        {
          role: "Regulatory/Compliance Consultant",
          category: "Regulatory",
          responsibility: `Prepare and follow up licence applications with ${s.regulators
            .map((r) => r.name.split("(")[0].trim())
            .join(", ")}.`,
          whenEngaged: "Immediately after feasibility",
        },
        {
          role: "Environmental Consultant",
          category: "Regulatory",
          responsibility: "EIA/environmental audit where required; state environmental permits.",
          whenEngaged: "Before construction",
        },
      ],
      deliverables: s.approvalsDeliverables,
    },
    ...(s.importHeavy === false ? [] : [importPhase()]),
    {
      name: `${s.importHeavy === false ? "4" : "5"}. Design & Implementation`,
      description: "The facility/service is designed, built, installed and commissioned.",
      typicalDuration: "8-40 weeks",
      stakeholders: [...s.specialists.design, ...s.specialists.implementation],
      deliverables: ["Completed facility/installation", "Commissioning report", "As-built documentation"],
    },
    {
      name: `${s.importHeavy === false ? "5" : "6"}. Operations & Maintenance`,
      description: "Ongoing operations, maintenance, compliance renewals and reporting.",
      typicalDuration: "Ongoing",
      stakeholders: [
        ...(s.specialists.operations ?? []),
        {
          role: "O&M / Facility Manager",
          category: "Operations",
          responsibility: "Day-to-day operations, preventive maintenance, statutory renewals.",
          whenEngaged: "From commissioning",
          typicalCost: "1-3% of asset value per year",
        },
        {
          role: "Auditor / Tax Consultant",
          category: "Advisory",
          responsibility: "Annual audit, FIRS/state tax filings, regulatory returns.",
          whenEngaged: "Ongoing",
        },
      ],
      deliverables: ["Licence renewals", "Maintenance records", "Statutory filings"],
    },
  ];
  return {
    id: s.id,
    name: s.name,
    isicCode: s.isicCode,
    country: "Nigeria",
    keywords: s.keywords,
    summary: s.summary,
    phases,
    regulators: s.regulators,
    risks: s.risks,
    paymentPoints: s.paymentPoints,
  };
}

function reg(
  name: string,
  purpose: string,
  legalBasis: string,
  officialUrl: string,
  jurisdiction = "Federal (Nigeria)"
): Regulator {
  return { name, jurisdiction, purpose, legalBasis, officialUrl, lastVerified: VERIFIED };
}

const CAC = reg(
  "Corporate Affairs Commission (CAC)",
  "Company incorporation and corporate filings.",
  "Companies and Allied Matters Act 2020",
  "https://www.cac.gov.ng"
);
const FIRS = reg(
  "Federal Inland Revenue Service (FIRS)",
  "Tax registration (TIN, VAT, CIT) and filings.",
  "FIRS (Establishment) Act 2007",
  "https://www.firs.gov.ng"
);
const NAFDAC = reg(
  "NAFDAC",
  "Registration of food, drugs, water and cosmetics products and facilities.",
  "NAFDAC Act Cap N1 LFN 2004",
  "https://www.nafdac.gov.ng"
);
const SON = reg(
  "Standards Organisation of Nigeria (SON)",
  "Product standards, MANCAP/SONCAP certification.",
  "SON Act 2015",
  "https://son.gov.ng"
);
const NESREA = reg(
  "NESREA",
  "Environmental standards, EIA compliance and enforcement.",
  "NESREA Act 2007",
  "https://www.nesrea.gov.ng"
);

export const extraIndustries: IndustryTemplate[] = [
  buildTemplate({
    id: "real-estate-development",
    name: "Real Estate Development",
    isicCode: "F4100",
    keywords: ["real estate", "estate development", "housing estate", "property development", "apartments"],
    summary:
      "Ecosystem for residential/commercial real estate development in Nigeria: titles, approvals, finance, construction and sales.",
    regulators: [
      reg(
        "State Ministry of Lands / Land Registry",
        "Title perfection, Governor's consent, C of O.",
        "Land Use Act 1978",
        "https://landsbureau.lagosstate.gov.ng",
        "State"
      ),
      reg(
        "State Physical Planning Authority",
        "Building plan approval and development permits.",
        "State Urban & Regional Planning Laws",
        "https://lasppa.lagosstate.gov.ng",
        "State"
      ),
      CAC,
      FIRS,
    ],
    risks: [
      "Defective land title / omo-onile disputes",
      "Building plan approval delays",
      "Construction cost inflation (cement, rebar)",
      "Off-taker default on off-plan sales",
    ],
    paymentPoints: [
      "Lawyer paid for title due diligence before land purchase",
      "Land owner and survey fees at acquisition",
      "Planning authority fees at plan approval",
      "Contractors paid by certified milestones",
      "Agents/marketers paid commission on unit sales",
    ],
    specialists: {
      design: [
        {
          role: "Architect (ARCON registered)",
          category: "Engineering",
          responsibility: "Building design, working drawings, approval drawings.",
          whenEngaged: "After land acquisition",
          typicalCost: "3-6% of construction value",
        },
        {
          role: "Structural/Civil Engineer (COREN)",
          category: "Engineering",
          responsibility: "Structural design and supervision.",
          whenEngaged: "Design stage",
        },
        {
          role: "Quantity Surveyor",
          category: "Advisory",
          responsibility: "Bill of quantities, cost planning, valuations.",
          whenEngaged: "Design through construction",
        },
      ],
      implementation: [
        {
          role: "Main Building Contractor",
          category: "Construction",
          responsibility: "Construction to approved drawings and specifications.",
          whenEngaged: "After approvals and financing",
          typicalCost: "Largest single cost item",
        },
      ],
      operations: [
        {
          role: "Estate Agent / Property Manager",
          category: "Operations",
          responsibility: "Sales, letting and facility management of completed units.",
          whenEngaged: "Pre-completion marketing onward",
          typicalCost: "5-10% commission / management fee",
        },
      ],
    },
    approvalsDeliverables: ["C of O / Governor's consent", "Building plan approval", "EIA where required"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "mining-quarrying",
    name: "Mining & Quarrying",
    isicCode: "B0810",
    keywords: ["mining", "quarry", "granite", "limestone", "mineral", "lithium", "gold mining"],
    summary:
      "Ecosystem for solid minerals mining/quarrying in Nigeria: mineral titles, community consent, environment, extraction and haulage.",
    regulators: [
      reg(
        "Mining Cadastre Office (MCO)",
        "Exploration licences, quarry leases and mining leases.",
        "Minerals and Mining Act 2007",
        "https://miningcadastre.gov.ng"
      ),
      reg(
        "Ministry of Solid Minerals Development",
        "Sector policy, community development agreements.",
        "Minerals and Mining Act 2007",
        "https://minesandsteel.gov.ng"
      ),
      NESREA,
      FIRS,
    ],
    risks: [
      "Community/host disputes and illegal mining overlap",
      "Title revocation for non-use",
      "Environmental liabilities and mine closure costs",
      "Commodity price volatility",
    ],
    paymentPoints: [
      "MCO fees at licence application and annual service fees",
      "Community development agreement payments",
      "Blasting/explosives permits and security costs",
      "Royalties on extracted minerals to government",
      "Haulage contractors paid per tonne moved",
    ],
    specialists: {
      design: [
        {
          role: "Geologist / Exploration Consultant",
          category: "Engineering",
          responsibility: "Resource assessment, drilling programme, reserve estimation.",
          whenEngaged: "Exploration stage",
        },
        {
          role: "Mining Engineer",
          category: "Engineering",
          responsibility: "Mine/quarry plan, bench design, blasting plan.",
          whenEngaged: "Before extraction",
        },
      ],
      implementation: [
        {
          role: "Blasting Contractor (licensed)",
          category: "Construction",
          responsibility: "Licensed explosives handling and controlled blasting.",
          whenEngaged: "Production stage",
        },
        {
          role: "Crushing Plant Supplier / Operator",
          category: "Operations",
          responsibility: "Crusher installation, aggregate production.",
          whenEngaged: "Production stage",
        },
      ],
    },
    approvalsDeliverables: ["Quarry lease / mining lease", "EIA approval", "Explosives permit", "CDA signed"],
  }),
  buildTemplate({
    id: "fintech",
    name: "Fintech / Payments Company",
    isicCode: "K6499",
    keywords: ["fintech", "payments", "wallet", "psp", "mobile money", "lending app", "payment gateway"],
    summary:
      "Ecosystem for launching a licensed fintech (payments/wallet/lending) in Nigeria: CBN licensing, compliance, technology and go-live.",
    regulators: [
      reg(
        "Central Bank of Nigeria (CBN)",
        "PSSP/PTSP/MMO/switching licences, capital requirements.",
        "CBN Act 2007; BOFIA 2020",
        "https://www.cbn.gov.ng"
      ),
      reg(
        "Nigeria Data Protection Commission (NDPC)",
        "Data protection registration and audits.",
        "Nigeria Data Protection Act 2023",
        "https://ndpc.gov.ng"
      ),
      reg(
        "NDIC",
        "Deposit insurance where applicable.",
        "NDIC Act 2006",
        "https://ndic.gov.ng"
      ),
      CAC,
    ],
    risks: [
      "Licence capital requirements (N100m-N5bn depending on category)",
      "Fraud and chargeback exposure",
      "Regulatory sanctions for AML/KYC failures",
      "Platform downtime and settlement failures",
    ],
    paymentPoints: [
      "Lawyers paid for licence application package",
      "CBN application and licensing fees",
      "Escrowed share capital deposit with CBN",
      "Core banking/payment platform vendor fees",
      "PCI-DSS/ISO audit and certification fees",
    ],
    specialists: {
      design: [
        {
          role: "Core Platform Vendor / CTO Team",
          category: "Engineering",
          responsibility: "Payment platform build/licence, integrations to NIBSS, switches and banks.",
          whenEngaged: "After licence strategy is set",
        },
        {
          role: "Compliance Officer (AML/CFT)",
          category: "Regulatory",
          responsibility: "AML/KYC framework, transaction monitoring, CBN returns.",
          whenEngaged: "Pre-licence and ongoing",
        },
      ],
      implementation: [
        {
          role: "Information Security Auditor",
          category: "Advisory",
          responsibility: "PCI-DSS, ISO 27001, penetration testing.",
          whenEngaged: "Before go-live",
        },
        {
          role: "Settlement Bank Partner",
          category: "Finance",
          responsibility: "Settlement accounts and float management.",
          whenEngaged: "Before go-live",
        },
      ],
    },
    approvalsDeliverables: ["CBN licence (category-specific)", "NDPC registration", "NIBSS integration approval"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "hotel-hospitality",
    name: "Hotel & Hospitality",
    isicCode: "I5510",
    keywords: ["hotel", "hospitality", "resort", "guest house", "short-let", "lodge"],
    summary:
      "Ecosystem for developing and operating a hotel/hospitality business in Nigeria, from land and construction to tourism licensing.",
    regulators: [
      reg(
        "State Ministry of Tourism / Hotel Licensing Authority",
        "Hotel registration, grading and operating licence.",
        "State Hotel Licensing Laws; NTDC Act",
        "https://tourism.lagosstate.gov.ng",
        "State"
      ),
      reg(
        "State Physical Planning Authority",
        "Building plan approval.",
        "State Urban & Regional Planning Laws",
        "https://lasppa.lagosstate.gov.ng",
        "State"
      ),
      NESREA,
      FIRS,
    ],
    risks: [
      "Low occupancy vs debt service",
      "Fire safety and liability incidents",
      "Multiple state/LGA levies",
      "Power/diesel cost burden",
    ],
    paymentPoints: [
      "Land and title costs at acquisition",
      "Planning and building approval fees",
      "Contractors paid by milestone",
      "FF&E suppliers paid before opening",
      "Tourism licence and annual renewals",
    ],
    specialists: {
      design: [
        {
          role: "Architect / Interior Designer",
          category: "Engineering",
          responsibility: "Hotel design, room mix, interiors and FF&E specification.",
          whenEngaged: "After site acquisition",
        },
        {
          role: "MEP Engineer",
          category: "Engineering",
          responsibility: "Power, water, HVAC and fire systems design.",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "Main Contractor",
          category: "Construction",
          responsibility: "Construction and fit-out.",
          whenEngaged: "After approvals",
        },
        {
          role: "Fire Service (State)",
          category: "Government",
          responsibility: "Fire safety certificate and inspections.",
          whenEngaged: "Before opening",
        },
      ],
      operations: [
        {
          role: "Hotel Management Company / GM",
          category: "Operations",
          responsibility: "Operations, staffing, OTA distribution, revenue management.",
          whenEngaged: "Pre-opening onward",
          typicalCost: "2-4% of revenue + incentive fees",
        },
      ],
    },
    approvalsDeliverables: ["Building approval", "Hotel operating licence", "Fire safety certificate"],
  }),
  buildTemplate({
    id: "private-school",
    name: "Private School / Education",
    isicCode: "P8510",
    keywords: ["school", "education", "academy", "college", "creche", "nursery", "secondary school"],
    summary:
      "Ecosystem for establishing a private school in Nigeria: state approval, facilities, staffing and quality assurance.",
    regulators: [
      reg(
        "State Ministry of Education",
        "School approval, curriculum compliance, inspections.",
        "State Education Laws; Education (National Minimum Standards) Act",
        "https://education.lagosstate.gov.ng",
        "State"
      ),
      CAC,
      FIRS,
    ],
    risks: [
      "Operating before approval attracts closure",
      "Teacher quality and retention",
      "Fee default by parents",
      "Safeguarding and safety liabilities",
    ],
    paymentPoints: [
      "Premises lease/purchase before approval inspection",
      "Ministry approval and inspection fees",
      "Furniture/lab equipment suppliers before opening",
      "Staff salaries from pre-opening",
      "Exam body registration fees (WAEC/NECO) when due",
    ],
    specialists: {
      design: [
        {
          role: "Education Consultant",
          category: "Advisory",
          responsibility: "Curriculum design, staffing plan, ministry approval file.",
          whenEngaged: "At inception",
        },
        {
          role: "Architect",
          category: "Engineering",
          responsibility: "Classroom/lab layouts to ministry standards.",
          whenEngaged: "Facility planning",
        },
      ],
      implementation: [
        {
          role: "Renovation Contractor",
          category: "Construction",
          responsibility: "Build/renovate classrooms, labs and sanitation to standard.",
          whenEngaged: "Before inspection",
        },
      ],
      operations: [
        {
          role: "Head Teacher & Teaching Staff",
          category: "Operations",
          responsibility: "Academic delivery and compliance with curriculum standards.",
          whenEngaged: "From opening",
        },
      ],
    },
    approvalsDeliverables: ["State ministry approval", "Facility inspection pass", "Exam body accreditation"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "cold-chain-logistics",
    name: "Cold Chain & Warehousing",
    isicCode: "H5210",
    keywords: ["cold chain", "cold room", "warehouse", "cold storage", "logistics hub", "reefer"],
    summary:
      "Ecosystem for cold-chain storage and warehousing in Nigeria: refrigeration systems, power, food safety and distribution.",
    regulators: [NAFDAC, SON, NESREA, FIRS],
    risks: [
      "Power outage spoilage losses",
      "Refrigerant regulation compliance",
      "Temperature-excursion liability claims",
      "High diesel/energy costs",
    ],
    paymentPoints: [
      "Refrigeration equipment suppliers (largely imported) via LC",
      "Clearing agents and haulage on arrival",
      "Installation contractors at commissioning",
      "Power solution (gen/solar hybrid) suppliers",
      "NAFDAC facility registration fees",
    ],
    specialists: {
      design: [
        {
          role: "Refrigeration Engineer",
          category: "Engineering",
          responsibility: "Cold room sizing, refrigeration load design, redundancy planning.",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "Cold Room Installation Contractor",
          category: "Construction",
          responsibility: "Panel erection, refrigeration plant installation, commissioning.",
          whenEngaged: "After equipment delivery",
        },
        {
          role: "Power Systems Provider",
          category: "Engineering",
          responsibility: "Hybrid gen/solar/inverter power with autonomy for outages.",
          whenEngaged: "Parallel with installation",
        },
      ],
    },
    approvalsDeliverables: ["NAFDAC facility registration", "Environmental permit", "Fire certificate"],
  }),
  buildTemplate({
    id: "poultry-farm",
    name: "Poultry Farming",
    isicCode: "A0146",
    keywords: ["poultry", "chicken", "broiler", "layer", "hatchery", "egg production"],
    summary:
      "Ecosystem for commercial poultry (broilers/layers/hatchery) in Nigeria: biosecurity, feed, veterinary care and offtake.",
    regulators: [
      reg(
        "Federal/State Ministry of Agriculture & Veterinary Services",
        "Farm registration, animal health and movement permits.",
        "Animal Diseases (Control) Act 1988",
        "https://fmard.gov.ng"
      ),
      NAFDAC,
      NESREA,
    ],
    risks: [
      "Disease outbreak (avian influenza, Newcastle)",
      "Feed price volatility (maize, soya)",
      "Heat stress mortality",
      "Offtake price crashes at glut periods",
    ],
    paymentPoints: [
      "Land and housing construction upfront",
      "Day-old chicks paid per batch",
      "Feed mills paid continuously (60-70% of cost)",
      "Veterinary services and vaccines per cycle",
      "Offtakers/processors pay on delivery",
    ],
    specialists: {
      design: [
        {
          role: "Poultry Housing Specialist",
          category: "Engineering",
          responsibility: "Pen house design, ventilation, stocking density planning.",
          whenEngaged: "Before construction",
        },
      ],
      implementation: [
        {
          role: "Veterinary Doctor",
          category: "Operations",
          responsibility: "Vaccination programme, biosecurity protocol, flock health.",
          whenEngaged: "From stocking, ongoing",
        },
        {
          role: "Feed Supplier / Feed Mill",
          category: "Procurement",
          responsibility: "Consistent feed supply or on-farm milling setup.",
          whenEngaged: "Before stocking",
        },
      ],
    },
    approvalsDeliverables: ["Farm registration", "Environmental permit", "NAFDAC registration (processing)"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "aquaculture-fishery",
    name: "Aquaculture / Fish Farming",
    isicCode: "A0322",
    keywords: ["fish farm", "aquaculture", "catfish", "tilapia", "fishery", "pond"],
    summary:
      "Ecosystem for commercial aquaculture in Nigeria: ponds/tanks, water management, feed, processing and market offtake.",
    regulators: [
      reg(
        "Federal Department of Fisheries & Aquaculture",
        "Fish farm registration and aquaculture policy.",
        "Sea Fisheries Act; FMARD regulations",
        "https://fmard.gov.ng"
      ),
      NAFDAC,
      NESREA,
    ],
    risks: [
      "Water quality failures and mass mortality",
      "Feed cost (up to 70% of production cost)",
      "Theft and predation",
      "Price pressure from imports",
    ],
    paymentPoints: [
      "Pond/tank construction contractors upfront",
      "Fingerling suppliers per stocking cycle",
      "Feed suppliers continuously",
      "Processing (smoking/oven) equipment suppliers",
      "Offtakers pay on harvest delivery",
    ],
    specialists: {
      design: [
        {
          role: "Aquaculture Consultant",
          category: "Advisory",
          responsibility: "Farm design, species selection, stocking and production plan.",
          whenEngaged: "At inception",
        },
      ],
      implementation: [
        {
          role: "Pond/RAS Construction Contractor",
          category: "Construction",
          responsibility: "Earthen ponds, concrete tanks or recirculating systems.",
          whenEngaged: "Site development",
        },
        {
          role: "Water/Borehole Engineer",
          category: "Engineering",
          responsibility: "Water source development, aeration and filtration.",
          whenEngaged: "Site development",
        },
      ],
    },
    approvalsDeliverables: ["Farm registration", "Water use/environmental permit"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "pharma-manufacturing",
    name: "Pharmaceutical Manufacturing",
    isicCode: "C2100",
    keywords: ["pharmaceutical", "drug manufacturing", "pharma plant", "medicine production", "tablets"],
    summary:
      "Ecosystem for a pharmaceutical manufacturing plant in Nigeria: GMP facility, NAFDAC licensing, equipment import and QA.",
    regulators: [
      NAFDAC,
      reg(
        "Pharmacy Council of Nigeria (PCN)",
        "Premises registration and superintendent pharmacist licensing.",
        "PCN Act 2022",
        "https://www.pcn.gov.ng"
      ),
      SON,
      NESREA,
    ],
    risks: [
      "GMP inspection failure delays product launch",
      "API import dependence and FX exposure",
      "Counterfeit competition",
      "Cold-chain and stability failures",
    ],
    paymentPoints: [
      "GMP facility design consultants upfront",
      "Cleanroom and equipment vendors via LC",
      "NAFDAC facility and product registration fees per product",
      "Superintendent pharmacist salary (statutory)",
      "QA lab equipment and reference standards",
    ],
    specialists: {
      design: [
        {
          role: "GMP Facility Design Consultant",
          category: "Engineering",
          responsibility: "Cleanroom zoning, HVAC design, GMP-compliant layout.",
          whenEngaged: "Before construction",
        },
        {
          role: "Superintendent Pharmacist",
          category: "Regulatory",
          responsibility: "Statutory technical oversight; PCN premises registration.",
          whenEngaged: "From licensing through operations",
        },
      ],
      implementation: [
        {
          role: "Cleanroom/Equipment Installation Contractor",
          category: "Construction",
          responsibility: "Cleanroom build, equipment installation and qualification (IQ/OQ/PQ).",
          whenEngaged: "After equipment delivery",
        },
        {
          role: "QA/QC Laboratory Team",
          category: "Operations",
          responsibility: "Method validation, batch release testing, stability studies.",
          whenEngaged: "Before production",
        },
      ],
    },
    approvalsDeliverables: ["NAFDAC facility GMP approval", "PCN premises registration", "Product registrations"],
  }),
  buildTemplate({
    id: "water-bottling",
    name: "Water Bottling / Beverage Plant",
    isicCode: "C1104",
    keywords: ["bottled water", "sachet water", "pure water", "beverage plant", "juice factory", "bottling"],
    summary:
      "Ecosystem for a water bottling or beverage plant in Nigeria: borehole/treatment, NAFDAC registration, filling lines and distribution.",
    regulators: [NAFDAC, SON, NESREA, FIRS],
    risks: [
      "NAFDAC sanctions for quality failures",
      "Packaging material price swings",
      "Distribution vehicle costs",
      "Water source contamination",
    ],
    paymentPoints: [
      "Borehole and treatment plant contractors upfront",
      "Filling line suppliers (often imported) via LC",
      "NAFDAC registration per product",
      "Packaging suppliers continuously",
      "Distributors on credit terms",
    ],
    specialists: {
      design: [
        {
          role: "Water Treatment Engineer",
          category: "Engineering",
          responsibility: "Treatment train design (filtration, RO, UV/ozone).",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "Filling Line Installer",
          category: "Construction",
          responsibility: "Bottling/sachet line installation and commissioning.",
          whenEngaged: "After delivery",
        },
        {
          role: "Microbiology Lab / QC",
          category: "Operations",
          responsibility: "Routine product testing to NAFDAC/SON standards.",
          whenEngaged: "From production start",
        },
      ],
    },
    approvalsDeliverables: ["NAFDAC product registration", "MANCAP certificate", "Environmental permit"],
  }),
  buildTemplate({
    id: "recycling-waste",
    name: "Recycling & Waste Management",
    isicCode: "E3830",
    keywords: ["recycling", "waste management", "plastic recycling", "waste collection", "pet flakes", "scrap"],
    summary:
      "Ecosystem for waste collection/recycling in Nigeria: state waste authority approvals, collection network, processing plant and offtake.",
    regulators: [
      reg(
        "State Waste Management Authority (e.g. LAWMA)",
        "Waste collection/PSP licences and recycling permits.",
        "State Waste Management Laws",
        "https://www.lawma.gov.ng",
        "State"
      ),
      NESREA,
      FIRS,
    ],
    risks: [
      "Feedstock supply inconsistency",
      "Informal-sector competition",
      "Machinery breakdown and spares import",
      "Offtake price swings (PET, aluminium)",
    ],
    paymentPoints: [
      "State authority licence fees",
      "Collection aggregators/waste pickers paid per kg",
      "Processing machinery suppliers via LC",
      "Logistics for baled material to offtakers",
      "Offtakers (local/export) pay on delivery",
    ],
    specialists: {
      design: [
        {
          role: "Waste Process Engineer",
          category: "Engineering",
          responsibility: "Sorting line, shredder/washing line design and siting.",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "Machinery Installation Contractor",
          category: "Construction",
          responsibility: "Install shredders, washers, balers; commission lines.",
          whenEngaged: "After delivery",
        },
        {
          role: "Aggregator Network Manager",
          category: "Operations",
          responsibility: "Build and manage collection/aggregation network.",
          whenEngaged: "Before plant start",
        },
      ],
    },
    approvalsDeliverables: ["PSP/recycling licence", "Environmental permit", "EIA where required"],
  }),
  buildTemplate({
    id: "ecommerce-retail",
    name: "E-commerce / Retail Chain",
    isicCode: "G4791",
    keywords: ["ecommerce", "e-commerce", "online store", "retail chain", "supermarket", "marketplace"],
    summary:
      "Ecosystem for launching e-commerce or a retail chain in Nigeria: platform, warehousing, logistics, payments and consumer protection.",
    regulators: [
      reg(
        "Federal Competition & Consumer Protection Commission (FCCPC)",
        "Consumer protection compliance, returns and product safety.",
        "FCCPA 2018",
        "https://fccpc.gov.ng"
      ),
      reg(
        "Nigeria Data Protection Commission (NDPC)",
        "Customer data protection compliance.",
        "Nigeria Data Protection Act 2023",
        "https://ndpc.gov.ng"
      ),
      CAC,
      FIRS,
    ],
    risks: [
      "Last-mile delivery failure rates",
      "Payment fraud and chargebacks",
      "Inventory shrinkage",
      "Thin margins vs marketing spend",
    ],
    paymentPoints: [
      "Platform/website developers upfront",
      "Warehouse lease and racking suppliers",
      "Payment gateway fees per transaction",
      "Logistics partners per delivery",
      "Suppliers on trade credit terms",
    ],
    specialists: {
      design: [
        {
          role: "E-commerce Platform Developer",
          category: "Engineering",
          responsibility: "Storefront, catalogue, checkout and payment integrations.",
          whenEngaged: "At inception",
        },
      ],
      implementation: [
        {
          role: "Payment Gateway Provider",
          category: "Finance",
          responsibility: "Card/transfer/USSD payment acceptance and settlement.",
          whenEngaged: "Before launch",
          typicalCost: "1.4-2% per transaction",
        },
        {
          role: "Last-mile Logistics Partner",
          category: "Logistics",
          responsibility: "Pick-up, delivery and returns network.",
          whenEngaged: "Before launch",
        },
      ],
    },
    approvalsDeliverables: ["NDPC registration", "FCCPC compliance framework"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "haulage-fleet",
    name: "Haulage & Fleet / Transport",
    isicCode: "H4923",
    keywords: ["haulage", "trucking", "fleet", "transport company", "logistics company", "trailers"],
    summary:
      "Ecosystem for a haulage/fleet business in Nigeria: truck acquisition, licensing, tracking, drivers and contract offtake.",
    regulators: [
      reg(
        "Federal Road Safety Corps (FRSC)",
        "Vehicle registration standards, driver licensing, safety compliance.",
        "FRSC (Establishment) Act 2007",
        "https://frsc.gov.ng"
      ),
      reg(
        "State Ministry of Transport / VIO",
        "Roadworthiness certificates and state permits.",
        "State Road Traffic Laws",
        "https://transportation.lagosstate.gov.ng",
        "State"
      ),
      FIRS,
    ],
    risks: [
      "Accidents and cargo liability",
      "Diesel price volatility",
      "Driver-related theft/diversion",
      "Road condition damage and downtime",
    ],
    paymentPoints: [
      "Truck purchase/lease (new or tokunbo import)",
      "Insurance (goods-in-transit + comprehensive) annually",
      "Tracking/telematics vendor subscriptions",
      "Drivers and trip allowances per trip",
      "Maintenance workshops continuously",
    ],
    specialists: {
      design: [
        {
          role: "Fleet Consultant",
          category: "Advisory",
          responsibility: "Truck spec selection, route economics, maintenance planning.",
          whenEngaged: "Before acquisition",
        },
      ],
      implementation: [
        {
          role: "Telematics/Tracking Vendor",
          category: "Engineering",
          responsibility: "GPS tracking, fuel monitoring, geofencing.",
          whenEngaged: "At fleet deployment",
        },
        {
          role: "Goods-in-Transit Insurer",
          category: "Insurance",
          responsibility: "Cargo and liability cover per policy.",
          whenEngaged: "Before operations",
        },
      ],
    },
    approvalsDeliverables: ["Vehicle registration & roadworthiness", "Hackney/state permits", "FRSC compliance"],
  }),
  buildTemplate({
    id: "filling-station",
    name: "Petrol Filling Station",
    isicCode: "G4730",
    keywords: ["filling station", "petrol station", "fuel station", "gas station", "pms retail"],
    summary:
      "Ecosystem for building and operating a petrol filling station in Nigeria: NMDPRA licensing, tank installation, safety and supply.",
    regulators: [
      reg(
        "NMDPRA",
        "Retail licence (storage/sales), siting approval and safety compliance.",
        "Petroleum Industry Act 2021",
        "https://www.nmdpra.gov.ng"
      ),
      reg(
        "DPR-successor State Fire Service",
        "Fire safety certification.",
        "State Fire Service Laws",
        "https://lagosstate.gov.ng",
        "State"
      ),
      NESREA,
      FIRS,
    ],
    risks: [
      "Siting approval rejection (distance rules)",
      "Product supply/allocation constraints",
      "Fire/explosion liability",
      "Margin regulation",
    ],
    paymentPoints: [
      "Land purchase meeting distance requirements",
      "NMDPRA licence and inspection fees",
      "Tank/pump suppliers and calibration",
      "Construction contractor for canopy/forecourt",
      "Depot/marketers paid per product lifting",
    ],
    specialists: {
      design: [
        {
          role: "Petroleum Engineer / Station Designer",
          category: "Engineering",
          responsibility: "Tank farm layout, pump configuration, safety distances.",
          whenEngaged: "Before approval application",
        },
      ],
      implementation: [
        {
          role: "Tank Installation Contractor",
          category: "Construction",
          responsibility: "Underground tank installation, pressure testing, calibration.",
          whenEngaged: "Construction stage",
        },
        {
          role: "Weights & Measures Calibrator",
          category: "Government",
          responsibility: "Pump calibration certification.",
          whenEngaged: "Before opening and periodically",
        },
      ],
    },
    approvalsDeliverables: ["NMDPRA retail licence", "Fire certificate", "Environmental permit", "Calibration certificate"],
  }),
  buildTemplate({
    id: "lpg-plant",
    name: "LPG / Cooking Gas Plant",
    isicCode: "G4661",
    keywords: ["lpg", "cooking gas", "gas plant", "propane", "gas refilling", "lpg skid"],
    summary:
      "Ecosystem for an LPG storage and refilling plant in Nigeria: NMDPRA licensing, pressure vessels, safety systems and distribution.",
    regulators: [
      reg(
        "NMDPRA",
        "LPG storage/refilling plant licence and safety standards.",
        "Petroleum Industry Act 2021",
        "https://www.nmdpra.gov.ng"
      ),
      SON,
      NESREA,
    ],
    risks: [
      "Leak/explosion catastrophic liability",
      "Pressure vessel certification lapses",
      "LPG price and supply volatility",
      "Cylinder quality in circulation",
    ],
    paymentPoints: [
      "Pressure vessels (skid/bulk tanks) via import LC",
      "NMDPRA licensing and inspection fees",
      "Installation and piping contractors",
      "Safety systems (fire suppression, gas detectors)",
      "Bulk LPG suppliers per truck delivery",
    ],
    specialists: {
      design: [
        {
          role: "Gas/Mechanical Engineer",
          category: "Engineering",
          responsibility: "Plant layout, pressure system design, safety distances.",
          whenEngaged: "Before licence application",
        },
      ],
      implementation: [
        {
          role: "Pressure Vessel Installer/Certifier",
          category: "Construction",
          responsibility: "Vessel installation, hydro testing, statutory certification.",
          whenEngaged: "Construction stage",
        },
        {
          role: "Safety Systems Contractor",
          category: "Engineering",
          responsibility: "Gas detection, fire suppression, earthing systems.",
          whenEngaged: "Before commissioning",
        },
      ],
    },
    approvalsDeliverables: ["NMDPRA plant licence", "Pressure vessel certificates", "Fire certificate"],
  }),
  buildTemplate({
    id: "microfinance-bank",
    name: "Microfinance Bank",
    isicCode: "K6419",
    keywords: ["microfinance", "mfb", "micro bank", "community bank", "micro lending"],
    summary:
      "Ecosystem for licensing and operating a microfinance bank in Nigeria under CBN regulation.",
    regulators: [
      reg(
        "Central Bank of Nigeria (CBN)",
        "MFB licence (Tier 1/2, State, National), prudential supervision.",
        "BOFIA 2020; CBN MFB Guidelines 2020",
        "https://www.cbn.gov.ng"
      ),
      reg("NDIC", "Deposit insurance for MFBs.", "NDIC Act 2006", "https://ndic.gov.ng"),
      CAC,
    ],
    risks: [
      "Capital requirements (N50m-N5bn by tier)",
      "Loan portfolio default (PAR)",
      "Regulatory sanction/licence revocation",
      "Liquidity mismatch",
    ],
    paymentPoints: [
      "Share capital deposited in escrow with CBN",
      "Licensing application fees",
      "Core banking software vendor",
      "Branch fit-out contractors",
      "NDIC premium annually",
    ],
    specialists: {
      design: [
        {
          role: "Banking Consultant",
          category: "Advisory",
          responsibility: "Licence application, business plan, policy manuals.",
          whenEngaged: "At inception",
        },
      ],
      implementation: [
        {
          role: "Core Banking Vendor",
          category: "Engineering",
          responsibility: "Core banking application, NIBSS/BVN integrations.",
          whenEngaged: "Pre-launch",
        },
        {
          role: "Experienced MD/CEO (CBN-approved)",
          category: "Operations",
          responsibility: "Fit-and-proper approved management.",
          whenEngaged: "Licensing requirement",
        },
      ],
    },
    approvalsDeliverables: ["CBN AIP then final licence", "NDIC registration"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "private-security",
    name: "Private Security Company",
    isicCode: "N8010",
    keywords: ["security company", "private guards", "security services", "guard company"],
    summary:
      "Ecosystem for a licensed private security company in Nigeria: NSCDC licensing, training, deployment and contracts.",
    regulators: [
      reg(
        "NSCDC (Private Guard Companies Dept)",
        "Private guard company licensing and supervision.",
        "Private Guard Companies Act 1986",
        "https://nscdc.gov.ng"
      ),
      CAC,
      FIRS,
    ],
    risks: [
      "Operating unlicensed is criminal",
      "Guard-involved incidents liability",
      "Client payment delays vs payroll",
      "High guard turnover",
    ],
    paymentPoints: [
      "NSCDC licence application and renewals",
      "Training academy costs per guard",
      "Uniforms and equipment suppliers",
      "Monthly payroll (largest cost)",
      "Clients invoiced monthly in arrears",
    ],
    specialists: {
      design: [
        {
          role: "Security Consultant (ex-services)",
          category: "Advisory",
          responsibility: "Operational doctrine, training curriculum, licensing file.",
          whenEngaged: "At inception",
        },
      ],
      implementation: [
        {
          role: "Training Academy",
          category: "Operations",
          responsibility: "Guard training to NSCDC standards.",
          whenEngaged: "Before deployment",
        },
        {
          role: "Control Room / Tracking Vendor",
          category: "Engineering",
          responsibility: "Radio/patrol monitoring and incident response systems.",
          whenEngaged: "Before deployment",
        },
      ],
    },
    approvalsDeliverables: ["NSCDC licence", "State command registrations"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "data-center",
    name: "Data Center / Cloud Infrastructure",
    isicCode: "J6311",
    keywords: ["data center", "datacenter", "colocation", "cloud infrastructure", "server farm", "hosting"],
    summary:
      "Ecosystem for building a data center in Nigeria: power redundancy, cooling, connectivity, certifications and colocation sales.",
    regulators: [
      reg(
        "Nigerian Communications Commission (NCC)",
        "Licensing where public connectivity services are offered.",
        "Nigerian Communications Act 2003",
        "https://www.ncc.gov.ng"
      ),
      reg(
        "Nigeria Data Protection Commission (NDPC)",
        "Data hosting compliance.",
        "Nigeria Data Protection Act 2023",
        "https://ndpc.gov.ng"
      ),
      NESREA,
      FIRS,
    ],
    risks: [
      "Power reliability and diesel cost",
      "Uptime SLA penalties",
      "Fibre cuts and connectivity outages",
      "Certification (Tier/ISO) failures",
    ],
    paymentPoints: [
      "Land and shell construction",
      "UPS/generators/cooling via import LC",
      "Fibre providers for diverse routes",
      "Certification bodies (Uptime, ISO 27001)",
      "Colocation clients pay monthly recurring",
    ],
    specialists: {
      design: [
        {
          role: "Data Center Design Engineer",
          category: "Engineering",
          responsibility: "Tier topology, power/cooling redundancy (N+1/2N), layout.",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "M&E Contractor",
          category: "Construction",
          responsibility: "Power train, CRAC/chiller installation, BMS.",
          whenEngaged: "Construction",
        },
        {
          role: "Fibre/Carrier Partners",
          category: "Engineering",
          responsibility: "Diverse fibre routes and IP transit.",
          whenEngaged: "Before launch",
        },
      ],
    },
    approvalsDeliverables: ["NDPC compliance", "NCC licence (if applicable)", "EIA/environmental permit"],
  }),
  buildTemplate({
    id: "film-production",
    name: "Film / Media Production",
    isicCode: "J5911",
    keywords: ["film", "movie production", "nollywood", "studio", "media production", "cinema"],
    summary:
      "Ecosystem for film/media production in Nigeria: financing, guilds, censorship approval, production and distribution.",
    regulators: [
      reg(
        "National Film & Video Censors Board (NFVCB)",
        "Film classification and distribution licensing.",
        "NFVCB Act 1993",
        "https://www.nfvcb.gov.ng"
      ),
      reg(
        "Nigerian Copyright Commission",
        "Copyright registration and anti-piracy.",
        "Copyright Act 2022",
        "https://copyright.gov.ng"
      ),
      CAC,
    ],
    risks: [
      "Piracy revenue loss",
      "Distribution window failures",
      "Budget overruns on production",
      "Talent scheduling conflicts",
    ],
    paymentPoints: [
      "Script/rights acquisition upfront",
      "Cast and crew per production schedule",
      "Equipment rental houses per shoot day",
      "Post-production studios at edit",
      "NFVCB classification fees before release",
    ],
    specialists: {
      design: [
        {
          role: "Producer / Line Producer",
          category: "Operations",
          responsibility: "Budgeting, scheduling, production management.",
          whenEngaged: "Development stage",
        },
        {
          role: "Entertainment Lawyer",
          category: "Legal",
          responsibility: "Chain of title, talent contracts, distribution agreements.",
          whenEngaged: "Development and distribution",
        },
      ],
      implementation: [
        {
          role: "Director & Crew",
          category: "Operations",
          responsibility: "Principal photography.",
          whenEngaged: "Production",
        },
        {
          role: "Post-production Studio",
          category: "Engineering",
          responsibility: "Editing, colour, sound design, mastering.",
          whenEngaged: "Post-production",
        },
      ],
    },
    approvalsDeliverables: ["NFVCB classification", "Copyright registration", "Location permits"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "broadcast-radio-tv",
    name: "Radio / TV Broadcasting",
    isicCode: "J6010",
    keywords: ["radio station", "tv station", "broadcasting", "broadcast licence", "fm station"],
    summary:
      "Ecosystem for licensing and launching a radio/TV station in Nigeria under NBC regulation.",
    regulators: [
      reg(
        "National Broadcasting Commission (NBC)",
        "Broadcast licence, frequency allocation, content code.",
        "NBC Act Cap N11 LFN 2004",
        "https://www.nbc.gov.ng"
      ),
      CAC,
      FIRS,
    ],
    risks: [
      "Licence cost and renewal burden",
      "NBC sanctions for content breaches",
      "Advertising revenue cyclicality",
      "Transmitter/power downtime",
    ],
    paymentPoints: [
      "NBC licence fee (substantial, category-based)",
      "Transmitter and studio equipment via import",
      "Mast/tower construction contractors",
      "On-air talent and staff payroll",
      "Content/programme acquisition",
    ],
    specialists: {
      design: [
        {
          role: "Broadcast Engineer",
          category: "Engineering",
          responsibility: "Studio design, transmitter spec, coverage planning.",
          whenEngaged: "Licence application stage",
        },
      ],
      implementation: [
        {
          role: "Mast/Tower Contractor",
          category: "Construction",
          responsibility: "Tower construction, antenna installation.",
          whenEngaged: "Build-out",
        },
        {
          role: "Studio Integrator",
          category: "Engineering",
          responsibility: "Console, automation and playout systems.",
          whenEngaged: "Build-out",
        },
      ],
    },
    approvalsDeliverables: ["NBC licence & frequency assignment", "NCAA aviation clearance for mast", "Type approval"],
  }),
  buildTemplate({
    id: "textile-garment",
    name: "Textile & Garment Factory",
    isicCode: "C1410",
    keywords: ["textile", "garment", "clothing factory", "fashion manufacturing", "apparel"],
    summary:
      "Ecosystem for a garment/textile factory in Nigeria: machinery import, production lines, labour and offtake (local/export).",
    regulators: [SON, NESREA, FIRS, CAC],
    risks: [
      "Cheap import competition",
      "Power costs vs margins",
      "Skilled machinist scarcity",
      "Fabric import dependence",
    ],
    paymentPoints: [
      "Industrial sewing machinery via import LC",
      "Factory lease and fit-out",
      "Fabric and trims suppliers per order",
      "Machinist wages per production run",
      "Buyers pay on delivery or LC (export)",
    ],
    specialists: {
      design: [
        {
          role: "Production Engineer",
          category: "Engineering",
          responsibility: "Line balancing, factory layout, capacity planning.",
          whenEngaged: "Setup stage",
        },
      ],
      implementation: [
        {
          role: "Machinery Technician",
          category: "Operations",
          responsibility: "Machine installation, maintenance, operator training.",
          whenEngaged: "Installation and ongoing",
        },
        {
          role: "Pattern/Sample Room Team",
          category: "Operations",
          responsibility: "Pattern making, sampling, quality standards.",
          whenEngaged: "Pre-production",
        },
      ],
    },
    approvalsDeliverables: ["Factory registration", "SON product standards compliance", "Export documentation (NEPC)"],
  }),
  buildTemplate({
    id: "agri-export",
    name: "Agro-Commodity Export",
    isicCode: "G4620",
    keywords: ["export", "commodity export", "cocoa export", "sesame", "cashew", "agro export", "ginger"],
    summary:
      "Ecosystem for exporting agro-commodities from Nigeria: NEPC registration, aggregation, quality, shipping and FX repatriation.",
    regulators: [
      reg(
        "Nigerian Export Promotion Council (NEPC)",
        "Exporter registration and incentives (EEG).",
        "NEPC Act",
        "https://nepc.gov.ng"
      ),
      reg(
        "Nigeria Agricultural Quarantine Service (NAQS)",
        "Phytosanitary certification for plant exports.",
        "NAQS Act 2018",
        "https://naqs.gov.ng"
      ),
      reg(
        "Central Bank of Nigeria (CBN)",
        "Export proceeds (NXP) documentation and repatriation.",
        "Foreign Exchange (Monitoring) Act",
        "https://www.cbn.gov.ng"
      ),
      FIRS,
    ],
    risks: [
      "Quality rejection at destination",
      "Price volatility between purchase and shipment",
      "FX repatriation compliance",
      "Aggregation-side fraud",
    ],
    paymentPoints: [
      "NEPC registration fees",
      "Aggregators/LBAs paid at buying centres",
      "Warehousing and fumigation services",
      "Pre-shipment inspection agents",
      "Shipping lines and forwarders at export; buyer pays via LC/CAD",
    ],
    specialists: {
      design: [
        {
          role: "Commodity Trade Advisor",
          category: "Advisory",
          responsibility: "Market linkage, Incoterms, LC structuring.",
          whenEngaged: "Before first contract",
        },
      ],
      implementation: [
        {
          role: "Quality Inspector / Fumigation Service",
          category: "Regulatory",
          responsibility: "Moisture/purity testing, fumigation certificates.",
          whenEngaged: "Before shipment",
        },
        {
          role: "Freight Forwarder (export)",
          category: "Logistics",
          responsibility: "Container stuffing, NXP processing, shipping docs.",
          whenEngaged: "At shipment",
        },
      ],
    },
    approvalsDeliverables: ["NEPC certificate", "Phytosanitary certificate", "NXP form per shipment"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "cement-plant",
    name: "Cement / Building Materials Plant",
    isicCode: "C2394",
    keywords: ["cement", "cement plant", "concrete", "blocks factory", "building materials"],
    summary:
      "Ecosystem for a cement grinding or building-materials plant in Nigeria: limestone/clinker supply, heavy plant, power and distribution.",
    regulators: [
      reg(
        "Mining Cadastre Office (MCO)",
        "Quarry lease for limestone where integrated.",
        "Minerals and Mining Act 2007",
        "https://miningcadastre.gov.ng"
      ),
      SON,
      NESREA,
      FIRS,
    ],
    risks: [
      "Enormous capex and long payback",
      "Clinker import FX exposure",
      "Power intensity",
      "Dominant-player competition",
    ],
    paymentPoints: [
      "EPC contractor milestone payments (largest)",
      "Plant equipment via LC",
      "Quarry royalties per tonne",
      "Power (captive plant/gas) contracts",
      "Distributors pay cash-and-carry",
    ],
    specialists: {
      design: [
        {
          role: "Process/Plant Engineer",
          category: "Engineering",
          responsibility: "Plant process design, mill sizing, quality control systems.",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "EPC Contractor",
          category: "Construction",
          responsibility: "Full plant construction and commissioning.",
          whenEngaged: "After financing close",
        },
        {
          role: "Captive Power Provider",
          category: "Engineering",
          responsibility: "Gas/coal captive power plant.",
          whenEngaged: "Parallel with plant build",
        },
      ],
    },
    approvalsDeliverables: ["EIA approval", "MANCAP/SON certification", "Quarry lease (if integrated)"],
  }),
  buildTemplate({
    id: "dredging-marine",
    name: "Dredging & Marine Services",
    isicCode: "F4291",
    keywords: ["dredging", "sand dredging", "marine services", "jetty", "reclamation"],
    summary:
      "Ecosystem for dredging/marine works in Nigeria: NIWA permits, dredger acquisition, environmental compliance and sand/reclamation sales.",
    regulators: [
      reg(
        "National Inland Waterways Authority (NIWA)",
        "Dredging permits on inland waterways.",
        "NIWA Act 1997",
        "https://niwa.gov.ng"
      ),
      reg(
        "Nigerian Maritime Administration & Safety Agency (NIMASA)",
        "Vessel registration and marine safety.",
        "NIMASA Act 2007",
        "https://nimasa.gov.ng"
      ),
      NESREA,
    ],
    risks: [
      "Permit overlaps (federal/state) disputes",
      "Equipment breakdown in remote sites",
      "Environmental/community claims",
      "Seasonal water level constraints",
    ],
    paymentPoints: [
      "Dredger purchase/import via LC (largest)",
      "NIWA permit and royalty fees",
      "Marine insurance premiums",
      "Crew and site security continuously",
      "Sand offtakers pay per truckload; reclamation clients per milestone",
    ],
    specialists: {
      design: [
        {
          role: "Hydrographic Surveyor",
          category: "Engineering",
          responsibility: "Bathymetric survey, volume computation.",
          whenEngaged: "Before dredging",
        },
      ],
      implementation: [
        {
          role: "Dredge Master & Crew",
          category: "Operations",
          responsibility: "Dredger operation and production management.",
          whenEngaged: "Operations",
        },
        {
          role: "Marine Engineer",
          category: "Engineering",
          responsibility: "Dredger maintenance, pipeline setup.",
          whenEngaged: "Operations",
        },
      ],
    },
    approvalsDeliverables: ["NIWA dredging permit", "EIA approval", "Vessel registration"],
  }),
  buildTemplate({
    id: "aviation-charter",
    name: "Aviation / Air Charter",
    isicCode: "H5110",
    keywords: ["airline", "air charter", "aviation", "aircraft", "helicopter services"],
    summary:
      "Ecosystem for an air charter/aviation operation in Nigeria: NCAA certification (AOC), aircraft acquisition, crew and maintenance.",
    regulators: [
      reg(
        "Nigeria Civil Aviation Authority (NCAA)",
        "Air Operator Certificate (AOC), airworthiness, crew licensing.",
        "Civil Aviation Act 2022",
        "https://ncaa.gov.ng"
      ),
      reg(
        "FAAN / NAMA",
        "Airport access, slots and navigation charges.",
        "FAAN Act; NAMA Act",
        "https://faan.gov.ng"
      ),
      FIRS,
    ],
    risks: [
      "AOC process length (12-24 months)",
      "Aircraft lease/insurance USD exposure",
      "Maintenance (C-checks) downtime",
      "Fuel (Jet A1) price and availability",
    ],
    paymentPoints: [
      "AOC application and NCAA fees",
      "Aircraft purchase/dry lease (USD, largest)",
      "Hull & liability insurance (USD annually)",
      "Type-rated crew salaries",
      "MRO facilities per maintenance event",
    ],
    specialists: {
      design: [
        {
          role: "Aviation Consultant (AOC specialist)",
          category: "Advisory",
          responsibility: "AOC 5-phase process management, manuals (OM, MEL).",
          whenEngaged: "At inception",
        },
      ],
      implementation: [
        {
          role: "Approved Maintenance Organisation (AMO)",
          category: "Engineering",
          responsibility: "Airworthiness maintenance under NCAA approval.",
          whenEngaged: "From aircraft arrival",
        },
        {
          role: "Type-rated Flight Crew",
          category: "Operations",
          responsibility: "Flight operations under AOC.",
          whenEngaged: "Before proving flights",
        },
      ],
    },
    approvalsDeliverables: ["AOC (5 phases)", "Aircraft registration (5N)", "Insurance certificates"],
  }),
  buildTemplate({
    id: "insurance-company",
    name: "Insurance Company",
    isicCode: "K6511",
    keywords: ["insurance company", "underwriting", "insurer", "insurance licence"],
    summary:
      "Ecosystem for licensing an insurance company in Nigeria under NAICOM: capital, actuaries, reinsurance and distribution.",
    regulators: [
      reg(
        "National Insurance Commission (NAICOM)",
        "Insurer licensing, solvency and market conduct.",
        "Insurance Act 2003; NAICOM Act 1997",
        "https://naicom.gov.ng"
      ),
      CAC,
      FIRS,
    ],
    risks: [
      "Minimum capital requirements (billions of naira)",
      "Claims reserving inadequacy",
      "Premium collection failures",
      "Reinsurance cost in hard markets",
    ],
    paymentPoints: [
      "Statutory deposit with CBN (10% of capital)",
      "NAICOM licensing fees",
      "Actuarial and audit firms annually",
      "Reinsurance treaties (premium cessions)",
      "Agents/brokers commission per policy",
    ],
    specialists: {
      design: [
        {
          role: "Actuary",
          category: "Advisory",
          responsibility: "Product pricing, reserving, solvency modelling.",
          whenEngaged: "Licensing and ongoing (statutory)",
        },
      ],
      implementation: [
        {
          role: "Reinsurance Broker",
          category: "Insurance",
          responsibility: "Treaty and facultative reinsurance placement.",
          whenEngaged: "Before underwriting",
        },
        {
          role: "Core Insurance Platform Vendor",
          category: "Engineering",
          responsibility: "Policy admin, claims and NAICOM returns systems.",
          whenEngaged: "Pre-launch",
        },
      ],
    },
    approvalsDeliverables: ["NAICOM licence", "Statutory deposit confirmation"],
    importHeavy: false,
  }),
  buildTemplate({
    id: "brewery-beverage",
    name: "Brewery / Alcoholic Beverages",
    isicCode: "C1103",
    keywords: ["brewery", "beer", "alcoholic beverage", "distillery", "spirits"],
    summary:
      "Ecosystem for a brewery/distillery in Nigeria: NAFDAC registration, excise licensing, brewing plant and distribution.",
    regulators: [
      NAFDAC,
      reg(
        "Nigeria Customs Service (Excise)",
        "Excise factory registration and duty payments.",
        "Customs & Excise Management Act",
        "https://customs.gov.ng"
      ),
      SON,
      NESREA,
    ],
    risks: [
      "Excise duty increases",
      "Raw material (sorghum, malt) supply",
      "Distribution/returnable bottle logistics",
      "Regulatory advertising restrictions",
    ],
    paymentPoints: [
      "Brewhouse equipment via import LC (largest)",
      "Excise licence and monthly duty remittances",
      "NAFDAC product registrations per SKU",
      "Bottling/packaging suppliers continuously",
      "Distributors pay against supply",
    ],
    specialists: {
      design: [
        {
          role: "Brewmaster / Process Engineer",
          category: "Engineering",
          responsibility: "Recipe development, brewhouse specification, QC.",
          whenEngaged: "Design stage",
        },
      ],
      implementation: [
        {
          role: "Plant Installation Contractor",
          category: "Construction",
          responsibility: "Brewhouse, fermentation, packaging line installation.",
          whenEngaged: "After delivery",
        },
        {
          role: "Excise Compliance Officer",
          category: "Regulatory",
          responsibility: "Excise records, duty computation, customs liaison.",
          whenEngaged: "From production start",
        },
      ],
    },
    approvalsDeliverables: ["Excise factory licence", "NAFDAC product registrations", "Environmental permit"],
  }),
];
