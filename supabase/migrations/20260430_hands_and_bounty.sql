-- Migration : mains remarquables + bounty hunter
-- A executer dans Supabase Studio > SQL Editor sur une base existante.

alter table score_evenement
  add column if not exists carre       integer not null default 0,
  add column if not exists royal_flush integer not null default 0,
  add column if not exists flush       integer not null default 0,
  add column if not exists bounty      boolean not null default false;

-- Garantit qu'il y a au plus un bounty par evenement.
create unique index if not exists score_ev_bounty_unique
  on score_evenement (evenement_id)
  where bounty = true;
