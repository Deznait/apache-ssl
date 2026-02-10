<?php
// La funció rep un json, valida nom i email perquè telèfon ja està validat al html i envia o error o un success
header('Content-Type: application/json');

$json = file_get_contents('php://input'); // Llegir de les dades enviades en el cos de la petició
$data = json_decode($json, true); 

if (!$data) {
    echo json_encode(["error" => "No s'han rebut dades o JSON invàlid"]);
    exit;
}

$nom = $data['username'] ?? 'sense_nom'; // Guardar nom d'usuari introduit al formulari o 'sense_nom' si no existeix.
$nom = filter_var($nom, FILTER_SANITIZE_FULL_SPECIAL_CHARS); //FILTER_SANITIZE_FULL_SPECIAL_CHARS per evitar codi maliciós
$data['username'] = $nom;

// Si la variable està declarada i es diferent a null, FILTER_SANITIZE_EMAIL per netejar l'email
if (isset($data['adreca'])) {
    $email = filter_var($data['adreca'], FILTER_SANITIZE_EMAIL);
    $data['adreca'] = $email;
}

$nomArxiu = "../tiquets/tiquet-1.json";
$aux = 0;

while (file_exists($nomArxiu)) {
    $aux++;
    $nomArxiu = "../tiquets/tiquet-" . $aux . ".json";
}

echo "Comprovant si el fitxer existeix: " . $nomArxiu . "\n";

if (!file_exists($nomArxiu)) {
    // Intentar crear el archivo
    $arxiu = fopen($nomArxiu, "w");

    if ($arxiu === false) {
        echo json_encode([
            "error" => "No s'ha pogut obrir l'arxiu",
            "file" => $nomArxiu,
            "dir_exists" => file_exists("../tiquets"),
            "dir_writable" => is_writable("../tiquets")
        ]);
        exit;
    }

    $jsonData = json_encode($data, JSON_PRETTY_PRINT); // Convertir l'array a JSON amb formatació
    $bytes = fwrite($arxiu, $jsonData); // Escriure les dades JSON a l'arxiu

    if ($bytes === false) {
        echo json_encode(["error" => "Error en fwrite"]);
        fclose($arxiu);
        exit;
    }

    fclose($arxiu);
    echo json_encode(["success" => true, "file" => $nomArxiu, "bytes" => $bytes]);
} else {
    echo json_encode(["error" => "El fitxer ja existeix"]);
}


