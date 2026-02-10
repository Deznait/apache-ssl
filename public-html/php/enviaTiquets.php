<?php
// Recull els tiquets del servidor en un arxiu i els envia al client.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$ticketsDir = __DIR__ . '/../tiquets/';

$files = glob($ticketsDir . 'tiquet-*.json'); // Amb el directori gaurdat anteriorment, obtenir tots els fitxers que coincideixen amb el patró.
        // glob() retorna un array amb els noms dels fitxers trobats.
$tickets = [];

foreach ($files as $file) {
    // Extraer el número del ticket
    $ticketNumber = preg_replace('/.*tiquet-(\d+)\.json/', '$1', $file);

    // Leer el contenido del archivo
    $content = file_get_contents($file);
    $data = json_decode($content, true);

    // Verificar que el JSON sea válido
        // json_last_error() retorna el último error de JSON. JSON_ERROR_NONE indica que no hubo errores.
    if (json_last_error() === JSON_ERROR_NONE) {
        $tickets[] = [
            'id' => (int)$ticketNumber,
            'filename' => basename($file), //basename() retorna el nom del fitxer sense la ruta completa.
            'data' => $data  // Incluye username, usermail, usertel y productos[]
        ];
    } else {
        // Si hay error en el JSON, incluir información del error
        $tickets[] = [
            'id' => (int)$ticketNumber,
            'filename' => basename($file),
            'data' => null,
            'error' => 'Error al leer JSON: ' . json_last_error_msg() // json_last_error_msg() retorna un mensaje descriptivo del último error de JSON.
        ];
    }
}

echo json_encode([
    'success' => true,
    'tickets' => $tickets,
    'total' => count($tickets)
]);
