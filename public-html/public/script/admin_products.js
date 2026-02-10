const PHP_API = '../../php/adminProducts.php';
let productes = [];
let editarIndex = -1;

// Ajax general. Funció que envia peticions al servidor, processa resposta i controla errors
function enviarAjax(url, metode, data, callback) {
    const xhr = new XMLHttpRequest(); //Objecte per fer una petició asíncrona al servidor sense recarregar la pàgina.

    // Funció que s'executa quan la resposta del servidor està llesta, la processa, 
    // maneja errors i entrega el resultat a través del callback.

    // Si la resposta del servidor és correcta i obtenim el codi "status" 200, entra a al if i la resposta que hem rebut del servidor
    // en format text JSON (resposeText) la parseja per a que sigui un objecte Javascript i la passa per la funció callback().
    // En el cas que es produeixi algun error (ja sigui per un error al parsejar o pel codi d'estat no sigui 200),
    // retorna un objecte d'error a través del callback() indicant que ha fallat.
    xhr.onload = function () {
        console.log('Resposta del servidor:', xhr.responseText);
        if (xhr.status === 200) {
            try {
                const respuesta = JSON.parse(xhr.responseText);
                callback(respuesta); // callback() es una funció per passar el resultat d'una operació asíncrona.
            } catch (e) {
                console.error('Error al parsejar el JSON:', e);
                callback({ success: false, message: 'Error al processar resposta' });
            }
        } else {
            callback({ success: false, message: 'Error al servidor' + xhr.status });
        }
    };

    // Funció que controla els errors de xarxa durant la petició AJAX.
    xhr.onerror = function () {
        console.error('Error de connexió');
        callback({ success: false, message: 'Error de connexió' });
    };

    xhr.open(metode, url, true); // S'indica el mètode que es farà servir (GET, POST), la url on es farà la crida i petició asíncrona (true).
    xhr.send(data); //S'envia la petició al servidor.
}

// Cargar productes
// Funció que carrega els productes des del servidor. Fa una crida a la funció enviarAjax() i passa per paràmetre 
// la url del fitxer php, el mètode que fem servir, les dades (null en aquest cas) i una funció callback per processar la resposta.
// Un cop dins, si la resposta data.success és true, guarda els productes a la variable productes i els mostra amb la funció showProducts() (que es troba a sota).
// En cas contrari, buida l'array productes i també crida a showProducts() per actualitzar la vista.
function loadProducts() {
    enviarAjax(PHP_API + '?accion=listar', 'GET', null, function (data) {
        console.log('Productos recibidos:', data);
        if (data.success) {
            productes = data.products;
            showProducts();
        } else {
            productes = [];
            showProducts();
        }
    });
}

