<?php
// Codi que fa de pont entre un arxiu JSON de productes guardat al servidor i
// la pàgina web que necessita obtenir la llista de productes disponibles.

header('Content-Type: application/json'); // La resposta serà en format JSON
header('Access-Control-Allow-Origin: *'); // Permetre sol·licituds des de qualsevol origen

$prodsDir = __DIR__ . '/../data/products/'; // Variable on es guarda el directori dels productes
$prodsFile = $prodsDir . 'products.json'; // Variable on es guarda el fitxer JSON dels productes
$productes = file_get_contents($prodsFile); // Llegir el contingut del fitxer JSON en format string

// Codifica el contingut JSON a un array associatiu de PHP
// si s'ha pogut llegir el fitxer i no està buit, es codifica passant el success a true i inclou la llista de productes a productes.
// sino, es passa success a false i una raó.
if ($productes){
    echo json_encode([
    'success' => true,
    'productes' => $productes
]);
} else {
    echo json_encode([
        'success' => false,
        'reason' => "Productes no trobats"
    ]);
}
