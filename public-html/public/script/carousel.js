/**
 * Funció que, al carregar-se la pàgina, inicialitza un carrusel d'imatges
 * amb títols que avança de forma automàtica cada 3 segons, però es pot
 * controlar clicant a les fletxes.
 */

window.onload = function () {
    // Array amb les variables
    const imagenes = [
        'resources/images/principal/coffee-shop.webp',
        'resources/images/principal/coffee.webp',
        'resources/images/principal/bocadillos.webp',
        'resources/images/principal/zumo.webp',
        'resources/images/principal/bocadillos2.webp'
    ];

    const titulos = [
        'Benvinguts al Gato Rumano',
        '',
        'Gaudeix de les ofertes de la setmana',
        '',
        'La pausa perfecta amb un sabor autèntic',

    ];

    let posicionActual = 0;
    let $botonRetroceder = document.querySelector('.retroceder');
    let $botonAvanzar = document.querySelector('.avanzar');
    let $imagen = document.querySelector('#imagen');
    let $titulo = document.querySelector('#titulos');
    let intervalo;

    // Funciones

    /**
     * Funció que canvia la foto a la següent posició
     */
    function pasarFoto() {
        if (posicionActual >= imagenes.length - 1) {
            posicionActual = 0;
        } else {
            posicionActual++;
        }
        renderizarImagen();
        renderizarTitulo();
    }

    /**
     * Funció que canvia la foto a l'anterior posició
     */
    function retrocederFoto() {
        if (posicionActual <= 0) {
            posicionActual = imagenes.length - 1;
        } else {
            posicionActual--;
        }
        renderizarImagen();
        renderizarTitulo();
    }

    /**
     * Funció que actualitza la imatge en funció de la posicionActual
     */
    function renderizarImagen() {
        $imagen.style.backgroundImage = `url(${imagenes[posicionActual]})`;
    }

    /**
     * Funció que actualitza el títol en funció de la posicionActual
     */
    function renderizarTitulo() {
        $titulo.textContent = titulos[posicionActual];
    }

    /**
     * Funció que permet iniciar el carrousel de forma automàtica
     */
    function iniciarAutomatic() {
        intervalo = setInterval(pasarFoto, 3000); // 3000 minisegons = 3 segons
    }

    /**
     *  Funció que permet parar el carrousel quan faig click a les fletxes,
     *  per tant, aquesta funció s'haurà de cridar als eventListener dels botons.
     */
    function pararAutomatic() {
        clearInterval(intervalo);
    }

    /**
     * Funció que al pressionar el botó d'avançar fa parar el carousel i
     * que només es passen les imatges si es fa click a la fletxa.
     */
    $botonAvanzar.addEventListener('click', () => {
        pasarFoto();
        pararAutomatic();
    });

    /**
     * Funció que al pressionar el botó de retorcedir fa parar el 
     * carousel i que només es passen les imatges si es fa click 
     * a la fletxa.
     */
    $botonRetroceder.addEventListener('click', () => {
        retrocederFoto();
        pararAutomatic();
    });

    /**
     * Inicialització de les funcions creades anteriorment.
     */
    renderizarImagen();
    renderizarTitulo();
    iniciarAutomatic();
}