-- Agentic Chat v1 schema (normalized + replay-safe storage)
-- Rollback-safe notes:
-- 1) New tables are additive and do not break existing /api/chat or /api/sessions.
-- 2) Rollback can be done by stopping writes to these tables before dropping them.
-- 3) Keep migration order: create tables -> create indexes -> verify read paths.

create table if not exists agent_sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  title text not null default 'Agent Session',
  status text not null default 'queued' check (status in ('queued', 'streaming', 'tool-running', 'completed', 'failed')),
  raw_output text,
  rendered_output text,
  retention_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_messages (
  id uuid primary key,
  session_id uuid not null references agent_sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  raw_output text,
  rendered_output text,
  pii_redacted boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists agent_tool_calls (
  id uuid primary key,
  session_id uuid not null references agent_sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  tool_name text not null,
  tool_args jsonb not null default '{}',
  tool_result jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  latency_ms int,
  created_at timestamptz not null default now()
);

create table if not exists agent_tool_results (
  id uuid primary key default gen_random_uuid(),
  tool_call_id uuid not null references agent_tool_calls(id) on delete cascade,
  result jsonb not null,
  rendered_output text,
  created_at timestamptz not null default now()
);

create table if not exists agent_action_logs (
  id uuid primary key,
  session_id uuid not null references agent_sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  action_type text not null,
  payload jsonb not null default '{}',
  status text not null,
  risk_level text not null default 'low' check (risk_level in ('low', 'high')),
  created_at timestamptz not null default now()
);

create table if not exists agent_feedback (
  id uuid primary key,
  session_id uuid not null references agent_sessions(id) on delete cascade,
  message_id uuid,
  user_id uuid not null references users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  category text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_sessions_user_time on agent_sessions(user_id, created_at desc);
create index if not exists idx_agent_messages_session_time on agent_messages(session_id, created_at desc);
create index if not exists idx_agent_messages_user_time on agent_messages(user_id, created_at desc);
create index if not exists idx_agent_tool_calls_session_time on agent_tool_calls(session_id, created_at desc);
create index if not exists idx_agent_action_logs_user_time on agent_action_logs(user_id, created_at desc);
