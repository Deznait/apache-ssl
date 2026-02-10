<?php
    // Comprova si l'usuari està loguejat i si és admin
    session_start(); // Inicia la sessió

    // Array associativa clau => valor on per defecte, comença per no estar loguejat i no ser admin
    $resposta=["correcte"=>false, "isLoggedIn"=>false]; 
    
    // if per comprovar si l'usuari està loguejat
    // empty() comprova si una variable està buida o no està definida, en aquest cas 'usuari'
    if (!empty($_SESSION['usuari'])) {
        $resposta["isLoggedIn"]=true; // Com que l'usuari esta loguejat, canviem a true
        $resposta["correcte"]=$_SESSION['admin']; // Com que l'usuari esta loguejat, em retornara 
                                                  // el que hi ha en el camp 'admin' de la sessió (true o false)
    }

    echo json_encode($resposta); // Retorna la resposta en format JSON
?>