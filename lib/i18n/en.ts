import { COMPANY } from "@/lib/company";
import type { Dictionary } from "@/lib/i18n/ja";

const en: Dictionary = {
  meta: {
    siteName: COMPANY.brand,
    title: `${COMPANY.brand} (${COMPANY.name}) | AI, SaaS & Web System Development`,
    description:
      "AXIS (株式会社アクシス) is a full-stack AI engineering team in Tokyo that takes AI, SaaS, and web systems from planning and design through development and operations.",
    keywords: ["AXIS", "株式会社アクシス", "AI development", "SaaS development", "Web systems", "Full stack", "Generative AI", "RAG", "Next.js", "Tokyo"],
    ogLocale: "en_US",
    pages: {
      about: {
        title: "Company",
        description:
          "Company profile of AXIS (株式会社アクシス; Representative Director 永井 将司), a full-stack AI engineering team delivering end to end, from requirements through design, development, infrastructure, and operations. Located in Hamamatsucho, Minato-ku, Tokyo.",
      },
      career: {
        title: "Careers",
        description:
          "AXIS is looking for people to build with. Now hiring frontend, backend, AI, and cloud engineers, and UI/UX designers.",
      },
      contact: {
        title: "Contact",
        description: "Reach out to AXIS for project consultations and questions — even before your requirements are settled.",
      },
      service: {
        title: "Services",
        description:
          "AI development, web development, cloud, mobile, UI/UX, and consulting — the six services AXIS provides.",
      },
      technology: {
        title: "Technology",
        description:
          "The technology stack and development flow AXIS uses: React, Next.js, Python, AWS, OpenAI, and more.",
      },
      works: {
        title: "Work & Case Studies",
        description: "A look at the work AXIS has delivered, organized by technology stack.",
      },
      privacy: {
        title: "Privacy Policy",
        description: "How AXIS (株式会社アクシス) handles personal information.",
      },
    },
  },

  nav: {
    home: "Home",
    service: "Services",
    works: "Work",
    technology: "Technology",
    about: "Company",
    career: "Careers",
    contact: "Contact",
    privacy: "Privacy Policy",
  },

  header: {
    menu: "Menu",
    contact: "Contact",
    home: `${COMPANY.brand} home`,
  },

  controls: {
    language: "Switch language",
    toLight: "Switch to white background",
    toSpace: "Switch to space background",
  },

  pageHeader: {
    about: {
      title: "Company",
      desc: "As a full-stack AI engineering team, we handle everything from requirements to operations, proposing solutions that improve how you work and help your business grow.",
    },
    career: {
      title: "Careers",
      desc: "Come build with us at AXIS. We welcome applications for every position, full-time or contract.",
    },
    contact: {
      title: "Contact",
      desc: "From project consultations to technical questions, feel free to get in touch.",
    },
    service: {
      title: "Services",
      desc: "From AI to the cloud, we offer a broad range of solutions to your challenges. Click a card to see the details.",
    },
    technology: {
      title: "Technology",
      desc: "We build scalable, highly maintainable systems on a proven technology stack.",
    },
    works: {
      title: "Work & Case Studies",
      desc: "A stack-by-stack overview of the work AXIS has delivered.",
    },
    privacy: {
      title: "Privacy Policy",
      desc: "How we handle personal information on this website.",
    },
  },

  hero: {
    title: ["Turning ideas into", "services people use."],
    lead: [
      "We turn your vision of “the service I want to build” into reality with solid engineering.",
      "With that as our starting point, AXIS provides end-to-end support for AI, SaaS, and web systems — from planning and design through development and operations.",
    ],
    ctaContact: "Contact us",
    ctaWorks: "View Development History",
    tags: ["Generative AI & RAG", "SaaS / MVP", "Business systems", "E-commerce & payments", "Cloud"],
  },

  home: {
    about: {
      title: "About Us",
      heading: ["Beyond development,", "as a trusted technical partner."],
      body: [
        "AXIS partners with your ideas and challenges to build AI and web systems that support your business.",
        "From planning and requirements through design, development, and post-launch operations and maintenance, we stay with you end to end — supporting long-term growth with solid engineering and careful communication.",
      ],
      link: "Company profile",
    },
    stats: {
      works: "Projects listed",
      worksUnit: "",
      categories: "Stacks & industries",
      categoriesUnit: "",
      services: "Service areas",
      servicesUnit: "",
    },
    services: {
      title: "What We Do",
      lead: "From planning to operations, leave every stage you need with one team.",
      link: "Explore services",
    },
    works: {
      title: "Selected Work",
      lead: "A selection of the websites and web services we have delivered.",
      link: (count: number) => `View all work (${count})`,
    },
    projects: {
      title: "Projects",
      lead: "Demo footage of services and systems we have built.",
      names: {
        aiVideo: "Medical generative AI & video demo system",
        luckyCoins: "Lucky Coins — member points & rewards web service",
        package7: "Clinic SaaS / MVP management dashboard",
        package8: "Education management system",
        package9: "Mobile e-commerce & payment platform",
        package10: "Cloud infrastructure build, monitoring & operations",
        package11: "Smart-city DX adoption portal",
      },
    },
    strengths: {
      title: "Why Clients Choose Us",
      items: [
        {
          title: "End to end, from planning to operations",
          body: "Requirements, design, development, infrastructure, and operations after launch — one team owns it all, with no hand-offs between stages.",
        },
        {
          title: "Start small, then grow",
          body: "Rather than starting with a large build, we ship a small MVP or proof of concept and improve it from how real users and the business respond.",
        },
        {
          title: "AI that works inside the business",
          body: "We connect generative AI, RAG, AI chatbots, and workflow automation to your existing operations and systems, so they hold up in production.",
        },
        {
          title: "Communication you can count on",
          body: "Same-day replies as a rule, regular progress updates, and deadlines met. You are welcome to talk to us before your requirements are settled.",
        },
      ],
    },
    company: {
      title: "Company Profile",
      link: "More about the company",
    },
    cta: {
      title: "Tell us about that idea first.",
      body: [
        "We welcome consultations on AI adoption, SaaS, and web system development.",
        "Even at the concept stage, we stay close to your challenges and figure out the best path forward together.",
      ],
      contact: "Talk about development",
      works: "View our work",
      lancersLabel: "External profile: ",
      lancers: "Lancers",
      note: "Confidential consultations available",
    },
  },

  mission: {
    headingLead: "Turning your ideas into",
    headingAccent: " lasting value.",
    body: [
      "We cherish our clients' aspirations and ideas, and open new possibilities with the power of AI and technology.",
      "Our aim is not simply to build systems.",
      "By facing each challenge head-on—from improving operations to creating new services—we generate value that drives business growth.",
    ],
    visionLead: "Toward a future where everyone can use AI",
    visionAccent: " to bring ideas to life.",
    visionTail: "",
    visionBody: [
      "We aim for a society where anyone can make use of AI and digital technology, regardless of company size or technical knowledge.",
      "Small ideas become new services, and eventually reach the world.",
      "Together with our clients, we will create that future.",
    ],
    values: {
      innovation: "We keep exploring cutting-edge technology to deliver innovative solutions.",
      quality: "We do not compromise on code quality or design.",
      trust: "Above all, we value long-term, trusting relationships with our clients.",
      speed: "We deliver value fast, with the agility of a small team.",
      ownership: "Everyone takes ownership and works with a sense of responsibility for the business.",
      learning: "Technology never stops evolving. Continuous learning is our strength.",
    },
  },

  reviews: {
    title: "What Our Clients Say",
    lead: "Feedback from clients who have entrusted their projects to us.",
    avatarAlt: (name: string) => `Avatar of ${name}`,
    showing: (shown: number, total: number) => `Showing ${shown} of ${total}`,
    items: [
      {
        name: "Kenta Sato",
        role: "CTO",
        company: "Tech Frontier Inc.",
        body: "Introducing generative AI let us automate our internal help-desk responses. From scoping requirements through production operations, the balance of speed and quality was outstanding.",
      },
      {
        name: "Misaki Suzuki",
        role: "Product Manager",
        company: "CloudWorks LLC",
        body: "I was impressed by both their full-stack development skills and how carefully they communicate. They stayed with us after launch with improvement proposals, so we can rely on them with confidence.",
      },
      {
        name: "Sho Tanaka",
        role: "President & CEO",
        company: "Northern Green Inc.",
        body: "Their development setup kept pace with the speed a startup needs, which was a huge help. The UI is polished too, and our customers' feedback has improved.",
      },
      {
        name: "Akari Ito",
        role: "Head of Marketing",
        company: "Branding Lab",
        body: "Because design and implementation move forward together, we had almost no rework. They deliver world-class experience design on a realistic schedule.",
      },
      {
        name: "Naoki Watanabe",
        role: "Head of Information Systems",
        company: "East Japan Logistics",
        body: "We asked them to migrate our legacy internal systems to the cloud. Their proposal covered security and cost optimization as well, which made it easy to explain to management.",
      },
      {
        name: "Riko Yamamoto",
        role: "UX Designer",
        company: "Mobile Studio",
        body: "They translate a Figma design system straight into production-quality implementation. Their attention to detail raised our product's level of finish a full notch.",
      },
      {
        name: "Yuto Nakamura",
        role: "Engineering Manager",
        company: "DataBridge Inc.",
        body: "The code quality is high and their review culture is thorough. For our internal LLM-powered tools, we received consistent support from PoC all the way to production.",
      },
      {
        name: "Megumi Kobayashi",
        role: "Business Planning",
        company: "Retail Next",
        body: "They dig deep when listening to business challenges and think alongside us as a partner rather than a mere contractor. They also responded quickly to operational questions after delivery.",
      },
      {
        name: "Daiki Kato",
        role: "CEO",
        company: "Smart Factory LLC",
        body: "They built an IoT data visualization dashboard in a short time. The UI prioritizes ease of use on the factory floor and has been well received — adoption exceeded our expectations.",
      },
      {
        name: "Mayu Yoshida",
        role: "Head of HR",
        company: "PeopleTech Inc.",
        body: "They overhauled our recruiting site and applicant management workflow. Our application completion rate improved, and the hiring team's workload dropped significantly.",
      },
    ],
  },

  about: {
    title: "Message from the Representative Director",
    signatureTitle: "Representative Director",
    intro: [
      "AXIS (株式会社アクシス) is a full-stack AI engineering team. We take web services, SaaS, business systems, and AI products from planning and design through development and operations.",
      "What matters to us is not simply “building a system,” but shaping ideas and problems that do not yet have a form, and turning them into services people actually use.",
      "We have worked on membership and payment systems, booking and admin systems, e-commerce, AI chatbots, RAG, and workflow automation tools, among many other services.",
      "“I know what I want to build, but not where to start.”\n“I have a business idea, but I don’t know if it can be built.”\n“I want to streamline existing work with AI or software.”",
      "Even from that stage, we work through requirements, UI/UX, database design, AI adoption, payments, infrastructure, and operations after launch, putting the necessary technology in place one piece at a time.",
      "We prefer not to start with a large build. We are most effective when we ship a small MVP or proof of concept, then improve it from how real users and the business respond.",
      "We treat a client’s ideas and business information with care. For past work, we share only what can be shown within the scope of NDAs and confidentiality.",
      "For people starting a new service, bringing AI into an existing business, or turning operations into software, we want to be the technical partner they feel they can talk to first.",
      "An idea-stage conversation is welcome.",
      "This is not development for the sake of technology. We turn ideas into real services while keeping the business and the user’s outcome in view.",
    ],
    specialties: {
      title: "Areas of Expertise",
      body: [
        "We specialize in AI-powered systems that streamline operations and in web applications built for maintainability and extensibility.",
        "From MVP (minimum viable product) development through production operations, we use agile practices to deliver value quickly.",
        "We cover a wide range of work, from launching new services to improving and rebuilding existing systems.",
      ],
      tags: [
        "AI workflow automation systems",
        "Maintainable, extensible web apps",
        "MVP to production",
        "Agile development",
        "New service launches",
        "Improving & rebuilding existing systems",
      ],
    },
    works: {
      title: "Development Track Record",
      items: [
        "AI business-support systems",
        "AI chatbots",
        "RAG search systems",
        "OCR document management systems",
        "Enterprise admin systems",
        "Membership web services",
        "SaaS products",
        "Booking management systems",
        "Payment systems",
        "Donation platforms",
        "Corporate websites",
        "Media sites",
        "Landing pages",
      ],
      portfolioLabel: "Portfolio: ",
      portfolioLink: "View all work",
    },
    values: {
      title: "What We Value in Our Work",
      body: [
        "We value building alongside clients while thinking together about what they truly need.",
        "Our proposals consider not only the technology but also the business and its operations, so that what we deliver is not “built and done” but a system that stays useful for years.",
        "We also hold ourselves to the following:",
      ],
      commitments: [
        "Same-day replies, as a rule",
        "Regular progress updates",
        "Deadlines strictly met",
        "Maintenance & operations support",
      ],
      concerns: ["“Our requirements aren't settled yet.”", "“We don't know where to start.”"],
      closing: [
        "Please feel free to reach out even at that stage.",
        "We'll support you carefully from the first conversation and propose the system that fits you best.",
        "We take responsibility through to the very end, and we look forward to working with you.",
      ],
      cta: "Get in touch",
    },
  },

  company: {
    title: "Company Profile",
    rows: [
      { label: "Company", value: COMPANY.name },
      { label: "English name", value: COMPANY.nameEn },
      { label: "Representative Director", value: COMPANY.representative },
      { label: "Head office", value: COMPANY.addressEn },
      {
        label: "Business",
        value:
          "Generative AI & RAG systems; SaaS & web application development; business systems; e-commerce & payment systems; cloud infrastructure build & operations; DX adoption support",
      },
      {
        label: "Development setup",
        value: "Flexible development tailored to each client's challenges, with long-term technical support",
      },
      {
        label: "Coverage",
        value:
          "Planning, requirements, UI/UX design, system development, testing, deployment, and operations & maintenance",
      },
    ],
  },

  team: {
    title: "Development Team",
    lead: "Development is handled by one male engineer and one female designer — a small team you deal with directly, from the first conversation through design and implementation.",
    headcount: "1 member",
    members: {
      engineer: {
        role: "Engineer",
        gender: "Male",
        body: "Handles requirements and architecture, frontend and backend development, AI implementation, infrastructure, and operations after launch.",
        areas: ["Requirements & architecture", "Web & SaaS development", "Generative AI & RAG", "Cloud & infrastructure", "Operations & maintenance"],
      },
      designer: {
        role: "Designer",
        gender: "Female",
        body: "Handles information design, UI/UX design, website and landing-page design, and design-system upkeep.",
        areas: ["UI/UX design", "Website & landing-page design", "Wireframes & prototypes", "Design systems"],
      },
    },
  },

  access: {
    title: "Access",
    addressLabel: "Address",
    address: COMPANY.addressEn,
    stationsLabel: "Nearest stations",
    stations: [
      "Hamamatsucho Station (JR Yamanote Line, JR Keihin-Tohoku Line, Tokyo Monorail)",
      "Daimon Station (Toei Asakusa Line, Toei Oedo Line)",
    ],
    openMap: "Open in Google Maps",
    mapTitle: `Location of ${COMPANY.brand} on Google Maps`,
  },

  services: {
    hint: "Click a card to see the details",
    more: "View details",
    modal: {
      process: "Process",
      scope: "Scope",
      cta: "Talk to us about this service",
      close: "Close",
    },
    items: {
      ai: {
        subtitle: "",
        description: "From designing and building generative AI to integrating LLMs into your business.",
        overview:
          "Using the latest LLMs such as ChatGPT, Claude, and Gemini, we develop and integrate RAG systems, AI agents, and custom models — handled end to end, from PoC (proof of concept) to production.",
        steps: [
          "Requirements & PoC design",
          "LLM selection & architecture design",
          "RAG / fine-tuning implementation",
          "Integration into production systems",
          "Monitoring & continuous improvement",
        ],
        features: [
          "RAG system development",
          "AI agent development",
          "Fine-tuning",
          "Prompt engineering",
          "Vector DB design",
          "MLOps setup",
          "LLM evaluation infrastructure",
        ],
      },
      web: {
        subtitle: "",
        description: "We build web apps on modern frameworks that balance performance with maintainability.",
        overview:
          "Centered on modern frameworks such as React and Next.js, we develop full stack — from the frontend to backend APIs — implementing Core Web Vitals, SEO, and accessibility to a high standard.",
        steps: [
          "Requirements & tech selection",
          "UI/UX design",
          "Frontend development",
          "Backend API development",
          "Testing & QA",
          "Deployment & operations",
        ],
        features: [
          "SPA / SSR / SSG",
          "API design & development",
          "Database design",
          "E2E testing",
          "Performance optimization",
          "SEO",
          "Accessibility",
        ],
      },
      cloud: {
        subtitle: "",
        description: "From AWS and Azure infrastructure to CI/CD pipelines, we build cloud-native environments.",
        overview:
          "We design and build cloud-native infrastructure centered on AWS and Azure. With IaC via Terraform, Docker containerization, and CI/CD pipelines on GitHub Actions, we establish a stable operating foundation.",
        steps: [
          "Current-state analysis & requirements",
          "Architecture design",
          "IaC implementation (Terraform)",
          "CI/CD pipeline setup",
          "Monitoring & alerting",
          "Migration & production rollout",
        ],
        features: [
          "AWS / Azure architecture",
          "Terraform IaC",
          "Docker / Kubernetes",
          "CI/CD setup",
          "Cost optimization",
          "Security design",
          "Incident response readiness",
        ],
      },
      mobile: {
        subtitle: "",
        description: "Cross-platform iOS and Android app development that maximizes the mobile experience.",
        overview:
          "Using Flutter and React Native, we develop cross-platform apps for both iOS and Android, combining native-quality UX with high performance.",
        steps: [
          "Requirements & screen design",
          "UI design",
          "Cross-platform development",
          "Testing (iOS / Android)",
          "Store submission & release",
          "Operations & updates",
        ],
        features: [
          "Flutter / React Native",
          "Push notifications",
          "Offline support",
          "In-App Purchase",
          "Store submission support",
          "Performance optimization",
        ],
      },
      design: {
        subtitle: "",
        description: "A user-centered design process that shapes clear, easy-to-use experiences.",
        overview:
          "From building Figma-based design systems to user research, prototyping, and usability testing, we cover it comprehensively and deliver designs compliant with accessibility standards (WCAG 2.1).",
        steps: [
          "User research",
          "Information architecture",
          "Wireframing",
          "UI design & prototyping",
          "Usability testing",
          "Design system delivery",
        ],
        features: [
          "Figma design systems",
          "Prototyping",
          "User research",
          "Accessibility",
          "Storybook integration",
          "Component libraries",
        ],
      },
      consulting: {
        subtitle: "",
        description:
          "From technology strategy to CTO support, consulting that works alongside you at the core of your business.",
        overview:
          "From driving DX and designing technical architecture to team building and CTO support, we provide consulting that bridges technology and business — not stopping at proposals, but running with you through execution.",
        steps: [
          "Current-state analysis & problem definition",
          "Technology strategy",
          "Roadmap planning",
          "Execution support & team building",
          "KPI design & measurement",
          "Ongoing improvement support",
        ],
        features: [
          "DX enablement",
          "Technical architecture design",
          "CTO support",
          "Engineering team building",
          "Code review",
          "Hiring & training support",
          "Technology selection consulting",
        ],
      },
    },
  },

  technology: {
    title: "The Technology We Use",
    lead: "A proven, modern stack for scalable development.",
    flowTitle: "Development Flow",
    flow: {
      requirement: "Requirements & discovery",
      architecture: "Design & tech selection",
      design: "UI/UX design",
      development: "Frontend & backend development",
      testing: "QA & testing",
      deployment: "Release & production rollout",
      maintenance: "Operations, maintenance & improvement",
    },
  },

  works: {
    title: "Work & Case Studies",
    lead: "Browse our work, organized by technology stack.",
    searchPlaceholder: "Search by site name, URL, or stack",
    emptyTitle: "No matching projects found",
    emptyBody: "Try changing your search keywords or stack filter.",
  },

  career: {
    lead: "We're looking for people to build the future with us.",
    hint: "Pick a card to see the details of each open position.",
    types: {
      both: "Full-time / Contract",
      contract: "Contract",
    },
    positions: {
      frontend: "We're hiring frontend engineers to build clear, well-crafted UIs.",
      backend: "We're hiring engineers to design and build scalable backend systems.",
      ai: "We're hiring AI engineers to integrate generative AI into real businesses.",
      cloud: "We're hiring engineers to design and operate cloud infrastructure.",
      design: "We're hiring UI/UX designers to shape the user experience.",
    },
    viewDetails: (role: string) => `View details for ${role}`,
    apply: "Apply / Contact us",
    closeBackdrop: "Click the background to close",
  },

  contact: {
    lead: "From project consultations to simple questions, feel free to reach out.",
    fields: {
      company: { label: "Company", placeholder: "Example Inc." },
      name: { label: "Your name", placeholder: "Taro Yamada" },
      email: { label: "Email address", placeholder: "contact@example.com" },
      phone: { label: "Phone number", placeholder: "03-0000-0000" },
      message: { label: "Message", placeholder: "Tell us about your project and what you need." },
    },
    required: (label: string) => `${label} is required`,
    invalidEmail: "Please enter a valid email address",
    messageTooShort: "Please enter at least 10 characters",
    sendFailed: "Failed to send. Please try again in a moment.",
    mailUnavailable: "The form cannot accept messages right now. Please reach us through our Lancers profile instead.",
    sentTitle: "Message sent",
    sentBody: ["Thank you for contacting us.", "We will get back to you within 3 business days."],
    sendAnother: "Send another inquiry →",
    sending: "Sending...",
    submit: "Send message",
    privacyLead: "The information you submit is handled in accordance with our ",
    privacyLink: "privacy policy",
    privacyTail: ".",
    info: {
      title: "How to Reach Us",
      addressLabel: "Address",
      lancersLabel: "Lancers",
      lancersBody: "You can also consult us or place an order through Lancers.",
      lancersLink: "View our Lancers profile",
      note: "It is fine if your requirements are not settled yet. We will start by listening carefully.",
    },
  },

  privacy: {
    policyTitle: "Personal Information Protection Policy",
    intro: [
      `${COMPANY.nameEn} (“we”, “our”, or “the Company”) develops, designs, and operates AI systems, SaaS products, and web applications. We regard the proper protection of personal information belonging to our clients, business partners, and website visitors as an important responsibility.`,
      "We comply with Japan’s Act on the Protection of Personal Information (Act No. 57 of 2003; the “APPI”), other applicable laws and regulations, and guidelines issued by the Personal Information Protection Commission, and we strive to acquire, use, manage, and protect personal information appropriately.",
      "This Privacy Policy sets out how we handle personal information and related data obtained through our official website (the “Site”).",
    ],
    sections: [
      {
        title: "Article 1 — Personal Information Handling Business Operator",
        body: ["Our basic information as a personal information handling business operator is as follows."],
        table: [
          { label: "Company name", value: COMPANY.name },
          { label: "English name", value: COMPANY.nameEn },
          { label: "Representative Director", value: COMPANY.representative },
          { label: "Head office", value: COMPANY.addressEn },
          {
            label: "Main business",
            value:
              "AI / RAG system development, SaaS and web application development, business system development, cloud infrastructure build & operations, and DX support",
          },
          { label: "Contact for personal information", value: "The contact form on this Site" },
        ],
      },
      {
        title: "Article 2 — Personal Information We Collect",
        body: [
          "To the extent necessary to provide services, respond to inquiries, and conduct business communications, we may collect the following information.",
        ],
        subsections: [
          {
            heading: "1. Information related to inquiries",
            bullets: [
              "Company or organization name",
              "Name / contact person name",
              "Email address",
              "Phone number",
              "Inquiry details",
              "Consultation details, development requests, and other information provided voluntarily",
            ],
          },
          {
            heading: "2. Information related to business dealings and consultations",
            bullets: [
              "Request details and information needed for estimates",
              "Business communication history",
              "Information provided in connection with contracts, proposals, or meetings",
              "Personal information contained in materials voluntarily provided by clients",
            ],
          },
          {
            heading: "3. Information collected through use of the Site",
            bullets: [
              "IP address",
              "Browser and OS type",
              "Access date and time",
              "Pages viewed, referrer URL, and other access logs",
              "Cookies and other identifiers, and settings stored in the browser",
            ],
          },
        ],
        after: [
          "Depending on its content and whether it can be matched with other information, such access data is handled appropriately as personal information or personally related information.",
        ],
      },
      {
        title: "Article 3 — Purposes of Use",
        body: [
          "We use personal information we collect within the scope necessary to achieve the following purposes.",
        ],
        numbered: [
          "To respond to inquiries, consultations, and questions, and to make necessary contact.",
          "To conduct hearings, clarify requirements, and perform technical reviews for system development, AI adoption, web production, and related work.",
          "To prepare estimates and proposals, and to conclude and manage contracts.",
          "To perform requested work and to communicate about progress, delivery, and operations/maintenance.",
          "To improve Site quality and usability, and to understand how the Site is used.",
          "To prevent unauthorized access, misuse, spam, and other harmful activity, and to maintain security.",
          "To manage inquiry and request history so we can provide smooth customer support.",
          "To fulfill legal obligations, prevent disputes, and take necessary action.",
          "To properly carry out work incidental to the purposes above.",
        ],
        after: [
          "Except where permitted by law, we do not handle personal information beyond the scope necessary to achieve the specified purposes of use without the individual’s consent.",
        ],
      },
      {
        title: "Article 4 — Proper Acquisition of Personal Information",
        body: [
          "We acquire personal information by lawful and fair means and do not acquire it by deception or other improper methods.",
          "When you provide personal information directly through the contact form or similar channels, we state the purposes of use in advance and ask only for information within the necessary scope.",
          "Except where exceptions under law apply, we obtain prior consent before acquiring sensitive personal information such as race, creed, or medical history.",
        ],
      },
      {
        title: "Article 5 — Provision to Third Parties",
        body: [
          "Except where we have obtained prior consent or where permitted by law, we do not provide personal data to third parties.",
          "However, we may provide personal data to the extent necessary in accordance with the APPI and other applicable laws in the following cases.",
        ],
        numbered: [
          "Where required by law.",
          "Where necessary to protect a person’s life, body, or property, and obtaining consent is difficult.",
          "Where especially necessary to improve public health or promote the sound upbringing of children, and obtaining consent is difficult.",
          "Where cooperation with a national or local government body in performing legally prescribed duties is necessary, and obtaining consent may hinder those duties.",
          "Where provision to a third party is otherwise permitted under the APPI.",
        ],
        after: [
          "Provision of personal data accompanying proper outsourcing under Article 27, Paragraph 5, Item 1 of the APPI is handled in accordance with that Act.",
        ],
      },
      {
        title: "Article 6 — Supervision of Contractors",
        body: [
          "To the extent necessary for business operations and service delivery, we may outsource work such as system development, server management, email delivery, and maintenance to external contractors.",
          "In such cases, pursuant to Article 25 of the APPI, we exercise necessary and appropriate supervision so that personal data is securely managed by the contractor.",
          "Specifically, according to the sensitivity of the information and the nature of the outsourced work, we confirm and manage matters including the following.",
        ],
        bullets: [
          "The contractor’s personal information protection framework and information management practices",
          "Confidentiality obligations and the permitted scope of use of personal information",
          "Access rights to information needed for the work",
          "Prohibition of use outside the stated purpose and unauthorized disclosure of personal data",
          "Conditions and controls for any further subcontracting",
          "Return, deletion, or appropriate retention of information when the engagement ends",
          "Reporting and response procedures if a data incident occurs",
        ],
        after: [
          "Even when contractors handle personal data, we strive to ensure that appropriate protective measures are in place.",
        ],
      },
      {
        title: "Article 7 — Security Control Measures",
        body: [
          "To prevent leakage, loss, damage, unauthorized access, and other risks to personal data, we take necessary and appropriate security control measures suited to the nature of the information and the scale of our business.",
          "Those measures include the following.",
        ],
        subsections: [
          {
            heading: "1. Organizational measures",
            body: [
              "We clarify responsibility for personal information management, monitor handling status, and maintain reporting and response procedures if issues arise.",
            ],
          },
          {
            heading: "2. Personnel measures",
            body: [
              "We require officers, employees, and contractors who handle personal information to maintain confidentiality and manage information appropriately.",
            ],
          },
          {
            heading: "3. Physical measures",
            body: [
              "We manage devices and storage media that hold personal information to help prevent theft, loss, and unauthorized viewing by third parties.",
            ],
          },
          {
            heading: "4. Technical measures",
            body: [
              "We work to keep information secure through appropriate access controls, credential management, protection of communications, and measures against unauthorized access.",
            ],
          },
          {
            heading: "5. Management of external contractors and cloud services",
            body: [
              "When using external services, we review terms of service, data storage locations, access controls, and security measures, and take necessary protective steps.",
            ],
          },
        ],
        after: [
          "Except for details that could impair security if disclosed, we will appropriately explain our security measures in response to inquiries, in accordance with applicable law.",
        ],
      },
      {
        title: "Article 8 — Information Management When Using AI Services",
        body: [
          "As a company that develops and supports the introduction of AI systems, we also take care when managing information used with AI services.",
          "When we use external generative AI or cloud AI services in the course of our work, we review the nature of the information involved, the purpose of use, the provider’s terms, and their data-handling policies.",
          "If personal data or confidential information entrusted by a client must be handled with an external AI service, we take appropriate steps—such as obtaining necessary consent, supervising contractors, and minimizing input data—in accordance with applicable law and our contracts with clients.",
          "Materials, technical information, business concepts, and other confidential information entrusted by clients are managed appropriately under contractual confidentiality obligations.",
        ],
      },
      {
        title: "Article 9 — Provision Involving Overseas Operators",
        body: [
          "When we use cloud or other external services, operators located outside Japan may be involved.",
          "If we provide personal data to a third party outside Japan, we take legally required steps under Article 28 of the APPI and related rules, including obtaining necessary consent, confirming the recipient’s personal information protection framework, and ensuring appropriate safeguards.",
          "When overseas contractors handle personal data, we strive for appropriate security management in light of the country of location, legal system, information governance, and contract terms.",
        ],
      },
      {
        title: "Article 10 — Use of Cookies and Similar Technologies",
        body: [
          "The Site may use cookies, local storage, and similar technologies to improve convenience and retain display settings.",
          "For example, we use them to remember language and color-theme preferences so your settings can be applied on later visits.",
          "Technical information may also be handled for security and to understand Site usage as part of ordinary operations.",
          "You may be able to restrict cookies in your browser settings, but some preference-saving features may then stop working correctly.",
          "If cookie or other identifier data constitutes personal information or personally related information, we handle it in accordance with applicable law.",
        ],
      },
      {
        title: "Article 11 — Use of External Services",
        subsections: [
          {
            heading: "1. Google Maps",
            body: [
              "The Site uses Google Maps, provided by Google LLC, to display our location and access information.",
              "When Google Maps is displayed or used, information such as IP address, browser details, device information, and cookies may be sent to or collected by Google.",
              "Please review Google’s privacy policy for how Google handles information.",
            ],
          },
          {
            heading: "2. Other external services",
            body: [
              "If we introduce analytics, advertising, inquiry-support, or similar services, we will review how those services collect and transmit information and the applicable laws, and we will revise this Policy or provide separate notice as needed.",
            ],
          },
        ],
        links: [
          {
            label: "Google Privacy Policy",
            href: "https://policies.google.com/privacy?hl=en",
          },
        ],
      },
      {
        title: "Article 12 — Retention Period and Deletion",
        body: [
          "We retain personal information for the period needed to achieve the purposes of use and any period required by law.",
          "Except where retention is required by law or contract, we strive to delete personal data without delay once it is no longer needed.",
          "Information whose retention period has ended, or that is otherwise unnecessary, is deleted or discarded by an appropriate method for its nature and storage medium.",
        ],
      },
      {
        title: "Article 13 — Disclosure, Correction, Suspension of Use, and Related Requests",
        body: [
          "If you request notification of purposes of use, disclosure, correction, addition, deletion, suspension of use, erasure, or suspension of third-party provision regarding personal data we hold, we will respond appropriately under the APPI and other applicable laws.",
          "We likewise handle requests for disclosure of third-party provision records as provided by law.",
        ],
        subsections: [
          {
            heading: "How to make a request",
            numbered: [
              "Contact us via the Site’s contact form, stating that your message concerns a personal information request and describing the action you seek.",
              "We will guide you through any confirmation steps that are needed.",
              "We will verify by appropriate means that the request comes from you or a duly authorized representative.",
              "We will review the request under applicable law and conduct any necessary investigation.",
              "We will take the legally required action and inform you of the result.",
            ],
          },
        ],
        after: [
          "For identity verification, we may ask you to provide information within the scope necessary for confirmation.",
          "If we cannot comply with a request under law, or cannot fully implement the measures you seek, we will notify you and explain the reasons as appropriate.",
        ],
      },
      {
        title: "Article 14 — Response to Personal Data Incidents",
        body: [
          "If we become aware of leakage, loss, damage, unauthorized access, or a similar incident involving personal data—or a risk thereof—we will promptly investigate the facts as the situation requires, prevent further harm, and take measures to prevent recurrence.",
          "Where reporting to the Personal Information Protection Commission or notification to affected individuals is required under Article 26 of the APPI or related rules, we will comply with the law.",
        ],
      },
      {
        title: "Article 15 — Complaints and Consultations",
        body: [
          "We appropriately accept questions, consultations, and complaints about our handling of personal information, review their content, and strive to respond sincerely and promptly.",
          "Please contact us through the Site’s contact form.",
        ],
      },
      {
        title: "Article 16 — Revisions to This Privacy Policy",
        body: [
          "We may revise this Privacy Policy in response to legal amendments, changes in our business, addition of services, or reviews of our information management practices.",
          "When we revise the Policy, we will post the revised content and effective date on the Site.",
          "Where law requires notice to individuals or obtaining consent for a change, we will follow the necessary procedures.",
        ],
      },
      {
        title: "Article 17 — Contact Desk",
        body: [
          "For inquiries about personal information, requests for disclosure and related actions, or complaints and consultations, please contact:",
          COMPANY.nameEn,
          `Representative Director: ${COMPANY.representative}`,
          `Address: ${COMPANY.addressEn}`,
          "Desk: Contact form on the official website",
        ],
      },
    ],
  },

  chatbot: {
    title: "AXIS Support",
    subtitle: "Questions or inquiries? Start here.",
    greeting: ["Hello. This is AXIS.", "We can guide you through our services and how to contact us."],
    quick: {
      service: "About our services",
      works: "See our work",
      contact: "Contact us",
    },
    cta: "Go to the contact form",
    open: "Open chat",
    close: "Close chat",
  },

  footer: {
    tagline: ["AI, SaaS & web system development", "End to end, from planning to operations"],
    sitemap: "Sitemap",
    contact: "Contact & Links",
    contactButton: "Contact form",
    lancers: "Lancers profile",
    privacy: "Privacy Policy",
  },

  notFound: {
    title: "Page not found",
    body: "The page you are looking for may have been moved or removed.",
    back: "Back to home",
  },

  scrollTop: "Back to top",
};

export default en;
