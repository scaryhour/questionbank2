# QuestionBank — Deployment Guide
# ================================
# Follow these steps in order. Takes about 30 minutes.

## STEP 1 — Set up Supabase (free database)

1. Go to https://supabase.com and sign up (free)
2. Click "New Project", give it a name e.g. "questionbank"
3. Wait for it to set up (~2 minutes)
4. Go to the SQL Editor (left sidebar) and run this SQL to create the questions table:

```sql
create table questions (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  level text not null,
  topic text not null,
  question text not null,
  answer text not null,
  difficulty text default 'medium',
  source text default 'ai',
  created_at timestamp with time zone default now()
);

-- Allow public read access
alter table questions enable row level security;
create policy "Anyone can read questions" on questions for select using (true);
create policy "Anyone can insert questions" on questions for insert with check (true);
```

5. Go to Settings → API
6. Copy these two values — you will need them later:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - anon public key (long string starting with eyJ...)


## STEP 2 — Get your Anthropic API key

1. Go to https://console.anthropic.com and sign up
2. Go to API Keys → Create Key
3. Copy the key (starts with sk-ant-...)
4. Add credit to your account (minimum $5 — very cheap, 1000 questions ≈ $0.50)


## STEP 3 — Deploy to Vercel (free hosting)

1. Go to https://github.com and sign up if you don't have an account
2. Create a new repository called "questionbank"
3. Upload all the project files to that repository

   Easiest way — use GitHub Desktop:
   a. Download from https://desktop.github.com
   b. File → Add Local Repository → select this folder
   c. Commit and Push

4. Go to https://vercel.com and sign up with your GitHub account
5. Click "New Project" → Import your "questionbank" repository
6. Before clicking Deploy, click "Environment Variables" and add:

   ANTHROPIC_API_KEY        = your key from Step 2
   NEXT_PUBLIC_SUPABASE_URL = your URL from Step 1
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your anon key from Step 1

7. Click Deploy
8. Wait ~2 minutes — your site will be live at https://questionbank.vercel.app


## STEP 4 — Test your site

1. Open your Vercel URL
2. Search for "Newton's laws"
3. If no results, click "Generate with AI"
4. Questions should appear within 10 seconds


## Troubleshooting

Problem: "Failed to generate questions"
Fix: Check that ANTHROPIC_API_KEY is correct in Vercel environment variables

Problem: Questions generate but don't save
Fix: Check that Supabase URL and key are correct, and that you ran the SQL in Step 1

Problem: Site doesn't load
Fix: In Vercel dashboard, click your project → Deployments → check the error log


## Costs

- Vercel hosting: FREE
- Supabase database: FREE (up to 500MB)
- Anthropic API: ~$0.001 per question generated (very cheap)
  → 1,000 questions generated = about $1 USD
