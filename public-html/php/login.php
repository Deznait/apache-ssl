<?php
session_start();

// Recuperar la informació que s'està passant pel document login.js
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

//Carregar els usuaris des del json
$archivo = '../users/users.json';

$json = file_get_contents($archivo);
$usuarios = json_decode($json, true);

// Verificació de que la petició s'ha fet amb el mètode POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $resposta=["correcte"=>false];
    // Recollir i sanejar les dades rebudes
    $nombre = trim($data['userName'] ?? '');
    $password = trim($data['password'] ?? '');

    $nombre=filter_var($nombre, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $password=filter_var($password, FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    // Bucle per a recorrer l'array del document users.json i buscar si el nom d'usuari i contrasenya exiteix i coincideixen
    $trobat = array_filter($usuarios["usuaris"], function($user) use ($nombre) {
        return $user["nom"] === $nombre;
    });

    // Si s'ha trobat el nom de l'usuari indicat
    if(!empty($trobat)){
        $usuariTrobat=reset($trobat); //agafa el primer element d'una array
        if($password == $usuariTrobat["contrasenya"]){ // Comprova si la contrasenya introduida coincideix amb la guardada
            session_regenerate_id(true); //Quan fas el login et genera una altra sessió internament
            $_SESSION['usuari'] = $usuariTrobat["nom"]; //Em guardes el nom trobat a l'usuari de la sessió
            $_SESSION['admin'] = $usuariTrobat["admin"]; //Em guardes el que conté l'atribut admin (true o false) a l'admin de la sessió
            $resposta["correcte"]=true;
            echo json_encode($resposta);
            exit();
        } else{
            echo json_encode($resposta);
        }
    } else{
        echo json_encode($resposta);
    }
}

?>