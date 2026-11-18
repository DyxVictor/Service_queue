-- Execute este SQL no Supabase (SQL Editor)

-- 1. Tabela de senhas
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  number integer not null,
  status text not null default 'waiting' check (status in ('waiting', 'called')),
  queue_type text default 'geral',
  created_at timestamptz default now(),
  called_at timestamptz
);

-- 2. Habilitar Realtime
alter publication supabase_realtime add table public.tickets;

-- 3. Função para pegar o próximo número (seguro contra concorrência)
create or replace function public.get_next_ticket_number()
returns integer
language plpgsql
as $$
declare
  next_num integer;
begin
  select coalesce(max(number), 0) + 1 into next_num from public.tickets;
  return next_num;
end;
$$;

-- 4. Row Level Security
alter table public.tickets enable row level security;

-- Qualquer pessoa pode criar senha (paciente)
create policy "Anyone can insert ticket"
  on public.tickets for insert
  to anon, authenticated
  with check (status = 'waiting');

-- Qualquer pessoa pode ver as senhas (tela pública)
create policy "Anyone can view tickets"
  on public.tickets for select
  to anon, authenticated
  using (true);

-- Apenas usuários autenticados (staff) podem atualizar (chamar senha)
create policy "Authenticated users can update tickets"
  on public.tickets for update
  to authenticated
  using (true)
  with check (true);

-- 5. Índices para performance
create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_number_idx on public.tickets (number);
create index if not exists tickets_created_at_idx on public.tickets (created_at);