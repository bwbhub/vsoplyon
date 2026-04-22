<?php
require __DIR__ . '/bootstrap.php';

$method = method();

switch ($method) {
    case 'GET':
        $evenement   = isset($_GET['evenement']) ? (int) $_GET['evenement'] : null;
        $utilisateur = isset($_GET['utilisateur']) ? (int) $_GET['utilisateur'] : null;
        $tournoi     = isset($_GET['tournoi']) ? (int) $_GET['tournoi'] : null;

        if ($evenement) {
            // Scores pour un evenement donne, trie par classement
            $sql = 'SELECT s.*, u.nom, u.prenom, u.pseudo
                    FROM score_evenement s
                    JOIN utilisateur u ON u.id = s.utilisateurid
                    WHERE s.evenementid = :id
                    ORDER BY s.score DESC, s.position_sortie DESC';
            $stmt = db()->prepare($sql);
            $stmt->execute([':id' => $evenement]);
            json_response($stmt->fetchAll());
        }

        if ($utilisateur) {
            $sql = 'SELECT s.*, e.date, e.id_tournoi, t.nom AS tournoi_nom
                    FROM score_evenement s
                    JOIN evenement e ON e.id = s.evenementid
                    LEFT JOIN tournoi t ON t.id = e.id_tournoi
                    WHERE s.utilisateurid = :id
                    ORDER BY e.date DESC';
            $stmt = db()->prepare($sql);
            $stmt->execute([':id' => $utilisateur]);
            json_response($stmt->fetchAll());
        }

        if ($tournoi) {
            $sql = 'SELECT st.*, u.nom, u.prenom, u.pseudo
                    FROM score_tournoi st
                    JOIN utilisateur u ON u.id = st.utilisateurid
                    WHERE st.tournoiid = :id
                    ORDER BY (st.points + st.bonus) DESC';
            $stmt = db()->prepare($sql);
            $stmt->execute([':id' => $tournoi]);
            json_response($stmt->fetchAll());
        }

        json_error('Specify ?evenement, ?utilisateur or ?tournoi', 400);

    case 'POST':
        $body = read_json_body();
        foreach (['utilisateurid', 'evenementid', 'tournoiid'] as $f) {
            if (!isset($body[$f])) json_error("Missing field: $f", 422);
        }
        $stmt = db()->prepare(
            'INSERT INTO score_evenement
             (utilisateurid, evenementid, tournoiid, points, bonus, position_sortie, score, repas)
             VALUES (:u, :e, :t, :p, :b, :pos, :s, :r)'
        );
        $points = (int)($body['points'] ?? 0);
        $bonus  = (int)($body['bonus']  ?? 0);
        $stmt->execute([
            ':u'   => (int) $body['utilisateurid'],
            ':e'   => (int) $body['evenementid'],
            ':t'   => (int) $body['tournoiid'],
            ':p'   => $points,
            ':b'   => $bonus,
            ':pos' => (int)($body['position_sortie'] ?? 0),
            ':s'   => (int)($body['score'] ?? ($points + $bonus)),
            ':r'   => $body['repas'] ?? 'non',
        ]);
        json_response(['id' => (int) db()->lastInsertId()], 201);

    default:
        json_error('Method not allowed', 405);
}
