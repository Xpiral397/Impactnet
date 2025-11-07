// Mock data for ImpactNet - 1000+ items with real Unsplash images

export interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
    isOrganization?: boolean;
  };
  content: string;
  image?: string;
  images?: string[];
  category: 'Feed' | 'Request' | 'Testimony' | 'Encouragement' | 'Impact';
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
  replies?: Reply[];
  helpDetails?: {
    beneficiary: string;
    amountSpent: string;
    story: string;
    transactionId?: string;
    receipts?: string[];
  };
  goal?: {
    type: 'money' | 'job' | 'travel' | 'other';
    target: number | string;
    raised: number;
    deadline?: string;
    milestones?: {
      title: string;
      amount: number;
      reached: boolean;
    }[];
    supporters?: {
      name: string;
      avatar: string;
      amount: number;
      timestamp: string;
    }[];
  };
}

export interface Reply {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

export interface Program {
  id: number;
  title: string;
  category: 'Healthcare' | 'Skills' | 'Housing' | 'Education';
  description: string;
  spotsAvailable: number;
  totalSpots: number;
  image: string;
  status: 'open' | 'closing_soon' | 'closed';
  coverImage?: string;
  videos?: { id: number; title: string; thumbnail: string; duration: string; views: string }[];
  updates?: { id: number; content: string; image?: string; timestamp: string; likes: number }[];
  about?: string;
  impact?: { beneficiaries: number; fundsRaised: string; successRate: string };
  organizer?: { name: string; avatar: string; role: string };
  // Detailed program information
  introVideo?: {
    url: string;
    thumbnail: string;
    duration: string;
    title: string;
  };
  reason?: string; // Why this program was established
  qualifications?: string[]; // Required qualifications
  howToApply?: string; // Application instructions
  criteria?: string[]; // Evaluation criteria
  closeDate?: string;
  executives?: {
    id: number;
    name: string;
    avatar: string;
    role: string;
    email: string;
  }[];
  requirements?: string[];
  benefits?: string[];
  timeline?: {
    phase: string;
    duration: string;
    description: string;
  }[];
}

export interface Message {
  id: number;
  user: { name: string; avatar: string };
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  image: string;
  beneficiaries: Beneficiary[];
  transactions: Transaction[];
  status: 'active' | 'completed' | 'ongoing';
  startDate: string;
  category: string;
}

export interface Beneficiary {
  id: number;
  name: string;
  avatar: string;
  story: string;
  amountReceived: string;
  date: string;
  location: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: string;
  recipient: string;
  transactionId: string;
  receipt?: string;
  category: string;
}

export interface MarketplaceProduct {
  id: number;
  seller: {
    name: string;
    avatar: string;
    story: string;
    programGraduate: boolean;
  };
  title: string;
  description: string;
  price: string;
  images: string[];
  category: string;
  sales: number;
  rating: number;
  inStock: boolean;
}

export interface Partnership {
  id: number;
  brand: {
    name: string;
    logo: string;
    website: string;
  };
  campaign: string;
  amountSponsored: string;
  beneficiaries: number;
  startDate: string;
  status: 'active' | 'completed';
  visibility: 'featured' | 'standard';
}

export interface PremiumTier {
  id: number;
  name: string;
  price: string;
  period: 'monthly' | 'annual';
  features: string[];
  badge: string;
  popular?: boolean;
}

// Real Nigerian names
const firstNames = ['Adewale', 'Blessing', 'Chidi', 'Damilola', 'Ebuka', 'Folake', 'Grace', 'Hassan', 'Ifeoma', 'Joy', 'Kehinde', 'Lola', 'Michael', 'Ngozi', 'Ola', 'Peace', 'Queen', 'Ruth', 'Sarah', 'Tunde', 'Uche', 'Victor', 'Yemi', 'Zainab', 'Amina', 'Bola', 'Chioma', 'David', 'Esther', 'Faith'];
const lastNames = ['Adebayo', 'Okonkwo', 'Williams', 'Johnson', 'Oluwaseun', 'Eze', 'Okoro', 'Ibrahim', 'Mohammed', 'Samuel', 'Peter', 'James', 'Ajayi', 'Nwankwo', 'Okafor', 'Ojo', 'Bello', 'Musa', 'Aliyu', 'Oladipo'];

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna', 'Benin City', 'Jos', 'Calabar'];

// Generate random name
const getRandomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};

// Generate random timestamp
const getRandomTimestamp = () => {
  const options = ['2 min ago', '15 min ago', '1 hour ago', '3 hours ago', '5 hours ago', '1 day ago', '2 days ago', '3 days ago', '1 week ago', '2 weeks ago'];
  return options[Math.floor(Math.random() * options.length)];
};

