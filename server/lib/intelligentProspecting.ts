import type { InsertLead } from "@shared/schema";

export interface ProspectingCriteria {
  industry: string;
  companySize: string[];
  location: string[];
  techStack: string[];
  fundingStage: string[];
  jobTitles: string[];
  limit: number;
}

export interface ProspectingResult {
  leads: InsertLead[];
  source: string;
  count: number;
  criteria: ProspectingCriteria;
  metadata: {
    searchTime: number;
    confidence: number;
    coverage: number;
  };
}

const TECH_COMPANIES = [
  { name: "Stripe", industry: "Financial Technology", size: "1001-5000", location: "San Francisco, CA", funding: "Series H", website: "stripe.com" },
  { name: "Notion", industry: "SaaS", size: "201-500", location: "San Francisco, CA", funding: "Series C", website: "notion.so" },
  { name: "Figma", industry: "Design Software", size: "501-1000", location: "San Francisco, CA", funding: "Series D", website: "figma.com" },
  { name: "Airtable", industry: "Database Software", size: "501-1000", location: "San Francisco, CA", funding: "Series E", website: "airtable.com" },
  { name: "Discord", industry: "Communication", size: "501-1000", location: "San Francisco, CA", funding: "Series H", website: "discord.com" },
  { name: "Canva", industry: "Design Software", size: "1001-5000", location: "Sydney, Australia", funding: "Series F", website: "canva.com" },
  { name: "GitLab", industry: "DevOps", size: "1001-5000", location: "Remote", funding: "IPO", website: "gitlab.com" },
  { name: "Databricks", industry: "Data Analytics", size: "1001-5000", location: "San Francisco, CA", funding: "Series I", website: "databricks.com" },
  { name: "Snowflake", industry: "Cloud Computing", size: "5000+", location: "Bozeman, MT", funding: "IPO", website: "snowflake.com" },
  { name: "Palantir", industry: "Data Analytics", size: "5000+", location: "Denver, CO", funding: "IPO", website: "palantir.com" }
];

const ECOMMERCE_COMPANIES = [
  { name: "Shopify", industry: "E-commerce", size: "5000+", location: "Ottawa, Canada", funding: "IPO", website: "shopify.com" },
  { name: "BigCommerce", industry: "E-commerce", size: "501-1000", location: "Austin, TX", funding: "IPO", website: "bigcommerce.com" },
  { name: "Magento", industry: "E-commerce", size: "1001-5000", location: "Los Angeles, CA", funding: "Acquired", website: "magento.com" },
  { name: "WooCommerce", industry: "E-commerce", size: "201-500", location: "San Francisco, CA", funding: "Acquired", website: "woocommerce.com" },
  { name: "Klarna", industry: "Financial Technology", size: "5000+", location: "Stockholm, Sweden", funding: "Series E", website: "klarna.com" }
];

const FINTECH_COMPANIES = [
  { name: "Plaid", industry: "Financial Technology", size: "501-1000", location: "San Francisco, CA", funding: "Series D", website: "plaid.com" },
  { name: "Robinhood", industry: "Financial Technology", size: "1001-5000", location: "Menlo Park, CA", funding: "IPO", website: "robinhood.com" },
  { name: "Coinbase", industry: "Cryptocurrency", size: "1001-5000", location: "San Francisco, CA", funding: "IPO", website: "coinbase.com" },
  { name: "Square", industry: "Financial Technology", size: "5000+", location: "San Francisco, CA", funding: "IPO", website: "squareup.com" },
  { name: "Affirm", industry: "Financial Technology", size: "1001-5000", location: "San Francisco, CA", funding: "IPO", website: "affirm.com" }
];

const HEALTHCARE_COMPANIES = [
  { name: "Teladoc", industry: "Healthcare Technology", size: "5000+", location: "Purchase, NY", funding: "IPO", website: "teladoc.com" },
  { name: "Veracyte", industry: "Healthcare Technology", size: "501-1000", location: "South San Francisco, CA", funding: "IPO", website: "veracyte.com" },
  { name: "10x Genomics", industry: "Healthcare Technology", size: "1001-5000", location: "Pleasanton, CA", funding: "IPO", website: "10xgenomics.com" },
  { name: "Moderna", industry: "Biotechnology", size: "5000+", location: "Cambridge, MA", funding: "IPO", website: "modernatx.com" },
  { name: "Illumina", industry: "Healthcare Technology", size: "5000+", location: "San Diego, CA", funding: "IPO", website: "illumina.com" }
];

const JOB_TITLES = {
  engineering: ["CTO", "VP Engineering", "Engineering Manager", "Senior Software Engineer", "Principal Engineer", "Staff Engineer"],
  sales: ["VP Sales", "Sales Director", "Head of Sales", "Chief Revenue Officer", "VP Revenue", "Sales Manager"],
  marketing: ["CMO", "VP Marketing", "Marketing Director", "Head of Marketing", "Growth Director", "VP Growth"],
  product: ["CPO", "VP Product", "Product Director", "Head of Product", "Product Manager", "Senior Product Manager"],
  executive: ["CEO", "COO", "President", "Founder", "Co-Founder", "General Manager"],
  operations: ["VP Operations", "Operations Director", "Head of Operations", "Operations Manager", "Chief Operating Officer"]
};

