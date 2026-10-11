// ===== Este archivo se carga en TODAS las páginas =====
// Por eso cada bloque primero verifica que el elemento exista en la página actual.

window.addEventListener("load", function () {
    console.log("Plataforma HopePets cargada correctamente.");
});

// 1. Botón para cambiar el tema claro / oscuro (se recuerda entre páginas)
const body = document.body;
const btnTema = document.getElementById("btnTema");

function aplicarTema(tema) {
    body.setAttribute("data-theme", tema);
    if (btnTema) {
        btnTema.textContent = tema === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    }
}

let temaGuardado = "light";
try {
    temaGuardado = localStorage.getItem("hopepets-tema") || "light";
} catch (error) {
    // Si el navegador bloquea localStorage, se usa el tema claro
}
aplicarTema(temaGuardado);

if (btnTema) {
    btnTema.addEventListener("click", function () {
        const nuevoTema = body.getAttribute("data-theme") === "light" ? "dark" : "light";
        aplicarTema(nuevoTema);
        try {
            localStorage.setItem("hopepets-tema", nuevoTema);
        } catch (error) {}
    });
}


// 4. Validación del formulario de contacto (solo en contacto.html)
const formulario = document.getElementById("formContacto");

if (formulario) {
    const campoNombre = document.getElementById("nombre");
    const campoCorreo = document.getElementById("correo");
    const campoMensaje = document.getElementById("mensaje");
    const errorMensaje = document.getElementById("errorMensaje");
    const exitoMensaje = document.getElementById("exitoMensaje");

    // Formato: texto@dominio.extension (sin espacios)
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Contador de caracteres del mensaje
    const contador = document.getElementById("contadorMensaje");
    function actualizarContador() {
        contador.textContent = campoMensaje.value.length + " / " + campoMensaje.maxLength;
    }
    campoMensaje.addEventListener("input", actualizarContador);

    function marcarCampo(campo, esInvalido) {
        campo.setAttribute("aria-invalid", esInvalido ? "true" : "false");
    }

    function mostrarError(texto, campo) {
        exitoMensaje.hidden = true;
        errorMensaje.textContent = texto;
        errorMensaje.hidden = false;
        campo.focus();
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = campoNombre.value.trim();
        const correo = campoCorreo.value.trim();
        const mensaje = campoMensaje.value.trim();

        // Se reinicia el estado de los campos
        [campoNombre, campoCorreo, campoMensaje].forEach(function (c) { marcarCampo(c, false); });

        if (nombre === "") {
            marcarCampo(campoNombre, true);
            mostrarError("Por favor, escribe tu nombre.", campoNombre);
            return;
        }

        if (correo === "") {
            marcarCampo(campoCorreo, true);
            mostrarError("Por favor, escribe tu correo electrónico.", campoCorreo);
            return;
        }

        if (!formatoCorreo.test(correo)) {
            marcarCampo(campoCorreo, true);
            mostrarError("Por favor, ingresa un correo electrónico válido (ejemplo: nombre@correo.com).", campoCorreo);
            return;
        }

        if (mensaje.length < 10) {
            marcarCampo(campoMensaje, true);
            mostrarError("El mensaje debe tener al menos 10 caracteres.", campoMensaje);
            return;
        }

        errorMensaje.hidden = true;
        exitoMensaje.textContent = "¡Muchas gracias, " + nombre + "! Tu mensaje ha sido enviado con éxito.";
        exitoMensaje.hidden = false;
        formulario.reset();
        actualizarContador();
    });
}

// 5. Interacción propia: donaciones simuladas con porcentaje recaudado (proyecto.html)
// Cada clic en "Apoyar Caso" suma el valor elegido; el avance se guarda en el navegador.
function mostrarToast(texto) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(mostrarToast.temporizador);
    mostrarToast.temporizador = setTimeout(function () {
        toast.classList.remove("visible");
    }, 3000);
}

function formatoPesos(valor) {
    return "$" + valor.toLocaleString("es-CO");
}

const recaudado = {};   // respaldo en memoria por si localStorage no está disponible