// Unsplash image categories for variety
const unsplashCategories = [
  'photo-1573496359142-b8d87734a5a2', // Woman smiling
  'photo-1507003211169-0a1dd7228f2d', // Man professional
  'photo-1494790108377-be9c29b29330', // Woman professional
  'photo-1472099645785-5658abf4ff4e', // Man smiling
  'photo-1438761681033-6461ffad8d80', // Woman portrait
  'photo-1500648767791-00dcc994a43e', // Man portrait
  'photo-1534528741775-53994a69daeb', // Woman young
  'photo-1506794778202-cad84cf45f1d', // Man young
  'photo-1487412720507-e7ab37603c6f', // Woman business
  'photo-1519085360753-af0119f7cbe7', // Man business
];

// Post content templates
const testimonies = [
  'I just got accepted into the Healthcare Support program! 🎉 After months of hoping and praying, this is finally happening. Thank you ImpactNet for giving me this opportunity.',
  'Today I received my first sewing machine from the Skills Training program! 🎊 I can finally start my own business. Dreams do come true!',
  'My daughter just started university with a full scholarship! 🎓 I never thought this would be possible. Thank you to everyone who believed in us!',
  'Just completed stage 5 of the Healthcare program! One step closer to getting the medical help my family needs. God is faithful! 🙏',
  'Graduated from the carpentry program today! Already got my first client. This is just the beginning! 💪',
];

const requests = [
  'My mother needs urgent medical help. She has been diagnosed with diabetes and we can\'t afford the medication. Any guidance would mean the world to us. 🙏',
  'Looking for advice on the university scholarship application. Has anyone here successfully applied? What documents do I need?',
  'My family lost our home in the recent floods. We need shelter and basic supplies. Please keep us in your prayers. 😢',
  'Need help with my skills training application. The deadline is this Friday and I\'m stuck on the requirements section.',
  'Seeking housing support for my family of 5. Our landlord is evicting us and we have nowhere to go. Please help!',
];

const encouragements = [
  'Remember: Your current situation is not your final destination. Every program winner you see today was once where you are now. Keep applying! 💪✨',
  'Don\'t give up! I applied 7 times before getting accepted. Persistence pays off. Your breakthrough is coming! 🌟',
  'To everyone waiting for their application results - stay strong! The waiting is hard but the reward is worth it. Keep believing! ❤️',
  'Your story isn\'t over yet. Keep pushing, keep praying, keep believing. Better days are ahead! 🙌',
  'Success is not final, failure is not fatal. Keep going, your miracle is on the way! ✨',
];

