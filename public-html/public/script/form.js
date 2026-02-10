/**
 * Aquesta funció serveix per interceptar el form submit i en comptes de fer un submit normal, poder gestionar-lo i enviar dades alterades
 * al servidor.
*/
window.addEventListener("DOMContentLoaded", function () {
    const carret = document.body.querySelector("#entra-carret"); // Agafem el formulari del carret
    // localstorage és una variable global del navegador que permet guardar dades en format clau-valor
    let carretData = JSON.parse(this.localStorage.getItem("productes"));
    if (!carretData) {
        carretData = { productes: [] };
    }
    afegirTotalAJSON(carretData);

    carret.addEventListener("submit", function (e) {
        e.preventDefault(); // Evita el comportament per defecte del form (enviar i recarregar la pàgina)
        alert("Enviant dades al servidor...");
        carretData.username = document.getElementById("username").value;
        carretData.usermail = document.getElementById("usermail").value;
        carretData.usertel = document.getElementById("usertel").value;
        enviaJSONAServer(carretData);
    });

    mostraTiquet();
})

/**
 * Envia les dades del carret en format JSON al servidor.
 * @param {*} productes L'array de productes a enviar en format JSON.
 */

function enviaJSONAServer(tiquet) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        console.log("Respuesta del servidor:", xhr.status, xhr.responseText);
        if (xhr.status === 200) {
            alert("Dades enviades correctament!");
            localStorage.removeItem("productes");
            window.location.replace("../index.html");
        } else {
            alert("Error: " + xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error("Error de xarxa");
        alert("Error de connexió amb el servidor");
    };

    xhr.open("POST", "/php/confirm.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(tiquet));
}

/**
 * Mostra el tiquet guardat al localStorage.
 * @returns Retorna valors void si és un error.
 */

function mostraTiquet() {
    let carretData = JSON.parse(localStorage.getItem("productes"));
    let tiquetDiv = document.body.querySelector(".tiquet-card");

    if (!carretData || !carretData.productes || carretData.productes.length === 0) {
        tiquetDiv.innerHTML = "<p>El carret està buit.</p>";
        return;
    }

    let html = "<h2>Resum de la comanda</h2><ul>";
    carretData.productes.forEach(item => {
        html += `<div class="item-card">
                    <h5>${item.nom}</h5>
                    <div class="item-details">
                        <span>Quantitat: ${item.quantitat}</span><br>
                        <span>Preu unitari: ${item.preu.toFixed(2)}€</span><br>
                        <span>Total: ${(item.preu * item.quantitat).toFixed(2)}€</span><br>
                    </div>
                </div>`;
    });
    html += `</ul>`;
    html += `<h4>Total a pagar: ${carretData.total.toFixed(2)}€</h4>`;

    tiquetDiv.innerHTML = html;
}

/**
 * Afegeix el valor total de tots els productes al JSON guardat al localStorage.
 * @param {*} carretData 
 */

function afegirTotalAJSON(carretData) {
    if (!carretData || !carretData.productes || carretData.productes.length === 0) {
        carretData.total = 0;
    } else {
        let total = 0;
        carretData.productes.forEach(item => {
            total += item.preu * item.quantitat;
        });
        carretData.total = total;
    }
    localStorage.setItem("productes", JSON.stringify(carretData)); // Actualitza el localStorage amb el total
}