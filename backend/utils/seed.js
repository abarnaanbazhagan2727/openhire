const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const connectDB = require('../config/db');

dotenv.config();

const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seed] Clearing existing demo records...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await SavedJob.deleteMany({});

    console.log('[Seed] Creating demo users...');
    // 1. Create Demo Seeker
    const seeker = await User.create({
      name: 'Alex Rivera',
      email: 'seeker.demo@openhire.dev',
      password: 'Password123!',
      role: 'seeker',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'CSS', 'Python', 'Express.js'],
      education: 'B.Tech in Computer Science and Engineering, CGPA: 8.9',
      experience: 'Associate Full-Stack Developer with 2 years building web apps and REST APIs.',
      resumeUrl: 'https://openhire.dev/resumes/alex-rivera-cv.pdf',
      portfolio: 'https://alexrivera.dev',
      linkedin: 'https://linkedin.com/in/alex-rivera-openhire'
    });

    // 2. Create Demo Employers
    const employer1 = await User.create({
      name: 'Sarah Chen',
      email: 'employer.demo@openhire.dev',
      password: 'Password123!',
      role: 'employer',
      phone: '+91 98111 22334',
      location: 'Bangalore, India',
      companyName: 'TechNova Solutions',
      companyDescription: 'Pioneering intelligent enterprise cloud solutions, distributed infrastructure, and modern applications.',
      companyWebsite: 'https://technova.example.com',
      industry: 'Information Technology & Software',
      companySize: '250-500 employees'
    });

    const employer2 = await User.create({
      name: 'Vikram Malhotra',
      email: 'careers@datasphere.dev',
      password: 'Password123!',
      role: 'employer',
      phone: '+91 98222 33445',
      location: 'Chennai, India',
      companyName: 'DataSphere AI',
      companyDescription: 'Next-generation AI research lab building foundation models and data intelligence platforms.',
      companyWebsite: 'https://datasphere.dev',
      industry: 'Artificial Intelligence & Data',
      companySize: '100-250 employees'
    });

    const employer3 = await User.create({
      name: 'Elena Rostova',
      email: 'talent@cloudworks.dev',
      password: 'Password123!',
      role: 'employer',
      phone: '+91 98333 44556',
      location: 'Hyderabad, India',
      companyName: 'CloudWorks Systems',
      companyDescription: 'Enterprise multicloud orchestration and Kubernetes platform development.',
      companyWebsite: 'https://cloudworks.dev',
      industry: 'Cloud Computing & DevOps',
      companySize: '500+ employees'
    });

    const employer4 = await User.create({
      name: 'Marcus Thorne',
      email: 'design@innovent.dev',
      password: 'Password123!',
      role: 'employer',
      phone: '+91 98444 55667',
      location: 'Mumbai, India',
      companyName: 'Innovent Design Labs',
      companyDescription: 'Boutique digital product studio crafting high-converting UI/UX and brand architectures.',
      companyWebsite: 'https://innovent.dev',
      industry: 'UI/UX & Creative',
      companySize: '50-100 employees'
    });

    const employer5 = await User.create({
      name: 'Dr. Arthur Vance',
      email: 'security@nextgenlabs.dev',
      password: 'Password123!',
      role: 'employer',
      phone: '+91 98555 66778',
      location: 'Delhi NCR, India',
      companyName: 'NextGen Labs',
      companyDescription: 'Pioneering cybersecurity defense research and zero-trust infrastructure solutions.',
      companyWebsite: 'https://nextgenlabs.dev',
      industry: 'Cybersecurity',
      companySize: '100-250 employees'
    });

    console.log('[Seed] Creating demo jobs...');
    const now = new Date();
    const future30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const future45 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
    const past2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const jobsData = [
      {
        title: 'Full Stack JavaScript Developer',
        category: 'Software Development',
        company: 'TechNova Solutions',
        description: 'We are seeking an ambitious Full Stack Developer to build mission-critical enterprise dashboards and scalable APIs.',
        responsibilities: [
          'Design and maintain robust RESTful APIs in Node.js and Express.',
          'Develop modular, responsive web interfaces with clean HTML5/CSS3/JavaScript.',
          'Optimize database queries and schema performance in MongoDB.',
          'Collaborate with product designers to ship features with high fidelity.'
        ],
        requirements: [
          'Strong proficiency in modern JavaScript (ES6+), Node.js, and HTML/CSS.',
          'Demonstrated experience with MongoDB, Mongoose, and JWT authentication.',
          'Familiarity with Git version control and REST architecture.',
          'Bachelor degree in Computer Science or equivalent practical experience.'
        ],
        skills: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'REST API', 'HTML5', 'CSS3'],
        location: 'Bangalore',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        salaryMin: 70000,
        salaryMax: 120000,
        experienceLevel: '1-3 Years',
        applicationDeadline: future30,
        employer: employer1._id,
        status: 'OPEN'
      },
      {
        title: 'AI/ML Intern',
        category: 'Artificial Intelligence',
        company: 'DataSphere AI',
        description: 'Exciting internship opportunity for students and recent grads passionate about deep learning, neural networks, and Python analytics.',
        responsibilities: [
          'Preprocess and annotate multimodal datasets for model training.',
          'Assist in benchmarking computer vision and NLP models.',
          'Write reproducible Python pipelines and document experimental metrics.',
          'Participate in weekly research reviews and model optimization sprints.'
        ],
        requirements: [
          'Solid understanding of Python, NumPy, Pandas, and basic Machine Learning algorithms.',
          'Hands-on experience with PyTorch, TensorFlow, or Scikit-learn via coursework or projects.',
          'Curiosity and eagerness to tackle hard data challenges.',
          'Available for a 6-month continuous internship.'
        ],
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'PyTorch', 'TensorFlow'],
        location: 'Chennai',
        jobType: 'Internship',
        workMode: 'On-site',
        salaryMin: 15000,
        salaryMax: 25000,
        experienceLevel: 'Fresher',
        applicationDeadline: future45,
        employer: employer2._id,
        status: 'OPEN'
      },
      {
        title: 'Senior Cloud Systems Architect',
        category: 'Cloud Computing',
        company: 'CloudWorks Systems',
        description: 'Lead the architecture of globally distributed containerized clusters and automated CI/CD pipelines.',
        responsibilities: [
          'Architect secure cloud infrastructure across AWS and Azure environments.',
          'Implement Infrastructure-as-Code using Terraform and Ansible.',
          'Manage Kubernetes deployments, service mesh, and observability stacks.',
          'Mentor junior cloud engineers and champion DevOps best practices.'
        ],
        requirements: [
          '5+ years in cloud infrastructure, Kubernetes, and container security.',
          'AWS or Azure Certified Solutions Architect certification preferred.',
          'Deep knowledge of Docker, Linux kernel tuning, and network routing.',
          'Proven record in high-availability 99.99% uptime systems.'
        ],
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Linux', 'DevOps'],
        location: 'Hyderabad',
        jobType: 'Full Time',
        workMode: 'Remote',
        salaryMin: 180000,
        salaryMax: 280000,
        experienceLevel: '5+ Years',
        applicationDeadline: future30,
        employer: employer3._id,
        status: 'OPEN'
      },
      {
        title: 'Lead UI/UX Product Designer',
        category: 'UI/UX Design',
        company: 'Innovent Design Labs',
        description: 'Shape the next generation of digital products with cutting-edge design systems, high-fidelity prototypes, and user empathy.',
        responsibilities: [
          'Lead end-to-end design from user journey mapping to final design handoffs.',
          'Build and maintain scalable design systems in Figma.',
          'Conduct usability testing sessions and distill behavioral feedback.',
          'Partner with front-end engineers to ensure pixel-perfect CSS execution.'
        ],
        requirements: [
          'Proven portfolio exhibiting modern SaaS and mobile app interface design.',
          'Mastery in Figma, wireframing, and interactive prototyping.',
          'Strong understanding of web accessibility standards (WCAG 2.1).',
          '3+ years of professional product design experience.'
        ],
        skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping', 'User Research'],
        location: 'Mumbai',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        salaryMin: 90000,
        salaryMax: 150000,
        experienceLevel: '3-5 Years',
        applicationDeadline: future30,
        employer: employer4._id,
        status: 'OPEN'
      },
      {
        title: 'Cybersecurity Threat Analyst',
        category: 'Cybersecurity',
        company: 'NextGen Labs',
        description: 'Protect critical infrastructure by monitoring security incidents, performing vulnerability audits, and automating threat detection.',
        responsibilities: [
          'Analyze telemetry from SIEM, EDR, and network IDS systems.',
          'Conduct vulnerability assessments and assist in penetration testing.',
          'Develop automated alert playbooks with Python and Bash scripts.',
          'Produce incident response reports for executive stakeholders.'
        ],
        requirements: [
          'Hands-on experience with SIEM platforms, Wireshark, and Linux forensics.',
          'Understanding of OWASP Top 10, MITRE ATT&CK framework, and network protocols.',
          'Certifications like CEH, CompTIA Security+, or OSCP are a plus.',
          'Strong analytical and incident triage mindset.'
        ],
        skills: ['Cybersecurity', 'Network Security', 'SIEM', 'Python', 'Linux', 'Penetration Testing'],
        location: 'Delhi NCR',
        jobType: 'Full Time',
        workMode: 'On-site',
        salaryMin: 75000,
        salaryMax: 130000,
        experienceLevel: '1-3 Years',
        applicationDeadline: future30,
        employer: employer5._id,
        status: 'OPEN'
      },
      {
        title: 'Data Science & Predictive Analytics Specialist',
        category: 'Data Science',
        company: 'DataSphere AI',
        description: 'Harness massive customer behavioral data to build predictive forecasting algorithms and business intelligence pipelines.',
        responsibilities: [
          'Build statistical models and time-series forecasts using Python and SQL.',
          'Design interactive dashboards and data pipelines.',
          'Communicate complex quantitative findings to product and marketing teams.',
          'Maintain data hygiene and automated feature engineering pipelines.'
        ],
        requirements: [
          'Degree in Data Science, Statistics, Mathematics, or Computer Science.',
          'Mastery of Python (Pandas, Scikit-learn, Seaborn) and advanced SQL.',
          '2+ years practical data modeling experience in production.',
          'Experience with data visualization tools (Tableau, PowerBI or D3.js).'
        ],
        skills: ['Data Science', 'Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Pandas'],
        location: 'Chennai',
        jobType: 'Full Time',
        workMode: 'Remote',
        salaryMin: 85000,
        salaryMax: 140000,
        experienceLevel: '1-3 Years',
        applicationDeadline: future30,
        employer: employer2._id,
        status: 'OPEN'
      },
      {
        title: 'Growth Marketing Manager',
        category: 'Marketing',
        company: 'TechNova Solutions',
        description: 'Drive user acquisition, retention, and brand expansion across modern developer tools and SaaS products.',
        responsibilities: [
          'Plan and execute multi-channel digital campaigns across search, social, and email.',
          'Analyze CAC, LTV, and conversion funnels using Google Analytics and Mixpanel.',
          'Produce technical thought-leadership content and webinars.',
          'Optimize landing page conversion rates through A/B testing.'
        ],
        requirements: [
          '3+ years in growth marketing for B2B SaaS or technology companies.',
          'Data-driven mindset with hands-on experimentation experience.',
          'Strong written communication and storytelling skills.',
          'Proficiency with CRM and marketing automation software.'
        ],
        skills: ['Growth Marketing', 'SEO', 'Content Strategy', 'Google Analytics', 'A/B Testing'],
        location: 'Bangalore',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        salaryMin: 65000,
        salaryMax: 110000,
        experienceLevel: '3-5 Years',
        applicationDeadline: future30,
        employer: employer1._id,
        status: 'OPEN'
      },
      {
        title: 'Quantitative Finance & Risk Analyst',
        category: 'Finance',
        company: 'NextGen Labs',
        description: 'Perform valuation models, risk assessment, and quantitative portfolio optimization for high-growth tech ventures.',
        responsibilities: [
          'Develop financial forecasting models and capital allocation simulations.',
          'Monitor market liquidity, volatility metrics, and counterparty risk.',
          'Prepare quarterly investor memos and financial performance dashboards.',
          'Automate financial data ingestion with Python and Excel VBA.'
        ],
        requirements: [
          'B.Com, MBA in Finance, CFA candidate, or equivalent degree.',
          'Exceptional financial modeling and Excel skills.',
          'Basic scripting skills in Python or R is a strong advantage.',
          'Strong understanding of corporate balance sheets and valuation.'
        ],
        skills: ['Financial Modeling', 'Excel', 'Risk Analysis', 'Python', 'Valuation'],
        location: 'Mumbai',
        jobType: 'Full Time',
        workMode: 'On-site',
        salaryMin: 70000,
        salaryMax: 125000,
        experienceLevel: '1-3 Years',
        applicationDeadline: future30,
        employer: employer5._id,
        status: 'OPEN'
      },
      {
        title: 'Junior Python & Automation Developer',
        category: 'Software Development',
        company: 'DataSphere AI',
        description: 'Join our automation squad to develop web scrapers, data processing bots, and internal workflow automations.',
        responsibilities: [
          'Write clean, modular Python scripts to parse structured and unstructured feeds.',
          'Build automated test suites and validation scripts.',
          'Integrate third-party REST APIs and Webhooks.',
          'Maintain code documentation and unit tests.'
        ],
        requirements: [
          'Solid fundamentals in Python 3.x and standard libraries.',
          'Familiarity with BeautifulSoup, Requests, or Playwright.',
          'Keen problem-solving capability and attention to detail.',
          'Graduating seniors or fresh graduates welcome to apply!'
        ],
        skills: ['Python', 'Automation', 'REST API', 'Git', 'Linux'],
        location: 'Chennai',
        jobType: 'Full Time',
        workMode: 'Remote',
        salaryMin: 35000,
        salaryMax: 55000,
        experienceLevel: 'Fresher',
        applicationDeadline: future45,
        employer: employer2._id,
        status: 'OPEN'
      },
      {
        title: 'Backend Microservices Engineer (Node / Go)',
        category: 'Software Development',
        company: 'TechNova Solutions',
        description: 'Architect resilient event-driven microservices handling millions of daily events with low latency.',
        responsibilities: [
          'Develop scalable microservices in Node.js and Go.',
          'Implement RabbitMQ and Kafka message queues for asynchronous processing.',
          'Ensure high throughput and sub-50ms API response latency.',
          'Collaborate with DevOps on CI/CD and Helm chart deployments.'
        ],
        requirements: [
          '3+ years backend development experience.',
          'Strong proficiency in Node.js, asynchronous programming, and databases.',
          'Knowledge of distributed caching with Redis.',
          'Experience building event-driven systems.'
        ],
        skills: ['Node.js', 'Go', 'Microservices', 'Redis', 'MongoDB', 'Docker'],
        location: 'Bangalore',
        jobType: 'Full Time',
        workMode: 'Remote',
        salaryMin: 110000,
        salaryMax: 180000,
        experienceLevel: '3-5 Years',
        applicationDeadline: future30,
        employer: employer1._id,
        status: 'OPEN'
      },
      {
        title: 'Frontend UI Engineer',
        category: 'Software Development',
        company: 'CloudWorks Systems',
        description: 'Craft buttery-smooth web dashboards with modern HTML5, responsive CSS3, and JavaScript.',
        responsibilities: [
          'Build responsive user interfaces for cloud management consoles.',
          'Optimize browser rendering performance and bundle sizes.',
          'Ensure cross-browser compatibility across mobile and desktop.',
          'Implement accessible components following WCAG specifications.'
        ],
        requirements: [
          'Exceptional skills in HTML5, CSS3, Flexbox, Grid, and JavaScript.',
          'Experience with component architectures and modern CSS frameworks.',
          'Passion for clean design, typography, and micro-interactions.',
          'Strong communication and collaborative skills.'
        ],
        skills: ['JavaScript', 'HTML5', 'CSS3', 'Responsive Design', 'Web Accessibility'],
        location: 'Hyderabad',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        salaryMin: 60000,
        salaryMax: 105000,
        experienceLevel: '1-3 Years',
        applicationDeadline: future30,
        employer: employer3._id,
        status: 'OPEN'
      },
      {
        title: 'Legacy Systems Migration Specialist',
        category: 'Software Development',
        company: 'TechNova Solutions',
        description: 'Special contract role to modernize legacy systems into cloud-native microservices.',
        responsibilities: [
          'Audit legacy codebases and document architecture dependencies.',
          'Migrate monolithic databases into schema-optimized MongoDB collections.',
          'Write unit and integration tests to prevent regression.'
        ],
        requirements: [
          '3+ years working in software migration and system integration.',
          'Proficiency with database migration tools and REST APIs.'
        ],
        skills: ['Node.js', 'SQL', 'MongoDB', 'Migration', 'REST API'],
        location: 'Bangalore',
        jobType: 'Contract',
        workMode: 'Hybrid',
        salaryMin: 80000,
        salaryMax: 130000,
        experienceLevel: '3-5 Years',
        applicationDeadline: past2, // Expired / Filled demo
        employer: employer1._id,
        status: 'FILLED'
      }
    ];

    const createdJobs = await Job.insertMany(jobsData);
    console.log(`[Seed] Successfully inserted ${createdJobs.length} jobs.`);

    console.log('[Seed] Creating demo applications...');
    // Create demo applications for Alex Rivera
    await Application.create([
      {
        job: createdJobs[0]._id, // TechNova Full Stack
        applicant: seeker._id,
        employer: employer1._id,
        fullName: seeker.name,
        email: seeker.email,
        phone: seeker.phone,
        coverLetter: 'I have 2 years of full-stack experience building modern Node.js web applications and would love to contribute to TechNova.',
        resumeUrl: seeker.resumeUrl,
        status: 'UNDER REVIEW',
        appliedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        job: createdJobs[1]._id, // DataSphere AI/ML Intern
        applicant: seeker._id,
        employer: employer2._id,
        fullName: seeker.name,
        email: seeker.email,
        phone: seeker.phone,
        coverLetter: 'Passionate about deep learning and hands-on Python model training. Looking forward to discussing the role.',
        resumeUrl: seeker.resumeUrl,
        status: 'SHORTLISTED',
        appliedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        job: createdJobs[10]._id, // CloudWorks Frontend UI
        applicant: seeker._id,
        employer: employer3._id,
        fullName: seeker.name,
        email: seeker.email,
        phone: seeker.phone,
        coverLetter: 'Skilled in building responsive web applications with semantic HTML5 and sleek CSS interactions.',
        resumeUrl: seeker.resumeUrl,
        status: 'INTERVIEW',
        appliedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seed] Creating demo bookmarks...');
    await SavedJob.create([
      { user: seeker._id, job: createdJobs[2]._id }, // Senior Cloud Systems Architect
      { user: seeker._id, job: createdJobs[3]._id }  // Lead UI/UX Product Designer
    ]);

    console.log('========================================================');
    console.log('  Database Seeding Completed Successfully!  ');
    console.log('========================================================');
    console.log('  Demo Job Seeker Account:');
    console.log('    Email:    seeker.demo@openhire.dev');
    console.log('    Password: Password123!');
    console.log('--------------------------------------------------------');
    console.log('  Demo Employer Account:');
    console.log('    Email:    employer.demo@openhire.dev');
    console.log('    Password: Password123!');
    console.log('========================================================');

    if (shouldExit) {
      process.exit(0);
    }
    return true;
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    if (shouldExit) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
