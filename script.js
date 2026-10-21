
document.addEventListener("DOMContentLoaded", async () => {
    // ELEMENTOS DEL VIDEO
    const video = document.getElementById("heroVideo");
    const videoToggle = document.getElementById("videoToggle");
    const soundToggle = document.getElementById("soundToggle");

    if (video && videoToggle) {
        videoToggle.addEventListener("click", async () => {
            if (video.paused) {
                try {
                    await video.play();
                    videoToggle.textContent = "Ⅱ";
                } catch (error) {
                    console.error("No se pudo reproducir el video:", error);
                }
            } else {
                video.pause();
                videoToggle.textContent = "▶";
            }
        });
    }

    if (video && soundToggle) {
        soundToggle.addEventListener("click", async () => {
            video.muted = !video.muted;
            soundToggle.textContent = video.muted ? "♪" : "♫";

            if (!video.paused && !video.muted) {
                try {
                    await video.play();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }

    // AÑO AUTOMÁTICO
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // TRADUCCIONES JSON
    const idiomaBtn = document.getElementById("idiomaBtn");
    let idiomaActual = "es";
    let traducciones = {};

    try {
        const respuesta = await fetch("./traducciones.json");

        if (!respuesta.ok) {
            throw new Error("No se encontró traducciones.json");
        }

        traducciones = await respuesta.json();
    } catch (error) {
        console.error("Error al cargar traducciones.json:", error);
    }

    // BUSCADOR Y FILTROS
    const searchInput = document.getElementById("searchInput");
    const brandButtons = document.querySelectorAll(".filter-btn");
    const filteredGrid = document.getElementById("filteredGrid");
    const resultsText = document.getElementById("resultsText");

    const cars = Array.from(
        document.querySelectorAll("#carCarousel .car-card")
    );

    let selectedBrand = "all";

    // TEXTOS DE LA PÁGINA
    function ponerTexto(selector, clave, indice = 0, usarHTML = false) {
        const elementos = document.querySelectorAll(selector);
        const elemento = elementos[indice];
        const texto = traducciones[idiomaActual]?.[clave];

        if (elemento && texto !== undefined) {
            if (usarHTML) {
                elemento.innerHTML = texto;
            } else {
                elemento.textContent = texto;
            }
        }
    }

    function traducirPagina() {
        const t = traducciones[idiomaActual];
        if (!t) return;

        // Menú
        ponerTexto(".navbar-nav .nav-link", "inicio", 0);
        ponerTexto(".navbar-nav .nav-link", "galeria", 1);
        ponerTexto(".navbar-nav .nav-link", "marcas", 2);
        ponerTexto(".navbar-nav .nav-link", "nosotros", 3);
        ponerTexto(".header-link", "verColeccion");
        
        // Portada
        ponerTexto(".hero .eyebrow", "etiqueta");
        ponerTexto(".hero h1", "titulo", 0, true);
        ponerTexto(".hero-text", "descripcion");
        ponerTexto(".hero .btn-main", "explorar");
        ponerTexto(".btn-outline-custom", "conocer");
        ponerTexto(".hero-meta div span", "velocidad", 0);
        ponerTexto(".hero-meta div span", "diseno", 1);
        ponerTexto(".hero-meta div span", "actitud", 2);
        ponerTexto(".scroll-cue", "descubrir");
        
        // Galería
        ponerTexto(".section-top .eyebrow", "seleccion", 0);
        ponerTexto(".section-top h2", "tituloGaleria", 0, true);
        ponerTexto(".section-top .muted", "subtituloGaleria");
        
        // Buscador
        ponerTexto(".filter-section .eyebrow", "buscarEstilo");
        ponerTexto(".filter-section h2", "tituloBuscar", 0, true);
        ponerTexto(".search-panel label", "etiquetaBuscar");
        if (searchInput) {
            searchInput.placeholder = t.placeholderBuscar;
        }

        brandButtons.forEach((button) => {
            const marca = button.dataset.brand;
            const clave = marca === "all"
                ? "todos"
                : "marca_" + marca.toLowerCase();

            if (t[clave]) button.textContent = t[clave];
        });

        // Sobre nosotros y pie
        ponerTexto(".about-content .eyebrow", "sobre");
        ponerTexto(".about-content h2", "tituloSobre", 0, true);
        ponerTexto(".about-content > p:not(.eyebrow)", "textoSobre");
        ponerTexto(".about-content .btn-main", "volver");
        ponerTexto(".footer > p", "fraseFooter");

        // Botones del video
        if (videoToggle) {
            videoToggle.setAttribute(
                "aria-label",
                video && video.paused ? t.reproducirVideo : t.pausarVideo
            );
        }

        if (soundToggle) {
            soundToggle.setAttribute(
                "aria-label",
                video && video.muted ? t.activarSonido : t.silenciarSonido
            );
        }

        if (idiomaBtn) {
            idiomaBtn.textContent = idiomaActual === "es" ? "EN" : "ES";
            idiomaBtn.setAttribute(
                "aria-label",
                idiomaActual === "es" ? "Switch to English" : "Cambiar a español"
            );
        }

        filterCars();
    }

    // FILTRAR LOS VEHÍCULOS
    function filterCars() {
        const t = traducciones[idiomaActual] || {};
        const busqueda = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const resultados = cars.filter((car) => {
            const marca = car.dataset.brand || "";
            const nombre = car.dataset.name || "";

            const coincideMarca =
                selectedBrand === "all" || marca === selectedBrand;

            const coincideBusqueda =
                marca.toLowerCase().includes(busqueda) ||
                nombre.toLowerCase().includes(busqueda);

            return coincideMarca && coincideBusqueda;
        });

        if (filteredGrid) {
            filteredGrid.replaceChildren();

            if (resultados.length === 0) {
                const mensaje = document.createElement("p");
                mensaje.className = "no-results";
                mensaje.textContent = t.sinResultados ||
                    "No encontramos carros con esa búsqueda.";
                filteredGrid.appendChild(mensaje);
            } else {
                resultados.forEach((car) => {
                    const columna = document.createElement("div");
                    columna.className = "col-md-6 col-lg-4";
                    columna.appendChild(car.cloneNode(true));
                    filteredGrid.appendChild(columna);
                });
            }
        }

        if (resultsText) {
            const cantidad = resultados.length;
            const plantilla = cantidad === 1
                ? t.unVehiculo || "vehículo encontrado"
                : t.variosVehiculos || "vehículos encontrados";

            resultsText.textContent = `${cantidad} ${plantilla}`;
        }
    }

    brandButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedBrand = button.dataset.brand || "all";

            brandButtons.forEach((otro) => {
                otro.classList.toggle(
                    "active",
                    otro.dataset.brand === selectedBrand
                );
            });

            filterCars();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", filterCars);
    }

    // BOTÓN DE IDIOMA
    if (idiomaBtn) {
        idiomaBtn.addEventListener("click", () => {
            idiomaActual = idiomaActual === "es" ? "en" : "es";
            document.documentElement.lang = idiomaActual;
            traducirPagina();
        });
    }

    traducirPagina();
    
    // CAMBIAR ENTRE MODO OSCURO Y CLARO
    const temaBtn = document.getElementById("temaBtn");

    function actualizarTema() {
        const modoClaro = document.body.classList.contains("modo-claro");

        if (temaBtn) {
            temaBtn.textContent = modoClaro
                ? "☾ Modo oscuro"
                : "☀ Modo claro";
        }
    }

    if (temaBtn) {
        temaBtn.addEventListener("click", () => {
            document.body.classList.toggle("modo-claro");
            actualizarTema();
        });

        actualizarTema();
    }

});

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const contactStatus = document.getElementById("contactStatus");
    const contactSubmit = document.getElementById("contactSubmit");

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const datos = {
            nombre: document.getElementById("contactName").value.trim(),
            correo: document.getElementById("contactEmail").value.trim(),
            mensaje: document.getElementById("contactMessage").value.trim()
        };

        contactSubmit.disabled = true;
        contactSubmit.textContent = "ENVIANDO...";
        contactStatus.textContent = "";

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "No se pudo enviar el mensaje.");
            }

            contactStatus.textContent = "¡Mensaje enviado correctamente!";
            contactForm.reset();

        } catch (error) {
            contactStatus.textContent =
                error.message || "Error al enviar. Intentá de nuevo.";
        } finally {
            contactSubmit.disabled = false;
            contactSubmit.textContent = "ENVIAR MENSAJE";
        }
    });
}

