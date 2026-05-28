-- Profiles extend auth.users with role and contact info
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'client' check (role in ('admin', 'client')),
  name text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- Skulls belong to a client profile
create table public.skulls (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade not null,
  points integer,
  dnr_tag_number text,
  date_received date not null default current_date,
  status text not null default 'Deer Head Received' check (status in (
    'Deer Head Received',
    'Skull Skinned',
    'Maceration Period',
    'Skull Cleaning',
    'Degreasing',
    'Whitening',
    'Finished'
  )),
  price numeric(10,2),
  payment_option text check (payment_option in (
    'full_upfront',
    'half_upfront',
    'pay_at_completion'
  )),
  amount_paid numeric(10,2) not null default 0,
  notes text,
  finished_notified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Editable email and SMS notification templates
create table public.notification_templates (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('email', 'sms')),
  subject text,
  body text not null,
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'client'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
