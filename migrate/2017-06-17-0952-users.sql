create table if not exists users (
  id serial primary key,
  email varchar(255) not null,
  password varchar(255),
  is_admin boolean not null default false,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create unique index if not exists users_lower_case_email_index
on users using btree (lower((email)::text));