// Generate 500 posts
export const posts: Post[] = Array.from({ length: 500 }, (_, i) => {
  const categories: Post['category'][] = ['Feed', 'Request', 'Testimony', 'Encouragement'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  let content = '';
  if (category === 'Testimony') content = testimonies[Math.floor(Math.random() * testimonies.length)];
  else if (category === 'Request') content = requests[Math.floor(Math.random() * requests.length)];
  else if (category === 'Encouragement') content = encouragements[Math.floor(Math.random() * encouragements.length)];
  else content = 'Just wanted to share my journey with this amazing community. Thank you all for the support! 💙';

  const hasImage = Math.random() > 0.6;

  // Curated list of valid Unsplash images for posts
  const validPostImages = [
    'photo-1488521787991-ed7bbaae773c', // Medical/healthcare
    'photo-1509099863731-ef4bff19e808', // Education
    'photo-1503428593586-e225b39bddfe', // Skills/training
    'photo-1427504494785-3a9ca7044f45', // Community
    'photo-1523240795612-9a054b0db644', // Team success
    'photo-1517245386807-bb43f82c33c4', // Office/professional
    'photo-1522071820081-009f0129c71c', // Group meeting
    'photo-1531545514256-b1400bc00f31', // Celebration
    'photo-1529156069898-49953e39b3ac', // Collaboration
    'photo-1521737711867-e3b97375f902', // Classroom
    'photo-1544776193-352d25ca82cd', // Graduation
    'photo-1523050854058-8df90110c9f1', // University campus
    'photo-1517048676732-d65bc937f952', // Professional workspace
    'photo-1542744173-8e7e53415bb0', // Modern office
    'photo-1573164713988-8665fc963095', // Business meeting
  ];

  // Support multiple images (20% chance)
  const multipleImages = hasImage && Math.random() > 0.8;
  const numImages = multipleImages ? Math.floor(Math.random() * 2) + 2 : 1; // 2-3 images

  const images = hasImage ? Array.from({ length: numImages }, () =>
    `https://images.unsplash.com/${validPostImages[Math.floor(Math.random() * validPostImages.length)]}?w=800&q=80`
  ) : undefined;

  // Add goal for Request posts (80% chance)
  const hasGoal = category === 'Request' && Math.random() > 0.2;
  const goalTypes: ('money' | 'job' | 'travel' | 'other')[] = ['money', 'job', 'travel', 'other'];
  const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)];
  const targetAmount = goalType === 'money' ? Math.floor(Math.random() * 10000) + 1000 : 0;
  const raisedAmount = goalType === 'money' ? Math.floor(Math.random() * targetAmount) : 0;
  const progressPercentage = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;

  return {
    id: i + 1,
    author: {
      name: getRandomName(),
      avatar: `https://images.unsplash.com/${unsplashCategories[Math.floor(Math.random() * unsplashCategories.length)]}?w=100&fit=crop&q=80`,
      role: 'Member'
    },
    content,
    images: images && images.length > 1 ? images : undefined,
    image: images && images.length === 1 ? images[0] : undefined,
    category,
    likes: Math.floor(Math.random() * 5000) + 10,
    comments: Math.floor(Math.random() * 500) + 1,
    timestamp: getRandomTimestamp(),
    isLiked: Math.random() > 0.7,
    // Add replies to some posts (30% chance)
    replies: Math.random() > 0.7 ? Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: j + 1,
      author: {
        name: getRandomName(),
        avatar: `https://images.unsplash.com/${unsplashCategories[Math.floor(Math.random() * unsplashCategories.length)]}?w=100&fit=crop&q=80`
      },
      content: ['This is inspiring! 🙏', 'Thank you for sharing!', 'Praying for you!', 'God bless you!', 'Keep going strong! 💪'][Math.floor(Math.random() * 5)],
      timestamp: getRandomTimestamp(),
      likes: Math.floor(Math.random() * 200)
    })) : undefined,
    // Add goal for Request posts
    goal: hasGoal ? {
      type: goalType,
      target: goalType === 'money' ? targetAmount : ['Software Developer', 'Travel to Medical Conference', 'Community Project Support'][Math.floor(Math.random() * 3)],
      raised: raisedAmount,
      deadline: Math.random() > 0.5 ? new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      milestones: goalType === 'money' && Math.random() > 0.5 ? [
        { title: 'Initial funding', amount: Math.floor(targetAmount * 0.25), reached: progressPercentage >= 25 },
        { title: 'Halfway point', amount: Math.floor(targetAmount * 0.5), reached: progressPercentage >= 50 },
        { title: 'Final push', amount: Math.floor(targetAmount * 0.75), reached: progressPercentage >= 75 },
      ] : undefined,
      supporters: raisedAmount > 0 ? Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, k) => ({
        name: getRandomName(),
        avatar: `https://images.unsplash.com/${unsplashCategories[Math.floor(Math.random() * unsplashCategories.length)]}?w=50&fit=crop&q=80`,
        amount: Math.floor(Math.random() * 500) + 10,
        timestamp: getRandomTimestamp(),
      })) : undefined,
    } : undefined
  };
});

