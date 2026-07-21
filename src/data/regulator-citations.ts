import { Regulator } from "@/lib/types";

interface Citation {
  legalBasis: string;
  officialUrl: string;
  lastVerified: string;
}

const V = "2026-07";

/** Citation registry keyed by a match substring of the regulator name (case-insensitive). */
const CITATIONS: [string, Citation][] = [
  ["NERC", { legalBasis: "Electricity Act 2023", officialUrl: "https://nerc.gov.ng", lastVerified: V }],
  ["Rural Electrification", { legalBasis: "EPSR Act 2005", officialUrl: "https://rea.gov.ng", lastVerified: V }],
  ["Standards Organisation", { legalBasis: "SON Act 2015", officialUrl: "https://son.gov.ng", lastVerified: V }],
  ["SON", { legalBasis: "SON Act 2015", officialUrl: "https://son.gov.ng", lastVerified: V }],
  ["Customs", { legalBasis: "Customs & Excise Management Act", officialUrl: "https://customs.gov.ng", lastVerified: V }],
  ["NESREA", { legalBasis: "NESREA Act 2007", officialUrl: "https://www.nesrea.gov.ng", lastVerified: V }],
  ["COREN", { legalBasis: "Engineers (Registration) Act", officialUrl: "https://coren.gov.ng", lastVerified: V }],
  ["NAFDAC", { legalBasis: "NAFDAC Act Cap N1 LFN 2004", officialUrl: "https://www.nafdac.gov.ng", lastVerified: V }],
  ["Corporate Affairs", { legalBasis: "Companies and Allied Matters Act 2020", officialUrl: "https://www.cac.gov.ng", lastVerified: V }],
  ["CAC", { legalBasis: "Companies and Allied Matters Act 2020", officialUrl: "https://www.cac.gov.ng", lastVerified: V }],
  ["FIRS", { legalBasis: "FIRS (Establishment) Act 2007", officialUrl: "https://www.firs.gov.ng", lastVerified: V }],
  ["Inland Revenue", { legalBasis: "FIRS (Establishment) Act 2007", officialUrl: "https://www.firs.gov.ng", lastVerified: V }],
  ["NUPRC", { legalBasis: "Petroleum Industry Act 2021", officialUrl: "https://www.nuprc.gov.ng", lastVerified: V }],
  ["NMDPRA", { legalBasis: "Petroleum Industry Act 2021", officialUrl: "https://www.nmdpra.gov.ng", lastVerified: V }],
  ["DPR", { legalBasis: "Petroleum Industry Act 2021 (successor agencies NUPRC/NMDPRA)", officialUrl: "https://www.nuprc.gov.ng", lastVerified: V }],
  ["NNPC", { legalBasis: "Petroleum Industry Act 2021", officialUrl: "https://nnpcgroup.com", lastVerified: V }],
  ["NCDMB", { legalBasis: "Nigerian Oil & Gas Industry Content Development Act 2010", officialUrl: "https://ncdmb.gov.ng", lastVerified: V }],
  ["NIMASA", { legalBasis: "NIMASA Act 2007", officialUrl: "https://nimasa.gov.ng", lastVerified: V }],
  ["NCC", { legalBasis: "Nigerian Communications Act 2003", officialUrl: "https://www.ncc.gov.ng", lastVerified: V }],
  ["NITDA", { legalBasis: "NITDA Act 2007", officialUrl: "https://nitda.gov.ng", lastVerified: V }],
  ["Data Protection", { legalBasis: "Nigeria Data Protection Act 2023", officialUrl: "https://ndpc.gov.ng", lastVerified: V }],
  ["Medical and Dental", { legalBasis: "Medical and Dental Practitioners Act", officialUrl: "https://www.mdcn.gov.ng", lastVerified: V }],
  ["MDCN", { legalBasis: "Medical and Dental Practitioners Act", officialUrl: "https://www.mdcn.gov.ng", lastVerified: V }],
  ["Pharmac", { legalBasis: "PCN Act 2022", officialUrl: "https://www.pcn.gov.ng", lastVerified: V }],
  ["Nursing", { legalBasis: "Nursing and Midwifery (Registration) Act", officialUrl: "https://www.nmcn.gov.ng", lastVerified: V }],
  ["Health Facility", { legalBasis: "State Health Facility Monitoring Laws", officialUrl: "https://health.lagosstate.gov.ng", lastVerified: V }],
  ["Ministry of Health", { legalBasis: "National Health Act 2014", officialUrl: "https://www.health.gov.ng", lastVerified: V }],
  ["NHIS", { legalBasis: "National Health Insurance Authority Act 2022", officialUrl: "https://www.nhia.gov.ng", lastVerified: V }],
  ["Central Bank", { legalBasis: "CBN Act 2007; BOFIA 2020", officialUrl: "https://www.cbn.gov.ng", lastVerified: V }],
  ["CBN", { legalBasis: "CBN Act 2007; BOFIA 2020", officialUrl: "https://www.cbn.gov.ng", lastVerified: V }],
  ["NEPC", { legalBasis: "NEPC Act", officialUrl: "https://nepc.gov.ng", lastVerified: V }],
  ["Export Promotion", { legalBasis: "NEPC Act", officialUrl: "https://nepc.gov.ng", lastVerified: V }],
  ["Quarantine", { legalBasis: "NAQS Act 2018", officialUrl: "https://naqs.gov.ng", lastVerified: V }],
  ["Shippers", { legalBasis: "Nigerian Shippers' Council Act", officialUrl: "https://shipperscouncil.gov.ng", lastVerified: V }],
  ["Ports Authority", { legalBasis: "NPA Act", officialUrl: "https://nigerianports.gov.ng", lastVerified: V }],
  ["NPA", { legalBasis: "NPA Act", officialUrl: "https://nigerianports.gov.ng", lastVerified: V }],
  ["NOTAP", { legalBasis: "NOTAP Act", officialUrl: "https://notap.gov.ng", lastVerified: V }],
  ["NIPC", { legalBasis: "NIPC Act 1995", officialUrl: "https://nipc.gov.ng", lastVerified: V }],
  ["Investment Promotion", { legalBasis: "NIPC Act 1995", officialUrl: "https://nipc.gov.ng", lastVerified: V }],
  ["Ministry of Agriculture", { legalBasis: "FMARD mandates; Animal Diseases (Control) Act", officialUrl: "https://fmard.gov.ng", lastVerified: V }],
  ["Physical Planning", { legalBasis: "State Urban & Regional Planning Laws", officialUrl: "https://lasppa.lagosstate.gov.ng", lastVerified: V }],
  ["Ministry of Lands", { legalBasis: "Land Use Act 1978", officialUrl: "https://landsbureau.lagosstate.gov.ng", lastVerified: V }],
  ["Land", { legalBasis: "Land Use Act 1978", officialUrl: "https://landsbureau.lagosstate.gov.ng", lastVerified: V }],
  ["Fire Service", { legalBasis: "State Fire Service Laws", officialUrl: "https://lagosstate.gov.ng", lastVerified: V }],
  ["Labour", { legalBasis: "Labour Act; Factories Act", officialUrl: "https://labour.gov.ng", lastVerified: V }],
  ["Factories", { legalBasis: "Factories Act Cap F1 LFN 2004", officialUrl: "https://labour.gov.ng", lastVerified: V }],
  ["EPA", { legalBasis: "State Environmental Protection Laws", officialUrl: "https://lasepa.gov.ng", lastVerified: V }],
  ["ARCON", { legalBasis: "ARCON Act (architects)", officialUrl: "https://arconigeria.gov.ng", lastVerified: V }],
  ["QSRBN", { legalBasis: "QSRBN Act", officialUrl: "https://qsrbn.org.ng", lastVerified: V }],
  ["Surveyors", { legalBasis: "SURCON Act", officialUrl: "https://surconng.com", lastVerified: V }],
  ["NBRRI", { legalBasis: "NBRRI mandates", officialUrl: "https://nbrri.gov.ng", lastVerified: V }],
  ["DisCo", { legalBasis: "Electricity Act 2023 (distribution licensing)", officialUrl: "https://nerc.gov.ng", lastVerified: V }],
];

export function enrichRegulators(regulators: Regulator[]): Regulator[] {
  return regulators.map((r) => {
    if (r.legalBasis && r.officialUrl && r.lastVerified) return r;
    const upper = r.name.toUpperCase();
    const hit = CITATIONS.find(([key]) => upper.includes(key.toUpperCase()));
    if (!hit) return r;
    const [, c] = hit;
    return {
      ...r,
      legalBasis: r.legalBasis ?? c.legalBasis,
      officialUrl: r.officialUrl ?? c.officialUrl,
      lastVerified: r.lastVerified ?? c.lastVerified,
    };
  });
}
