'use client';

import { builder } from '@builder.io/react';

const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY;

if (!apiKey) {
  console.warn('Builder API key is missing. Set NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY');
} else {
  builder.init(apiKey);
}

export { builder };

