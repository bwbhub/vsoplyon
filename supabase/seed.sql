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

insert into tournoi (nom, annee, numero, date_debut) values
  ('Saison 2 - 2026', 2026, 2, current_date);

-- Pas de session de demo : la 1ere sera creee par l'admin
-- ou par le cron auto le mercredi.