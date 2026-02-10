/**
 * Funció que, al carregar la pàgina, oculta el contingut principal i després crida a
 * una altra funció per comprovar si l'usuari té permisos d'administrador.
 */
window.onload = function () {
    const main = document.body.querySelector("main");
    main.style.display = "none";

    comprovaAdmin();
    mostraTiquets();
}

/**
 * Funció que envia una petició al servidor per comprovar si l'usuari és administrador i,
 * segons la resposta, mostra el contingut de la pàgina o redirigeix fora.
 */
function comprovaAdmin() {
    const xhr = new XMLHttpRequest();

    //Definim que vull que faci la constant xhr quan enviï les dades en el send()
    // Si la resposta del servidor és correcta i obtenim el codi "status" 200, entra a al if i la resposta que hem rebut del servidor
    // en format text JSON (resposeText) la parseja per a que sigui un objecte Javascript 
    xhr.onload = function () {
        console.log("Respuesta del servidor:", xhr.status, xhr.responseText);
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);

            if (response.correcte) {
                document.body.querySelector("main").style.display = "block"; // Mostrem el contingut principal si és admin.
                alert("Ets admin");
            } else {
                let missatge = response.isLoggedIn ? "No ets administrador" : "No tens iniciada la sessió";
                alert(missatge);
                window.location.replace("../index.html");
            }
        } else {
            alert("Error: " + xhr.status);
        }
    };

    xhr.open("POST", "../../php/adminLogin.php", true);
    xhr.send();
}

/**
 * Mostra tots els tiquets del servidor si ets admin.
 */

function mostraTiquets() {
    const xhr = new XMLHttpRequest();

    // En aquesta funció, si la resposta del servidor és correcta i obtenim el codi "status" 200, entra a al if i 
    // la resposta que hem rebut del servidor en format text JSON (resposeText) la parseja per a que sigui un objecte Javascript 
    xhr.onload = function () {
        console.log("Respuesta del servidor:", xhr.status, xhr.responseText);
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);

            if (response.success) {
                let tiquets = response["tickets"]; // Array amb tots els tiquets obtinguts del servidor,
                // TODO: mostra tots els tiquets
                let titol = document.createElement('h2');
                titol.textContent = "Tiquets dels usuaris";
                titol.classList.add("admin-titol");
                let contenidor = document.createElement('div');
                contenidor.id = "tiquet-div";
                tiquets.forEach(element => {
                    let tiquet = document.createElement('card');
                    tiquet.classList.add("tiquet-card");
                    let product = '';
                    product += `<h3>Tiquet ID: ${element.id}</h3>`;
                    product += `<p>Nom: ${element.data.username}</p>`;
                    product += `<p>Adreça: ${element.data.usermail}</p>`;
                    product += `<p>Telèfon: ${element.data.usertel}</p>`;
                    element.data.productes.forEach(item => {
                        product += `<div class="item-card">
                                        <h5>${item.nom}</h5>
                                        <div class="item-details">
                                            <span>Quantitat: ${item.quantitat}</span><br>
                                            <span>Preu unitari: ${item.preu.toFixed(2)}€</span><br>
                                            <span>Total: ${(item.preu * item.quantitat).toFixed(2)}€</span><br>
                                        </div>
                                    </div>`;
                    })
                    product += `<h4>Total a pagar: ${element.data.total.toFixed(2)}€</h4>`;
                    tiquet.innerHTML = product;
                    contenidor.appendChild(tiquet);
                });
                contenidor.classList.add("tiquet-container");
                document.body.querySelector(".login-adm").style.display = "none";
                document.body.querySelector("#tiquet-contenidor").appendChild(titol);
                document.body.querySelector("#tiquet-contenidor").appendChild(contenidor);
            } else if (response["tickets"].length == 0) {
                document.body.querySelector("#tiquet-contenidor").innerHTML = `<h3>No s'ha trobat els tiquets</h3>`;
            } else {
                alert("No ha funcionat.")
            }
        } else {
            alert("Error: " + xhr.status);
        }
    };

    xhr.open("POST", "../../php/enviaTiquets.php", true);
    xhr.send();
}