// Generate 200 programs
export const programs: Program[] = Array.from({ length: 200 }, (_, i) => {
  const categories: Program['category'][] = ['Healthcare', 'Skills', 'Housing', 'Education'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  const programTitles = {
    Healthcare: ['Healthcare Support Initiative', 'Medical Aid Program', 'Emergency Healthcare Fund', 'Family Health Coverage', 'Surgical Assistance Program'],
    Skills: ['Professional Skills Training', 'Vocational Development', 'Entrepreneurship Bootcamp', 'Digital Skills Academy', 'Trade Certification Program'],
    Housing: ['Emergency Housing Support', 'Affordable Housing Initiative', 'Shelter Assistance Program', 'Home Renovation Fund', 'Family Housing Project'],
    Education: ['University Scholarship Program', 'Secondary School Support', 'Adult Education Initiative', 'STEM Scholarship Fund', 'Girls Education Program']
  };

  const titles = programTitles[category];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const totalSpots = Math.floor(Math.random() * 100) + 20;
  const spotsAvailable = Math.floor(Math.random() * totalSpots);

  const statuses: Program['status'][] = ['open', 'closing_soon', 'closed'];
  const status = spotsAvailable > 5 ? 'open' : spotsAvailable > 0 ? 'closing_soon' : 'closed';

  // Valid program images by category
  const programImages = {
    Healthcare: ['photo-1538108149393-fbbd81895907', 'photo-1584820927498-cfe5211fd8bf', 'photo-1519494026892-80bbd2d6fd0d'],
    Skills: ['photo-1522202176988-66273c2fd55f', 'photo-1517245386807-bb43f82c33c4', 'photo-1552664730-d307ca884978'],
    Housing: ['photo-1560518883-ce09059eeffa', 'photo-1556912172-45b7abe8b7e1', 'photo-1494526585095-c41746248156'],
    Education: ['photo-1503676260728-1c00da094a0b', 'photo-1427504494785-3a9ca7044f45', 'photo-1509062522246-3755977927d7']
  };

  const categoryImages = programImages[category];
  const selectedImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];

  return {
    id: i + 1,
    title,
    category,
    description: `This program provides comprehensive support in ${category.toLowerCase()} to families and individuals in need.`,
    spotsAvailable,
    totalSpots,
    image: `https://images.unsplash.com/${selectedImage}?w=500&q=80`,
    coverImage: `https://images.unsplash.com/${selectedImage}?w=1200&q=80`,
    status,
    about: `Our ${title} is dedicated to transforming lives through targeted support and resources. We believe everyone deserves access to quality ${category.toLowerCase()} regardless of their financial situation.`,
    impact: {
      beneficiaries: Math.floor(Math.random() * 5000) + 100,
      fundsRaised: `$${(Math.floor(Math.random() * 900) + 100)}K`,
      successRate: `${Math.floor(Math.random() * 20) + 80}%`
    },
    organizer: {
      name: getRandomName(),
      avatar: `https://images.unsplash.com/${unsplashCategories[Math.floor(Math.random() * unsplashCategories.length)]}?w=100&fit=crop&q=80`,
      role: 'Program Director'
    },
    videos: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, j) => ({
      id: j + 1,
      title: ['Success Story', 'Testimonial', 'Life Changed', 'Journey to Success', 'How We Help'][Math.floor(Math.random() * 5)],
      thumbnail: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&q=80`,
      duration: `${Math.floor(Math.random() * 8) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      views: `${Math.floor(Math.random() * 50) + 5}K`
    })),
    updates: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
      id: j + 1,
      content: `🎉 Amazing update! We just helped ${Math.floor(Math.random() * 50) + 10} more families through this program. Your support makes all the difference!`,
      image: Math.random() > 0.5 ? `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=600&q=80` : undefined,
      timestamp: getRandomTimestamp(),
      likes: Math.floor(Math.random() * 3000) + 100
    }))
  };
});

