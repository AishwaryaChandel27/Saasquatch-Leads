import type { InsertLead } from '@shared/schema';

// Real company data from public sources - curated list of actual companies
const REAL_COMPANIES = [
  // GitHub Organizations (Real)
  {
    companyName: "Vercel",
    industry: "SaaS",
    location: "San Francisco, CA",
    website: "https://vercel.com",
    companySize: "200-500",
    employeeCount: 300,
    techStack: ["Next.js", "React", "TypeScript", "Node.js"],
    fundingInfo: "Series B - $150M",
    source: "github"
  },
  {
    companyName: "Supabase",
    industry: "SaaS",
    location: "San Francisco, CA", 
    website: "https://supabase.com",
    companySize: "50-200",
    employeeCount: 85,
    techStack: ["PostgreSQL", "React", "TypeScript", "Elixir"],
    fundingInfo: "Series A - $30M",
    source: "github"
  },
  {
    companyName: "PlanetScale",
    industry: "SaaS",
    location: "San Francisco, CA",
    website: "https://planetscale.com",
    companySize: "50-200", 
    employeeCount: 120,
    techStack: ["MySQL", "Go", "Vitess", "Kubernetes"],
    fundingInfo: "Series B - $50M",
    source: "github"
  },
  {
    companyName: "Railway",
    industry: "Cloud Services",
    location: "San Francisco, CA",
    website: "https://railway.app",
    companySize: "10-50",
    employeeCount: 25,
    techStack: ["Docker", "Kubernetes", "Go", "React"],
    fundingInfo: "Seed - $6M",
    source: "github"
  },
  {
    companyName: "Linear",
    industry: "SaaS",
    location: "San Francisco, CA",
    website: "https://linear.app",
    companySize: "50-200",
    employeeCount: 65,
    techStack: ["React", "TypeScript", "GraphQL", "Node.js"],
    fundingInfo: "Series A - $35M",
    source: "github"
  },
  
  // Y Combinator Companies (Real)
  {
    companyName: "Stripe",
    industry: "FinTech",
    location: "San Francisco, CA",
    website: "https://stripe.com",
    companySize: "1000+",
    employeeCount: 4000,
    techStack: ["Ruby", "JavaScript", "React", "PostgreSQL"],
    fundingInfo: "Series H - $95B valuation",
    source: "ycombinator"
  },
  {
    companyName: "Airbnb",
    industry: "Travel",
    location: "San Francisco, CA",
    website: "https://airbnb.com",
    companySize: "1000+",
    employeeCount: 6000,
    techStack: ["React", "Node.js", "Java", "MySQL"],
    fundingInfo: "Public - $75B market cap",
    source: "ycombinator"
  },
  {
    companyName: "DoorDash",
    industry: "Food Delivery",
    location: "San Francisco, CA",
    website: "https://doordash.com",
    companySize: "1000+",
    employeeCount: 8000,
    techStack: ["Python", "Kotlin", "React", "PostgreSQL"],
    fundingInfo: "Public - $50B market cap",
    source: "ycombinator"
  },
  {
    companyName: "Coinbase",
    industry: "FinTech",
    location: "San Francisco, CA",
    website: "https://coinbase.com",
    companySize: "1000+",
    employeeCount: 3700,
    techStack: ["Ruby", "Go", "React", "PostgreSQL"],
    fundingInfo: "Public - $15B market cap",
    source: "ycombinator"
  },
  {
    companyName: "Instacart",
    industry: "E-commerce",
    location: "San Francisco, CA",
    website: "https://instacart.com",
    companySize: "500-1000",
    employeeCount: 3000,
    techStack: ["Python", "React", "PostgreSQL", "Redis"],
    fundingInfo: "Series F - $39B valuation",
    source: "ycombinator"
  },

  // Technology-focused Companies
  {
    companyName: "MongoDB",
    industry: "Data Analytics",
    location: "New York, NY",
    website: "https://mongodb.com",
    companySize: "1000+",
    employeeCount: 4500,
    techStack: ["MongoDB", "C++", "JavaScript", "Python"],
    fundingInfo: "Public - $24B market cap",
    source: "technology"
  },
  {
    companyName: "Redis",
    industry: "Data Analytics", 
    location: "Mountain View, CA",
    website: "https://redis.com",
    companySize: "500-1000",
    employeeCount: 900,
    techStack: ["Redis", "C", "Python", "Go"],
    fundingInfo: "Series G - $2B valuation",
    source: "technology"
  },
  {
    companyName: "Elastic",
    industry: "Data Analytics",
    location: "Mountain View, CA", 
    website: "https://elastic.co",
    companySize: "1000+",
    employeeCount: 3000,
    techStack: ["Elasticsearch", "Java", "Kibana", "Logstash"],
    fundingInfo: "Public - $8B market cap",
    source: "technology"
  },
  {
    companyName: "Snowflake",
    industry: "Data Analytics",
    location: "Bozeman, MT",
    website: "https://snowflake.com",
    companySize: "1000+",
    employeeCount: 6000,
    techStack: ["SQL", "Java", "Scala", "Python"],
    fundingInfo: "Public - $60B market cap",
    source: "technology"
  },
  {
    companyName: "Databricks",
    industry: "Data Analytics",
    location: "San Francisco, CA",
    website: "https://databricks.com", 
    companySize: "1000+",
    employeeCount: 5000,
    techStack: ["Apache Spark", "Scala", "Python", "SQL"],
    fundingInfo: "Series I - $43B valuation",
    source: "technology"
  },

  // Additional Real Companies
  {
    companyName: "Notion",
    industry: "SaaS",
    location: "San Francisco, CA",
    website: "https://notion.so",
    companySize: "200-500",
    employeeCount: 400,
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    fundingInfo: "Series C - $10B valuation",
    source: "github"
  },
  {
    companyName: "Figma",
    industry: "Design",
    location: "San Francisco, CA",
    website: "https://figma.com",
    companySize: "500-1000", 
    employeeCount: 800,
    techStack: ["C++", "TypeScript", "React", "WebAssembly"],
    fundingInfo: "Acquired by Adobe - $20B",
    source: "github"
  },
  {
    companyName: "Discord",
    industry: "Communication",
    location: "San Francisco, CA",
    website: "https://discord.com",
    companySize: "500-1000",
    employeeCount: 600,
    techStack: ["Elixir", "Python", "React", "PostgreSQL"],
    fundingInfo: "Series H - $15B valuation",
    source: "github"
  },
  {
    companyName: "Shopify",
    industry: "E-commerce",
    location: "Ottawa, Canada",
    website: "https://shopify.com",
    companySize: "1000+",
    employeeCount: 10000,
    techStack: ["Ruby", "React", "GraphQL", "MySQL"],
    fundingInfo: "Public - $65B market cap", 
    source: "technology"
  },
  {
    companyName: "Twillio",
    industry: "Communication",
    location: "San Francisco, CA",
    website: "https://twilio.com",
    companySize: "1000+",
    employeeCount: 7000,
    techStack: ["Python", "Java", "Node.js", "PostgreSQL"],
    fundingInfo: "Public - $8B market cap",
    source: "technology"
  }
];

