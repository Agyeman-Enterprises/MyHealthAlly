'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Grid } from '@/components/layout/Grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function ProgramsPage() {
  const programs = [
    {
      id: '1',
      title: 'Weight Management Program',
      description: 'Comprehensive 12-week program focusing on sustainable weight loss through nutrition, exercise, and lifestyle changes.',
      duration: '12 weeks',
      category: 'Weight Loss',
    },
    {
      id: '2',
      title: 'Diabetes Management',
      description: 'Learn to manage blood sugar levels effectively with personalized meal plans, medication management, and monitoring.',
      duration: 'Ongoing',
      category: 'Chronic Disease',
    },
    {
      id: '3',
      title: 'Heart Health Program',
      description: 'Improve cardiovascular health through diet, exercise, stress management, and regular monitoring.',
      duration: '16 weeks',
      category: 'Cardiac Health',
    },
  ];

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-h1 mb-2">Program Library</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Explore our evidence-based health programs
          </p>
        </div>

        <Grid cols={3} gap="lg" responsive>
          {programs.map((program) => (
            <Card key={program.id} hover>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                  <span
                    className="px-2 py-1 text-caption border-radius"
                    style={{
                      backgroundColor: 'var(--color-primary)' + '20',
                      color: 'var(--color-primary)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {program.category}
                  </span>
                </div>
                <CardTitle>{program.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                  {program.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                    Duration: {program.duration}
                  </span>
                  <Link href={`/content/programs/${program.id}`}>
                    <Button variant="outline" size="sm">
                      Learn More <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </div>
    </PageContainer>
  );
}