// Featured Program with full details (ID 1)
programs[0] = {
  ...programs[0],
  id: 1,
  title: 'Emergency Healthcare Support Initiative',
  category: 'Healthcare',
  description: 'Providing life-saving medical care and surgical support to families who cannot afford critical healthcare services.',
  introVideo: {
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
    duration: '12:34',
    title: 'Why We Started the Emergency Healthcare Initiative'
  },
  reason: `In Nigeria, thousands of families face medical emergencies they cannot afford. We established this program after witnessing countless preventable deaths due to lack of funds for surgery, medication, and treatment.

Every year, over 15,000 children die from treatable conditions simply because their families cannot afford basic medical care. We decided this had to change.

This program was born from the story of Amina, a 7-year-old girl who needed urgent heart surgery. Her family sold everything they had but still couldn't raise the ₦500,000 needed. By the time they reached us, it was too late.

We vowed never to let this happen again. Today, we've successfully helped over 2,847 families access life-saving healthcare. But we need more support to reach everyone who needs help.`,

  qualifications: [
    'Must be a Nigerian citizen or legal resident',
    'Provide medical documentation from a registered hospital',
    'Family income below ₦150,000/month',
    'Must have exhausted other funding options (NHIS, family, community)',
    'Willing to share your story to inspire others (optional)'
  ],

  requirements: [
    'Valid national identification (NIN, Voter\'s Card, or Passport)',
    'Medical reports and doctor\'s recommendation letter',
    'Proof of income (bank statements or employer letter)',
    'Hospital cost breakdown and invoice',
    '2 reference letters from community leaders',
    'Recent passport photograph'
  ],

  criteria: [
    '**Medical Urgency (40%)** - Life-threatening conditions prioritized',
    '**Financial Need (30%)** - Family\'s inability to pay for treatment',
    '**Documentation Completeness (15%)** - All required documents submitted',
    '**Community Support (10%)** - Letters of recommendation quality',
    '**Story Impact (5%)** - Potential to inspire and help others'
  ],

  howToApply: `**Application Process** (3 Simple Steps)

1. **Submit Video Application** - Record a 3-5 minute video telling us:
   - Your medical situation
   - What treatment you need
   - Why you cannot afford it
   - How this program will change your life

2. **AI Preliminary Interview** - Our AI assistant will chat with you to:
   - Verify you meet basic qualifications
   - Collect additional information
   - Ensure you understand the process
   - Record your responses for review

3. **Executive Review** - Our medical board will:
   - Review your video and documents
   - Verify medical necessity
   - Make final approval decision
   - Contact you within 7-10 business days`,

  benefits: [
    '100% coverage of approved medical costs (up to ₦2,000,000)',
    'Direct payment to hospital - no cash handling',
    'Post-treatment follow-up support for 6 months',
    'Connection to ongoing medical support programs',
    'Priority access to future healthcare initiatives',
    'Counseling and mental health support',
    'Transportation allowance for medical appointments'
  ],

  timeline: [
    {
      phase: 'Application Submission',
      duration: '1-3 days',
      description: 'Complete video application and AI interview'
    },
    {
      phase: 'Document Verification',
      duration: '3-5 days',
      description: 'Our team verifies all submitted documents'
    },
    {
      phase: 'Executive Review',
      duration: '5-7 days',
      description: 'Medical board reviews and makes decision'
    },
    {
      phase: 'Approval & Payment',
      duration: '1-2 days',
      description: 'Funds transferred directly to hospital'
    },
    {
      phase: 'Treatment',
      duration: 'Varies',
      description: 'Receive your medical treatment'
    },
    {
      phase: 'Follow-up Support',
      duration: '6 months',
      description: 'Ongoing support and check-ins'
    }
  ],

  closeDate: '2025-12-31',

  executives: [
    {
      id: 1,
      name: 'Dr. Adewale Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
      role: 'Chief Medical Officer',
      email: 'dr.adewale@impactnet.ng'
    },
    {
      id: 2,
      name: 'Blessing Okonkwo',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop&q=80',
      role: 'Program Director',
      email: 'blessing@impactnet.ng'
    },
    {
      id: 3,
      name: 'Chidi Nwankwo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&fit=crop&q=80',
      role: 'Finance Manager',
      email: 'chidi@impactnet.ng'
    }
  ],

  spotsAvailable: 45,
  totalSpots: 100,
  status: 'open',
  image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=500&q=80',
  coverImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80'
};

// Generate 300 messages
export const messages: Message[] = Array.from({ length: 300 }, (_, i) => ({
  id: i + 1,
  user: {
    name: getRandomName(),
    avatar: `https://images.unsplash.com/${unsplashCategories[Math.floor(Math.random() * unsplashCategories.length)]}?w=100&fit=crop&q=80`
  },
  lastMessage: [
    'Thank you for your help!',
    'When is the next interview?',
    'I uploaded the documents.',
    'Please check my application.',
    'Congratulations on passing!',
    'Can we schedule a call?',
    'I have a question about the program.',
  ][Math.floor(Math.random() * 7)],
  timestamp: getRandomTimestamp(),
  unread: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
  online: Math.random() > 0.6
}));

