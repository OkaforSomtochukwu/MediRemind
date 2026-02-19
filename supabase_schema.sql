-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text, -- Added for invite lookup
  age integer,
  gender text,
  occupation text,
  marital_status text,
  address text,
  nationality text,
  religion text,
  admission_mode text,
  caregiver_id uuid references auth.users, -- The person who monitors this user

  constraint username_length check (char_length(full_name) >= 3)
);

-- Create a table for medications
create table medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  dosage text,
  frequency text,
  status text default 'pending', -- pending, taken, missed
  time text, -- e.g. "08:00"
  inventory_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for caregiver invitations
create table caregiver_invites (
  id uuid default gen_random_uuid() primary key,
  inviter_id uuid references auth.users not null, -- The Dependent
  invitee_email text not null, -- The Caregiver's email
  status text default 'pending', -- pending, accepted, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table medications enable row level security;
alter table caregiver_invites enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by authenticated users." on profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Medications Policies
create policy "Users can view their own medications." on medications
  for select using (
    auth.uid() = user_id or 
    exists (
      select 1 from profiles 
      where profiles.id = medications.user_id 
      and profiles.caregiver_id = auth.uid()
    )
  );

create policy "Users can manage their own medications." on medications
  for all using (auth.uid() = user_id);

-- Caregiver Invites Policies
create policy "Users can view invites they sent or received." on caregiver_invites
  for select using (
    auth.uid() = inviter_id or 
    exists (
      select 1 from profiles 
      where profiles.email = caregiver_invites.invitee_email 
      and profiles.id = auth.uid()
    )
  );

create policy "Dependents can send invites." on caregiver_invites
  for insert with check (auth.uid() = inviter_id);

create policy "Caregivers can update invite status." on caregiver_invites
  for update using (
    exists (
      select 1 from profiles 
      where profiles.email = caregiver_invites.invitee_email 
      and profiles.id = auth.uid()
    )
  );
