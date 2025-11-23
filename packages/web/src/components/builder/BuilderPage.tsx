'use client';

import { BuilderComponent } from '@builder.io/react';
import type { BuilderContent } from '@builder.io/react';
import { builder } from '@/lib/builder/builder.config';
import SafeHydrate from '@/components/SafeHydrate';

type BuilderPageProps = {
  model: string;
  urlPath: string;
  data?: Record<string, any>;
  content?: BuilderContent | null;
};

export async function fetchBuilderContent(model: string, urlPath: string) {
  const content = await builder
    .get(model, {
      userAttributes: { urlPath },
    })
    .toPromise();

  return content || null;
}

export function BuilderPage({
  model,
  urlPath,
  data = {},
  content,
}: BuilderPageProps) {
  return (
    <SafeHydrate>
      <BuilderComponent
        model={model}
        // @ts-ignore - Builder types can be loose
        options={{ userAttributes: { urlPath } }}
        data={data}
        // @ts-ignore - Builder content type mismatch
        content={content}
      />
    </SafeHydrate>
  );
}

