# Canon Code Governance (Enterprise)

This repo is governed by strict correctness rules:
- Single-source enums/types in `lib/domain/*`
- Strict TS compiler flags
- No unsafe env defaults
- No inline JSX data shaping
- No TODO/FIXME/STUB
- No `as any` / `as unknown` / non-null assertions `!`

CI runs `npm run verify` and will fail on violations.

## Enforcement

- **ESLint**: Bans `as any`, `!`, `process.env`, TODO comments
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **JSX Guard**: Blocks `.map()/.filter()/.reduce()` in JSX return statements
- **CI/CD**: GitHub Actions runs `npm run verify` on every PR/push

## Rules

1. **Enums/Types**: All shared enums/types MUST live in `lib/domain/enums.ts` and `lib/domain/types.ts`
2. **Environment Variables**: Use `lib/env.ts` (zod-validated). Never `process.env.X || ""`
3. **Type Safety**: No `as any`, `as unknown`, or non-null assertions `!`
4. **Code Completeness**: No TODOs, FIXMEs, stubs, or placeholders
5. **JSX Purity**: No data shaping in JSX - move `.map()/.filter()/.reduce()` to variables/services

## Verification

Run `npm run verify` to check all rules:
- Linting (ESLint)
- Type checking (TypeScript)
- JSX shaping guard
- Build verification
