# Get Supabase Database Connection String

## Quick Steps:

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com
   - Select your project

2. **Navigate to Database Settings:**
   - Click **Settings** (gear icon, left sidebar)
   - Click **Database**

3. **Get Connection String:**
   - Scroll to **Connection string**
   - Select **Connection pooling** tab
   - Select **Transaction** mode
   - Copy the connection string

4. **Add to `.env.local`:**
   ```env
   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

5. **If you don't know the password:**
   - In Database settings, look for **Database password**
   - Or click **Reset database password** if needed
   - The password is different from your Supabase account password

6. **Run migrations:**
   ```bash
   npm run migrate
   ```