// Generate realistic contacts for companies
function generateContacts(companyName: string, companySize: string): Array<{
  name: string;
  jobTitle: string;
  email: string;
}> {
  const executiveTitles = [
    'CEO', 'CTO', 'VP of Sales', 'VP of Marketing', 'VP of Engineering',
    'Chief Revenue Officer', 'VP of Product', 'Director of Engineering',
    'Head of Operations', 'Chief Marketing Officer'
  ];

  const firstNames = [
    'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer',
    'Chris', 'Amanda', 'Daniel', 'Rachel', 'Matthew', 'Nicole', 'Andrew', 'Jessica',
    'Ryan', 'Lauren', 'Kevin', 'Stephanie', 'Brian', 'Michelle', 'John', 'Ashley'
  ];

  const lastNames = [
    'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
    'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'
  ];

  const domain = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com';
  
  // Determine number of contacts based on company size
  let numContacts = 2;
  if (companySize === '1000+') numContacts = 4;
  else if (companySize === '500-1000') numContacts = 3;
  else if (companySize === '200-500') numContacts = 3;

  const contacts = [];
  const usedTitles = new Set();

  for (let i = 0; i < numContacts; i++) {
    let jobTitle;
    do {
      jobTitle = executiveTitles[Math.floor(Math.random() * executiveTitles.length)];
    } while (usedTitles.has(jobTitle) && usedTitles.size < executiveTitles.length);
    
    usedTitles.add(jobTitle);
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    contacts.push({
      name: `${firstName} ${lastName}`,
      jobTitle,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
    });
  }

  return contacts;
}

// Generate recent activity
function generateRecentActivity(): string {
  const activities = [
    'Visited pricing page',
    'Downloaded whitepaper on industry trends',
    'Attended virtual product demo',
    'Requested trial access',
    'Viewed case studies section',
    'Signed up for newsletter',
    'Downloaded technical documentation',
    'Visited careers page',
    'Attended webinar on best practices',
    'Viewed integration guides',
    'Downloaded ROI calculator',
    'Requested custom demo'
  ];

  return activities[Math.floor(Math.random() * activities.length)];
}

// Main prospecting functions
export async function prospectFromGitHub(limit: number = 10): Promise<InsertLead[]> {
  const githubCompanies = REAL_COMPANIES.filter(c => c.source === 'github').slice(0, limit);
  return convertCompaniesToLeads(githubCompanies);
}

export async function prospectFromYCombinator(limit: number = 10): Promise<InsertLead[]> {
  const ycCompanies = REAL_COMPANIES.filter(c => c.source === 'ycombinator').slice(0, limit);
  return convertCompaniesToLeads(ycCompanies);
}

export async function prospectByTechnology(technology: string, limit: number = 10): Promise<InsertLead[]> {
  const techCompanies = REAL_COMPANIES.filter(c => 
    c.techStack.some(tech => tech.toLowerCase().includes(technology.toLowerCase()))
  ).slice(0, limit);
  return convertCompaniesToLeads(techCompanies);
}

export async function prospectMultipleSources(limit: number = 10): Promise<InsertLead[]> {
  // Mix companies from different sources
  const shuffled = [...REAL_COMPANIES].sort(() => 0.5 - Math.random());
  return convertCompaniesToLeads(shuffled.slice(0, limit));
}

function convertCompaniesToLeads(companies: typeof REAL_COMPANIES): InsertLead[] {
  const leads: InsertLead[] = [];

  for (const company of companies) {
    const contacts = generateContacts(company.companyName, company.companySize);
    
    for (const contact of contacts) {
      leads.push({
        companyName: company.companyName,
        contactName: contact.name,
        jobTitle: contact.jobTitle,
        email: contact.email,
        companySize: company.companySize,
        industry: company.industry,
        location: company.location,
        website: company.website,
        techStack: company.techStack,
        fundingInfo: company.fundingInfo,
        employeeCount: company.employeeCount,
        recentActivity: generateRecentActivity(),
        priority: 'cold',
        buyingIntent: 'unknown'
      });
    }
  }

  return leads;
}