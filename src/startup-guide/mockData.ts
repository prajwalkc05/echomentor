// Mock data for Startup Guide modules when backend is unavailable

export const generateMockIdeas = (_problem: string, _domain?: string) => {
  const ideas = [
    {
      id: `idea-${Date.now()}-1`,
      name: 'AI Study Companion',
      pitch: 'An intelligent study assistant that adapts to your learning style and helps you master any subject faster.',
      problem: 'Students struggle with personalized learning and time management',
      demand: 85,
      competition: 45,
      revenue: 78,
      scalability: 92,
      confidence: 87
    },
    {
      id: `idea-${Date.now()}-2`,
      name: 'EduConnect Platform',
      pitch: 'Connect students with peer tutors and mentors in real-time for collaborative learning.',
      problem: 'Lack of accessible peer-to-peer learning opportunities',
      demand: 78,
      competition: 62,
      revenue: 71,
      scalability: 85,
      confidence: 79
    },
    {
      id: `idea-${Date.now()}-3`,
      name: 'SkillPath Navigator',
      pitch: 'AI-powered career guidance that maps your skills to in-demand opportunities.',
      problem: 'Students unsure about career paths and skill development',
      demand: 91,
      competition: 38,
      revenue: 82,
      scalability: 88,
      confidence: 91
    },
    {
      id: `idea-${Date.now()}-4`,
      name: 'QuickLearn Micro-Courses',
      pitch: 'Bite-sized, gamified courses that teach practical skills in 15 minutes a day.',
      problem: 'Traditional courses are too long and not engaging enough',
      demand: 88,
      competition: 71,
      revenue: 75,
      scalability: 94,
      confidence: 83
    },
    {
      id: `idea-${Date.now()}-5`,
      name: 'StudySync Scheduler',
      pitch: 'Smart calendar that optimizes your study schedule based on your energy levels and deadlines.',
      problem: 'Poor time management leads to burnout and missed deadlines',
      demand: 82,
      competition: 55,
      revenue: 68,
      scalability: 79,
      confidence: 76
    }
  ];

  return {
    ideas,
    suggestions: [
      'Focus on mobile-first approach',
      'Consider freemium pricing model',
      'Partner with educational institutions'
    ]
  };
};

export const generateMockValidation = (_idea: any) => {
  return {
    score: 84,
    summary: 'Strong market potential with moderate competition. Focus on differentiation.',
    demandTrend: [
      { name: 'Q1', value: 65 },
      { name: 'Q2', value: 72 },
      { name: 'Q3', value: 78 },
      { name: 'Q4', value: 85 }
    ],
    competitionAnalysis: [
      { subject: 'Innovation', A: 85 },
      { subject: 'Market Fit', A: 78 },
      { subject: 'Scalability', A: 92 },
      { subject: 'Team', A: 70 },
      { subject: 'Execution', A: 75 }
    ],
    swot: {
      strengths: [
        'Strong AI capabilities and personalization',
        'Large addressable market in education',
        'Scalable SaaS business model',
        'Growing demand for online learning'
      ],
      weaknesses: [
        'High customer acquisition cost',
        'Need for continuous content updates',
        'Dependency on AI accuracy',
        'Limited brand recognition initially'
      ],
      opportunities: [
        'Expansion to corporate training market',
        'Partnership with universities',
        'International market expansion',
        'B2B enterprise solutions'
      ],
      threats: [
        'Competition from established EdTech players',
        'Rapid technology changes',
        'Data privacy regulations',
        'Economic downturn affecting education spending'
      ]
    },
    roast: [
      '🔥 Another AI-powered learning app? The market is already saturated with "revolutionary" EdTech solutions.',
      '🔥 Your personalization claims sound great, but can you actually deliver on them or is it just marketing fluff?',
      '🔥 Students are broke. How exactly are you planning to monetize this without pricing yourself out?',
      '🔥 What makes you think students will stick around? Most learning apps have terrible retention rates.',
      '🔥 Your competition includes billion-dollar companies. What\'s your unfair advantage besides "AI"?'
    ]
  };
};

