// Quan el document estigui carregat al DOM, afegim un event listener al botó de canvi de tema
document.addEventListener('DOMContentLoaded', () => {
    const darkLightButton = document.getElementById('darkLight');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme'); // va a recuperar la variable 'theme' del localStorage, va a recuperar el que te guardat
    if (savedTheme === 'dark') {
        body.classList.add('darkmode');
    }

    if (darkLightButton) {
        darkLightButton.addEventListener('click', (e) => {
            e.preventDefault();
            body.classList.toggle('darkmode'); //Actua com un interruptor, si el body té la classe "darkmode", la treu, i si no ho està, la posa
            if (body.classList.contains('darkmode')) {
                localStorage.setItem('theme', 'dark'); // si el mode fosc està activat, guarda 'dark' a la variable 'theme' del localStorage
            } else {
                localStorage.setItem('theme', 'light'); // si el mode clar està activat, guarda 'light' a la variable 'theme' del localStorage
            }
        });
    }
});