// ImpactNet Organization Posts - Real transparency posts showing exact amounts
const impactNetPosts: Post[] = [
  {
    id: 99001,
    author: {
      name: 'ImpactNet',
      avatar: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&fit=crop&q=80',
      role: 'Organization',
      isOrganization: true
    },
    content: '',
    category: 'Impact',
    likes: 4520,
    comments: 342,
    timestamp: '3 hours ago',
    isLiked: false,
    images: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
      'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80'
    ],
    helpDetails: {
      beneficiary: 'Amina Ibrahim',
      amountSpent: '₦450,000',
      story: 'Today we completed surgery for Amina\'s 8-year-old daughter who needed urgent heart surgery. The family couldn\'t afford the ₦450,000 cost. Thanks to donations from 127 supporters, the surgery was successful and she\'s now recovering well.',
      transactionId: 'TXN-2025-001892',
      receipts: ['https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80']
    },
    replies: [
      {
        id: 1,
        author: { name: 'Sarah Williams', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80' },
        content: 'This is amazing! So glad I could contribute. How is the little one doing now?',
        timestamp: '2 hours ago',
        likes: 89
      },
      {
        id: 2,
        author: { name: 'Michael Okonkwo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80' },
        content: 'Love the transparency! Every naira accounted for. This is how charity should work 🙏',
        timestamp: '1 hour ago',
        likes: 125
      }
    ]
  },
  {
    id: 99002,
    author: {
      name: 'ImpactNet',
      avatar: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&fit=crop&q=80',
      role: 'Organization',
      isOrganization: true
    },
    content: '',
    category: 'Impact',
    likes: 3890,
    comments: 278,
    timestamp: '1 day ago',
    isLiked: true,
    images: [
      'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80'
    ],
    helpDetails: {
      beneficiary: 'Chidi Nwankwo',
      amountSpent: '₦280,000',
      story: 'Chidi just received his full tailoring equipment set + 6 months of workshop rent paid. Total investment: ₦280,000. He completed our skills training program and is now starting his own business. We don\'t just train - we set people up for success.',
      transactionId: 'TXN-2025-001845',
      receipts: ['https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80']
    }
  },
  {
    id: 99003,
    author: {
      name: 'ImpactNet',
      avatar: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&fit=crop&q=80',
      role: 'Organization',
      isOrganization: true
    },
    content: '',
    category: 'Impact',
    likes: 5240,
    comments: 412,
    timestamp: '2 days ago',
    isLiked: false,
    images: [
      'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80'
    ],
    helpDetails: {
      beneficiary: 'Blessing Adeyemi',
      amountSpent: '₦1,250,000',
      story: 'Full university scholarship activated for Blessing! Tuition (₦850K), accommodation (₦250K), books & supplies (₦100K), living allowance (₦50K). Every semester we\'ll post exactly where the money goes. Education should never be limited by finances.',
      transactionId: 'TXN-2025-001823',
      receipts: ['https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80']
    },
    replies: [
      {
        id: 1,
        author: { name: 'Blessing Adeyemi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop&q=80' },
        content: 'I still can\'t believe this is real! Thank you ImpactNet and all the donors. I promise to make you proud! 🎓❤️',
        timestamp: '2 days ago',
        likes: 892
      }
    ]
  }
];

// Insert ImpactNet posts at the beginning of regular posts array
posts.unshift(...impactNetPosts);