export const generateMockMVP = (_idea: any) => {
  return {
    recommendedStack: ['React', 'Node.js', 'MongoDB', 'OpenAI API'],
    techStacks: {
      frontend: ['React', 'Next.js', 'Vue.js', 'Angular'],
      backend: ['Node.js', 'Python/Django', 'Ruby on Rails', 'Go'],
      database: ['MongoDB', 'PostgreSQL', 'Firebase', 'Supabase'],
      ai: ['OpenAI API', 'Hugging Face', 'TensorFlow', 'Custom Model']
    },
    features: [
      {
        name: 'User Authentication & Onboarding',
        priority: 'High',
        effort: '1-2 weeks',
        status: 'core'
      },
      {
        name: 'AI Chat Interface',
        priority: 'High',
        effort: '2-3 weeks',
        status: 'core'
      },
      {
        name: 'Study Plan Generator',
        priority: 'High',
        effort: '2 weeks',
        status: 'core'
      },
      {
        name: 'Progress Tracking Dashboard',
        priority: 'Medium',
        effort: '1-2 weeks',
        status: 'core'
      },
      {
        name: 'Resource Library',
        priority: 'Medium',
        effort: '1 week',
        status: 'nice'
      },
      {
        name: 'Social Features & Community',
        priority: 'Low',
        effort: '2-3 weeks',
        status: 'future'
      },
      {
        name: 'Mobile App',
        priority: 'Low',
        effort: '4-6 weeks',
        status: 'future'
      }
    ],
    timeline: [
      {
        phase: 'Foundation & Setup',
        duration: '2 weeks',
        tasks: ['Setup development environment', 'Design database schema', 'Create wireframes', 'Setup CI/CD']
      },
      {
        phase: 'Core Features Development',
        duration: '6 weeks',
        tasks: ['Build authentication', 'Implement AI chat', 'Create study planner', 'Build dashboard']
      },
      {
        phase: 'Testing & Refinement',
        duration: '2 weeks',
        tasks: ['User testing', 'Bug fixes', 'Performance optimization', 'Security audit']
      },
      {
        phase: 'Beta Launch',
        duration: '1 week',
        tasks: ['Deploy to production', 'Onboard beta users', 'Gather feedback', 'Monitor metrics']
      }
    ],
    monetization: [
      {
        model: 'Freemium',
        revenue: '$5-15/month',
        pros: 'Low barrier to entry, viral growth potential',
        cons: 'Low conversion rates, high support costs'
      },
      {
        model: 'Subscription',
        revenue: '$20-50/month',
        pros: 'Predictable revenue, higher LTV',
        cons: 'Higher churn risk, need strong value prop'
      },
      {
        model: 'B2B Licensing',
        revenue: '$500-5000/month',
        pros: 'Higher revenue per customer, stable contracts',
        cons: 'Longer sales cycles, customization needs'
      }
    ]
  };
};

