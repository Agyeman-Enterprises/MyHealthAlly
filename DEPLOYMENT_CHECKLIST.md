# MyHealthAlly Web App - Deployment Checklist

Use this checklist to ensure a successful deployment to production.

## Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed (or documented)
- [ ] Production build succeeds locally (`pnpm --filter @myhealthally/web build`)
- [ ] No console errors in browser DevTools
- [ ] All routes tested locally

### Git Repository
- [ ] Git repository initialized
- [ ] All files committed
- [ ] `.gitignore` properly configured
- [ ] GitHub repository created: `myhealthally-web`
- [ ] Code pushed to `main` branch

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` defined (production API URL)
- [ ] `NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY` defined
- [ ] `NODE_ENV` set to `production`

## Vercel Configuration

### Project Setup
- [ ] Repository imported from GitHub
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Root Directory: `packages/web`
- [ ] Build Command: `pnpm install && pnpm --filter @myhealthally/web build`
- [ ] Output Directory: `.next` (auto-detected)
- [ ] Install Command: `pnpm install`
- [ ] Node Version: 18.x

### Environment Variables in Vercel
- [ ] `NEXT_PUBLIC_API_URL` = `https://api.myhealthally.com`
- [ ] `NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY` = (your API key)
- [ ] `NODE_ENV` = `production`

### Deployment Settings
- [ ] Production branch: `main`
- [ ] Automatic deployments: Enabled
- [ ] Serverless functions: Enabled

## Deployment

- [ ] Initial deployment triggered
- [ ] Build completed successfully (check Vercel logs)
- [ ] Production URL received: `https://myhealthally-web.vercel.app`
- [ ] Preview URL received (for PRs)

## Post-Deployment QA

### Design & Styling
- [ ] Teal brand color `#39C6B3` visible across all pages
- [ ] 6px border radius applied to cards, buttons, inputs
- [ ] Typography matches design system (Inter font)
- [ ] Shadows match theme.json
- [ ] Responsive design works on mobile devices

### Patient App Routes
- [ ] `/patient/dashboard` - Loads and displays data
- [ ] `/patient/analytics` - Charts render correctly
- [ ] `/patient/analytics` - BMI graph displays
- [ ] `/patient/labs` - Orders tab loads
- [ ] `/patient/labs` - Results tab loads
- [ ] `/patient/profile` - Profile tab loads
- [ ] `/patient/profile` - Referrals tab loads
- [ ] `/patient/profile` - Documents tab loads
- [ ] `/patient/messages` - Messages load
- [ ] `/patient/messages` - AI thread works
- [ ] `/patient/schedule` - Schedule page loads

### Clinician Portal Routes
- [ ] `/clinician/dashboard` - Dashboard loads
- [ ] `/clinician/patients` - Patient list loads
- [ ] `/clinician/patients/[id]` - Patient detail loads
- [ ] `/clinician/visit/[id]` - Visit workspace loads
- [ ] `/clinician/tasks` - Tasks page loads
- [ ] `/clinician/messages` - Messages inbox loads
- [ ] `/clinician/labs` - Labs page loads

### Ohimaa Content Engine Routes
- [ ] `/content/programs` - Programs page loads
- [ ] `/content/meal-plans` - Meal plans load
- [ ] `/content/exercises` - Exercises load
- [ ] `/content/stress` - Stress resources load
- [ ] `/content/sleep` - Sleep resources load
- [ ] `/content/gi-reset` - GI reset program loads
- [ ] `/content/detox` - Detox program loads
- [ ] `/content/support` - Support page loads

### Technical Checks
- [ ] No 404 errors (check browser console)
- [ ] No JavaScript errors (check browser console)
- [ ] No missing assets (images, fonts, etc.)
- [ ] API calls succeed (check Network tab)
- [ ] Authentication flow works
- [ ] Protected routes redirect correctly
- [ ] Loading states display properly
- [ ] Error states handle gracefully

### Performance
- [ ] Page load times < 3 seconds
- [ ] Images optimized and loading
- [ ] Fonts loading correctly
- [ ] No layout shift (CLS)
- [ ] Lighthouse score > 80

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Custom Domain (Optional)

- [ ] Domain added in Vercel project settings
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] Domain verified and active

## Monitoring & Alerts

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (if applicable)
- [ ] Uptime monitoring set up (if applicable)
- [ ] Performance monitoring active

## Documentation

- [ ] Production URL documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented

## Sign-Off

- [ ] All checklist items completed
- [ ] QA testing passed
- [ ] Stakeholder approval received
- [ ] Production deployment confirmed

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Production URL**: _______________  
**Status**: ☐ Ready for Production ☐ Needs Fixes
