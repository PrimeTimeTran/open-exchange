import { prisma } from '@/prisma';
import JobsSearchClient from './JobsSearchClient';

export const dynamic = 'force-dynamic';

export default async function CareersSearchPage() {
  const jobs = await prisma.job.findMany({
    select: {
      id: true,
      title: true,
      team: true,
      location: true,
      type: true,
      description: true,
      seniority: true,
      remote: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <JobsSearchClient jobs={jobs} />;
}
