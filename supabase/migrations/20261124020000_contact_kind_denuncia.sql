-- Permite denunciar reportes desde el formulario de contacto.
alter table public.contact_messages drop constraint if exists contact_messages_kind_check;
alter table public.contact_messages add constraint contact_messages_kind_check check (kind in ('consulta', 'aliado', 'voluntario', 'colaborar', 'apoyo', 'grupo', 'denuncia'));
