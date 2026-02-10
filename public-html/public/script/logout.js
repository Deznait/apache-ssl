/**
 * Funció que espera a que tot l'HTML estigui carregat i
 * prerarat per executar la funció que crida.
 */
window.addEventListener("DOMContentLoaded", function () {
    updateUI();
})

/**
 * Funció que comprova si l'usuari està logejat o no.
 * Envia al servidor una petició per verificar que l'usuari està logejat i espera una resposta.
 * @returns retorna true o false depenent de si està logejat o no.
 */
async function isLoggedIn() {
    try {
        const response = await fetch("/php/isLoggedIn.php", { method: "POST" }); // Enviem una petició POST al servidor i amb await esperem la resposta
        const data = await response.json(); // Aquí esperem la resposta del servidor i la convertim a JSON
        console.log("Respuesta del servidor:", data);
        return data.correcte; // true o false
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}

/**
 * Funció que ens actualitza el botó d'iniciar/tancar sessió
 * basat en l'estat del login
 */
async function updateUI() {
    const loggedIn = await isLoggedIn(); // Espera la resposta de la funció isLoggedIn()

    if (loggedIn) {
        console.log("dins del loggedIn");
        const loginForm = document.querySelector("#loginForm");

        document.querySelector(".envia").style.display = "none"; // Amaga el botó d'enviar

        const logoutBoto = document.createElement('button');
        logoutBoto.type = 'submit';
        logoutBoto.className = 'logout envia';
        logoutBoto.id = 'logout';
        logoutBoto.innerHTML = 'Tancar sessió';

        logoutBoto.onclick = logout;

        loginForm.insertAdjacentElement("beforeend", logoutBoto);
        // User is logged in, so show the logout button container
        /* botoLogin.textContent = "Tanca la sessió"*/

    } else {
        console.log("No es logged in");
    }
}

/**
 * Funció que envia al servidor la petició de logout i després recarrega 
 * la pàgina per actualitzar l'estat de la sessió.
 * 
 * @returns Retorna 'void' (no res) si la petició té èxit o false si hi ha un error en la petició
 */
async function logout() {
    try {
        const response = await fetch("/php/logout.php", { method: "POST" });
        //const data = await response.json(); // aquí esperas la respuesta en JSON
        window.location.reload();
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}