export const generateMockRoadmap = (_idea: any) => {
  return {
    roadmap: [
      {
        month: 1,
        phase: 'Ideation & Validation',
        goals: ['Validate problem', 'Define MVP scope', 'Create wireframes', 'Setup team'],
        status: 'completed' as const,
        tasks: [
          'Conduct 20+ user interviews',
          'Analyze competitor landscape',
          'Define unique value proposition',
          'Create product requirements doc'
        ],
        tools: ['Figma', 'Notion', 'Google Forms', 'Miro'],
        tutorials: [
          'How to validate startup ideas',
          'Customer interview best practices',
          'Creating effective wireframes'
        ],
        mistakes: [
          'Skipping user research',
          'Building features nobody wants',
          'Ignoring competition'
        ]
      },
      {
        month: 2,
        phase: 'MVP Development',
        goals: ['Build core features', 'Setup infrastructure', 'Create landing page', 'Beta testing'],
        status: 'current' as const,
        tasks: [
          'Develop authentication system',
          'Implement AI integration',
          'Build user dashboard',
          'Create onboarding flow'
        ],
        tools: ['React', 'Node.js', 'MongoDB', 'Vercel', 'OpenAI API'],
        tutorials: [
          'Building scalable web apps',
          'Integrating AI APIs',
          'Database design patterns'
        ],
        mistakes: [
          'Over-engineering the MVP',
          'Perfectionism delaying launch',
          'Ignoring mobile users'
        ]
      },
      {
        month: 3,
        phase: 'Launch & Early Traction',
        goals: ['Public launch', 'Get first 100 users', 'Gather feedback', 'Iterate quickly'],
        status: 'upcoming' as const,
        tasks: [
          'Launch on Product Hunt',
          'Post in relevant communities',
          'Reach out to early adopters',
          'Setup analytics tracking'
        ],
        tools: ['Product Hunt', 'Reddit', 'Twitter', 'Google Analytics', 'Mixpanel'],
        tutorials: [
          'Successful Product Hunt launches',
          'Growth hacking strategies',
          'Community building tactics'
        ],
        mistakes: [
          'Launching without audience',
          'Not collecting user feedback',
          'Giving up too early'
        ]
      },
      {
        month: 4,
        phase: 'Growth & Optimization',
        goals: ['Reach 1000 users', 'Improve retention', 'Optimize conversion', 'Build community'],
        status: 'upcoming' as const,
        tasks: [
          'Implement referral program',
          'A/B test key features',
          'Improve onboarding flow',
          'Create content marketing strategy'
        ],
        tools: ['Optimizely', 'Hotjar', 'Mailchimp', 'Buffer'],
        tutorials: [
          'SaaS growth strategies',
          'Conversion rate optimization',
          'Content marketing for startups'
        ],
        mistakes: [
          'Focusing on vanity metrics',
          'Neglecting customer support',
          'Scaling too fast'
        ]
      },
      {
        month: 5,
        phase: 'Monetization & Scaling',
        goals: ['Launch paid plans', 'Reach profitability', 'Hire team', 'Expand features'],
        status: 'upcoming' as const,
        tasks: [
          'Implement payment system',
          'Create pricing tiers',
          'Hire first employees',
          'Build advanced features'
        ],
        tools: ['Stripe', 'Chargebee', 'LinkedIn', 'AngelList'],
        tutorials: [
          'SaaS pricing strategies',
          'Hiring your first team',
          'Scaling infrastructure'
        ],
        mistakes: [
          'Pricing too low',
          'Hiring too early',
          'Losing focus on core product'
        ]
      },
      {
        month: 6,
        phase: 'Fundraising & Expansion',
        goals: ['Raise seed round', 'Expand market', 'Build partnerships', 'Scale team'],
        status: 'upcoming' as const,
        tasks: [
          'Create pitch deck',
          'Reach out to investors',
          'Negotiate term sheets',
          'Plan international expansion'
        ],
        tools: ['DocSend', 'Crunchbase', 'AngelList', 'LinkedIn'],
        tutorials: [
          'How to pitch investors',
          'Understanding term sheets',
          'Building investor relationships'
        ],
        mistakes: [
          'Raising too early',
          'Taking bad money',
          'Diluting too much equity'
        ]
      }
    ]
  };
};

