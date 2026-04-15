# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization, give it a name (e.g. `feupload`), set a database password, and pick a region close to you
4. Wait for the project to finish provisioning

## 2. Get Your API Keys

1. In your project dashboard, go to **Settings** (gear icon) → **API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon / public** key (starts with `eyJhbG...`)

## 3. Configure the App

Create a `.env` file in the project root (next to `package.json`):

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

> Never commit this file — it's already in `.gitignore`.

## 4. Run the Database Migration

1. In the Supabase dashboard, go to **SQL Editor** → **New Query**
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** — this creates all tables, indexes, RLS policies, and the auto-profile trigger
4. Then paste and run `supabase/migrations/002_seed_data.sql` to populate the courses

## 5. Create Test Users (Optional)

1. Go to **Authentication** → **Users** → **Add User**
2. Create a user with email + password (e.g. `test@feup.up.pt` / `test1234`)
3. The trigger will automatically create a profile row for them
4. You can now sign in from the app

## 6. Start the App

```bash
npm install
npm start
```

Then press `w` for web, `i` for iOS simulator, or scan the QR code with Expo Go.
