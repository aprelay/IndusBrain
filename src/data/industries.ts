import { IndustryTemplate } from "@/lib/types";

export const industries: IndustryTemplate[] = [
  {
    id: "solar-power",
    name: "Solar Power System",
    keywords: [
      "solar",
      "pv",
      "photovoltaic",
      "renewable",
      "inverter",
      "power system",
      "mini-grid",
      "minigrid",
    ],
    summary:
      "End-to-end ecosystem for developing and installing a solar power system in Nigeria, from legal review through commissioning.",
    phases: [
      {
        name: "1. Legal & Contract Review",
        description:
          "Contracts, land agreements and power purchase terms are reviewed and negotiated before any commitment.",
        typicalDuration: "2-6 weeks",
        stakeholders: [
          {
            role: "Commercial/Energy Lawyer",
            category: "Legal",
            responsibility:
              "Review EPC contracts, PPAs, land lease agreements, warranties and liability clauses.",
            whenEngaged: "Before signing any contract",
            typicalCost: "Fixed fee or 0.5-2% of contract value",
          },
          {
            role: "Notary / CAC Filing Agent",
            category: "Legal",
            responsibility:
              "Company registration checks, notarisation and corporate filings with the Corporate Affairs Commission.",
            whenEngaged: "During contract execution",
          },
        ],
        deliverables: ["Executed contracts", "Due-diligence report", "Land/rooftop rights confirmation"],
      },
      {
        name: "2. Financing",
        description: "Banks and investors structure and approve funding for the project.",
        typicalDuration: "4-12 weeks",
        stakeholders: [
          {
            role: "Commercial Bank / DFI",
            category: "Finance",
            responsibility:
              "Project finance, loans, letters of credit for equipment import (e.g. Bank of Industry, InfraCredit).",
            whenEngaged: "After contracts are agreed in principle",
            typicalCost: "Interest, arrangement fees 1-2%",
          },
          {
            role: "Financial Advisor",
            category: "Advisory",
            responsibility: "Financial modelling, tariff analysis, bankability assessment.",
            whenEngaged: "Early feasibility stage",
          },
        ],
        deliverables: ["Approved facility / term sheet", "Financial model", "Letter of credit"],
      },
      {
        name: "3. Insurance & Risk Assessment",
        description: "Insurers assess and price the project's construction and operational risks.",
        typicalDuration: "2-4 weeks",
        stakeholders: [
          {
            role: "Insurance Broker / Underwriter",
            category: "Insurance",
            responsibility:
              "Construction-all-risk (CAR), marine cargo insurance for imports, operational insurance.",
            whenEngaged: "Before equipment shipment and construction",
            typicalCost: "0.3-1.5% of insured value per year",
          },
          {
            role: "Risk Assessor / Loss Adjuster",
            category: "Insurance",
            responsibility: "Site risk survey, theft/vandalism exposure, flood and fire risk rating.",
            whenEngaged: "During underwriting",
          },
        ],
        deliverables: ["CAR policy", "Marine cargo policy", "Risk assessment report"],
      },
      {
        name: "4. Engineering Design & Review",
        description: "Engineers design the system and independent engineers review it.",
        typicalDuration: "3-8 weeks",
        stakeholders: [
          {
            role: "Solar Design Engineer (COREN registered)",
            category: "Engineering",
            responsibility:
              "System sizing, PV array layout, inverter/battery specification, single-line diagrams.",
            whenEngaged: "After feasibility approval",
            typicalCost: "3-8% of EPC value",
          },
          {
            role: "Independent/Owner's Engineer",
            category: "Engineering",
            responsibility: "Third-party design review, quality assurance for the client and lenders.",
            whenEngaged: "Design review and construction supervision",
          },
          {
            role: "Electrical Engineer (grid interface)",
            category: "Engineering",
            responsibility: "Grid interconnection design, protection settings, DisCo coordination.",
            whenEngaged: "If grid-tied",
          },
        ],
        deliverables: ["Detailed design package", "Bill of quantities", "Design review certificate"],
      },
      {
        name: "5. Site Survey & Inspection",
        description: "Surveyors confirm the site is suitable and legally usable.",
        typicalDuration: "1-3 weeks",
        stakeholders: [
          {
            role: "Land Surveyor",
            category: "Engineering",
            responsibility: "Topographic survey, boundary verification, survey plan for title.",
            whenEngaged: "Before final design",
          },
          {
            role: "Geotechnical Engineer",
            category: "Engineering",
            responsibility: "Soil tests for ground-mounted structures and foundations.",
            whenEngaged: "Ground-mount projects",
          },
          {
            role: "Structural Engineer",
            category: "Engineering",
            responsibility: "Roof load assessment for rooftop installations.",
            whenEngaged: "Rooftop projects",
          },
        ],
        deliverables: ["Survey plan", "Soil/roof report", "Site suitability sign-off"],
      },
      {
        name: "6. Procurement & Importation",
        description:
          "Equipment not manufactured locally is sourced abroad, shipped, cleared and delivered.",
        typicalDuration: "8-16 weeks",
        stakeholders: [
          {
            role: "Importer / Procurement Agent",
            category: "Procurement",
            responsibility: "Source panels, inverters, batteries; negotiate FOB/CIF terms; manage Form M.",
            whenEngaged: "After design freeze",
            typicalCost: "2-5% commission",
          },
          {
            role: "Licensed Customs Clearing Agent",
            category: "Logistics",
            responsibility: "Customs declarations, duty/levy payment, SONCAP certificates, port clearance.",
            whenEngaged: "On cargo arrival",
            typicalCost: "Agency fees + statutory duties",
          },
          {
            role: "Freight Forwarder / Shipping Line",
            category: "Logistics",
            responsibility: "International sea/air freight, container booking, shipping documents.",
            whenEngaged: "After purchase order",
          },
          {
            role: "Haulage / Last-mile Logistics",
            category: "Logistics",
            responsibility: "Trucking from port (Apapa/Tin Can/Onne) to project site, offloading equipment.",
            whenEngaged: "After customs clearance",
          },
        ],
        deliverables: ["Purchase orders", "Bill of lading", "SONCAP certificate", "Delivered equipment"],
      },
      {
        name: "7. Installation & Construction",
        description: "The EPC contractor installs, tests and commissions the system.",
        typicalDuration: "4-12 weeks",
        stakeholders: [
          {
            role: "EPC Contractor / Installer",
            category: "Construction",
            responsibility: "Civil works, mounting, electrical installation, testing and commissioning.",
            whenEngaged: "After equipment delivery",
            typicalCost: "Largest single cost line",
          },
          {
            role: "HSE Officer",
            category: "Operations",
            responsibility: "Health, safety and environment compliance on site.",
            whenEngaged: "Throughout construction",
          },
        ],
        deliverables: ["Installed system", "Commissioning report", "As-built drawings"],
      },
      {
        name: "8. Operations & Maintenance",
        description: "Ongoing monitoring, maintenance and performance guarantees.",
        typicalDuration: "Project lifetime (20-25 years)",
        stakeholders: [
          {
            role: "O&M Contractor",
            category: "Operations",
            responsibility: "Preventive maintenance, panel cleaning, monitoring, warranty claims.",
            whenEngaged: "Post-commissioning",
            typicalCost: "1-2% of capex per year",
          },
        ],
        deliverables: ["O&M contract", "Monthly performance reports"],
      },
    ],
    regulators: [
      { name: "NERC", jurisdiction: "Nigeria", purpose: "Electricity generation/mini-grid permits and tariff regulation" },
      { name: "Rural Electrification Agency (REA)", jurisdiction: "Nigeria", purpose: "Off-grid programmes, grants and mini-grid support" },
      { name: "Standards Organisation of Nigeria (SON)", jurisdiction: "Nigeria", purpose: "SONCAP product certification for imported equipment" },
      { name: "Nigeria Customs Service", jurisdiction: "Nigeria", purpose: "Import duties, levies and clearance" },
      { name: "NESREA / State EPA", jurisdiction: "Nigeria", purpose: "Environmental impact compliance" },
      { name: "COREN", jurisdiction: "Nigeria", purpose: "Engineering practice licensing" },
      { name: "DisCo (distribution company)", jurisdiction: "Local", purpose: "Grid interconnection approval where grid-tied" },
    ],
    risks: [
      "FX volatility on imported equipment",
      "Port congestion and clearing delays",
      "Substandard/counterfeit panels without SONCAP",
      "Land title disputes",
      "Theft and vandalism of installed equipment",
    ],
    paymentPoints: [
      "Legal fees at contract review",
      "Bank arrangement fees and interest at financial close",
      "Insurance premiums before shipment/construction",
      "Engineering design fees at design stage",
      "Survey and inspection fees at site assessment",
      "Equipment payment (LC) at order; duties at clearance",
      "Clearing agent and haulage fees at delivery",
      "EPC milestone payments during construction",
      "O&M fees annually after commissioning",
    ],
  },
  {
    id: "construction",
    name: "Building & Construction Project",
    keywords: ["construction", "building", "real estate", "estate", "housing", "warehouse", "factory building", "road"],
    summary:
      "Ecosystem for delivering a construction project in Nigeria from land acquisition to handover.",
    phases: [
      {
        name: "1. Land & Legal",
        description: "Land acquisition, title perfection and contracts.",
        typicalDuration: "4-12 weeks",
        stakeholders: [
          { role: "Property Lawyer", category: "Legal", responsibility: "Title search, deed of assignment, Governor's consent, contract review.", whenEngaged: "Before land purchase", typicalCost: "5-10% of land value" },
          { role: "Estate Surveyor & Valuer", category: "Advisory", responsibility: "Land valuation and market advisory.", whenEngaged: "Before purchase" },
          { role: "Land Surveyor", category: "Engineering", responsibility: "Survey plan, beacons, charting at Surveyor-General's office.", whenEngaged: "During title perfection" },
        ],
        deliverables: ["Perfected title (C of O / Governor's consent)", "Registered survey plan"],
      },
      {
        name: "2. Design & Approvals",
        description: "Architectural/engineering design and statutory building approvals.",
        typicalDuration: "6-16 weeks",
        stakeholders: [
          { role: "Architect (ARCON registered)", category: "Engineering", responsibility: "Architectural design and drawings.", whenEngaged: "After land secured", typicalCost: "3-6% of project cost" },
          { role: "Structural Engineer", category: "Engineering", responsibility: "Structural design and calculations.", whenEngaged: "Design stage" },
          { role: "M&E Engineer", category: "Engineering", responsibility: "Mechanical, electrical and plumbing design.", whenEngaged: "Design stage" },
          { role: "Quantity Surveyor", category: "Advisory", responsibility: "Bill of quantities, cost planning.", whenEngaged: "Design stage" },
          { role: "Town Planner", category: "Regulatory", responsibility: "Planning permit processing with state physical planning authority.", whenEngaged: "Before construction" },
        ],
        deliverables: ["Approved building plans", "Bill of quantities", "Planning permit"],
      },
      {
        name: "3. Finance & Insurance",
        description: "Construction finance and insurance cover.",
        typicalDuration: "4-8 weeks",
        stakeholders: [
          { role: "Bank / Mortgage Institution", category: "Finance", responsibility: "Construction finance, mortgages.", whenEngaged: "After approvals" },
          { role: "Insurer", category: "Insurance", responsibility: "Contractor-all-risk and workmen's compensation insurance (mandatory for buildings above 2 floors).", whenEngaged: "Before construction" },
        ],
        deliverables: ["Facility approval", "CAR insurance policy"],
      },
      {
        name: "4. Construction & Supervision",
        description: "Physical construction with supervision and materials supply.",
        typicalDuration: "6-24 months",
        stakeholders: [
          { role: "Main Contractor", category: "Construction", responsibility: "Execution of works per contract.", whenEngaged: "After mobilisation" },
          { role: "Building Materials Suppliers / Importers", category: "Procurement", responsibility: "Cement, steel, finishes; imports where not locally made.", whenEngaged: "Throughout" },
          { role: "Project Manager / Consultant Team", category: "Advisory", responsibility: "Supervision, valuations, certificates of payment.", whenEngaged: "Throughout" },
          { role: "HSE Officer", category: "Operations", responsibility: "Site safety compliance.", whenEngaged: "Throughout" },
        ],
        deliverables: ["Completed structure", "Interim payment certificates"],
      },
      {
        name: "5. Completion & Handover",
        description: "Final inspections, certification and handover.",
        typicalDuration: "2-6 weeks",
        stakeholders: [
          { role: "State Building Control Agency", category: "Government", responsibility: "Stage inspections and certificate of completion/fitness for habitation.", whenEngaged: "At completion" },
          { role: "Facility Manager", category: "Operations", responsibility: "Post-handover operations and maintenance.", whenEngaged: "After handover" },
        ],
        deliverables: ["Certificate of completion", "Handover documents"],
      },
    ],
    regulators: [
      { name: "State Physical Planning Authority", jurisdiction: "State", purpose: "Building plan approval" },
      { name: "State Building Control Agency", jurisdiction: "State", purpose: "Construction stage inspections" },
      { name: "Surveyor-General's Office", jurisdiction: "State", purpose: "Survey plan registration" },
      { name: "Lands Registry", jurisdiction: "State", purpose: "Title registration and Governor's consent" },
      { name: "NESREA / State EPA", jurisdiction: "Nigeria/State", purpose: "Environmental impact assessment for large projects" },
    ],
    risks: ["Title defects and 'omo-onile' disputes", "Building collapse from poor supervision", "Cost escalation on imported materials", "Approval delays"],
    paymentPoints: [
      "Legal and survey fees at land acquisition",
      "Design consultants' fees at design stage",
      "Statutory approval fees before construction",
      "Insurance premium before site mobilisation",
      "Contractor milestone payments via payment certificates",
      "Completion certification fees at handover",
    ],
  },
  {
    id: "agro-processing",
    name: "Agro-Processing Plant",
    keywords: ["agro", "agriculture", "farm", "processing", "rice mill", "cassava", "poultry", "food processing", "palm oil"],
    summary: "Ecosystem for setting up an agro-processing facility in Nigeria.",
    phases: [
      {
        name: "1. Feasibility, Legal & Land",
        description: "Business case, land acquisition and legal structuring.",
        typicalDuration: "4-10 weeks",
        stakeholders: [
          { role: "Agribusiness Consultant", category: "Advisory", responsibility: "Feasibility study, raw material supply assessment.", whenEngaged: "First step" },
          { role: "Lawyer", category: "Legal", responsibility: "Land agreements, supplier/offtake contracts, company structuring.", whenEngaged: "Before commitments" },
          { role: "Land Surveyor", category: "Engineering", responsibility: "Site survey and title documentation.", whenEngaged: "Land acquisition" },
        ],
        deliverables: ["Feasibility report", "Land title", "Executed contracts"],
      },
      {
        name: "2. Finance & Insurance",
        description: "Funding via banks and agricultural finance schemes.",
        typicalDuration: "6-12 weeks",
        stakeholders: [
          { role: "Bank / BOI / NIRSAL", category: "Finance", responsibility: "Loans, CBN intervention funds, credit guarantees.", whenEngaged: "After feasibility" },
          { role: "Insurer (incl. NAIC)", category: "Insurance", responsibility: "Plant insurance, agricultural risk insurance.", whenEngaged: "Before operations" },
        ],
        deliverables: ["Approved facility", "Insurance policies"],
      },
      {
        name: "3. Equipment Sourcing & Importation",
        description: "Processing machinery sourced locally or imported.",
        typicalDuration: "8-20 weeks",
        stakeholders: [
          { role: "Equipment Vendor / Importer", category: "Procurement", responsibility: "Machinery specification, sourcing, Form M processing.", whenEngaged: "After finance" },
          { role: "Clearing Agent", category: "Logistics", responsibility: "Customs clearance and duty exemptions (agric equipment often 0% duty).", whenEngaged: "On arrival" },
          { role: "Logistics / Haulage", category: "Logistics", responsibility: "Delivery to plant site.", whenEngaged: "After clearance" },
        ],
        deliverables: ["Installed-ready machinery on site"],
      },
      {
        name: "4. Construction & Installation",
        description: "Factory building and machinery installation.",
        typicalDuration: "3-9 months",
        stakeholders: [
          { role: "Building Contractor", category: "Construction", responsibility: "Factory buildings, silos, utilities.", whenEngaged: "Parallel with equipment order" },
          { role: "Mechanical/Process Engineer", category: "Engineering", responsibility: "Machinery installation and commissioning.", whenEngaged: "After delivery" },
        ],
        deliverables: ["Completed factory", "Commissioned production line"],
      },
      {
        name: "5. Regulatory Certification & Operations",
        description: "Product registration and start of production.",
        typicalDuration: "6-16 weeks",
        stakeholders: [
          { role: "NAFDAC Consultant", category: "Regulatory", responsibility: "Product registration for food items.", whenEngaged: "Before market sales" },
          { role: "SON Consultant", category: "Regulatory", responsibility: "MANCAP certification for locally made products.", whenEngaged: "Before market sales" },
          { role: "Distributors / Offtakers", category: "Operations", responsibility: "Sales and distribution channels.", whenEngaged: "At launch" },
        ],
        deliverables: ["NAFDAC registration", "MANCAP certificate", "First production run"],
      },
    ],
    regulators: [
      { name: "NAFDAC", jurisdiction: "Nigeria", purpose: "Food and drug product registration" },
      { name: "SON", jurisdiction: "Nigeria", purpose: "Product standards (MANCAP)" },
      { name: "Federal Ministry of Agriculture", jurisdiction: "Nigeria", purpose: "Sector policies and support schemes" },
      { name: "NESREA / State EPA", jurisdiction: "Nigeria/State", purpose: "Environmental compliance for effluent/waste" },
      { name: "Nigeria Customs Service", jurisdiction: "Nigeria", purpose: "Import clearance for machinery" },
    ],
    risks: ["Raw material supply seasonality", "Power supply costs", "FX exposure on machinery", "Regulatory approval delays"],
    paymentPoints: [
      "Consultant fees at feasibility",
      "Legal and land costs at acquisition",
      "Bank fees at financial close",
      "Equipment payment and duties at import",
      "Contractor payments during construction",
      "NAFDAC/SON fees at certification",
    ],
  },
  {
    id: "import-trade",
    name: "General Importation & Trade",
    keywords: ["import", "importation", "clearing", "customs", "shipping", "trade", "goods", "container"],
    summary: "Ecosystem for importing goods into Nigeria and distributing them.",
    phases: [
      {
        name: "1. Sourcing & Contracts",
        description: "Finding suppliers and agreeing terms.",
        typicalDuration: "2-6 weeks",
        stakeholders: [
          { role: "Sourcing Agent", category: "Procurement", responsibility: "Supplier identification, factory audits, price negotiation.", whenEngaged: "First step" },
          { role: "Trade Lawyer", category: "Legal", responsibility: "Sales contracts, Incoterms, dispute clauses.", whenEngaged: "Before payment" },
        ],
        deliverables: ["Proforma invoice", "Signed supply contract"],
      },
      {
        name: "2. Trade Finance & Documentation",
        description: "Payment instruments and statutory import documents.",
        typicalDuration: "2-4 weeks",
        stakeholders: [
          { role: "Bank (Authorised Dealer)", category: "Finance", responsibility: "Form M, letters of credit, FX sourcing.", whenEngaged: "Before shipment" },
          { role: "Insurance Company", category: "Insurance", responsibility: "Marine cargo insurance (mandatory local insurance).", whenEngaged: "Before shipment" },
        ],
        deliverables: ["Approved Form M", "LC/payment", "Marine insurance certificate"],
      },
      {
        name: "3. Shipping & Pre-Arrival",
        description: "International freight and conformity certification.",
        typicalDuration: "4-10 weeks",
        stakeholders: [
          { role: "Freight Forwarder", category: "Logistics", responsibility: "Booking, consolidation, shipping documents.", whenEngaged: "After production" },
          { role: "SONCAP/Inspection Agent", category: "Regulatory", responsibility: "Pre-shipment conformity assessment for regulated goods.", whenEngaged: "Before shipment" },
        ],
        deliverables: ["Bill of lading", "SONCAP certificate", "PAAR"],
      },
      {
        name: "4. Clearance & Delivery",
        description: "Port clearance and inland delivery.",
        typicalDuration: "1-4 weeks",
        stakeholders: [
          { role: "Licensed Customs Agent", category: "Logistics", responsibility: "Customs declaration, duty payment, examination, release.", whenEngaged: "On arrival" },
          { role: "Terminal Operator / Shipping Line", category: "Logistics", responsibility: "Terminal handling, demurrage, container deposit.", whenEngaged: "At port" },
          { role: "Haulage Company", category: "Logistics", responsibility: "Truck delivery to warehouse.", whenEngaged: "After release" },
        ],
        deliverables: ["Customs release", "Goods delivered to warehouse"],
      },
      {
        name: "5. Distribution",
        description: "Storage and sale of goods.",
        typicalDuration: "Ongoing",
        stakeholders: [
          { role: "Warehouse Operator", category: "Operations", responsibility: "Storage and inventory management.", whenEngaged: "After delivery" },
          { role: "Distributors / Retailers", category: "Operations", responsibility: "Sales channels to end customers.", whenEngaged: "Ongoing" },
        ],
        deliverables: ["Stocked inventory", "Sales"],
      },
    ],
    regulators: [
      { name: "Nigeria Customs Service", jurisdiction: "Nigeria", purpose: "Duties, levies, clearance" },
      { name: "CBN", jurisdiction: "Nigeria", purpose: "Form M and FX regulations" },
      { name: "SON", jurisdiction: "Nigeria", purpose: "SONCAP conformity for regulated products" },
      { name: "NAFDAC", jurisdiction: "Nigeria", purpose: "Regulated foods, drugs, cosmetics imports" },
      { name: "NPA / Shippers' Council", jurisdiction: "Nigeria", purpose: "Port operations and shipping charges" },
    ],
    risks: ["FX scarcity and rate movement", "Demurrage from clearing delays", "Seizure for wrong documentation", "Supplier fraud"],
    paymentPoints: [
      "Supplier payment via LC/TT",
      "Bank charges at Form M/LC",
      "Insurance premium before shipment",
      "Freight payment to forwarder",
      "Duties, levies, terminal and agency charges at clearance",
      "Haulage at delivery",
    ],
  },
  {
    id: "oil-gas",
    name: "Oil & Gas Project",
    keywords: ["oil", "gas", "petroleum", "lng", "pipeline", "refinery", "depot", "filling station"],
    summary: "Ecosystem for oil & gas sector projects in Nigeria (downstream/midstream focus).",
    phases: [
      {
        name: "1. Licensing & Legal",
        description: "Regulatory licences and legal structuring come first.",
        typicalDuration: "3-9 months",
        stakeholders: [
          { role: "Oil & Gas Lawyer", category: "Legal", responsibility: "Licence applications, JV agreements, regulatory compliance.", whenEngaged: "First step" },
          { role: "Regulatory Consultant", category: "Regulatory", responsibility: "NMDPRA/NUPRC licence processing.", whenEngaged: "First step" },
        ],
        deliverables: ["Licence to construct/operate", "Corporate approvals"],
      },
      {
        name: "2. Finance & Insurance",
        description: "Capital-intensive funding and specialist energy insurance.",
        typicalDuration: "2-6 months",
        stakeholders: [
          { role: "Banks / Energy Funds", category: "Finance", responsibility: "Project finance, reserve-based lending.", whenEngaged: "After licensing" },
          { role: "Energy Insurance Broker", category: "Insurance", responsibility: "Energy package insurance, liability covers (local content rules apply).", whenEngaged: "Before construction" },
        ],
        deliverables: ["Financial close", "Insurance programme"],
      },
      {
        name: "3. Engineering & EIA",
        description: "FEED/detailed engineering and environmental approvals.",
        typicalDuration: "3-12 months",
        stakeholders: [
          { role: "Engineering Firm (FEED/EPC)", category: "Engineering", responsibility: "Front-end and detailed engineering design.", whenEngaged: "After licensing" },
          { role: "EIA Consultant", category: "Regulatory", responsibility: "Environmental impact assessment approval.", whenEngaged: "Before construction" },
          { role: "Surveyor", category: "Engineering", responsibility: "Route/site surveys.", whenEngaged: "Design stage" },
        ],
        deliverables: ["Approved EIA", "Issued-for-construction drawings"],
      },
      {
        name: "4. Procurement, Import & Construction",
        description: "Equipment import and facility construction with local content rules.",
        typicalDuration: "6-24 months",
        stakeholders: [
          { role: "Procurement/Importer", category: "Procurement", responsibility: "Long-lead equipment, NCDMB compliance.", whenEngaged: "After design" },
          { role: "Clearing Agent & Logistics", category: "Logistics", responsibility: "Port clearance, heavy haulage to site.", whenEngaged: "On arrival" },
          { role: "EPC Contractor", category: "Construction", responsibility: "Construction, installation, commissioning.", whenEngaged: "Construction phase" },
        ],
        deliverables: ["Mechanical completion", "Commissioning certificates"],
      },
      {
        name: "5. Operations",
        description: "Licensed operations with ongoing compliance.",
        typicalDuration: "Facility lifetime",
        stakeholders: [
          { role: "O&M Operator", category: "Operations", responsibility: "Operations, maintenance, HSE compliance.", whenEngaged: "Post-commissioning" },
          { role: "HSE/Compliance Auditor", category: "Regulatory", responsibility: "Periodic regulatory audits.", whenEngaged: "Ongoing" },
        ],
        deliverables: ["Operating licence renewals", "Audit reports"],
      },
    ],
    regulators: [
      { name: "NMDPRA", jurisdiction: "Nigeria", purpose: "Midstream/downstream licensing" },
      { name: "NUPRC", jurisdiction: "Nigeria", purpose: "Upstream regulation" },
      { name: "NCDMB", jurisdiction: "Nigeria", purpose: "Local content compliance" },
      { name: "Federal Ministry of Environment", jurisdiction: "Nigeria", purpose: "EIA approval" },
      { name: "NAICOM", jurisdiction: "Nigeria", purpose: "Local insurance requirements" },
    ],
    risks: ["Licence delays", "Community relations issues", "Local content non-compliance penalties", "Price/FX volatility"],
    paymentPoints: [
      "Legal and licence fees upfront",
      "Financing fees at close",
      "Insurance premiums pre-construction",
      "Engineering fees at design",
      "Equipment and duties at import",
      "EPC milestones during construction",
    ],
  },
  {
    id: "telecom-ict",
    name: "Telecom / ICT Infrastructure",
    keywords: ["telecom", "tower", "fibre", "fiber", "internet", "isp", "data center", "data centre", "ict", "network"],
    summary: "Ecosystem for telecom/ICT infrastructure deployment in Nigeria.",
    phases: [
      {
        name: "1. Licensing & Legal",
        description: "NCC licensing and legal agreements.",
        typicalDuration: "2-6 months",
        stakeholders: [
          { role: "Telecom Lawyer", category: "Legal", responsibility: "NCC licence application, interconnect and colocation agreements.", whenEngaged: "First step" },
          { role: "Regulatory Consultant", category: "Regulatory", responsibility: "NCC processes, spectrum where applicable.", whenEngaged: "First step" },
        ],
        deliverables: ["NCC licence", "Executed agreements"],
      },
      {
        name: "2. Finance & Insurance",
        description: "Capex funding and asset insurance.",
        typicalDuration: "1-3 months",
        stakeholders: [
          { role: "Bank / Investors", category: "Finance", responsibility: "Capex financing.", whenEngaged: "After licence" },
          { role: "Insurer", category: "Insurance", responsibility: "Asset and liability insurance.", whenEngaged: "Before rollout" },
        ],
        deliverables: ["Funding", "Insurance policies"],
      },
      {
        name: "3. Planning, Survey & Permits",
        description: "Network design, site surveys and way-leave permits.",
        typicalDuration: "1-4 months",
        stakeholders: [
          { role: "Network Engineer", category: "Engineering", responsibility: "RF/fibre network design.", whenEngaged: "Planning" },
          { role: "Surveyor", category: "Engineering", responsibility: "Site and route surveys.", whenEngaged: "Planning" },
          { role: "State/LG Permit Agents", category: "Government", responsibility: "Right-of-way and site permits.", whenEngaged: "Before construction" },
        ],
        deliverables: ["Network design", "RoW permits"],
      },
      {
        name: "4. Equipment Import & Deployment",
        description: "Equipment importation and installation.",
        typicalDuration: "2-6 months",
        stakeholders: [
          { role: "Equipment Vendor/Importer", category: "Procurement", responsibility: "Radios, fibre, power systems; NCC type approval.", whenEngaged: "After design" },
          { role: "Clearing Agent & Logistics", category: "Logistics", responsibility: "Clearance and site delivery.", whenEngaged: "On arrival" },
          { role: "Installation Contractor", category: "Construction", responsibility: "Tower/fibre build, integration.", whenEngaged: "Deployment" },
        ],
        deliverables: ["Deployed network", "Integration test results"],
      },
      {
        name: "5. Operations",
        description: "Network operations and regulatory compliance.",
        typicalDuration: "Ongoing",
        stakeholders: [
          { role: "NOC / O&M Team", category: "Operations", responsibility: "Monitoring, maintenance, SLA management.", whenEngaged: "Post-launch" },
          { role: "Compliance Officer", category: "Regulatory", responsibility: "NCC returns, QoS reporting.", whenEngaged: "Ongoing" },
        ],
        deliverables: ["Live services", "Compliance reports"],
      },
    ],
    regulators: [
      { name: "NCC", jurisdiction: "Nigeria", purpose: "Licensing, type approval, QoS" },
      { name: "NITDA", jurisdiction: "Nigeria", purpose: "IT regulations and data protection (with NDPC)" },
      { name: "State Governments", jurisdiction: "State", purpose: "Right-of-way charges and permits" },
      { name: "Nigeria Customs Service", jurisdiction: "Nigeria", purpose: "Equipment import clearance" },
    ],
    risks: ["Right-of-way cost disputes", "Fibre cuts and vandalism", "FX on imported equipment", "Multiple taxation"],
    paymentPoints: [
      "Licence fees at application",
      "Legal fees at agreements",
      "Financing fees at close",
      "RoW/permit fees before build",
      "Equipment and duties at import",
      "Contractor payments at deployment",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare Facility",
    keywords: ["hospital", "clinic", "healthcare", "medical", "diagnostic", "pharmacy", "laboratory"],
    summary: "Ecosystem for establishing a hospital, clinic, or diagnostic centre in Nigeria.",
    phases: [
      {
        name: "1. Legal & Registration",
        description: "Corporate setup and facility registration.",
        typicalDuration: "4-12 weeks",
        stakeholders: [
          { role: "Health Sector Lawyer", category: "Legal", responsibility: "Company setup, facility registration, professional agreements.", whenEngaged: "First step" },
          { role: "State Ministry of Health Liaison", category: "Regulatory", responsibility: "Facility registration and premises inspection.", whenEngaged: "Before operations" },
        ],
        deliverables: ["Facility registration", "Corporate documents"],
      },
      {
        name: "2. Finance & Insurance",
        description: "Funding and medical liability cover.",
        typicalDuration: "4-10 weeks",
        stakeholders: [
          { role: "Bank / Health Investors", category: "Finance", responsibility: "Facility and equipment financing.", whenEngaged: "After planning" },
          { role: "Insurer", category: "Insurance", responsibility: "Professional indemnity, asset insurance.", whenEngaged: "Before operations" },
        ],
        deliverables: ["Funding", "Indemnity policies"],
      },
      {
        name: "3. Facility & Equipment",
        description: "Building fit-out and medical equipment importation.",
        typicalDuration: "3-9 months",
        stakeholders: [
          { role: "Medical Planner / Architect", category: "Engineering", responsibility: "Clinical facility design to standards.", whenEngaged: "Design stage" },
          { role: "Medical Equipment Importer", category: "Procurement", responsibility: "Imaging, lab and theatre equipment sourcing.", whenEngaged: "After design" },
          { role: "Clearing Agent", category: "Logistics", responsibility: "Clearance incl. NAFDAC-regulated devices.", whenEngaged: "On arrival" },
          { role: "Biomedical Engineer", category: "Engineering", responsibility: "Equipment installation, calibration, maintenance.", whenEngaged: "Installation" },
        ],
        deliverables: ["Fitted facility", "Installed equipment"],
      },
      {
        name: "4. Staffing & Accreditation",
        description: "Professional licensing and payer accreditation.",
        typicalDuration: "6-16 weeks",
        stakeholders: [
          { role: "MDCN-licensed Practitioners", category: "Operations", responsibility: "Clinical services delivery.", whenEngaged: "Before opening" },
          { role: "HMO Accreditation Consultant", category: "Advisory", responsibility: "NHIA/HMO empanelment for insured patients.", whenEngaged: "Before/at launch" },
        ],
        deliverables: ["Licensed staff roster", "HMO/NHIA accreditation"],
      },
      {
        name: "5. Operations",
        description: "Live operations with quality compliance.",
        typicalDuration: "Ongoing",
        stakeholders: [
          { role: "Hospital Administrator", category: "Operations", responsibility: "Operations, billing, quality management.", whenEngaged: "Post-launch" },
          { role: "Waste Management Contractor", category: "Operations", responsibility: "Medical waste disposal compliance.", whenEngaged: "Ongoing" },
        ],
        deliverables: ["Operational facility", "Compliance records"],
      },
    ],
    regulators: [
      { name: "State Ministry of Health / HEFAMAA-type agencies", jurisdiction: "State", purpose: "Facility registration and monitoring" },
      { name: "MDCN", jurisdiction: "Nigeria", purpose: "Medical practitioner licensing" },
      { name: "PCN", jurisdiction: "Nigeria", purpose: "Pharmacy licensing" },
      { name: "MLSCN", jurisdiction: "Nigeria", purpose: "Laboratory licensing" },
      { name: "NAFDAC", jurisdiction: "Nigeria", purpose: "Drugs and medical device regulation" },
      { name: "NHIA", jurisdiction: "Nigeria", purpose: "Health insurance accreditation" },
    ],
    risks: ["Regulatory closure for unlicensed practice", "Equipment downtime without biomedical support", "Payer receivable delays"],
    paymentPoints: [
      "Legal and registration fees upfront",
      "Financing fees at close",
      "Design fees at planning",
      "Equipment and duties at import",
      "Fit-out contractor payments",
      "Accreditation fees before launch",
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing Plant (General)",
    keywords: ["manufacturing", "plant", "production line", "assembly", "packaging", "fmcg"],
    summary: "Ecosystem for establishing a general manufacturing operation in Nigeria.",
    phases: [
      {
        name: "1. Feasibility, Legal & Site",
        description: "Business case, legal structuring and site acquisition.",
        typicalDuration: "6-14 weeks",
        stakeholders: [
          { role: "Industry Consultant", category: "Advisory", responsibility: "Feasibility, market and cost study.", whenEngaged: "First step" },
          { role: "Corporate Lawyer", category: "Legal", responsibility: "Incorporation, permits strategy, contracts, pioneer status advice.", whenEngaged: "Before commitments" },
          { role: "Surveyor", category: "Engineering", responsibility: "Industrial site survey and documentation.", whenEngaged: "Site acquisition" },
        ],
        deliverables: ["Feasibility report", "Site secured", "Corporate structure"],
      },
      {
        name: "2. Finance & Insurance",
        description: "Capex/working capital and industrial insurance.",
        typicalDuration: "6-12 weeks",
        stakeholders: [
          { role: "Bank / BOI", category: "Finance", responsibility: "Term loans, working capital, LCs for machinery.", whenEngaged: "After feasibility" },
          { role: "Insurer", category: "Insurance", responsibility: "Industrial all-risk, machinery breakdown, group life.", whenEngaged: "Before operations" },
        ],
        deliverables: ["Facilities approved", "Insurance programme"],
      },
      {
        name: "3. Machinery Import & Factory Build",
        description: "Machinery importation and factory construction in parallel.",
        typicalDuration: "4-12 months",
        stakeholders: [
          { role: "Machinery Importer", category: "Procurement", responsibility: "Production line sourcing, Form M, spare parts strategy.", whenEngaged: "After finance" },
          { role: "Clearing Agent & Heavy Haulage", category: "Logistics", responsibility: "Clearance and machinery delivery/rigging.", whenEngaged: "On arrival" },
          { role: "Building Contractor", category: "Construction", responsibility: "Factory, utilities, power infrastructure.", whenEngaged: "Parallel" },
          { role: "Process/Installation Engineers", category: "Engineering", responsibility: "Line installation and commissioning.", whenEngaged: "After delivery" },
        ],
        deliverables: ["Factory complete", "Line commissioned"],
      },
      {
        name: "4. Certification & Launch",
        description: "Product standards, environmental compliance and market launch.",
        typicalDuration: "6-16 weeks",
        stakeholders: [
          { role: "SON/NAFDAC Consultants", category: "Regulatory", responsibility: "MANCAP/product registrations as applicable.", whenEngaged: "Pre-launch" },
          { role: "Environmental Consultant", category: "Regulatory", responsibility: "Environmental audit/EIA compliance.", whenEngaged: "Pre-launch" },
          { role: "Distributors", category: "Operations", responsibility: "Route-to-market.", whenEngaged: "Launch" },
        ],
        deliverables: ["Certifications", "First shipment to market"],
      },
    ],
    regulators: [
      { name: "SON", jurisdiction: "Nigeria", purpose: "Product standards (MANCAP)" },
      { name: "NAFDAC", jurisdiction: "Nigeria", purpose: "Regulated product registration" },
      { name: "NESREA / State EPA", jurisdiction: "Nigeria/State", purpose: "Environmental compliance" },
      { name: "NIPC", jurisdiction: "Nigeria", purpose: "Investment incentives (pioneer status)" },
      { name: "Nigeria Customs Service", jurisdiction: "Nigeria", purpose: "Machinery import clearance" },
      { name: "Factory Inspectorate (Ministry of Labour)", jurisdiction: "Nigeria", purpose: "Factory registration and safety" },
    ],
    risks: ["Power cost and reliability", "FX on machinery and inputs", "Smuggled/grey-market competition", "Multiple taxation/levies"],
    paymentPoints: [
      "Consultant and legal fees upfront",
      "Bank fees at financial close",
      "Machinery payment and duties at import",
      "Contractor payments during build",
      "Certification fees pre-launch",
    ],
  },
];

export function findIndustry(request: string): IndustryTemplate | null {
  const text = request.toLowerCase();
  let best: { template: IndustryTemplate; score: number } | null = null;
  for (const template of industries) {
    const score = template.keywords.filter((k) => text.includes(k)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { template, score };
    }
  }
  return best ? best.template : null;
}