// Campaigns data - Full transparency
export const campaigns: Campaign[] = [
  {
    id: 1,
    title: 'Emergency Medical Fund 2025',
    description: 'Covering urgent medical expenses for families who can\'t afford life-saving treatments.',
    goal: 10000000,
    raised: 7850000,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
    status: 'active',
    startDate: 'January 2025',
    category: 'Healthcare',
    beneficiaries: [
      {
        id: 1,
        name: 'Amina Ibrahim',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
        story: 'Heart surgery for 8-year-old daughter',
        amountReceived: '₦450,000',
        date: 'Nov 1, 2025',
        location: 'Lagos'
      },
      {
        id: 2,
        name: 'Tunde Okafor',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop&q=80',
        story: 'Diabetes medication and insulin supply - 6 months',
        amountReceived: '₦180,000',
        date: 'Oct 28, 2025',
        location: 'Abuja'
      },
      {
        id: 3,
        name: 'Grace Eze',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&fit=crop&q=80',
        story: 'Emergency caesarean section - mother and baby doing well',
        amountReceived: '₦320,000',
        date: 'Oct 25, 2025',
        location: 'Port Harcourt'
      }
    ],
    transactions: [
      {
        id: 1,
        date: 'Nov 1, 2025',
        description: 'Lagos University Teaching Hospital - Heart Surgery',
        amount: '₦450,000',
        recipient: 'LUTH Medical Center',
        transactionId: 'TXN-2025-001892',
        category: 'Medical',
        receipt: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80'
      },
      {
        id: 2,
        date: 'Oct 28, 2025',
        description: 'Insulin & Medication Supply - 6 months',
        amount: '₦180,000',
        recipient: 'HealthPlus Pharmacy',
        transactionId: 'TXN-2025-001871',
        category: 'Medical',
        receipt: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80'
      },
      {
        id: 3,
        date: 'Oct 25, 2025',
        description: 'Emergency C-Section Surgery',
        amount: '₦320,000',
        recipient: 'Rivers State Hospital',
        transactionId: 'TXN-2025-001856',
        category: 'Medical',
        receipt: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80'
      }
    ]
  },
  {
    id: 2,
    title: 'Skills Training & Business Startup Fund',
    description: 'Not just training - we provide tools, equipment, and startup capital for graduates.',
    goal: 5000000,
    raised: 4200000,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    status: 'active',
    startDate: 'January 2025',
    category: 'Skills Development',
    beneficiaries: [
      {
        id: 1,
        name: 'Chidi Nwankwo',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
        story: 'Tailoring business - full equipment set + 6 months workshop rent',
        amountReceived: '₦280,000',
        date: 'Oct 31, 2025',
        location: 'Enugu'
      },
      {
        id: 2,
        name: 'Ngozi Ajayi',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&fit=crop&q=80',
        story: 'Hairdressing salon setup - complete equipment + 3 months rent',
        amountReceived: '₦350,000',
        date: 'Oct 27, 2025',
        location: 'Ibadan'
      }
    ],
    transactions: [
      {
        id: 1,
        date: 'Oct 31, 2025',
        description: 'Tailoring Equipment Package',
        amount: '₦180,000',
        recipient: 'Singer Nigeria Ltd',
        transactionId: 'TXN-2025-001845',
        category: 'Equipment'
      },
      {
        id: 2,
        date: 'Oct 31, 2025',
        description: 'Workshop Rent - 6 months advance',
        amount: '₦100,000',
        recipient: 'Property Owner - Mr. Okeke',
        transactionId: 'TXN-2025-001846',
        category: 'Rent'
      }
    ]
  },
  {
    id: 3,
    title: 'University Scholarship Program 2025',
    description: 'Full scholarships covering tuition, accommodation, books, and living expenses.',
    goal: 15000000,
    raised: 12500000,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    status: 'active',
    startDate: 'September 2025',
    category: 'Education',
    beneficiaries: [
      {
        id: 1,
        name: 'Blessing Adeyemi',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop&q=80',
        story: 'Full scholarship - Computer Science, University of Lagos',
        amountReceived: '₦1,250,000',
        date: 'Oct 15, 2025',
        location: 'Lagos'
      }
    ],
    transactions: [
      {
        id: 1,
        date: 'Oct 15, 2025',
        description: 'Tuition Fee - 1st Semester',
        amount: '₦850,000',
        recipient: 'University of Lagos',
        transactionId: 'TXN-2025-001823',
        category: 'Tuition'
      },
      {
        id: 2,
        date: 'Oct 15, 2025',
        description: 'Accommodation - On-campus hostel',
        amount: '₦250,000',
        recipient: 'UNILAG Student Affairs',
        transactionId: 'TXN-2025-001824',
        category: 'Accommodation'
      },
      {
        id: 3,
        date: 'Oct 16, 2025',
        description: 'Books & Study Materials',
        amount: '₦100,000',
        recipient: 'Campus Bookstore',
        transactionId: 'TXN-2025-001825',
        category: 'Books'
      }
    ]
  }
];

// User profile data
export const userProfile = {
  name: 'Jane Doe',
  headline: 'Hopeful Student & Mother of 2',
  location: 'Lagos, Nigeria',
  email: 'jane.doe@email.com',
  phone: '+234 801 234 5678',
  joinDate: 'November 2025',
  bio: 'I am a dedicated mother of two beautiful children, seeking opportunities to improve our lives through education and skill development. I believe in the power of community and helping others achieve their dreams. Currently applying for healthcare support and skills training programs to create a better future for my family.',
  stats: {
    connections: 156,
    posts: 12,
    applications: 3
  },
  referralCode: 'JANE2025XYZ',
  referralStats: {
    referrals: 5,
    points: 50
  },
  coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&fit=crop&q=80',
  title: 'Aspiring Educator & Community Builder',
  socialLinks: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/janedoe', icon: 'linkedin' },
    { platform: 'Twitter', url: 'https://twitter.com/janedoe', icon: 'twitter' }
  ]
};

// Marketplace - Products from beneficiaries (ImpactNet takes 5% transaction fee)
export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: 1,
    seller: {
      name: 'Chidi Nwankwo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
      story: 'Skills Training Graduate - Class of 2025',
      programGraduate: true
    },
    title: 'Custom Tailored Men\'s Suit',
    description: 'Premium quality custom-fitted suits. Measurements taken, perfect fit guaranteed. 2-week delivery.',
    price: '₦35,000',
    images: [
      'https://images.unsplash.com/photo-1594938384039-5fea1c9d89ab?w=600&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'
    ],
    category: 'Fashion',
    sales: 47,
    rating: 4.9,
    inStock: true
  },
  {
    id: 2,
    seller: {
      name: 'Ngozi Ajayi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&fit=crop&q=80',
      story: 'Skills Training Graduate - Class of 2025',
      programGraduate: true
    },
    title: 'Professional Hair Braiding Service',
    description: 'All styles - Box braids, Cornrows, Twists. Premium quality hair included. Home service available in Lagos.',
    price: '₦15,000',
    images: [
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80',
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80'
    ],
    category: 'Beauty',
    sales: 89,
    rating: 5.0,
    inStock: true
  },
  {
    id: 3,
    seller: {
      name: 'Emmanuel Okoro',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop&q=80',
      story: 'Skills Training Graduate - Class of 2024',
      programGraduate: true
    },
    title: 'Handcrafted Wooden Furniture',
    description: 'Custom tables, chairs, cabinets. Solid wood, professional finish. Free delivery within Abuja.',
    price: '₦45,000',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      'https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=600&q=80'
    ],
    category: 'Home & Living',
    sales: 34,
    rating: 4.8,
    inStock: true
  }
];

