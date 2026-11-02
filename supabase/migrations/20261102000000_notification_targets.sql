-- Nearby-user notifications: one-shot flag + a lookup that only the server (service_role) may call.
alter table public.pets add column if not exists notified_at timestamptz;

create or replace function public.notification_targets(p_lat float8, p_lng float8, p_exclude uuid)
returns table (id uuid, full_name text, email text, distance_km float8)
language sql
stable
security definer
set search_path = ''
as $$
    select t.id, t.full_name, t.email, t.distance_km from (
        select pr.id, pr.full_name, pr.email,
               2 * 6371 * asin(sqrt(
                   power(sin(radians(pr.notification_lat - p_lat) / 2), 2) +
                   cos(radians(p_lat)) * cos(radians(pr.notification_lat)) *
                   power(sin(radians(pr.notification_lng - p_lng) / 2), 2)
               )) as distance_km,
               pr.notification_radius_km as radius
        from public.profiles pr
        where pr.notifications_enabled
          and pr.email is not null
          and pr.notification_lat is not null
          and pr.notification_lng is not null
          and pr.id <> p_exclude
    ) t
    where t.distance_km <= t.radius
    limit 200; -- ponytail: cap per report; move to a queue if volume grows
$$;
revoke all on function public.notification_targets(float8, float8, uuid) from public, anon, authenticated;
grant execute on function public.notification_targets(float8, float8, uuid) to service_role;
