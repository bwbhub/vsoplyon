<?php
require __DIR__ . '/bootstrap.php';
require_method(['GET']);

$tournoi = isset($_GET['tournoi']) ? (int) $_GET['tournoi'] : null;
$all     = isset($_GET['all']) && $_GET['all'] !== '0';
$limit   = isset($_GET['limit']) ? max(1, min(500, (int) $_GET['limit'])) : 100;

if ($tournoi) {
    // Classement pour un tournoi specifique (via score_tournoi)
    $sql = 'SELECT u.id, u.nom, u.prenom, u.pseudo,
                   COALESCE(st.points, 0) AS points,
                   COALESCE(st.bonus, 0)  AS bonus,
                   COALESCE(st.points, 0) + COALESCE(st.bonus, 0) AS total
            FROM score_tournoi st
            JOIN utilisateur u ON u.id = st.utilisateurid
            WHERE st.tournoiid = :id
            ORDER BY total DESC, u.nom ASC
            LIMIT ' . $limit;
    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => $tournoi]);
    json_response($stmt->fetchAll());
}

if ($all) {
    // Classement all-time agrege depuis score_evenement
    $sql = 'SELECT u.id, u.nom, u.prenom, u.pseudo,
                   SUM(COALESCE(s.score, 0)) AS total_score,
                   SUM(COALESCE(s.points, 0)) AS total_points,
                   SUM(COALESCE(s.bonus, 0))  AS total_bonus,
                   COUNT(s.id) AS participations
            FROM utilisateur u
            LEFT JOIN score_evenement s ON s.utilisateurid = u.id
            GROUP BY u.id
            HAVING participations > 0
            ORDER BY total_score DESC
            LIMIT ' . $limit;
    $stmt = db()->query($sql);
    json_response($stmt->fetchAll());
}

json_error('Specify ?tournoi=<id> or ?all=1', 400);
