<?php
require __DIR__ . '/bootstrap.php';

json_response([
    'name'      => 'VSOP Lyon API',
    'status'    => 'ok',
    'endpoints' => [
        'GET  /api/users.php',
        'GET  /api/users.php?id=1',
        'POST /api/users.php',
        'PUT  /api/users.php?id=1',
        'DELETE /api/users.php?id=1',
        'GET  /api/tournois.php',
        'GET  /api/tournois.php?id=1',
        'GET  /api/lieux.php',
        'GET  /api/evenements.php',
        'GET  /api/evenements.php?id=1',
        'GET  /api/evenements.php?tournoi=1',
        'GET  /api/evenements.php?upcoming=1&limit=1',
        'GET  /api/evenements.php?recent=1&limit=5',
        'GET  /api/scores.php?evenement=1',
        'GET  /api/scores.php?utilisateur=1',
        'POST /api/scores.php',
        'GET  /api/leaderboard.php?tournoi=1',
        'GET  /api/leaderboard.php?all=1',
        'POST /api/auth.php  { login, password }',
    ],
]);
