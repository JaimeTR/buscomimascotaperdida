-- Mensajes del formulario de contacto: consultas, alianzas, voluntariado, colaboración y avisos de apoyo (con comprobante opcional).
-- Cualquiera puede enviar uno (insert); solo administradores los leen y gestionan.
create table if not exists public.contact_messages (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    kind text not null check (kind in ('consulta', 'aliado', 'voluntario', 'colaborar', 'apoyo', 'grupo')),
    name text not null check (char_length(name) between 2 and 120),
    email text not null check (char_length(email) between 5 and 160),
    phone text check (phone is null or char_length(phone) <= 30),
    message text check (message is null or char_length(message) <= 2000),
    amount numeric(10, 2) check (amount is null or (amount >= 0 and amount < 1000000)),
    attachment_path text check (attachment_path is null or char_length(attachment_path) <= 300),
    join_group boolean not null default false,
    allow_mention boolean not null default false,
    user_id uuid references auth.users (id) on delete set null,
    status text not null default 'new' check (status in ('new', 'read', 'done'))
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_user_idx on public.contact_messages (user_id);

alter table public.contact_messages enable row level security;

create policy "contact_insert_anyone" on public.contact_messages
    for insert to anon, authenticated
    with check (status = 'new' and (user_id is null or user_id = (select auth.uid())));
create policy "contact_admin_read" on public.contact_messages
    for select to authenticated using ((select public.is_admin()));
create policy "contact_admin_update" on public.contact_messages
    for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Un permiso concreto y mínimo: el visitante anónimo solo puede insertar aquí.
grant insert on public.contact_messages to anon;

-- Comprobantes: bucket privado, 5 MB, imágenes y PDF. Se suben sin sesión; solo administradores los ven.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contact-attachments', 'contact-attachments', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "contact_attach_insert" on storage.objects
    for insert to anon, authenticated with check (bucket_id = 'contact-attachments');
create policy "contact_attach_admin_read" on storage.objects
    for select to authenticated using (bucket_id = 'contact-attachments' and (select public.is_admin()));
