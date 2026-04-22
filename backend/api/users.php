<?php
require __DIR__ . '/bootstrap.php';

$method = method();
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

// Champs publics (on ne renvoie jamais password / salt)
$PUBLIC_FIELDS = 'id, nom, prenom, pseudo, mail, tel, admin';

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = db()->prepare("SELECT $PUBLIC_FIELDS FROM utilisateur WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if (!$row) json_error('User not found', 404);
            json_response($row);
        }
        $search = $_GET['search'] ?? null;
        if ($search) {
            $stmt = db()->prepare(
                "SELECT $PUBLIC_FIELDS FROM utilisateur
                 WHERE nom LIKE :q OR prenom LIKE :q OR pseudo LIKE :q OR mail LIKE :q
                 ORDER BY nom, prenom"
            );
            $stmt->execute([':q' => '%' . $search . '%']);
        } else {
            $stmt = db()->query("SELECT $PUBLIC_FIELDS FROM utilisateur ORDER BY nom, prenom");
        }
        json_response($stmt->fetchAll());

    case 'POST':
        $body = read_json_body();
        $required = ['nom', 'prenom'];
        foreach ($required as $f) {
            if (empty($body[$f])) json_error("Missing field: $f", 422);
        }
        $stmt = db()->prepare(
            'INSERT INTO utilisateur (nom, prenom, pseudo, password, mail, tel, salt, admin)
             VALUES (:nom, :prenom, :pseudo, :password, :mail, :tel, :salt, :admin)'
        );
        $stmt->execute([
            ':nom'      => $body['nom'],
            ':prenom'   => $body['prenom'],
            ':pseudo'   => $body['pseudo']   ?? '',
            ':password' => $body['password'] ?? '',
            ':mail'     => $body['mail']     ?? '',
            ':tel'      => $body['tel']      ?? '',
            ':salt'     => $body['salt']     ?? '',
            ':admin'    => $body['admin']    ?? 'Non',
        ]);
        $newId = (int) db()->lastInsertId();
        $stmt = db()->prepare("SELECT $PUBLIC_FIELDS FROM utilisateur WHERE id = :id");
        $stmt->execute([':id' => $newId]);
        json_response($stmt->fetch(), 201);

    case 'PUT':
    case 'PATCH':
        if (!$id) json_error('Missing id', 400);
        $body = read_json_body();
        $allowed = ['nom', 'prenom', 'pseudo', 'mail', 'tel', 'admin', 'password'];
        $set = [];
        $params = [':id' => $id];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $body)) {
                $set[] = "$f = :$f";
                $params[":$f"] = $body[$f];
            }
        }
        if (!$set) json_error('No fields to update', 422);
        $sql = 'UPDATE utilisateur SET ' . implode(', ', $set) . ' WHERE id = :id';
        db()->prepare($sql)->execute($params);
        $stmt = db()->prepare("SELECT $PUBLIC_FIELDS FROM utilisateur WHERE id = :id");
        $stmt->execute([':id' => $id]);
        json_response($stmt->fetch());

    case 'DELETE':
        if (!$id) json_error('Missing id', 400);
        $stmt = db()->prepare('DELETE FROM utilisateur WHERE id = :id');
        $stmt->execute([':id' => $id]);
        json_response(['deleted' => $stmt->rowCount()]);

    default:
        json_error('Method not allowed', 405);
}
