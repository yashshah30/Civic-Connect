-- ==============================================================================
-- Migration: 001_notifications_and_profiles_schema.sql
-- Description: Align public.notifications and public.profiles tables with backend
--              controllers and frontend components.
-- Safe & Idempotent: Uses IF NOT EXISTS and checks before altering/updating.
-- ==============================================================================

-- 1. ALIGN NOTIFICATIONS TABLE
-- Adds missing columns (title, type, is_read) expected by complaint & notification controllers.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text DEFAULT 'general';

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'is_read'
  ) THEN 
    ALTER TABLE public.notifications ADD COLUMN is_read boolean DEFAULT false;
    -- If legacy 'read' column exists, migrate existing status to 'is_read'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'read'
    ) THEN 
      UPDATE public.notifications SET is_read = read;
    END IF;
  END IF;
END $$;

-- 2. ALIGN PROFILES TABLE
-- Adds contact and address fields expected by Profile controller and Citizen settings.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

