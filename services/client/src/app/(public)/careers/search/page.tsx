'use client';

import React, { useState } from 'react';
import { ArrowRight, Code, Globe, Lock, Zap, Search } from 'lucide-react';

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

const positions = [
  {
    title: 'Senior Rust Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Build the core matching engine that powers the exchange. High performance, low latency.',
    tags: ['Rust', 'gRPC', 'Systems'],
  },
  {
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Craft beautiful and responsive interfaces for our traders. React, Next.js, Tailwind.',
    tags: ['React', 'TypeScript', 'Next.js'],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'New York / Remote',
    type: 'Full-time',
    description:
      'Design intuitive workflows for complex financial instruments.',
    tags: ['Figma', 'UX/UI', 'System Design'],
  },
  {
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Lead our user acquisition strategies and community growth initiatives.',
    tags: ['Growth', 'Analytics', 'Social'],
  },
  {
    title: 'Financial Analyst',
    department: 'Finance',
    location: 'New York',
    type: 'Full-time',
    description:
      'Analyze market trends and assist with financial planning and reporting.',
    tags: ['Finance', 'Excel', 'Modeling'],
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Define the roadmap and strategy for our core exchange products.',
    tags: ['Product Management', 'Strategy', 'Crypto'],
  },
];

const benefits = [
  {
    title: 'Open Source First',
    description:
      'Work on code that is visible to the world. Contribute to the ecosystem.',
    icon: <Code className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Remote Native',
    description: 'Work from anywhere. We value output over hours.',
    icon: <Globe className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Competitive Equity',
    description: 'Own a piece of the protocol you are building.',
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Privacy & Security',
    description:
      'Work on cutting edge cryptography and security implementations.',
    icon: <Lock className="w-6 h-6 text-primary" />,
  },
];

const teams = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Finance',
  'Operations',
];

export default function CareersSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team],
    );
  };

  const filteredPositions = positions.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesTeam =
      selectedTeams.length === 0 || selectedTeams.includes(job.department);

    return matchesSearch && matchesTeam;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      {/* <div className="py-12 px-6 border-b border-border/40 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-display font-bold">Open Roles</h1>
            <Button variant="ghost" asChild>
              <a href="/careers">Back to Careers</a>
            </Button>
          </div>
        </div>
      </div> */}

      {/* Open Positions */}
      <section id="open-roles" className="py-12 px-6">
        <div className="container mx-auto max-w-7xl space-y-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
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
                filteredPositions.map((job, index) => (
                  <Card
                    key={index}
                    className="group hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {job.title}
                          </CardTitle>
                          <CardDescription>
                            {job.department} · {job.location} · {job.type}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          className="w-fit hover:bg-primary hover:text-on-primary"
                        >
                          Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="font-normal bg-primary text-on-primary"
                          >
                            {tag}
                          </Badge>
                        ))}
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
