<?php
require __DIR__ . '/bootstrap.php';
require_method(['GET']);

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

if ($id) {
    $stmt = db()->prepare(
        'SELECT t.id, t.nom, t.id_lieu, l.nom AS lieu_nom
         FROM tournoi t LEFT JOIN lieu l ON l.id = t.id_lieu
         WHERE t.id = :id'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) json_error('Tournoi not found', 404);
    json_response($row);
}

$stmt = db()->query(
    'SELECT t.id, t.nom, t.id_lieu, l.nom AS lieu_nom
     FROM tournoi t LEFT JOIN lieu l ON l.id = t.id_lieu
     ORDER BY t.id DESC'
);
json_response($stmt->fetchAll());
