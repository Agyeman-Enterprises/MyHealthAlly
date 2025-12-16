# PWA Environment Variables Setup

## Development

Create `pwa/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Production

Create `pwa/.env.production`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-production-domain.com
```

**Note:** Replace `api.your-production-domain.com` with your actual production API domain.

## Important

- `.env.local` and `.env.production` are in `.gitignore` and won't be committed
- Always use `NEXT_PUBLIC_` prefix for client-side environment variables
- Rebuild after changing environment variables: `npm run build`
