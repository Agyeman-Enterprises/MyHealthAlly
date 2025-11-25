# Troubleshooting Internal Server Errors

## Quick Checks

1. **Backend Server Status**
   - Backend should be running on port **3001**
   - Check: `http://localhost:3001/`
   - Should return: `{ "message": "MyHealthAlly API", ... }`

2. **Frontend Server Status**
   - Frontend should be running on port **3000**
   - Check: `http://localhost:3000/`
   - Should redirect to `/marketing`

3. **Common Issues**

### Backend Not Running
If you see "Unable to connect to the server" errors:
```powershell
cd packages/backend
npm run dev
```

### Port Conflicts
- Backend: Port 3001
- Frontend: Port 3000
- If ports are in use, check with: `netstat -ano | findstr :3001`

### Database Connection
If health check fails:
- Ensure PostgreSQL is running
- Check `.env` file has correct `DATABASE_URL`
- Run migrations: `npx prisma migrate dev`

## Error Logging

The backend now has a global exception filter that logs all errors:
- Check terminal output for detailed error messages
- 500 errors are logged with full stack traces
- 400 errors are logged as warnings

## Testing Endpoints

### Backend Health
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
```

### Backend Root
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/" -UseBasicParsing
```

### Frontend
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
```

## Common API Errors

### 401 Unauthorized
- Token expired or invalid
- Check `AuthContext` for token refresh logic
- Verify JWT_SECRET in backend `.env`

### 404 Not Found
- Endpoint doesn't exist
- Check route path matches controller
- Verify module is imported in `app.module.ts`

### 500 Internal Server Error
- Check backend terminal for stack trace
- Verify database connection
- Check Prisma schema matches database
- Verify all required environment variables are set

## Restarting Servers

### Backend
```powershell
cd packages/backend
npm run dev
```

### Frontend
```powershell
cd packages/web
npm run dev
```

## Environment Variables

Ensure both `.env` files are configured:
- `packages/backend/.env`
- `packages/web/.env`

Required backend variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (optional, defaults to 3001)

Required frontend variables:
- `NEXT_PUBLIC_API_URL` (optional, defaults to http://localhost:3001)
