<?php
require __DIR__ . '/bootstrap.php';
require_method(['POST']);

$body = read_json_body();
$login    = trim((string)($body['login'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($login === '' || $password === '') {
    json_error('Missing login or password', 422);
}

// Recherche l'utilisateur par pseudo OU mail
$stmt = db()->prepare(
    'SELECT id, nom, prenom, pseudo, mail, tel, admin, password, salt
     FROM utilisateur
     WHERE pseudo = :login OR mail = :login
     LIMIT 1'
);
$stmt->execute([':login' => $login]);
$user = $stmt->fetch();

if (!$user) json_error('Invalid credentials', 401);

// Verification mot de passe.
// La base actuelle stocke les mdp en clair (legacy). On gere les 2 cas :
// 1. hash PHP (password_hash) si present
// 2. sinon comparaison directe (legacy)
$stored = (string) $user['password'];
$ok = false;

if (str_starts_with($stored, '$2y$') || str_starts_with($stored, '$argon2')) {
    $ok = password_verify($password, $stored);
} else {
    $ok = hash_equals($stored, $password);
}

if (!$ok) json_error('Invalid credentials', 401);

// On ne renvoie JAMAIS password / salt
unset($user['password'], $user['salt']);

// Token simple (a remplacer par JWT plus tard)
$token = bin2hex(random_bytes(24));

json_response([
    'token' => $token,
    'user'  => $user,
]);
