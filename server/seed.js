require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Opportunity = require('./models/Opportunity');
const Application = require('./models/Application');

const sampleOpportunities = [
  {
    title: 'Full-Stack Web Development Intern',
    companyName: 'TechNova Solutions',
    domain: 'Web Development',
    location: 'Bangalore (Hybrid)',
    experience: 'Fresher (0 Years)',
    type: 'Internship',
    stipendOrSalary: '₹25,000 / month',
    description: 'Join our product engineering team to build scalable web applications using React.js, Node.js, Express, and MongoDB. Collaborate on REST API design and responsive UI components.',
    applicationLink: 'https://technova.example.com/careers/fullstack-intern'
  },
  {
    title: 'Frontend React Developer',
    companyName: 'PixelCraft Studios',
    domain: 'Web Development',
    location: 'Remote',
    experience: '0–1 Years',
    type: 'Full-Time',
    stipendOrSalary: '₹6.5 – ₹8.5 LPA',
    description: 'Build modern customer-facing dashboards using React.js, Vite, and responsive CSS architecture.',
    applicationLink: 'https://pixelcraft.example.com/jobs/frontend-react'
  },
  {
    title: 'Data Science & Analytics Intern',
    companyName: 'QuantEdge Analytics',
    domain: 'Data Science',
    location: 'Hyderabad (On-site)',
    experience: 'Fresher (0 Years)',
    type: 'Internship',
    stipendOrSalary: '₹30,000 / month',
    description: 'Work with financial and retail datasets using Python, Pandas, SQL, and Scikit-Learn to build predictive customer churn models.',
    applicationLink: 'https://quantedge.example.com/careers/data-science-intern'
  },
  {
    title: 'Junior Data Scientist',
    companyName: 'DataPulse Corp',
    domain: 'Data Science',
    location: 'Pune (Hybrid)',
    experience: '1–2 Years',
    type: 'Full-Time',
    stipendOrSalary: '₹9.0 – ₹12.0 LPA',
    description: 'Design statistical models, A/B testing frameworks, and time-series forecasting pipelines using Python and SQL.',
    applicationLink: 'https://datapulse.example.com/careers/jr-data-scientist'
  },
  {
    title: 'AI/ML Research & Engineering Intern',
    companyName: 'NeuroSync AI Labs',
    domain: 'Artificial Intelligence',
    location: 'Bangalore (On-site)',
    experience: 'Fresher / Final Year Student',
    type: 'Internship',
    stipendOrSalary: '₹35,000 / month',
    description: 'Assist in fine-tuning LLMs, RAG pipelines, and computer vision models using PyTorch and Hugging Face.',
    applicationLink: 'https://neurosync.example.com/careers/aiml-intern'
  },
  {
    title: 'Machine Learning Engineer (NLP)',
    companyName: 'CogniVerse Technologies',
    domain: 'Artificial Intelligence',
    location: 'Remote',
    experience: '1–3 Years',
    type: 'Full-Time',
    stipendOrSalary: '₹12.0 – ₹16.0 LPA',
    description: 'Build production NLP microservices, vector search indexing, and conversational AI agents.',
    applicationLink: 'https://cogniverse.example.com/jobs/ml-engineer-nlp'
  },
  {
    title: 'Product UI/UX Design Intern',
    companyName: 'Aura Design Collective',
    domain: 'UI/UX Design',
    location: 'Mumbai (Hybrid)',
    experience: 'Fresher (Portfolio Required)',
    type: 'Internship',
    stipendOrSalary: '₹20,000 / month',
    description: 'Conduct user research, create wireframes, interactive Figma prototypes, and maintain our design system.',
    applicationLink: 'https://auradesign.example.com/internships/ui-ux'
  },
  {
    title: 'Backend Java & Spring Boot Developer',
    companyName: 'FinCore Enterprise Systems',
    domain: 'Java Development',
    location: 'Chennai (On-site)',
    experience: '0–2 Years',
    type: 'Full-Time',
    stipendOrSalary: '₹7.0 – ₹10.0 LPA',
    description: 'Develop high-throughput enterprise microservices using Java 17, Spring Boot, Hibernate, and RESTful APIs.',
    applicationLink: 'https://fincore.example.com/careers/java-backend-dev'
  },
  {
    title: 'Digital Marketing & Growth Intern',
    companyName: 'GrowthHive Media',
    domain: 'Digital Marketing',
    location: 'Delhi NCR (Hybrid)',
    experience: 'Fresher (0 Years)',
    type: 'Internship',
    stipendOrSalary: '₹15,000 / month',
    description: 'Drive organic and paid acquisition campaigns across SEO, Google Ads, LinkedIn, and content marketing.',
    applicationLink: 'https://growthhive.example.com/careers/digital-marketing-intern'
  },
  {
    title: 'Cloud & DevOps Engineering Intern',
    companyName: 'SkyScale Infrastructure',
    domain: 'Cloud & DevOps',
    location: 'Hyderabad (Hybrid)',
    experience: 'Fresher (0–1 Years)',
    type: 'Internship',
    stipendOrSalary: '₹28,000 / month',
    description: 'Automate CI/CD pipelines using GitHub Actions, Docker, Kubernetes, and AWS.',
    applicationLink: 'https://skyscale.example.com/careers/devops-intern'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing collections...');
    await Application.deleteMany({});
    await Opportunity.deleteMany({});
    await User.deleteMany({});

    console.log('Creating users...');
    const adminUser = await User.create({
      name: 'Portal Administrator',
      email: 'admin@careerlaunch.com',
      password: 'Admin@12345',
      role: 'admin'
    });

    const candidateUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.edu',
      password: 'Candidate@12345',
      role: 'user'
    });

    const candidateUser2 = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@example.edu',
      password: 'Candidate@12345',
      role: 'user'
    });

    console.log(`Created admin (${adminUser.email}) and 2 candidate users.`);

    const opportunitiesWithAdmin = sampleOpportunities.map((opp) => ({
      ...opp,
      createdBy: adminUser._id
    }));

    const createdOpportunities = await Opportunity.insertMany(opportunitiesWithAdmin);
    console.log(`Seeded ${createdOpportunities.length} opportunities.`);

    const firstOpp = createdOpportunities[0];
    const secondOpp = createdOpportunities[2];

    await Application.insertMany([
      {
        opportunityId: firstOpp._id,
        opportunity: firstOpp._id,
        userId: candidateUser._id,
        opportunitySnapshot: {
          title: firstOpp.title,
          companyName: firstOpp.companyName,
          domain: firstOpp.domain,
          location: firstOpp.location,
          type: firstOpp.type
        },
        applicantName: candidateUser.name,
        email: candidateUser.email,
        phone: '+91 9876543210',
        resumeLink: 'https://drive.google.com/file/d/sample-aarav-resume/view',
        coverLetter: 'Built multiple MERN stack projects and excited to contribute to TechNova Solutions.',
        status: 'Reviewing',
        adminNotes: 'Strong frontend portfolio. Scheduling initial tech screening.',
        appliedAt: new Date(Date.now() - 86400000)
      },
      {
        opportunityId: secondOpp._id,
        opportunity: secondOpp._id,
        userId: candidateUser2._id,
        opportunitySnapshot: {
          title: secondOpp.title,
          companyName: secondOpp.companyName,
          domain: secondOpp.domain,
          location: secondOpp.location,
          type: secondOpp.type
        },
        applicantName: candidateUser2.name,
        email: candidateUser2.email,
        phone: '+91 9123456780',
        resumeLink: 'https://drive.google.com/file/d/sample-priya-resume/view',
        coverLetter: 'Experienced in Python, SQL, and predictive modeling.',
        status: 'Shortlisted',
        adminNotes: 'Excellent academic background and Kaggle project experience.',
        appliedAt: new Date()
      }
    ]);

    console.log('Seeded 2 sample applications with statuses.');
    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
