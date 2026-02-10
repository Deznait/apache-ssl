
function guardarProducte(card) {
  // || [] -> si el resultat  anterior es null (pq no s'ha guardat res a localstorage), 
  // llavors s'utilitza un objecte amb un array buit com defecte (on s'introduiran els productes)
  let carret = JSON.parse(localStorage.getItem("productes")) || { productes: [] };
  const nom = card.getAttribute('data-producte');
  const preuText = card.querySelector('.preu').textContent;
  const preu = parseFloat(preuText);
  const quantitat = parseInt(card.querySelector('.num').textContent, 10);
  const index = carret.productes.findIndex(item => item.nom === nom); //find

  if (quantitat > 0) {
    if (index >= 0) {
      carret.productes[index].quantitat = quantitat;
    } else {
      carret.productes.push({
        nom: nom,
        preu: preu,
        quantitat: quantitat
      });
    }
  } else {
    if (index >= 0) {
      carret.productes.splice(index, 1)
    }
  }

  localStorage.setItem("productes", JSON.stringify(carret));
}

// Add to cart 
document.addEventListener('click', function (e) {
  //If per afegir un producte al carret
  if (e.target.classList.contains('btn-cart') || e.target.closest('.btn-cart')) {
    const button = e.target.closest('.btn-cart') || e.target;
    button.classList.toggle('cart_clk');
    const qty = button.parentElement.querySelector('.qty');
    if (qty) {
      qty.classList.toggle('active');
    }
    const card = button.closest('.product-card');
    guardarProducte(card);
  }


  // If per augmentar la quantitat d'un producte
  if (e.target.classList.contains('fa-plus-square') || e.target.closest('.inc')) {
    const inc = e.target.closest('.inc');
    const numSpan = inc.parentElement.querySelector('.num');
    let prnum = parseInt(numSpan.textContent, 10);
    prnum++;
    numSpan.textContent = prnum;

    const cartIcon = inc.closest('.crtdiv').querySelector('.fa-shopping-cart');
    if (cartIcon) {
      cartIcon.setAttribute('data-before', prnum);
    }
    const card = inc.closest('.product-card');
    guardarProducte(card);
  }


  // if per a reduir la quantitat d'un producte
  if (e.target.classList.contains('fa-minus-square') || e.target.closest('.dec')) {
    const dec = e.target.closest('.dec');
    const numSpan = dec.parentElement.querySelector('.num');
    let prnum = parseInt(numSpan.textContent, 10);

    if (prnum > 0) {
      prnum--;
      numSpan.textContent = prnum;

      const cartIcon = dec.closest('.crtdiv').querySelector('.fa-shopping-cart');
      if (cartIcon) {
        cartIcon.setAttribute('data-before', prnum);
      }
      const card = dec.closest('.product-card');
      guardarProducte(card);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  recuperaProductesServidor();
});

function crearCard(item) {
  const ofertaClass = item.oferta ? 'oferta' : '';
  const imgUrl = item.imatge || "placeholder.png";
  return `
    <article class="product-card ${ofertaClass}" data-producte="${item.nom}">
      <div class="inner">
        <img src="../resources/images/products/${imgUrl}" alt="${item.nom}">
        <h5>${item.nom}</h5>
        <p class="descripcio">${item.descripció || item.descripcio}</p>
        <div class="preu-oferta-container">
            <p class="preu-iva"><span class="preu">${item.preu.toFixed(2)}</span> € <span class="iva">IVA inclós</span></p>
            <div class="oferta-badge">
              ${item.oferta ? 'Oferta!' : ''}
            </div>
          </div>
          <div class="cont">
            <div class="crtdiv">
              <button type="button" class="cart btn-cart">
                Afegir a la cistella
              </button>
              <span class="qty">
                <span class="dec">
                  <i class="fa fa-minus" aria-hidden="true"></i>
                </span>
                <span class="num">1</span>
                <span class="inc">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </span>
              </span>
            </div>
          </div>

        </div>

    </article>
  `;
}

// Li passa per paràmetre una llista de categories amb els seus productes, genera cada card 
// de cada producte i les afegeix a la secció corresponent
function mostrarCategories(categories) {
  const productesDiv = document.getElementById("productes");

  Object.keys(categories).forEach(cat => {
    const items = categories[cat];
    if (items.length === 0) return;

    if (cat === "entrepans-freds") {
      const fredsCards = document.querySelector("#freds .product-cards");
      if (fredsCards) {
        fredsCards.innerHTML = items.map(crearCard).join("");
      }
    } else if (cat === "entrepans-calents") {
      const calentsCards = document.querySelector("#calents .product-cards");
      if (calentsCards) {
        calentsCards.innerHTML = items.map(crearCard).join("");
      }
    } else {
      let sec = document.getElementById(cat);
      if (!sec) {
        sec = document.createElement("section");
        sec.id = cat;
        const titulo = cat.charAt(0).toUpperCase() + cat.slice(1);
        sec.innerHTML = `<h3>${titulo}</h3><div class="product-cards flex"></div>`;
        productesDiv.appendChild(sec);
      }
      const cards = sec.querySelector(".product-cards");
      cards.innerHTML = items.map(crearCard).join("");
    }
  });
}

//https://www.w3schools.com/howto/howto_js_vertical_tabs.asp
// Funció que cada cop que es fa click en alguna de les pestanyes dels entrepans, oculta tots
// els continguts, treu la class active de totes les pestanyes i un cop això mostra el contingut 
// seleccionat i afegeix la class active a la pestanya seleccionada.
function openBocata(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Funció que fa una petició al serviqdor per recuperar els productes
function recuperaProductesServidor() {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.success) {
        const data = JSON.parse(response.productes);
        const productes = data.productes;
        const cats = {};
        for (const item of productes) {
          if (item.categoria === 'entrepans') {
            const subcat = (item.descripció?.toLowerCase().includes('fred'))
              ? 'entrepans-freds'
              : 'entrepans-calents';
            if (!cats[subcat]) cats[subcat] = [];
            cats[subcat].push(item);
          } else {
            if (!cats[item.categoria]) cats[item.categoria] = [];
            cats[item.categoria].push(item);
          }
        }
        mostrarCategories(cats);
      } else {
        alert("Error: " + xhr.status);
      }
    } else {
      alert("Error: " + xhr.status);
    }
  };

  xhr.onerror = function () {
    console.error("Error de xarxa");
    alert("Error de connexió amb el servidor");
  };

  xhr.open("GET", "/php/enviaProductes.php", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

