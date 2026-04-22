<?php
/**
 * Copie ce fichier en `config.php` et remplis tes vraies valeurs.
 * Le fichier `config.php` ne doit PAS etre versionne (voir .gitignore).
 */

return [
    'db' => [
        'host'     => 'vsoplyondbase.mysql.db',
        'port'     => 3306,
        'database' => 'vsoplyondbase',
        'user'     => 'vsoplyondbase',
        'password' => 'CHANGE_ME',
        'charset'  => 'utf8mb4',
    ],

    // Liste des origines autorisees a appeler l'API (frontend Vercel, localhost dev)
    'cors_allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://vsoplyon.vercel.app',
        'https://vsop-lyon.fr',
    ],

    // Active/desactive le mode debug (retourne les messages PDO detailles)
    'debug' => false,
];