function leerRecaudado(boton) {
    const caso = boton.dataset.caso;
    if (recaudado[caso] !== undefined) return recaudado[caso];

    let valor = parseInt(boton.dataset.inicial, 10) || 0;   // valor inicial de ejemplo
    try {
        const guardado = localStorage.getItem("hopepets-recaudado-" + caso);
        if (guardado !== null) valor = parseInt(guardado, 10) || 0;
    } catch (error) {}

    recaudado[caso] = valor;
    return valor;
}

function guardarRecaudado(caso, valor) {
    recaudado[caso] = valor;
    try {
        localStorage.setItem("hopepets-recaudado-" + caso, valor);
    } catch (error) {}
}

function porcentajeDe(total, meta) {
    return Math.floor((total / meta) * 100);   // floor: no muestra 100% antes de llegar a la meta
}

function pintarRecaudado(boton) {
    const meta = parseInt(boton.dataset.meta, 10);
    const total = Math.min(leerRecaudado(boton), meta);
    const porcentaje = porcentajeDe(total, meta);
    const tarjeta = boton.closest(".contenido-tarjeta");

    tarjeta.querySelector(".apoyo-recaudado").textContent = formatoPesos(total);
    tarjeta.querySelector(".apoyo-pct").textContent = porcentaje + "% recaudado";
    tarjeta.querySelector(".barra-relleno").style.width = porcentaje + "%";
    tarjeta.querySelector(".barra").setAttribute("aria-valuenow", porcentaje);

    const cumplida = total >= meta;
    boton.disabled = cumplida;
    tarjeta.querySelector(".select-monto").disabled = cumplida;
    boton.textContent = cumplida ? "¡Meta cumplida! 🎉" : "Apoyar Caso";
}

const botonesApoyar = document.querySelectorAll(".btn-apoyar");

botonesApoyar.forEach(function (boton) {
    pintarRecaudado(boton);

    boton.addEventListener("click", function () {
        const caso = boton.dataset.caso;
        const meta = parseInt(boton.dataset.meta, 10);
        const select = boton.closest(".contenido-tarjeta").querySelector(".select-monto");
        const donacion = parseInt(select.value, 10);
        const nuevoTotal = Math.min(leerRecaudado(boton) + donacion, meta);

        guardarRecaudado(caso, nuevoTotal);
        pintarRecaudado(boton);

        if (nuevoTotal >= meta) {
            alert("🎉 ¡Meta alcanzada! Gracias a todos los que donaron para " + caso + ".");
        } else {
            mostrarToast("¡Gracias por donar " + formatoPesos(donacion) + " a " + caso + "! Ya se recaudó el " +
                porcentajeDe(nuevoTotal, meta) + "%.");
        }
    });
});

const btnReiniciar = document.getElementById("btnReiniciar");
if (btnReiniciar) {
    btnReiniciar.addEventListener("click", function () {
        botonesApoyar.forEach(function (boton) {
            guardarRecaudado(boton.dataset.caso, parseInt(boton.dataset.inicial, 10) || 0);
            pintarRecaudado(boton);
        });
        mostrarToast("Contadores reiniciados.");
    });
}

// 6. Efecto de escritura en el perfil (index.html)
const rolAnimado = document.getElementById("rolAnimado");
if (rolAnimado) {
    const frases = ["programadora en formación", "creativa y curiosa", "amante de los animales", "soñando con ayudar a las mascotas"];
    const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frase = 0, letras = 0, borrando = false;

    function escribir() {
        const actual = frases[frase];
        rolAnimado.textContent = actual.slice(0, letras);

        if (!borrando && letras < actual.length) {
            letras++;
            setTimeout(escribir, 110);
        } else if (!borrando) {
            borrando = true;
            setTimeout(escribir, 1400);
        } else if (letras > 0) {
            letras--;
            setTimeout(escribir, 60);
        } else {
            borrando = false;
            frase = (frase + 1) % frases.length;
            setTimeout(escribir, 300);
        }
    }

    if (!sinAnimacion) escribir();
}

// 7. Las secciones aparecen suavemente al hacer scroll
if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".card-seccion").forEach(function (seccion) {
        seccion.classList.add("reveal");
        observador.observe(seccion);
    });
}