<?php
    // Petició al servidor per tancar la sessió de l'usuari

    // Inicialitzar la sessió
    session_start();

    // Destruir totes les variables de sessió
    $_SESSION = array();

    // Destruir la sessió
    session_destroy();
?>