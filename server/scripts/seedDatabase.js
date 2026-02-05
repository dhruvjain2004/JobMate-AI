import "dotenv/config";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";

const companySeeds = [
  {
    key: "naukriverse",
    name: "NaukriVerse Labs",
    email: "labs@naukriverse.com",
    password: "Recruiter@123",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=200&q=80",
  },
  {
    key: "futurehire",
    name: "FutureHire",
    email: "hello@futurehire.co",
    password: "Future@123",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=200&q=80",
  },
  {
    key: "slack",
    name: "Slack",
    email: "careers@slack.com",
    password: "Slack@123",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png",
  },
  {
    key: "amazon",
    name: "Amazon",
    email: "talent@amazon.com",
    password: "Amazon@123",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    key: "meta",
    name: "Meta",
    email: "jobs@meta.com",
    password: "Meta@123",
    image:
      "https://www.uctoday.com/wp-content/uploads/2021/12/What-is-Meta.jpg",
  },
];

const baseResponsibilities = [
  "Collaborate with cross-functional teams to deliver high-quality work",
  "Own feature development from discovery to rollout",
  "Continuously improve code quality, observability, and performance",
];

const baseSkills = [
  "Excellent communication",
  "Ownership mindset",
  "Ability to work in fast-paced environments",
];