// Brand Partnerships (Sponsors pay for CSR visibility)
export const partnerships: Partnership[] = [
  {
    id: 1,
    brand: {
      name: 'GTBank',
      logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=80',
      website: 'https://gtbank.com'
    },
    campaign: 'Emergency Medical Fund 2025',
    amountSponsored: '₦2,500,000',
    beneficiaries: 12,
    startDate: 'January 2025',
    status: 'active',
    visibility: 'featured'
  },
  {
    id: 2,
    brand: {
      name: 'MTN Nigeria',
      logo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&q=80',
      website: 'https://mtn.ng'
    },
    campaign: 'University Scholarship Program',
    amountSponsored: '₦5,000,000',
    beneficiaries: 8,
    startDate: 'September 2024',
    status: 'active',
    visibility: 'featured'
  },
  {
    id: 3,
    brand: {
      name: 'Dangote Foundation',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
      website: 'https://dangote-foundation.org'
    },
    campaign: 'Skills Training & Business Startup',
    amountSponsored: '₦3,200,000',
    beneficiaries: 25,
    startDate: 'March 2025',
    status: 'active',
    visibility: 'featured'
  }
];

// Premium Subscription Tiers
export const premiumTiers: PremiumTier[] = [
  {
    id: 1,
    name: 'Free',
    price: '₦0',
    period: 'monthly',
    badge: 'Member',
    features: [
      'Apply to programs',
      'Community access',
      'Basic profile',
      'View transparency reports'
    ]
  },
  {
    id: 2,
    name: 'Impact Plus',
    price: '₦2,500',
    period: 'monthly',
    badge: 'Verified Impact Member',
    popular: true,
    features: [
      'Everything in Free',
      'Verified badge',
      'Priority application review',
      'Detailed impact dashboard',
      'Monthly impact reports',
      'Early access to new programs',
      'Profile highlights'
    ]
  },
  {
    id: 3,
    name: 'Impact Pro',
    price: '₦5,000',
    period: 'monthly',
    badge: 'Premium Donor',
    features: [
      'Everything in Impact Plus',
      'Exclusive donor dashboard',
      'Direct beneficiary updates',
      'Tax-deductible receipts',
      'Quarterly video reports',
      'Name on campaigns',
      'Marketplace seller privileges (0% fee)',
      'Private community access'
    ]
  }
];

// Revenue Streams Summary
export const revenueStreams = {
  marketplace: {
    model: 'Transaction Fee',
    rate: '5% per sale',
    monthlyRevenue: '₦450,000',
    description: 'Program graduates sell products/services. ImpactNet takes 5% (waived for Pro members).'
  },
  premiumSubscriptions: {
    model: 'Monthly Subscriptions',
    impactPlus: '₦2,500/month',
    impactPro: '₦5,000/month',
    subscribers: 1240,
    monthlyRevenue: '₦4,200,000',
    description: 'Premium features: verified badges, detailed reports, priority support.'
  },
  partnerships: {
    model: 'Brand Sponsorships',
    rate: 'Custom packages',
    monthlyRevenue: '₦8,500,000',
    description: 'Brands sponsor campaigns for CSR visibility. Full transparency tracking.'
  },
  transparencyService: {
    model: 'Service Fee for NGOs',
    rate: '₦50,000 - ₦500,000/year',
    clients: 12,
    monthlyRevenue: '₦350,000',
    description: 'NGOs/Companies use our platform to track and showcase their donations.'
  },
  affiliateCommissions: {
    model: 'Affiliate Partnerships',
    monthlyRevenue: '₦180,000',
    description: 'Commissions from education platforms, financial services partnerships.'
  },
  totalMonthlyRevenue: '₦13,680,000',
  impactReinvestment: '70%', // 70% goes back to programs
  operatingCosts: '20%',
  sustainabilityFund: '10%'
};
