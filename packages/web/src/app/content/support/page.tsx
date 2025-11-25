'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, MessageSquare, FileText } from 'lucide-react';

export default function SupportPage() {
  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-h1 mb-2">Support</h1>
          <p className="text-body text-slate-600">
            Get help and find answers to your questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body mb-4 text-slate-600">
                Find answers to common questions about using MyHealthAlly, managing your health data, and connecting with your care team.
              </p>
              <Button variant="outline">View FAQ</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body mb-4 text-slate-600">
                Need help? Reach out to our support team via message or email. We&apos;re here to assist you.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body mb-4 text-slate-600">
                Access user guides, tutorials, and documentation to help you get the most out of MyHealthAlly.
              </p>
              <Button variant="outline">View Docs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

