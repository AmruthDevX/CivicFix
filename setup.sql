-- IMPORTANT: Run this entire script in your Supabase SQL Editor!

-- 1. Create the reports table securely linked to auth.users
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ticket_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the status history tracking table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor TEXT NOT NULL,
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Set up Row Level Security (RLS) for the reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- 4. Policies:
-- Anyone can view all reports (so the Community Feed works)
CREATE POLICY "Public profiles are viewable by everyone" ON reports FOR SELECT USING (true);
CREATE POLICY "History is viewable by everyone" ON status_history FOR SELECT USING (true);

-- Users can only insert their own reports
CREATE POLICY "Users can insert their own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Trigger/logic limits: Normally an Edge Function or DB Trigger handles updates and history inserts.
-- For this hackathon, we temporarily allow users to update their own reports.
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (auth.uid() = user_id);

-- Storage (Optional but recommended):
-- Go to Storage -> Create a new public bucket named "issue_images"
-- We will handle uploads from the frontend immediately into this bucket!
