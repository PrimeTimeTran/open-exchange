import { PrismaClient } from '@prisma/client';

export async function seedJobs(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
) {
  console.log('Seeding jobs...');

  const jobs = [
    {
      title: 'Senior Full Stack Engineer',
      team: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
OpenC is a social media platform designed to empower creators and users by combining transparency, decentralized governance, and tokenized incentives. We are reimagining the creator economy by giving real ownership back to the people who create value.

### The Role
We are looking for a Senior Full Stack Engineer to help build the core infrastructure of OpenC. You will be responsible for designing and implementing scalable backend services and responsive frontend interfaces. You will work closely with our smart contract engineers to integrate Web3 features into a seamless Web2-like user experience.

### Key Responsibilities
- Architect and build scalable REST and gRPC APIs using Node.js and Go.
- Develop responsive, high-performance frontend applications using Next.js and React.
- Integrate blockchain interactions (wallet connection, token transfers, governance voting) into the user interface.
- Optimize database performance (PostgreSQL, Redis) and ensure data integrity.
- Collaborate with product and design teams to deliver high-quality user experiences.
- Mentor junior engineers and contribute to engineering best practices.
`,
      requirements: `
### What We're Looking For
- **Experience:** 5+ years of experience in full-stack development.
- **Frontend:** Deep expertise in React, Next.js, and modern CSS frameworks (Tailwind).
- **Backend:** Strong proficiency in Node.js (TypeScript) and/or Go.
- **Database:** Experience with SQL databases (PostgreSQL) and ORMs (Prisma).
- **Web3:** Familiarity with Ethereum/EVM, ethers.js/wagmi, and smart contract integration is a huge plus.
- **Infrastructure:** Experience with Docker, Kubernetes, and cloud providers (AWS/GCP).
- **Mindset:** A passion for decentralization and the creator economy.
`,
      responsibilities:
        'Develop user-facing features for content creation, engagement rewards, and governance voting.',
      quantity: 1,
      salaryLow: 140000,
      salaryHigh: 190000,
      status: 'OPEN',
      seniority: 'Senior',
      currency: 'USD',
    },
    {
      title: 'Mobile Engineer (iOS/Android)',
      team: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
OpenC is building the future of social media, where creators own their audience and their revenue. We believe mobile is the primary interface for this new economy.

### The Role
As a Mobile Engineer at OpenC, you will lead the development of our native mobile applications. You will be responsible for translating our web experience into a performant, native mobile experience. You will tackle unique challenges related to mobile wallet integration and signing transactions on the go.

### Key Responsibilities
- Build and maintain high-quality React Native applications for iOS and Android.
- Implement secure mobile wallet management and "Sign in with Ethereum" flows.
- Optimize app performance and ensure a smooth, 60fps experience.
- Work with platform-specific APIs (notifications, biometrics, secure storage).
- Collaborate with the design team to implement pixel-perfect UIs.
`,
      requirements: `
### What We're Looking For
- **Experience:** 3+ years of mobile development experience.
- **Tech Stack:** Proficiency in React Native. Experience with Swift/Kotlin is a plus.
- **Web3 Mobile:** Experience integrating mobile wallets (Rainbow, MetaMask, WalletConnect).
- **Architecture:** Understanding of mobile architecture patterns and state management.
- **Quality:** Strong focus on testing and automated release pipelines (Fastlane).
`,
      responsibilities:
        'Build and maintain the OpenC mobile app. Integrate wallet connect features.',
      quantity: 1,
      salaryLow: 120000,
      salaryHigh: 170000,
      status: 'OPEN',
      seniority: 'Mid-Senior',
      currency: 'USD',
    },
    {
      title: 'DevOps / Site Reliability Engineer',
      team: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
OpenC operates at the intersection of high-scale social media and high-reliability blockchain infrastructure. We need to ensure 99.99% uptime while managing complex dependencies.

### The Role
We are seeking a DevOps / Site Reliability Engineer to build and maintain our cloud and blockchain infrastructure. You will own our CI/CD pipelines, cluster management, and monitoring systems. You will play a critical role in securing our platform and ensuring it can scale to millions of users.

### Key Responsibilities
- Manage Kubernetes clusters on AWS/GCP using Terraform / IaC.
- Maintain and optimize CI/CD pipelines (GitHub Actions).
- Implement comprehensive monitoring and alerting (Prometheus, Grafana, ELK).
- Manage blockchain nodes and indexers ensuring high availability.
- Harden infrastructure security and manage access controls.
`,
      requirements: `
### What We're Looking For
- **Experience:** 4+ years in DevOps or SRE roles.
- **Containerization:** Deep knowledge of Docker and Kubernetes orchestration.
- **IaC:** Proficiency with Terraform, Ansible, or Pulumi.
- **Cloud:** extensive experience with AWS or GCP services.
- **Blockchain Ops:** Experience running Geth, Erigon, or other blockchain nodes is highly desirable.
- **Scripting:** Strong scripting skills in Bash, Python, or Go.
`,
      responsibilities:
        'Manage our CI/CD pipelines, cloud infrastructure, and blockchain node connections.',
      quantity: 1,
      salaryLow: 130000,
      salaryHigh: 190000,
      status: 'OPEN',
      seniority: 'Senior',
      currency: 'USD',
    },
    {
      title: 'Senior Smart Contract Engineer',
      team: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
The OpenC Token (OPENC) and our governance system are the heart of our platform. We are building novel mechanisms for decentralized content moderation and fair reward distribution.

### The Role
We are looking for a Senior Smart Contract Engineer to design, implement, and secure our protocol. You will work on the core OPENC token contracts, governance modules (Governor), and staking mechanisms. Security and gas optimization are your top priorities.

### Key Responsibilities
- Design and implement secure smart contracts in Solidity.
- Develop and test governance protocols for platform decision-making.
- Write comprehensive test suites using Foundry or Hardhat.
- Coordinate external audits and bug bounty programs.
- Optimize contract gas usage and storage patterns.
`,
      requirements: `
### What We're Looking For
- **Experience:** 3+ years of Solidity development experience.
- **Tools:** Mastery of Foundry, Hardhat, and smart contract testing methodologies.
- **Security:** Deep understanding of EVM internals and common attack vectors.
- **DeFi/DAO:** Experience building governance systems (Compound/OpenZeppelin Governor) or DeFi protocols.
- **Audits:** Experience navigating the audit process and remediation.
`,
      responsibilities:
        'Write secure smart contracts for the OPENC token, governance voting, and rewards distribution.',
      quantity: 1,
      salaryLow: 160000,
      salaryHigh: 240000,
      status: 'OPEN',
      seniority: 'Senior',
      currency: 'USD',
    },
    {
      title: 'Product Manager - Creator Economy',
      team: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
OpenC is democratizing creator ownership. We need a visionary Product Manager to translate this mission into concrete features that creators love.

### The Role
As a Product Manager for the Creator Economy, you will define the roadmap for creator tools, monetization features, and token incentives. You will bridge the gap between technical possibilities and user needs, ensuring our tokenomics drive real value.

### Key Responsibilities
- Define the product vision and strategy for creator monetization and engagement.
- Conduct user research to understand the pain points of creators on traditional platforms.
- Write detailed product requirements and user stories.
- Collaborate with engineering and design to ship high-quality features.
- Analyze product metrics and iterate on token incentive models.
`,
      requirements: `
### What We're Looking For
- **Experience:** 4+ years of product management experience, preferably in social media or creator economy.
- **Web3 Fluency:** Strong understanding of crypto, tokens, and DAOs.
- **User-Centric:** Passion for building intuitive and delightful user experiences.
- **Analytical:** Ability to use data to drive decision-making.
- **Communication:** Excellent written and verbal communication skills.
`,
      responsibilities:
        'Drive product strategy for creator monetization, governance, and engagement rewards.',
      quantity: 1,
      salaryLow: 150000,
      salaryHigh: 210000,
      status: 'OPEN',
      seniority: 'Lead',
      currency: 'USD',
    },
    {
      title: 'Marketing Lead',
      team: 'Marketing',
      location: 'New York, NY',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
We are building a movement, not just a product. We need a Marketing Lead who can tell the story of OpenC and mobilize a community of creators and believers.

### The Role
You will lead our go-to-market strategy, brand positioning, and community growth. You will be responsible for acquiring our first million users and building a vibrant, engaged community across Twitter, Discord, and Farcaster.

### Key Responsibilities
- Develop and execute the go-to-market strategy for OpenC launch.
- Manage and grow our social media presence and community channels.
- Partner with key influencers and creators to drive adoption.
- Create compelling content (blogs, threads, videos) that educates and inspires.
- Organize virtual and IRL community events.
`,
      requirements: `
### What We're Looking For
- **Experience:** 5+ years of marketing experience in tech, with at least 2 years in Web3/Crypto.
- **Community:** Proven track record of building and managing active communities (Discord/Twitter).
- **Storyteller:** Exceptional writing and communication skills.
- **Hustle:** Ability to work in a fast-paced, startup environment.
- **Network:** Existing relationships with creators and crypto influencers is a plus.
`,
      responsibilities:
        'Manage community channels (Discord, Twitter), run campaigns, and partner with key creators.',
      quantity: 1,
      salaryLow: 120000,
      salaryHigh: 180000,
      status: 'OPEN',
      seniority: 'Lead',
      currency: 'USD',
    },
    {
      title: 'Finance Manager',
      team: 'Finance',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
As a platform with its own token economy, OpenC faces unique financial challenges. We need a Finance Manager who can navigate the complexities of both fiat and crypto treasury management.

### The Role
You will oversee OpenC's financial operations, including financial planning, reporting, and treasury management. You will handle accounting for both corporate operations and on-chain assets, ensuring compliance and financial health.

### Key Responsibilities
- Manage the company's fiat and crypto treasury strategies.
- Oversee financial planning, budgeting, and forecasting.
- Handle crypto accounting and tax compliance.
- Manage payroll and benefits for a distributed, global team.
- Prepare financial reports for investors and stakeholders.
`,
      requirements: `
### What We're Looking For
- **Experience:** 5+ years of finance or accounting experience. CPA preferred.
- **Crypto Native:** Deep understanding of crypto accounting principles and tools.
- **Operational:** Experience with treasury management and payment rails.
- **Compliance:** Knowledge of tax regulations related to digital assets.
- **Detail Oriented:** High attention to detail and accuracy.
`,
      responsibilities:
        'Financial reporting, treasury management (OPENC token and stablecoins), and compliance.',
      quantity: 1,
      salaryLow: 120000,
      salaryHigh: 170000,
      status: 'OPEN',
      seniority: 'Mid-Senior',
      currency: 'USD',
    },
    {
      title: 'Head of Investor Relations',
      team: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
OpenC is supported by a diverse group of stakeholders, from equity investors to token holders. We need a Head of Investor Relations to maintain trust and transparency with our community.

### The Role
You will be the primary point of contact for our investors and the broader token-holder community. You will manage communications regarding governance proposals, treasury reports, and strategic updates. You will help professionalize our DAO governance.

### Key Responsibilities
- Develop and execute an investor relations strategy for both equity and token stakeholders.
- Draft quarterly reports, newsletters, and governance updates.
- Manage the governance proposal process and facilitate community discussion.
- Organize investor calls and AMAs.
- Maintain relationships with key strategic partners and investors.
`,
      requirements: `
### What We're Looking For
- **Experience:** 7+ years in Investor Relations, Capital Markets, or Corporate Communications.
- **Web3 Governance:** Understanding of DAO structures and token governance.
- **Communication:** Outstanding written and verbal communication skills.
- **Strategic:** Ability to synthesize complex information into clear narratives.
- **Network:** Experience working with VCs and institutional investors.
`,
      responsibilities:
        'Communicate company updates, manage governance proposals, and engage with key stakeholders.',
      quantity: 1,
      salaryLow: 160000,
      salaryHigh: 240000,
      status: 'OPEN',
      seniority: 'Executive',
      currency: 'USD',
    },
    {
      title: 'Business Analyst',
      team: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      remote: true,
      description: `
### About OpenC
Data is the lifeblood of our platform. We need to understand how users interact with our product and our token economy to make informed decisions.

### The Role
As a Business Analyst, you will dive deep into our data—both off-chain (Postgres) and on-chain (Ethereum/L2). You will build dashboards, conduct ad-hoc analyses, and model the health of the OPENC token economy. Your insights will drive product and strategy decisions.

### Key Responsibilities
- Build and maintain dashboards to track KPIs (User Growth, Retention, Token Velocity).
- Analyze on-chain data using tools like Dune Analytics or Flipside.
- Conduct A/B test analysis to optimize product features.
- Model token economic scenarios and reward distribution strategies.
- Present findings to the executive team and the community.
`,
      requirements: `
### What We're Looking For
- **Experience:** 3+ years of experience in data analysis or business intelligence.
- **Technical Skills:** Expert SQL skills and proficiency in Python/R.
- **On-Chain Data:** Experience querying blockchain data (Dune, Graph, etc.) is essential.
- **Visualization:** Proficiency with Tableau, Looker, or similar BI tools.
- **Curiosity:** A deep desire to understand the "why" behind the numbers.
`,
      responsibilities:
        'Create dashboards, analyze user engagement, and model token economy performance.',
      quantity: 1,
      salaryLow: 100000,
      salaryHigh: 140000,
      status: 'OPEN',
      seniority: 'Mid-Level',
      currency: 'USD',
    },
  ];

  for (const job of jobs) {
    const createdJob = await prisma.job.create({
      data: {
        ...job,
        tenantId,
        createdByUserId: userId,
        createdByMembershipId: membershipId,
        updatedByUserId: userId,
        updatedByMembershipId: membershipId,
      },
    });
    console.log(`Seeded job: ${createdJob.title}`);
  }

  console.log(`Seeded ${jobs.length} jobs.`);
}