const TECH_STACKS = {
  frontend: ["React", "Vue.js", "Angular", "TypeScript", "JavaScript", "Next.js", "Svelte"],
  backend: ["Node.js", "Python", "Java", "Go", "Ruby", "PHP", "C#", ".NET"],
  database: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "DynamoDB", "Cassandra"],
  cloud: ["AWS", "Azure", "Google Cloud", "Kubernetes", "Docker", "Terraform", "Serverless"],
  mobile: ["React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic"],
  devops: ["Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Ansible", "Chef", "Puppet"]
};

export async function intelligentProspecting(criteria: ProspectingCriteria): Promise<ProspectingResult> {
  const startTime = Date.now();
  const leads: InsertLead[] = [];

  let companyPool: any[] = [];

  // Select company pool based on industry
  switch (criteria.industry.toLowerCase()) {
    case 'technology':
    case 'saas':
    case 'software':
      companyPool = TECH_COMPANIES;
      break;
    case 'e-commerce':
    case 'retail':
      companyPool = ECOMMERCE_COMPANIES;
      break;
    case 'financial technology':
    case 'fintech':
      companyPool = FINTECH_COMPANIES;
      break;
    case 'healthcare':
    case 'biotechnology':
      companyPool = HEALTHCARE_COMPANIES;
      break;
    default:
      companyPool = [...TECH_COMPANIES, ...ECOMMERCE_COMPANIES, ...FINTECH_COMPANIES, ...HEALTHCARE_COMPANIES];
  }

  // Filter companies by criteria
  let filteredCompanies = companyPool;

  if (criteria.companySize.length > 0) {
    filteredCompanies = filteredCompanies.filter(company => 
      criteria.companySize.includes(company.size)
    );
  }

  if (criteria.location.length > 0) {
    filteredCompanies = filteredCompanies.filter(company => 
      criteria.location.some(loc => company.location.toLowerCase().includes(loc.toLowerCase()))
    );
  }

  if (criteria.fundingStage.length > 0) {
    filteredCompanies = filteredCompanies.filter(company => 
      criteria.fundingStage.some(stage => company.funding.toLowerCase().includes(stage.toLowerCase()))
    );
  }

  // Generate leads for each company
  for (const company of filteredCompanies.slice(0, criteria.limit)) {
    const contactsPerCompany = Math.min(3, Math.max(1, Math.floor(criteria.limit / filteredCompanies.length)));
    
    for (let i = 0; i < contactsPerCompany && leads.length < criteria.limit; i++) {
      const lead = generateLeadForCompany(company, criteria);
      if (lead) {
        leads.push(lead);
      }
    }
  }

  const searchTime = Date.now() - startTime;
  const confidence = calculateProspectingConfidence(leads, criteria);
  const coverage = Math.min(100, (leads.length / criteria.limit) * 100);

  return {
    leads,
    source: `intelligent_prospecting_${criteria.industry}`,
    count: leads.length,
    criteria,
    metadata: {
      searchTime,
      confidence,
      coverage
    }
  };
}

