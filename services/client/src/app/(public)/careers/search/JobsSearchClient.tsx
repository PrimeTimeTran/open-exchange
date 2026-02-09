'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';

import { Button } from '@/components/ui';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/shared/components/ui/card';

export interface Job {
  id: string;
  remote: boolean;
  type: string | null;
  team: string | null;
  title: string | null;
  location: string | null;
  seniority: string | null;
  description: string | null;
}

interface JobsSearchClientProps {
  jobs: Job[];
}

export default function JobsSearchClient({ jobs }: JobsSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Extract unique teams from jobs
  const teams = Array.from(
    new Set(jobs.map((job) => job.team).filter((t): t is string => !!t)),
  );

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team],
    );
  };

  const filteredPositions = jobs.filter((job) => {
    const matchesSearch =
      (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    const matchesTeam =
      selectedTeams.length === 0 ||
      (job.team && selectedTeams.includes(job.team));

    return matchesSearch && matchesTeam;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <section id="open-roles" className="py-12 px-6">
        <div className="container mx-auto max-w-7xl space-y-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/4 space-y-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, skill..."
                    className="pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Teams</h3>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Checkbox
                        id={`team-${team}`}
                        checked={selectedTeams.includes(team)}
                        onCheckedChange={() => toggleTeam(team)}
                      />
                      <Label
                        htmlFor={`team-${team}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {team}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Job List */}
            <div className="w-full lg:w-3/4 space-y-6">
              {filteredPositions.length === 0 ? (
                <div className="text-center py-12 border rounded-xl border-dashed">
                  <p className="text-muted-foreground">
                    No positions found matching your criteria.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTeams([]);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                filteredPositions.map((job) => (
                  <Card
                    key={job.id}
                    className="group hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {job.title}
                          </CardTitle>
                          <CardDescription>
                            {job.team} · {job.location} · {job.type}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          className="w-fit hover:bg-primary hover:text-on-primary"
                          asChild
                        >
                          <Link
                            href={`/careers/${
                              job.title
                                ? encodeURIComponent(
                                    job.title
                                      .replace(/\s+/g, '-')
                                      .toLowerCase(),
                                  )
                                : job.id
                            }`}
                          >
                            Learn More <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {/* Remove markdown headers roughly for preview */}
                        {job.description
                          ?.replace(/###/g, '')
                          .replace(/\*\*/g, '')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.seniority && (
                          <Badge
                            variant="secondary"
                            className="font-normal bg-primary text-on-primary"
                          >
                            {job.seniority}
                          </Badge>
                        )}
                        {job.remote && (
                          <Badge
                            variant="secondary"
                            className="font-normal bg-primary text-on-primary"
                          >
                            Remote
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="mt-16 text-center bg-card border border-border rounded-2xl p-12 space-y-6">
            <h3 className="text-2xl font-bold font-display">
              Don't see your role?
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We are always looking for exceptional talent. Send us your resume
              and tell us how you can contribute to the mission.
            </p>
            <Button variant="secondary" size="lg">
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
