-- Hauptadmin einrichten (einmalig ausführen)
INSERT INTO team_members (user_id, name, email, role, is_active)
VALUES (
  '1f4b4042-e9dc-40bc-b815-53e3d84d7e76',
  'Andreas Wallner',
  'admin@munichmotions.com',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE
  SET user_id = '1f4b4042-e9dc-40bc-b815-53e3d84d7e76',
      role = 'admin',
      is_active = true;
