alter table tokens alter column expires_at set default now() + interval '1 day';
