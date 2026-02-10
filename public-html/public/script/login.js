/**
 * Funció que intercepta el que s'envia des del formulari del login, recull l'usuari i 
 * la contrasenya que s'ha introduit i els passa a una altra funció que serà l'encarregada
 * d'enviar-les al sevidor.
 */
window.addEventListener("DOMContentLoaded", function () {
    // fer aixo amb el submit del formulari login 
    const enviarLogin = document.body.querySelector("#loginForm");
    let dadesLogin = {};

    enviarLogin.addEventListener("submit", function (e) {
        e.preventDefault(); // Evita que es faci el submit per defecte
        console.log("Enviant dades al servidor...");

        dadesLogin.userName = document.getElementById("userName").value;
        dadesLogin.password = document.getElementById("password").value;

        enviaJSONAServer(dadesLogin);
    });

})

/**
 * Funció que rep les dades que enviarà al servidor i, segons la resposta,
 * redirigeix al window.location indicat o mostra un missatge d'error.
 * @param {*} dadesLogin Les credencials rebudes de la funció anterior.
 */
function enviaJSONAServer(dadesLogin) {
    console.log(dadesLogin);

    const xhr = new XMLHttpRequest();

    //Definim que vull que faci la constant xhr quan enviï les dades en el send()
    xhr.onload = function () {
        console.log("Respuesta del servidor:", xhr.status, xhr.responseText);
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);

            if (response.correcte == true) {
                window.location.replace("../index.html");
            } else {
                alert("incorrecte");
            }
        } else {
            alert("Error: " + xhr.status);
        }
    };

    xhr.open("POST", "../../php/login.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(dadesLogin)); //Convertim l'objecte dadesLogin a JSON i l'enviem al servidor
}