<?php
    // Comprova si l'usuari està loguejat
    session_start();

    $resposta=["correcte"=>false];

    // if per comprovar si l'usuari està loguejat
    // empty() comprova si una variable està buida o no està definida, en aquest cas 'usuari'
    if (!empty($_SESSION['usuari'])) {
        $resposta["correcte"]=true;
        $resposta['usuari']=$_SESSION['usuari']; // Com que l'usuari esta loguejat, em retornara 
                                                  // el que hi ha en el camp 'usuari' de la sessió
    }

    echo json_encode($resposta);
?>