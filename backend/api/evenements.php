<?php
require __DIR__ . '/bootstrap.php';
require_method(['GET']);

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

if ($id) {
    $stmt = db()->prepare(
        'SELECT e.*, l.nom AS lieu_nom, t.nom AS tournoi_nom
         FROM evenement e
         LEFT JOIN lieu l ON l.id = e.id_lieu
         LEFT JOIN tournoi t ON t.id = e.id_tournoi
         WHERE e.id = :id'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) json_error('Evenement not found', 404);
    json_response($row);
}

$tournoi  = isset($_GET['tournoi']) ? (int) $_GET['tournoi'] : null;
$upcoming = isset($_GET['upcoming']) && $_GET['upcoming'] !== '0';
$recent   = isset($_GET['recent']) && $_GET['recent'] !== '0';
$limit    = isset($_GET['limit']) ? max(1, min(100, (int) $_GET['limit'])) : 50;

$sql = 'SELECT e.*, l.nom AS lieu_nom, t.nom AS tournoi_nom
        FROM evenement e
        LEFT JOIN lieu l ON l.id = e.id_lieu
        LEFT JOIN tournoi t ON t.id = e.id_tournoi';
$where = [];
$params = [];

if ($tournoi) {
    $where[] = 'e.id_tournoi = :tournoi';
    $params[':tournoi'] = $tournoi;
}
if ($upcoming) {
    $where[] = 'e.date >= CURDATE() AND e.annulation = "non"';
}
if ($recent) {
    $where[] = 'e.date < CURDATE()';
}
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}

$sql .= $upcoming ? ' ORDER BY e.date ASC' : ' ORDER BY e.date DESC';
$sql .= ' LIMIT ' . $limit;

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_response($stmt->fetchAll());
