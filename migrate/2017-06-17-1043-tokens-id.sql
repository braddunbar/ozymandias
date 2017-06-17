create extension if not exists pgcrypto;
delete from tokens;
alter table tokens alter column id set data type uuid using id::uuid, alter column id set default gen_random_uuid();
