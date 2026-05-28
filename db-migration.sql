-- =====================================================
-- DATABASE MIGRATION SCRIPT FOR DRAG & DROP EMAIL BUILDER
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/puhxqptqnqloczinsyhw/sql
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    invited_by uuid,
    joined_at timestamp with time zone DEFAULT now(),
    CONSTRAINT group_members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text])))
);

-- Create group_invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    email text NOT NULL,
    invited_by uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    group_id uuid NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    folder_id uuid,
    group_id uuid NOT NULL,
    created_by uuid NOT NULL,
    editor_type text DEFAULT 'drag-drop'::text,
    content jsonb,
    html_content text,
    css_content text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT emails_editor_type_check CHECK ((editor_type = ANY (ARRAY['drag-drop'::text, 'code'::text])))
);

-- Primary Keys
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.groups ADD CONSTRAINT groups_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.group_members ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.group_invitations ADD CONSTRAINT group_invitations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.folders ADD CONSTRAINT folders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.emails ADD CONSTRAINT emails_pkey PRIMARY KEY (id);

-- Unique Constraints
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.group_members ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);
ALTER TABLE ONLY public.group_invitations ADD CONSTRAINT group_invitations_token_key UNIQUE (token);

-- Foreign Keys
ALTER TABLE ONLY public.groups ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.group_members ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.group_members ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.group_members ADD CONSTRAINT group_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.group_invitations ADD CONSTRAINT group_invitations_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.group_invitations ADD CONSTRAINT group_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.folders ADD CONSTRAINT folders_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.folders ADD CONSTRAINT folders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.emails ADD CONSTRAINT emails_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.emails ADD CONSTRAINT emails_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.emails ADD CONSTRAINT emails_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view groups they are members of" ON public.groups FOR SELECT USING (id IN (SELECT DISTINCT group_members.group_id FROM public.group_members WHERE group_members.user_id = auth.uid()));
CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Group creators can delete their groups" ON public.groups FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Group creators can add members" ON public.group_members FOR INSERT WITH CHECK ((EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_members.group_id AND g.created_by = auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Group members can view other members" ON public.group_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()));
CREATE POLICY "Group creators can update member roles" ON public.group_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_members.group_id AND g.created_by = auth.uid()));
CREATE POLICY "Group creators and users can remove memberships" ON public.group_members FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_members.group_id AND g.created_by = auth.uid()));

-- RLS Policies for group_invitations
CREATE POLICY "Group admins can create invitations" ON public.group_invitations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_invitations.group_id AND g.created_by = auth.uid()));
CREATE POLICY "Anyone can view invitations by token" ON public.group_invitations FOR SELECT USING (true);
CREATE POLICY "Group admins can update invitations" ON public.group_invitations FOR UPDATE USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_invitations.group_id AND g.created_by = auth.uid()));
CREATE POLICY "Group admins can delete invitations" ON public.group_invitations FOR DELETE USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_invitations.group_id AND g.created_by = auth.uid()));

-- RLS Policies for folders
CREATE POLICY "Users can create folders in their groups" ON public.folders FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = folders.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can view folders in their groups" ON public.folders FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = folders.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can update folders in their groups" ON public.folders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = folders.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can delete folders in their groups" ON public.folders FOR DELETE USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = folders.group_id AND group_members.user_id = auth.uid()));

-- RLS Policies for emails
CREATE POLICY "Users can create emails in their groups" ON public.emails FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = emails.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can view emails in their groups" ON public.emails FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = emails.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can update emails in their groups" ON public.emails FOR UPDATE USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = emails.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can delete emails in their groups" ON public.emails FOR DELETE USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = emails.group_id AND group_members.user_id = auth.uid()));

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated;
GRANT ALL ON public.group_invitations TO authenticated;
GRANT ALL ON public.folders TO authenticated;
GRANT ALL ON public.emails TO authenticated;

-- Grant permissions to anon for invitations (needed for invite acceptance)
GRANT SELECT ON public.group_invitations TO anon;
