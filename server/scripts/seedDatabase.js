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
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo.svg",
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

