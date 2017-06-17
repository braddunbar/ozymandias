create table if not exists tokens (
  id varchar(255) primary key,
  expires_at timestamp with time zone not null,
  user_id integer not null references users (id)
);