const extendedJobSeeds = [
  {
    title: "Frontend Engineer",
    description:
      "<p>Lead the UI engineering roadmap for our candidate experience pod.</p>",
    keyResponsibilities: [
      "Build high-quality React components with accessibility in mind",
      "Collaborate with designers to ship experiments quickly",
      ...baseResponsibilities,
    ],
    skillsRequired: ["React", "TypeScript", "TailwindCSS", "REST APIs"],
    location: "Remote / Bengaluru",
    category: "Programming",
    level: "Mid Level",
    salary: 1800000,
    companyKey: "naukriverse",
  },
  {
    title: "Senior Backend Engineer",
    description: "<p>Own large parts of our job-matching platform.</p>",
    keyResponsibilities: [
      "Design and implement Node.js microservices",
      "Mentor junior engineers and lead tech deep-dives",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Node.js", "MongoDB", "AWS", "Microservices"],
    location: "Gurugram",
    category: "Programming",
    level: "Senior Level",
    salary: 2600000,
    companyKey: "naukriverse",
  },
  {
    title: "Product Designer",
    description:
      "<p>Craft polished experiences for both job seekers and recruiters.</p>",
    keyResponsibilities: [
      "Drive discovery workshops with PMs and researchers",
      "Deliver high-fidelity UI flows in Figma",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Figma", "User Research", "Design Systems"],
    location: "Mumbai",
    category: "Designing",
    level: "Mid Level",
    salary: 1500000,
    companyKey: "futurehire",
  },
  {
    title: "Talent Acquisition Partner",
    description:
      "<p>Help Fortune 500 customers hire quickly through curated shortlists.</p>",
    keyResponsibilities: [
      "Manage end-to-end recruitment for technology roles",
      "Build relationships with hiring managers",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Stakeholder Management", "Sourcing", "Interviewing"],
    location: "Remote",
    category: "Human Resources",
    level: "Mid Level",
    salary: 1200000,
    companyKey: "futurehire",
  },
  {
    title: "Full Stack Developer",
    description:
      "<p>Build and ship highly responsive web applications used by millions of candidates.</p>",
    keyResponsibilities: [
      "Design user-friendly interfaces using React",
      "Develop and maintain REST/GraphQL APIs",
      ...baseResponsibilities,
    ],
    skillsRequired: ["React", "Node.js", "MongoDB", "Testing"],
    location: "California",
    category: "Programming",
    level: "Senior Level",
    salary: 8200000,
    companyKey: "slack",
  },
  {
    title: "Data Scientist",
    description:
      "<p>Drive business decisions using data and build predictive models for hiring success.</p>",
    keyResponsibilities: [
      "Analyze large datasets to uncover trends",
      "Develop predictive models and present insights",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Python", "SQL", "Machine Learning", "Tableau"],
    location: "New York",
    category: "Data Science",
    level: "Intermediate Level",
    salary: 7200000,
    companyKey: "slack",
  },
  {
    title: "UI/UX Designer",
    description:
      "<p>Create intuitive digital experiences across job discovery, applications, and dashboards.</p>",
    keyResponsibilities: [
      "Conduct user research and usability testing",
      "Create wireframes, prototypes, and design systems",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Figma", "Design Systems", "User Research"],
    location: "Bangalore",
    category: "Designing",
    level: "Beginner Level",
    salary: 6100000,
    companyKey: "slack",
  },
  {
    title: "DevOps Engineer",
    description:
      "<p>Automate deployments and keep our multi-region infrastructure healthy.</p>",
    keyResponsibilities: [
      "Automate deployment processes using CI/CD",
      "Manage AWS infrastructure with Terraform",
      ...baseResponsibilities,
    ],
    skillsRequired: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    location: "Washington",
    category: "Programming",
    level: "Senior Level",
    salary: 9000000,
    companyKey: "slack",
  },
  {
    title: "Mobile App Developer",
    description:
      "<p>Own the Android & iOS app experiences that job seekers rely on daily.</p>",
    keyResponsibilities: [
      "Build performant React Native screens",
      "Integrate with backend APIs securely",
      ...baseResponsibilities,
    ],
    skillsRequired: ["React Native", "TypeScript", "App Store Submission"],
    location: "Hyderabad",
    category: "Programming",
    level: "Intermediate Level",
    salary: 7500000,
    companyKey: "amazon",
  },
  {
    title: "Project Manager",
    description:
      "<p>Lead cross-functional squads to deliver hiring products on time.</p>",
    keyResponsibilities: [
      "Define project scope and success metrics",
      "Facilitate sprint planning and retrospectives",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Agile", "Stakeholder Management", "JIRA"],
    location: "Bangalore",
    category: "Management",
    level: "Senior Level",
    salary: 6000000,
    companyKey: "amazon",
  },
  {
    title: "Growth Marketing Manager",
    description:
      "<p>Own multi-channel campaigns to bring millions of candidates to NaukriVerse.</p>",
    keyResponsibilities: [
      "Design and execute performance marketing campaigns",
      "Analyze funnel metrics and optimize CAC",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Performance Marketing", "Google Ads", "Analytics"],
    location: "Remote",
    category: "Marketing",
    level: "Mid Level",
    salary: 5500000,
    companyKey: "meta",
  },
  {
    title: "Security Engineer",
    description:
      "<p>Keep our hiring platform secure by building proactive defenses.</p>",
    keyResponsibilities: [
      "Conduct security reviews and threat modeling",
      "Automate vulnerability detection and remediation",
      ...baseResponsibilities,
    ],
    skillsRequired: ["AppSec", "OWASP", "SAST/DAST", "Node.js"],
    location: "Chennai",
    category: "Cybersecurity",
    level: "Senior Level",
    salary: 8800000,
    companyKey: "meta",
  },
  // 30 New Jobs Added
  {
    title: "React Native Developer",
    description:
      "<p>Build cross-platform mobile applications for iOS and Android users.</p>",
    keyResponsibilities: [
      "Develop efficient React Native applications",
      "Optimize app performance and user experience",
      "Collaborate with backend teams on API integration",
      ...baseResponsibilities,
    ],
    skillsRequired: ["React Native", "JavaScript", "Mobile Development"],
    location: "Pune",
    category: "Programming",
    level: "Mid Level",
    salary: 1400000,
    companyKey: "naukriverse",
  },
  {
    title: "QA Automation Engineer",
    description:
      "<p>Build automated testing frameworks and ensure product quality.</p>",
    keyResponsibilities: [
      "Design and implement test automation frameworks",
      "Execute manual and automated test cases",
      "Report and track bugs in bug tracking systems",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Selenium", "Python", "JIRA", "Test Planning"],
    location: "Bengaluru",
    category: "Quality Assurance",
    level: "Mid Level",
    salary: 1100000,
    companyKey: "naukriverse",
  },
  {
    title: "Business Analyst",
    description:
      "<p>Gather requirements and translate them into technical specifications.</p>",
    keyResponsibilities: [
      "Conduct stakeholder interviews to understand requirements",
      "Create detailed business specifications and documentation",
      "Work with technical teams to implement solutions",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Requirements Gathering", "Documentation", "SQL"],
    location: "Hyderabad",
    category: "Business Analyst",
    level: "Intermediate Level",
    salary: 1000000,
    companyKey: "futurehire",
  },
  {
    title: "Machine Learning Engineer",
    description:
      "<p>Build intelligent algorithms to match candidates with jobs.</p>",
    keyResponsibilities: [
      "Design and implement ML models for job matching",
      "Conduct A/B tests to measure model impact",
      "Optimize model performance and inference speed",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Python", "TensorFlow", "Machine Learning", "SQL"],
    location: "Remote",
    category: "Data Science",
    level: "Senior Level",
    salary: 2200000,
    companyKey: "futurehire",
  },
  {
    title: "Cloud Infrastructure Engineer",
    description:
      "<p>Manage and optimize cloud infrastructure for scalability.</p>",
    keyResponsibilities: [
      "Design cloud architecture on AWS/GCP",
      "Implement infrastructure as code using Terraform",
      "Monitor and optimize cloud costs",
      ...baseResponsibilities,
    ],
    skillsRequired: ["AWS", "Terraform", "Docker", "Kubernetes"],
    location: "Gurugram",
    category: "Programming",
    level: "Senior Level",
    salary: 2000000,
    companyKey: "slack",
  },
  {
    title: "Product Manager",
    description:
      "<p>Drive product vision and roadmap for our hiring platform.</p>",
    keyResponsibilities: [
      "Define product strategy and roadmap",
      "Work with design and engineering to ship features",
      "Analyze user feedback and metrics to drive decisions",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Product Strategy", "Analytics", "Communication"],
    location: "Bangalore",
    category: "Product Management",
    level: "Senior Level",
    salary: 1800000,
    companyKey: "slack",
  },
  {
    title: "Graphic Designer",
    description:
      "<p>Create stunning visual assets for our marketing and product.</p>",
    keyResponsibilities: [
      "Design marketing collateral and social media assets",
      "Create UI elements and design system components",
      "Collaborate with product teams on visual design",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Adobe Creative Suite", "Figma", "Design Principles"],
    location: "Mumbai",
    category: "Designing",
    level: "Mid Level",
    salary: 900000,
    companyKey: "amazon",
  },
  {
    title: "Content Writer",
    description:
      "<p>Create engaging content that resonates with job seekers and recruiters.</p>",
    keyResponsibilities: [
      "Write blog posts, guides, and email campaigns",
      "Develop content strategy and editorial calendar",
      "Optimize content for SEO and engagement",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Content Writing", "SEO", "Email Marketing"],
    location: "Remote",
    category: "Marketing",
    level: "Beginner Level",
    salary: 600000,
    companyKey: "amazon",
  },
  {
    title: "Database Administrator",
    description:
      "<p>Maintain and optimize database performance for millions of records.</p>",
    keyResponsibilities: [
      "Manage MongoDB and PostgreSQL databases",
      "Implement backup and disaster recovery strategies",
      "Optimize database queries and indexes",
      ...baseResponsibilities,
    ],
    skillsRequired: ["MongoDB", "PostgreSQL", "SQL", "Backup & Recovery"],
    location: "Pune",
    category: "Programming",
    level: "Senior Level",
    salary: 1600000,
    companyKey: "meta",
  },
  {
    title: "UX Researcher",
    description:
      "<p>Understand user behavior through research to drive product improvements.</p>",
    keyResponsibilities: [
      "Conduct user interviews and usability testing sessions",
      "Analyze research data and create insights reports",
      "Collaborate with product teams on findings",
      ...baseResponsibilities,
    ],
    skillsRequired: ["User Research", "Qualitative Analysis", "Communication"],
    location: "Bangalore",
    category: "Designing",
    level: "Mid Level",
    salary: 1200000,
    companyKey: "naukriverse",
  },
  {
    title: "Integration Engineer",
    description:
      "<p>Build integrations with third-party platforms and services.</p>",
    keyResponsibilities: [
      "Design and implement API integrations",
      "Troubleshoot integration issues and bugs",
      "Document integration processes and specifications",
      ...baseResponsibilities,
    ],
    skillsRequired: ["REST APIs", "Node.js", "Integration Testing"],
    location: "Hyderabad",
    category: "Programming",
    level: "Mid Level",
    salary: 1300000,
    companyKey: "futurehire",
  },
  {
    title: "Performance Marketing Specialist",
    description:
      "<p>Optimize marketing campaigns for maximum ROI and conversions.</p>",
    keyResponsibilities: [
      "Manage paid advertising campaigns across channels",
      "Monitor and optimize campaign metrics",
      "Conduct A/B testing to improve conversions",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Google Ads", "Facebook Ads", "Analytics"],
    location: "Delhi",
    category: "Marketing",
    level: "Intermediate Level",
    salary: 1100000,
    companyKey: "slack",
  },
  {
    title: "Customer Success Manager",
    description:
      "<p>Ensure our recruiter customers achieve their hiring goals.</p>",
    keyResponsibilities: [
      "Onboard new customers and provide training",
      "Monitor customer health and identify upsell opportunities",
      "Gather feedback and communicate with product team",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Customer Success", "Communication", "Sales"],
    location: "Remote",
    category: "Customer Success",
    level: "Mid Level",
    salary: 900000,
    companyKey: "amazon",
  },
  {
    title: "Infrastructure Security Engineer",
    description:
      "<p>Build secure infrastructure and protect against cyber threats.</p>",
    keyResponsibilities: [
      "Implement security best practices across infrastructure",
      "Conduct security audits and penetration testing",
      "Respond to security incidents and vulnerabilities",
      ...baseResponsibilities,
    ],
    skillsRequired: ["AWS Security", "Incident Response", "SIEM Tools"],
    location: "Bangalore",
    category: "Cybersecurity",
    level: "Senior Level",
    salary: 2100000,
    companyKey: "meta",
  },
  {
    title: "API Developer",
    description:
      "<p>Build robust REST and GraphQL APIs used by millions.</p>",
    keyResponsibilities: [
      "Design and implement scalable APIs",
      "Implement API documentation and versioning",
      "Optimize API performance and reliability",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Node.js", "REST APIs", "GraphQL", "API Design"],
    location: "Gurugram",
    category: "Programming",
    level: "Senior Level",
    salary: 1700000,
    companyKey: "naukriverse",
  },
  {
    title: "Technical Writer",
    description:
      "<p>Create clear technical documentation for developers and users.</p>",
    keyResponsibilities: [
      "Write API documentation and user guides",
      "Create code samples and tutorials",
      "Maintain documentation accuracy and completeness",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Technical Writing", "Markdown", "API Documentation"],
    location: "Remote",
    category: "Documentation",
    level: "Intermediate Level",
    salary: 800000,
    companyKey: "futurehire",
  },
  {
    title: "Solutions Architect",
    description:
      "<p>Design end-to-end solutions for enterprise customers.</p>",
    keyResponsibilities: [
      "Understand customer requirements and design solutions",
      "Create architecture diagrams and specifications",
      "Lead technical discussions with stakeholders",
      ...baseResponsibilities,
    ],
    skillsRequired: ["System Design", "Architecture", "Cloud Platforms"],
    location: "Bangalore",
    category: "Architecture",
    level: "Senior Level",
    salary: 2300000,
    companyKey: "slack",
  },
  {
    title: "Frontend QA Engineer",
    description:
      "<p>Ensure excellent user experience through comprehensive testing.</p>",
    keyResponsibilities: [
      "Test frontend functionality across browsers and devices",
      "Create automated test suites for UI components",
      "Report bugs with detailed reproduction steps",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Selenium", "JavaScript", "Cross-browser Testing"],
    location: "Hyderabad",
    category: "Quality Assurance",
    level: "Mid Level",
    salary: 1000000,
    companyKey: "amazon",
  },
  {
    title: "Analytics Engineer",
    description:
      "<p>Transform raw data into actionable business insights.</p>",
    keyResponsibilities: [
      "Build data pipelines and analytics models",
      "Create dashboards and reports for stakeholders",
      "Analyze trends and provide insights for decision-making",
      ...baseResponsibilities,
    ],
    skillsRequired: ["SQL", "Python", "Tableau", "Data Warehouse"],
    location: "Remote",
    category: "Data Science",
    level: "Mid Level",
    salary: 1400000,
    companyKey: "meta",
  },
  {
    title: "Compliance Officer",
    description:
      "<p>Ensure our platform complies with all regulations and policies.</p>",
    keyResponsibilities: [
      "Monitor regulatory requirements and updates",
      "Implement compliance policies and procedures",
      "Conduct compliance audits and training",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Compliance", "Risk Management", "Regulations"],
    location: "Bangalore",
    category: "Compliance",
    level: "Senior Level",
    salary: 1300000,
    companyKey: "naukriverse",
  },
  {
    title: "Web Performance Engineer",
    description:
      "<p>Optimize web performance to ensure lightning-fast load times.</p>",
    keyResponsibilities: [
      "Profile and optimize page load performance",
      "Implement caching and CDN strategies",
      "Monitor real user metrics and performance",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Performance Optimization", "Node.js", "Web Standards"],
    location: "Pune",
    category: "Programming",
    level: "Senior Level",
    salary: 1650000,
    companyKey: "futurehire",
  },
  {
    title: "Brand Manager",
    description:
      "<p>Build and maintain our brand identity across all touchpoints.</p>",
    keyResponsibilities: [
      "Develop brand strategy and guidelines",
      "Oversee brand marketing campaigns",
      "Manage brand partnerships and collaborations",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Brand Management", "Marketing Strategy", "Communication"],
    location: "Mumbai",
    category: "Marketing",
    level: "Senior Level",
    salary: 1200000,
    companyKey: "slack",
  },
  {
    title: "Senior Software Engineer",
    description:
      "<p>Lead technical initiatives and mentor engineering teams.</p>",
    keyResponsibilities: [
      "Lead design and implementation of major features",
      "Mentor junior engineers and conduct code reviews",
      "Drive technical excellence and best practices",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Software Design", "Leadership", "System Architecture"],
    location: "Bangalore",
    category: "Programming",
    level: "Senior Level",
    salary: 2400000,
    companyKey: "amazon",
  },
  {
    title: "HR Business Partner",
    description:
      "<p>Support business units with HR strategy and operations.</p>",
    keyResponsibilities: [
      "Provide HR guidance and support to business leaders",
      "Manage employee relations and performance issues",
      "Execute HR projects and initiatives",
      ...baseResponsibilities,
    ],
    skillsRequired: ["HR Management", "Employee Relations", "Communication"],
    location: "Gurgaon",
    category: "Human Resources",
    level: "Mid Level",
    salary: 950000,
    companyKey: "meta",
  },
  {
    title: "Blockchain Developer",
    description:
      "<p>Build decentralized solutions using blockchain technology.</p>",
    keyResponsibilities: [
      "Design and implement smart contracts",
      "Develop blockchain-based applications",
      "Conduct security audits of blockchain code",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Solidity", "Blockchain", "Web3.js", "Smart Contracts"],
    location: "Remote",
    category: "Programming",
    level: "Senior Level",
    salary: 2500000,
    companyKey: "naukriverse",
  },
  {
    title: "Operations Manager",
    description:
      "<p>Manage day-to-day operations and improve efficiency.</p>",
    keyResponsibilities: [
      "Oversee operational processes and workflows",
      "Identify opportunities for process improvement",
      "Manage budgets and resources effectively",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Operations", "Process Management", "Analytics"],
    location: "Bangalore",
    category: "Operations",
    level: "Mid Level",
    salary: 1000000,
    companyKey: "futurehire",
  },
  {
    title: "Site Reliability Engineer",
    description:
      "<p>Ensure platform availability and reliability at scale.</p>",
    keyResponsibilities: [
      "Implement monitoring and alerting systems",
      "Respond to incidents and post-mortems",
      "Improve system reliability and resilience",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Monitoring Tools", "Linux", "On-call Support"],
    location: "Hyderabad",
    category: "DevOps",
    level: "Senior Level",
    salary: 1900000,
    companyKey: "slack",
  },
  {
    title: "Email Marketing Specialist",
    description:
      "<p>Create engaging email campaigns that drive conversions.</p>",
    keyResponsibilities: [
      "Design and execute email marketing campaigns",
      "Analyze email metrics and optimize performance",
      "Segment audiences and personalize content",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Email Marketing", "Marketing Automation", "Analytics"],
    location: "Remote",
    category: "Marketing",
    level: "Beginner Level",
    salary: 700000,
    companyKey: "amazon",
  },
  {
    title: "Research Scientist",
    description:
      "<p>Conduct research on emerging technologies and methodologies.</p>",
    keyResponsibilities: [
      "Design and conduct research experiments",
      "Publish research findings and insights",
      "Collaborate with academic institutions",
      ...baseResponsibilities,
    ],
    skillsRequired: ["Research", "Machine Learning", "Data Science"],
    location: "Bangalore",
    category: "Research",
    level: "Senior Level",
    salary: 2700000,
    companyKey: "meta",
  },
  {
    title: "Accessibility Engineer",
    description:
      "<p>Build inclusive experiences for all users.</p>",
    keyResponsibilities: [
      "Implement WCAG accessibility standards",
      "Conduct accessibility audits and testing",
      "Guide teams on accessibility best practices",
      ...baseResponsibilities,
    ],
    skillsRequired: ["WCAG", "Accessibility Testing", "Frontend Development"],
    location: "Pune",
    category: "Programming",
    level: "Mid Level",
    salary: 1250000,
    companyKey: "naukriverse",
  },
];

const ensureCompany = async (companySeed) => {
  let company = await Company.findOne({ email: companySeed.email });
  if (company) return company;

  const hashed = await bcrypt.hash(companySeed.password, 10);
  company = await Company.create({
    name: companySeed.name,
    email: companySeed.email,
    image: companySeed.image,
    password: hashed,
  });
  return company;
};

const findOrCreateJob = async (payload) => {
  const exists = await Job.findOne({
    title: payload.title,
    companyId: payload.companyId,
  });
  if (exists) return null;
  const job = await Job.create(payload);
  return job;
};

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Please set it in server/.env");
    }

    await connectDB();

    const savedCompaniesEntries = await Promise.all(
      companySeeds.map(async (seed) => ({
        key: seed.key,
        doc: await ensureCompany(seed),
      }))
    );
    const companiesMap = savedCompaniesEntries.reduce((acc, curr) => {
      acc[curr.key] = curr.doc;
      return acc;
    }, {});

    let insertedCount = 0;
    for (const job of extendedJobSeeds) {
      const company = companiesMap[job.companyKey];
      if (!company) continue;
      const payload = {
        title: job.title,
        description: job.description,
        keyResponsibilities: job.keyResponsibilities,
        skillsRequired: job.skillsRequired || baseSkills,
        location: job.location,
        category: job.category,
        level: job.level,
        salary: job.salary,
        companyId: company._id,
        date: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 40),
      };
      const created = await findOrCreateJob(payload);
      if (created) insertedCount += 1;
    }

    console.log(
      insertedCount > 0
        ? `Inserted ${insertedCount} new job(s) across ${Object.keys(companiesMap).length} companies ✅`
        : "Seed skipped — all jobs already exist ✅"
    );
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();