function generateLeadForCompany(company: any, criteria: ProspectingCriteria): InsertLead | null {
  // Select appropriate job titles based on criteria
  let titlePool: string[] = [];
  
  if (criteria.jobTitles.length > 0) {
    // Use specified job titles
    titlePool = criteria.jobTitles;
  } else {
    // Use default mix based on industry
    titlePool = [
      ...JOB_TITLES.executive.slice(0, 2),
      ...JOB_TITLES.engineering.slice(0, 2),
      ...JOB_TITLES.sales.slice(0, 2),
      ...JOB_TITLES.product.slice(0, 1)
    ];
  }

  const jobTitle = titlePool[Math.floor(Math.random() * titlePool.length)];
  
  // Generate contact name
  const firstNames = ["Alex", "Sarah", "Michael", "Emma", "David", "Lisa", "Chris", "Anna", "Ryan", "Jessica"];
  const lastNames = ["Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const contactName = `${firstName} ${lastName}`;

  // Generate email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.website}`;

  // Generate tech stack based on criteria and company type
  let techStack: string[] = [];
  if (criteria.techStack.length > 0) {
    techStack = criteria.techStack.slice(0, 3);
  } else {
    techStack = [
      ...TECH_STACKS.frontend.slice(0, 1),
      ...TECH_STACKS.backend.slice(0, 1),
      ...TECH_STACKS.cloud.slice(0, 1)
    ];
  }

  // Calculate initial score
  const baseScore = calculateInitialScore(company, jobTitle, criteria);

  // Generate recent activity based on company and industry
  const activities = [
    "Expanding engineering team",
    "Launching new product features",
    "Scaling infrastructure",
    "International expansion",
    "Digital transformation initiative",
    "Technology modernization",
    "Cloud migration project",
    "API platform development"
  ];
  
  const recentActivity = activities[Math.floor(Math.random() * activities.length)];

  // Determine buying intent based on job title and company characteristics
  let buyingIntent: "Low" | "Medium" | "High" = "Medium";
  
  if (JOB_TITLES.executive.some(title => jobTitle.includes(title))) {
    buyingIntent = "High";
  } else if (JOB_TITLES.engineering.some(title => jobTitle.includes(title))) {
    buyingIntent = "Medium";
  }

  return {
    companyName: company.name,
    contactName,
    jobTitle,
    email,
    phone: null,
    companySize: company.size,
    industry: company.industry,
    location: company.location,
    website: `https://${company.website}`,
    fundingInfo: company.funding,
    techStack,
    recentActivity,
    buyingIntent,
    priority: baseScore >= 75 ? "hot" : baseScore >= 50 ? "warm" : "cold",
    employeeCount: getEmployeeCountFromSize(company.size),
    budgetRange: generateBudgetRange(company.size, company.funding),
    decisionTimeline: generateDecisionTimeline(jobTitle),
    aiInsights: null
  };
}

function calculateInitialScore(company: any, jobTitle: string, criteria: ProspectingCriteria): number {
  let score = 60; // Base score

  // Company size scoring
  const sizeScores: Record<string, number> = {
    '1-10': 40,
    '11-50': 55,
    '51-200': 70,
    '201-500': 80,
    '501-1000': 85,
    '1001-5000': 90,
    '5000+': 75
  };
  score += (sizeScores[company.size] - 60) * 0.3;

  // Industry scoring
  const highValueIndustries = ['Financial Technology', 'SaaS', 'Cloud Computing', 'Data Analytics'];
  if (highValueIndustries.includes(company.industry)) {
    score += 15;
  }

  // Job title scoring
  if (JOB_TITLES.executive.some(title => jobTitle.includes(title))) {
    score += 20;
  } else if (JOB_TITLES.engineering.some(title => jobTitle.includes(title))) {
    score += 10;
  }

  // Funding stage scoring
  if (company.funding.includes('Series') || company.funding.includes('IPO')) {
    score += 10;
  }

  return Math.min(100, Math.max(20, Math.round(score)));
}

function getEmployeeCountFromSize(size: string): number {
  const sizeMap: Record<string, number> = {
    '1-10': 5,
    '11-50': 30,
    '51-200': 125,
    '201-500': 350,
    '501-1000': 750,
    '1001-5000': 3000,
    '5000+': 8000
  };
  return sizeMap[size] || 100;
}

function generateBudgetRange(size: string, funding: string): string {
  if (size === '5000+' || funding === 'IPO') {
    return '$500K-$2M+';
  } else if (size === '1001-5000' || funding.includes('Series')) {
    return '$100K-$500K';
  } else if (size === '501-1000') {
    return '$50K-$200K';
  } else if (size === '201-500') {
    return '$25K-$100K';
  } else {
    return '$10K-$50K';
  }
}

function generateDecisionTimeline(jobTitle: string): string {
  if (JOB_TITLES.executive.some(title => jobTitle.includes(title))) {
    return '1-3 months';
  } else if (JOB_TITLES.engineering.some(title => jobTitle.includes(title))) {
    return '3-6 months';
  } else {
    return '6-12 months';
  }
}

function calculateProspectingConfidence(leads: InsertLead[], criteria: ProspectingCriteria): number {
  let confidence = 70; // Base confidence

  // Higher confidence with more specific criteria
  if (criteria.companySize.length > 0) confidence += 5;
  if (criteria.location.length > 0) confidence += 5;
  if (criteria.techStack.length > 0) confidence += 10;
  if (criteria.fundingStage.length > 0) confidence += 10;
  if (criteria.jobTitles.length > 0) confidence += 10;

  // Quality of generated leads
  const avgScore = leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length;
  if (avgScore >= 75) confidence += 10;
  else if (avgScore >= 60) confidence += 5;

  return Math.min(100, confidence);
}

export async function prospectByIndustryAndCriteria(
  industry: string,
  companySize: string[] = [],
  jobTitles: string[] = [],
  techStack: string[] = [],
  limit: number = 10
): Promise<ProspectingResult> {
  const criteria: ProspectingCriteria = {
    industry,
    companySize,
    location: [],
    techStack,
    fundingStage: [],
    jobTitles,
    limit
  };

  return intelligentProspecting(criteria);
}

export async function prospectHighValueTargets(limit: number = 10): Promise<ProspectingResult> {
  const criteria: ProspectingCriteria = {
    industry: 'Technology',
    companySize: ['501-1000', '1001-5000', '5000+'],
    location: [],
    techStack: ['React', 'Node.js', 'AWS', 'Kubernetes'],
    fundingStage: ['Series B', 'Series C', 'Series D', 'IPO'],
    jobTitles: ['CEO', 'CTO', 'VP Engineering', 'VP Sales'],
    limit
  };

  return intelligentProspecting(criteria);
}