export const generateMockFunding = (_idea: any) => {
  return {
    readiness: {
      score: 72,
      summary: 'Good foundation, but needs stronger traction metrics',
      metrics: [
        { name: 'Traction', score: 65, status: 'medium' },
        { name: 'Team', score: 78, status: 'good' },
        { name: 'Market', score: 85, status: 'good' },
        { name: 'Product', score: 70, status: 'medium' },
        { name: 'Financials', score: 62, status: 'medium' }
      ]
    },
    sources: [
      {
        type: 'Bootstrapping',
        amount: '$0-50K',
        fit: 92,
        timeline: '0-3 months',
        difficulty: 'Easy'
      },
      {
        type: 'Angel Investors',
        amount: '$50K-500K',
        fit: 78,
        timeline: '3-6 months',
        difficulty: 'Medium'
      },
      {
        type: 'Seed Round',
        amount: '$500K-2M',
        fit: 65,
        timeline: '6-12 months',
        difficulty: 'Hard'
      },
      {
        type: 'Accelerator',
        amount: '$25K-150K',
        fit: 85,
        timeline: '3-6 months',
        difficulty: 'Medium'
      }
    ],
    projections: [
      { year: 'Year 1', revenue: '$50K', users: '5,000', mrr: '$4.2K' },
      { year: 'Year 2', revenue: '$300K', users: '25,000', mrr: '$25K' },
      { year: 'Year 3', revenue: '$1.2M', users: '100,000', mrr: '$100K' },
      { year: 'Year 4', revenue: '$5M', users: '400,000', mrr: '$417K' },
      { year: 'Year 5', revenue: '$15M', users: '1.2M', mrr: '$1.25M' }
    ],
    investorFeedback: [
      {
        type: 'Angel Investor',
        rating: 7,
        feedback: 'Interesting concept, but I need to see more traction. Come back when you have 1,000 paying users.'
      },
      {
        type: 'VC Partner',
        rating: 6,
        feedback: 'The market is crowded. What\'s your unfair advantage? Why will you win against established players?'
      },
      {
        type: 'Accelerator Director',
        rating: 8,
        feedback: 'Great team and vision. We\'d love to see you apply to our next cohort. Focus on user retention metrics.'
      },
      {
        type: 'Corporate VC',
        rating: 5,
        feedback: 'Too early for us. We typically invest in Series A+ with proven product-market fit and $1M+ ARR.'
      }
    ],
    pitchDeckSections: [
      'Problem',
      'Solution',
      'Market Size',
      'Business Model',
      'Traction',
      'Competition',
      'Team',
      'Financials',
      'Ask',
      'Vision'
    ]
  };
};

