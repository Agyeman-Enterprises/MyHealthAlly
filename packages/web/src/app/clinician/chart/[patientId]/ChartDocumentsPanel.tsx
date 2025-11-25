'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { File, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ChartDocumentsPanelProps {
  documents: any[];
}

export function ChartDocumentsPanel({ documents }: ChartDocumentsPanelProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-h3 flex items-center gap-2 text-slate-900">
            <File className="w-5 h-5 text-teal-600" />
            Documents
          </CardTitle>
          <Link href="/clinician/documents">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-50">
                    <File className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-body font-medium text-slate-900">
                      {doc.name || doc.title || doc.type}
                    </p>
                    <p className="text-caption mt-1 text-slate-600">
                      {new Date(doc.createdAt || doc.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.type && (
                    <Badge
                      variant="outline"
                      className="text-caption border-slate-200 text-slate-600"
                    >
                      {doc.type}
                    </Badge>
                  )}
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <File className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-body text-slate-600">
              No documents found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

