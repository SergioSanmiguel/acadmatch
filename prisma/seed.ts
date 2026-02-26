import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const users = [
    {
      name: 'Dr. Emily Chen',
      email: 'e.chen@mit.edu',
      image: null,
      university: 'MIT',
      country: 'United States',
      mainField: 'Computer Science',
      secondaryFields: ['Biology', 'Medicine'],
      researchLines: ['Machine Learning for Drug Discovery', 'Computational Genomics'],
      bio: 'Assistant Professor at MIT focusing on the intersection of AI and biomedical research.',
      googleScholarUrl: 'https://scholar.google.com',
      collaborationInterests: ['Co-authoring papers', 'Grant applications', 'Data sharing'],
      profileComplete: true,
    },
    {
      name: 'Prof. James Okafor',
      email: 'j.okafor@oxford.ac.uk',
      image: null,
      university: 'University of Oxford',
      country: 'United Kingdom',
      mainField: 'Physics',
      secondaryFields: ['Mathematics', 'Engineering'],
      researchLines: ['Quantum Computing', 'Topological Materials'],
      bio: 'Theoretical physicist with 15 years of experience in quantum systems.',
      collaborationInterests: ['Joint laboratories', 'Workshops & conferences'],
      profileComplete: true,
    },
    {
      name: 'Dr. María García',
      email: 'garcia@uam.es',
      image: null,
      university: 'Universidad Autónoma de Madrid',
      country: 'Spain',
      mainField: 'Psychology',
      secondaryFields: ['Neuroscience', 'Computer Science'],
      researchLines: ['Cognitive Neuroscience', 'Human-Computer Interaction'],
      bio: 'Researcher in cognitive psychology and neuroergonomics.',
      collaborationInterests: ['International projects', 'Open science'],
      profileComplete: true,
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  console.log('✅ Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
