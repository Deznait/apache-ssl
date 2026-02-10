<?php
header('Content-Type: application/json');

$json_file = '../data/products/products.json';
$img_dir = '../public/resources/images/products/';

// crear carpetes si no existeixen segons la ruta definida a les variables
if (!file_exists(dirname($json_file))) {
    mkdir(dirname($json_file), 0755, true); // Crea el directori segons la variable introduida, 
                                            // se li assignen permisos i el true indica que es crei el directori
}
if (!file_exists($img_dir)) {
    mkdir($img_dir, 0755, true);
}

// Crear JSON indicat a la variable "$json_file" en el cas que no existeix
if (!file_exists($json_file)) {
    // Si entra aquí, és que no existeix el fitxer JSON i per tant es crea un nou json amb
    // un array de productes buit i s'utilitza JSON_PRETTY_PRINT per a que estigui ben formatat
    file_put_contents($json_file, json_encode(['productes' => []], JSON_PRETTY_PRINT));
}

// Llegir json
$content = file_get_contents($json_file);
$data = json_decode($content, true);
$productes = $data['productes'];

// veure quina accio vol fer l'usuari segons el paràmetre 'accion' que es rep per GET (del document admin_products.js)
$accio = $_REQUEST['accion'] ?? '';

// PUJAR IMG
function uploadImage($file) {
    global $img_dir;

    // si no hi ha arxiu, utilitzar placeholder
    if (!isset($file) || $file['error'] == 4) {
        return 'placeholder.png';
    }

    // verificar que es una imatge
    $check = getimagesize($file["tmp_name"]);
    if ($check === false) {
        return ['error' => 'El arxiu no es una imatge'];
    }

    // verificar extensio
    $extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"];

    // si l'extensió no és correcte, retornar error
    if (!in_array($extension, $allowed_extensions)) {
        return ['error' => 'Nomes es permeten imatges JPG, JPEG, PNG, GIF o WEBP'];
    }

    // netejar nom arxiu (treure espais i caracters especials)
    
    // substitueix l'expressió regular del primer paràmetre,
    // pel que jo introdueixo en el segon paràmetre 
    // del que l'indiques en el tercer paràmetre
    $clean_name = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', basename($file["name"]));

    // generar nom amb timestamp per evitar duplicats
    $timestamp = time();
    $filename = $timestamp . '_' . $clean_name;

    $destination = $img_dir . $filename; // ruta completa on es guardarà la imatge

    // moure arxiu
    //move_uploaded_file: funció de PHP que mou un arxiu pujat al servidor a una nova ubicació
    if (move_uploaded_file($file["tmp_name"], $destination)) {
        // retornar nomes el nom del arxiu (sense la ruta completa)
        return $filename;
    } else {
        return ['error' => 'Error al pujar la imatge'];
    }
}

// Mostrar TOTS els productes
if ($accio == 'listar') {
    echo json_encode([
        'success' => true,
        'products' => $productes
    ]);
}

// Afegir nou producte
elseif ($accio == 'añadir') {
    // pujar imatge primer
    $img_name = uploadImage($_FILES['imatge'] ?? null);

    // si hi ha error al pujar
    if (is_array($img_name)) {
        echo json_encode([
            'success' => false,
            'message' => $img_name['error']
        ]);
        exit;
    }

    // recollir horaris seleccionats
    $schedules = isset($_POST['horario']) ? $_POST['horario'] : [];

    $new_product = [
        'nom' => $_POST['nom'] ?? '',
        'preu' => floatval($_POST['preu'] ?? 0), // floatval per assegurar que es guarda com a nombre decimal
        'descripció' => $_POST['descripcio'] ?? '',
        'categoria' => $_POST['categoria'] ?? 'altres',
        'imatge' => $img_name,
        'oferta' => isset($_POST['oferta']), // el que fa isset és comprovar si el checkbox està marcat (retorna true) o no (retorna false)
        'horario' => $schedules
    ];

    // afegir al principi del array "productes" el nou producte
    array_unshift($productes, $new_product);

    // guardar al JSON
    $data['productes'] = $productes; // assigna l'array actualitzat de productes a la clau 'productes' de l'array $data
    //JSON_PRETTY_PRINT per a que estigui ben formatat i JSON_UNESCAPED_UNICODE per a que no escapi caracters especials
    if (file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode([
            'success' => true,
            'message' => 'Producte afegit correctament'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar al arxiu JSON'
        ]);
    }
}

// Editar producte existent
elseif ($accio == 'editar') {
    $index = intval($_POST['index'] ?? -1); // obtenir index del producte a editar

    if ($index < 0 || $index >= count($productes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Index de producte invalid'
        ]);
        exit;
    }

    // si hi ha nova imatge, pujar-la; si no, mantenir antiga
    if (isset($_FILES['imatge']) && $_FILES['imatge']['error'] != 4) {
        $img_name = uploadImage($_FILES['imatge']);

        // si hi ha error al pujar
        if (is_array($img_name)) {
            echo json_encode([
                'success' => false,
                'message' => $img_name['error']
            ]);
            exit;
        }

        // eliminar imatge antiga si no es placeholder
        $old_img = $productes[$index]['imatge'];
        if ($old_img != 'placeholder.png' && file_exists($img_dir . $old_img)) {
            unlink($img_dir . $old_img);
        }
    } else {
        // mantenir imatge antiga
        $img_name = $productes[$index]['imatge'];
    }

    // recollir horaris seleccionats
    $schedules = isset($_POST['horario']) ? $_POST['horario'] : [];

    $productes[$index] = [
        'nom' => $_POST['nom'] ?? '',
        'preu' => floatval($_POST['preu'] ?? 0),
        'descripció' => $_POST['descripcio'] ?? '',
        'categoria' => $_POST['categoria'] ?? 'altres',
        'imatge' => $img_name,
        'oferta' => isset($_POST['oferta']),
        'horario' => $schedules
    ];

    // guardar al JSON
    $data['productes'] = $productes;
    if (file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode([
            'success' => true,
            'message' => 'Producte actualitzat correctament'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar al arxiu JSON'
        ]);
    }
}

// Eliminar producte
elseif ($accio == 'eliminar') {
    $index = intval($_POST['index'] ?? -1);

    if ($index < 0 || $index >= count($productes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Index de producte invalid'
        ]);
        exit;
    }

    // eliminar tambe imatge del servidor
    $img_to_delete = $productes[$index]['imatge'];
    if ($img_to_delete != 'placeholder.png' && file_exists($img_dir . $img_to_delete)) {
        unlink($img_dir . $img_to_delete);
    }

    // eliminar producte del array
    array_splice($productes, $index, 1);

    // guardar al JSON
    $data['productes'] = $productes;
    if (file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode([
            'success' => true,
            'message' => 'Producte eliminat correctament'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar al arxiu JSON'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Accio no valida. Accio rebuda: ' . $accio
    ]);
}