// Mostrar productes a la taula
function showProducts() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';

    // Si no existeixen productes, m'afageixes una fila al cos de la taula amb el missatge indicat.
    if (productes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No hi ha prouctes</td></tr>';
        return;
    }

    // Bucle forEach per recórrer l'array de productes i crear una fila per cada producte 
    // i amb diferents caselles per a poder introduir tota la inforamció.
    productes.forEach((producte, index) => {
        const fila = tbody.insertRow(); // insertRow() crea i insereix una nova fila (<tr>) dins del cos de la taula (<tbody>).

        // Insertar imatge. insertCell() crea i insereix una nova cel·la (<td>) dins d'una fila (<tr>) d'una taula html.
        fila.insertCell().innerHTML = `<img src="../resources/images/products/${producte.imatge}" alt="${producte.nom}" style="width: 50px;">`;

        // Insertar dades
        fila.insertCell().textContent = producte.nom;
        fila.insertCell().textContent = producte.preu.toFixed(2) + ' €';
        fila.insertCell().textContent = producte.categoria;
        fila.insertCell().textContent = producte.descripció || 'Sense descripció';
        fila.insertCell().innerHTML = producte.oferta ? '<span style="color: green;">Sí</span>' : '<span style="color: red;">No</span>';

        // Horaris
        // Primer em guarda a horaris els horaris del producte (o un array buit si no té).
        // Amb el mètode .map() recórre cada horari i el converteix a text (Matí, Tarda, Nit).
        // Finalment, amb .join(', ') uneix tots els horaris en una sola cadena separada per comes i així poder-ho introduit a la taula.
        const horaris = producte.horario || [];
        const horariosTexto = horaris.map(h => {
            if (h === 'manana') return 'Matí';
            if (h === 'tarde') return 'Tarda';
            if (h === 'noche') return 'Nit';
            return h;
        }).join(', ');
        fila.insertCell().textContent = horariosTexto || 'No especificat';

        const accions = fila.insertCell();
        //innerHTML serveix per establir o retornar el contingut HTML d'un element.
        accions.innerHTML = `
        <div class="flex">
            <button onclick="prepareEdit(${index})" class="btn-edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deleteProduct(${index})" class="btn-delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });
}

// Preview img. Codi que permet previsualitzar una imatge abans de pujar-la al servidor.
// S'afegeix un event listener al camp d'input de tipus file amb id 'imatge' que s'activa quan l'usuari selecciona un fitxer.
// A const file es guarda el fitxer seleccionat. 
// Si hi ha fitxer, es crea un objecte "reader" de tipus FileReader(). 
// Amb onload es defineix una funció que s'executa quan la lectura del fitxer és completa.
// Dins d'aquesta funció, guardem a dins de preview l'element img amb id 'image-preview' on es mostrarà la previsualització.
// En el cas de si no existeix, entra a l'if i es crea l'element img, s'estableixen els seus estils i s'afegeix al DOM amb appendChild().
// Amb "preview.src = event.target.result;" establim la imatge previsualitzada amb el contingut llegit pel FileReader.
// I per últim, amb el "readAsDataURL()" llegim el contingut del fitxer que li passem per paràmetre
document.getElementById('imatge').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        console.log('Imagen seleccionada:', file.name);
        const reader = new FileReader();
        reader.onload = function (event) {
            let preview = document.getElementById('image-preview');
            if (!preview) {
                preview = document.createElement('img');
                preview.id = 'image-preview';
                preview.style.cssText = 'max-width: 150px; margin-top: 10px; border: 2px solid #ddd; padding: 5px;';
                e.target.parentElement.appendChild(preview);
            }
            preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// addEventListener del formulari per a guardar un producte
document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();

    console.log('Guardant producte...');
    console.log('Mode edició:', editarIndex >= 0 ? 'Editar' : 'Afegir');

    // Recollir dades. Crear un objecte FormData a partir de les dades del formulari.
    const formData = new FormData(this);

    // Editar vs añadir. Si editarIndex és major o igual a 0, significa que estem en mode edició, sinó, en mode afegir. 
    if (editarIndex >= 0) {
        formData.append('accion', 'editar');
        formData.append('index', editarIndex);
    } else {
        formData.append('accion', 'añadir');
    }

    // Crear l'objecte XMLHttpRequest per enviar les dades al servidor.
    const xhr = new XMLHttpRequest();

    // function onload per processar la resposta del servidor. Si status 200 parsegem el JSON responseText a objecte Javascript 
    // i si data.success és true, recarreguem els productes i netegem el formulari.
    // i sino mostrem errors pertinents
    xhr.onload = function () {
        console.log('Resposta:', xhr.responseText);

        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                console.log('Dades parsejades:', data);

                if (data.success) {
                    loadProducts();
                    cleanForm();
                }
            } catch (e) {
                console.error('Error al parsejar resposta:', e);
            }
        } else {
            console.error('Error al guardar' + xhr.status);
        }
    };

    // funció que controlem errors de connexió
    xhr.onerror = function () {
        console.error('Error de conexión');
    };

    xhr.open('POST', PHP_API, true); // Obrim la connexió amb mètode POST a la URL definida a PHP_API.
    xhr.send(formData); // Enviem les dades del formulari al servidor.
});

// Preparar per editar.
// Funció que prepara el formulari per editar un producte existent.
// Adapta el formulari amb les dades del producte seleccionat i canvia l'estat del botó de guardar.
function prepareEdit(index) {
    console.log('Editant producte:', index);
    editarIndex = index;
    const producte = productes[index];

    // reomplir form 
    document.getElementById('nom').value = producte.nom;
    document.getElementById('preu').value = producte.preu;
    document.getElementById('descripcio').value = producte.descripció || '';
    document.getElementById('categoria').value = producte.categoria;
    document.getElementById('oferta').checked = producte.oferta;

    // Marcar horaris
    const checkboxesSchedule = document.querySelectorAll('input[name="horario[]"]');
    checkboxesSchedule.forEach(checkbox => {
        checkbox.checked = producte.horario && producte.horario.includes(checkbox.value);
    });

    // Mostrar imatge
    let preview = document.getElementById('image-preview');
    if (!preview) {
        preview = document.createElement('img');
        preview.id = 'image-preview';
        preview.style.cssText = 'max-width: 150px; margin-top: 10px; border: 2px solid #ddd; padding: 5px;';
        document.getElementById('imatge').parentElement.appendChild(preview);
    }
    preview.src = '../resources/images/products/' + producte.imatge;

    // Cambiar el botón
    document.querySelector('.btn-save').textContent = 'Actualitzar Producte';
    document.getElementById('btn-cancel-edit').style.display = 'inline-block';

    // Añadir texto informativo
    let infoText = document.getElementById('info-imagen-edit');
    if (!infoText) {
        infoText = document.createElement('small');
        infoText.id = 'info-imagen-edit';
        infoText.style.display = 'block';
        infoText.style.marginTop = '5px';
        infoText.style.color = '#666';
        document.getElementById('imatge').parentElement.appendChild(infoText);
    }
    infoText.textContent = '* No seleccionis cap imatge per mantenir la actual';

    // Scroll!!!!!!!!!!!!!!!
    // scrollIntoView() desplaça la pàgina fins a l'element especificat.
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

// Eliminar producte
// Funció que elimina un producte després de confirmar-ho amb l'usuari.
function deleteProduct(index) {
    if (!confirm('Segur que vols eliminar: ' + productes[index].nom + '?')) {
        return;
    }

    const formData = new FormData();
    formData.append('accion', 'eliminar');
    formData.append('index', index);

    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        console.log('Resposta eliminar:', xhr.responseText);
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    loadProducts();
                } else {
                    console.error(data.message, 'error');
                }
            } catch (e) {
                console.error('Error al processar respoesta', e);
            }
        } else {
            console.error('Error al eliminar');
        }
    };

    xhr.onerror = function () {
        console.error('Error de connexió');
    };

    xhr.open('POST', PHP_API, true);
    xhr.send(formData);
}

// Netejar form
// Funció que neteja el formulari i restableix l'estat per afegir un nou producte.
function cleanForm() {
    document.getElementById('product-form').reset();
    editarIndex = -1;

    // Resetejar checkbox
    document.querySelectorAll('input[name="horario[]"]').forEach(cb => cb.checked = true);

    document.querySelector('.btn-save').textContent = 'Guardar Producte';
    document.getElementById('btn-cancel-edit').style.display = 'none';

    // Eliminar preview 
    const preview = document.getElementById('image-preview');
    if (preview) preview.remove();

    // Eliminar text
    const infoText = document.getElementById('info-imagen-edit');
    if (infoText) infoText.remove();
}

document.getElementById('btn-cancel-edit').addEventListener('click', cleanForm);

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
});