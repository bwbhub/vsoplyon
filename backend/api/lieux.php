<?php
require __DIR__ . '/bootstrap.php';
require_method(['GET']);

$stmt = db()->query('SELECT id, nom FROM lieu ORDER BY nom');
json_response($stmt->fetchAll());
