-- =====================================================================
-- Schema VSOP-LYON  (Postgres / Supabase)
-- =====================================================================
-- A executer dans Supabase Studio > SQL Editor (ou via `psql -f schema.sql`)
-- Conventions :
--   * snake_case partout
--   * tous les ids en bigserial
--   * timestamps tz-aware (timestamptz)
--   * booleens reels (admin, annulation, repas)
--   * mots de passe stockes en bcrypt uniquement (pas de salt separe)
-- =====================================================================

-- Drop dans le bon ordre (dependances inverses) si on relance le script
drop view if exists score_tournoi cascade;
drop table if exists score_evenement cascade;
drop table if exists evenement       cascade;
drop table if exists tournoi         cascade;
drop table if exists lieu            cascade;
drop table if exists utilisateur     cascade;

-- ---------------------------------------------------------------------
-- utilisateur
-- ---------------------------------------------------------------------
create table utilisateur (
  id          bigserial primary key,
  nom         text        not null,
  prenom      text        not null,
  pseudo      text        unique,
  mail        text        unique not null,
  tel         text,
  password    text        not null,                -- bcrypt
  admin       boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index utilisateur_mail_idx   on utilisateur (lower(mail));
create index utilisateur_pseudo_idx on utilisateur (lower(pseudo));

-- ---------------------------------------------------------------------
-- lieu
-- ---------------------------------------------------------------------
create table lieu (
  id          bigserial primary key,
  nom         text        not null,
  adresse     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- tournoi  (saison / championnat)
-- ---------------------------------------------------------------------
create table tournoi (
  id          bigserial primary key,
  nom         text        not null,
  saison      text,                                -- ex: "2025-2026"
  date_debut  date,
  date_fin    date,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- evenement  (une session de poker datee)
-- ---------------------------------------------------------------------
create table evenement (
  id          bigserial primary key,
  date        timestamptz not null,
  lieu_id     bigint      references lieu(id)    on delete set null,
  tournoi_id  bigint      references tournoi(id) on delete set null,
  nom         text,
  description text,
  annulation  boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index evenement_date_idx     on evenement (date);
create index evenement_tournoi_idx  on evenement (tournoi_id);

-- ---------------------------------------------------------------------
-- score_evenement
-- ---------------------------------------------------------------------
create table score_evenement (
  id              bigserial primary key,
  utilisateur_id  bigint      not null references utilisateur(id) on delete cascade,
  evenement_id    bigint      not null references evenement(id)   on delete cascade,
  tournoi_id      bigint               references tournoi(id)     on delete set null,
  points          integer     not null default 0,
  bonus           integer     not null default 0,
  kills           integer     not null default 0,
  position_sortie integer,
  score           integer     not null default 0,
  repas           boolean     not null default false,
  created_at      timestamptz not null default now(),
  unique (utilisateur_id, evenement_id)
);

create index score_ev_utilisateur_idx on score_evenement (utilisateur_id);
create index score_ev_evenement_idx   on score_evenement (evenement_id);
create index score_ev_tournoi_idx     on score_evenement (tournoi_id);

-- ---------------------------------------------------------------------
-- score_tournoi  (vue calculee : agregation par tournoi)
-- ---------------------------------------------------------------------
create or replace view score_tournoi as
  select
    s.utilisateur_id,
    s.tournoi_id,
    sum(s.points)            as points,
    sum(s.bonus)             as bonus,
    sum(s.points + s.bonus)  as total,
    count(*)                 as participations
  from score_evenement s
  where s.tournoi_id is not null
  group by s.utilisateur_id, s.tournoi_id;
