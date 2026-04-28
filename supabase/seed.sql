-- =====================================================================
-- Seed minimal pour developpement / test
-- A executer apres schema.sql
-- Le mdp ci-dessous est le hash bcrypt de "admin123"
-- =====================================================================

insert into utilisateur (nom, prenom, pseudo, mail, password, admin) values
  ('Admin',   'Super', 'admin',   'admin@vsop.local',
   '$2a$10$6N3ZkQwdVkO.8bnD8pXJguMr8hsKNyrEtZFehmlcYtnfXR2yPi3GS', true),
  ('Doe',     'John',  'jdoe',    'john@vsop.local',
   '$2a$10$6N3ZkQwdVkO.8bnD8pXJguMr8hsKNyrEtZFehmlcYtnfXR2yPi3GS', false);

insert into lieu (nom, adresse) values
  ('Le Comptoir', '12 rue Mercière, Lyon'),
  ('Le Briey',    '5 rue de Briey, Lyon');

insert into tournoi (nom, saison) values
  ('Championnat 2025-2026', '2025-2026');

insert into evenement (date, lieu_id, tournoi_id, nom) values
  (now() + interval '7 days', 1, 1, 'Session ouverture'),
  (now() - interval '3 days', 2, 1, 'Session test passe');