export const generateMockCofounders = (message: string, _context?: any) => {
  const lowerMessage = message.toLowerCase();
  
  // Landing page copy
  if (lowerMessage.includes('landing') || lowerMessage.includes('copy') || lowerMessage.includes('page')) {
    return {
      message: "Great question! For landing page copy, focus on the problem first, then your unique solution. Here's a framework:\n\n**Hero Section:**\n- Headline: Clear benefit (e.g., 'Master Any Subject 3x Faster with AI')\n- Subheadline: How it works\n- CTA: 'Start Free Trial'\n\n**Social Proof:**\n- User testimonials\n- Metrics (users, success rate)\n- Trust badges\n\nWant me to draft specific copy for your startup?",
      suggestions: ['Draft hero section', 'Write value propositions', 'Create CTA copy']
    };
  }
  
  // Features
  if (lowerMessage.includes('feature') || lowerMessage.includes('product')) {
    return {
      message: "Here are 5 innovative features for your product:\n\n1. **AI Study Buddy** - Conversational AI that explains concepts in your learning style\n2. **Smart Flashcards** - Auto-generated from your notes with spaced repetition\n3. **Progress Insights** - Visual analytics showing your learning patterns\n4. **Peer Matching** - Connect with students studying the same topics\n5. **Gamification** - Earn badges and compete on leaderboards\n\nWhich feature resonates most with your vision?",
      suggestions: ['Prioritize features', 'Estimate development time', 'Design user flow']
    };
  }
  
  // Tech stack
  if (lowerMessage.includes('tech') || lowerMessage.includes('stack') || lowerMessage.includes('recommend')) {
    return {
      message: "For your tech stack, I recommend:\n\n**Frontend:** React + TypeScript + Tailwind CSS\n- Fast development, great ecosystem, type safety\n\n**Backend:** Node.js + Express + MongoDB\n- JavaScript everywhere, scalable, flexible schema\n\n**AI/ML:** OpenAI API + LangChain\n- Quick integration, powerful capabilities\n\n**Hosting:** Vercel (frontend) + Render (backend)\n- Easy deployment, good free tiers\n\n**Total Cost:** ~$50-100/month to start\n\nWant me to explain any of these choices?",
      suggestions: ['Compare alternatives', 'Estimate costs', 'Setup guide']
    };
  }
  
  // Launch checklist
  if (lowerMessage.includes('launch') || lowerMessage.includes('checklist')) {
    return {
      message: "Here's your comprehensive launch checklist:\n\n**Pre-Launch (2 weeks before):**\n✅ Finalize MVP features\n✅ Create landing page\n✅ Setup analytics (Google Analytics, Mixpanel)\n✅ Prepare social media accounts\n✅ Write launch announcement\n\n**Launch Day:**\n✅ Post on Product Hunt\n✅ Share on Twitter, LinkedIn, Reddit\n✅ Email your waitlist\n✅ Reach out to tech journalists\n\n**Post-Launch (Week 1):**\n✅ Respond to all feedback\n✅ Fix critical bugs\n✅ Thank early adopters\n✅ Analyze metrics\n\nReady to launch?",
      suggestions: ['Create Product Hunt strategy', 'Draft launch email', 'Plan social media posts']
    };
  }
  
  // Growth strategy
  if (lowerMessage.includes('growth') || lowerMessage.includes('strategy') || lowerMessage.includes('scale')) {
    return {
      message: "Here's a growth strategy for your startup:\n\n**Month 1-2: Foundation**\n- Content marketing (blog, SEO)\n- Community building (Discord, Reddit)\n- Referral program (give 1 month free, get 1 month free)\n\n**Month 3-4: Acceleration**\n- Paid ads (Google, Facebook) - $500/month budget\n- Influencer partnerships\n- Guest posting on popular blogs\n\n**Month 5-6: Scaling**\n- Affiliate program (20% commission)\n- PR outreach\n- Strategic partnerships\n\n**Key Metrics:**\n- CAC < $50\n- LTV > $200\n- Churn < 5%\n\nWhich channel should we focus on first?",
      suggestions: ['Calculate unit economics', 'Design referral program', 'Create content calendar']
    };
  }
  
  // Business plan
  if (lowerMessage.includes('business') || lowerMessage.includes('plan')) {
    return {
      message: "Let's create your business plan outline:\n\n**1. Executive Summary**\n- Mission, vision, value proposition\n\n**2. Market Analysis**\n- TAM, SAM, SOM\n- Competitor analysis\n- Target customer personas\n\n**3. Product/Service**\n- Features and benefits\n- Unique selling points\n- Development roadmap\n\n**4. Business Model**\n- Revenue streams\n- Pricing strategy\n- Unit economics\n\n**5. Go-to-Market**\n- Marketing channels\n- Sales strategy\n- Growth tactics\n\n**6. Financial Projections**\n- 3-year revenue forecast\n- Break-even analysis\n- Funding requirements\n\nWant me to dive deeper into any section?",
      suggestions: ['Calculate TAM/SAM/SOM', 'Define pricing tiers', 'Create financial model']
    };
  }
  
  // Default response
  return {
    message: "I'm here to help you build your startup! I can assist with:\n\n💡 **Strategy** - Business plans, go-to-market, growth tactics\n🎨 **Product** - Features, UX, roadmap planning\n💻 **Tech** - Stack recommendations, architecture, tools\n💰 **Funding** - Pitch decks, investor outreach, financials\n📈 **Marketing** - Landing pages, content, SEO, ads\n\nWhat would you like to work on today?",
    suggestions: ['Generate landing page copy', 'Suggest product features', 'Create business plan', 'Launch strategy']
  };
};
