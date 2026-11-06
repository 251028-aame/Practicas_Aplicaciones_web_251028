
console.log("¡JavaScript conectado correctamente!");

const formularioRegistro = document.getElementById("formularioRegistro");
const secciones = Array.from(formularioRegistro.querySelectorAll(".form-section"));
const mensajeEstado = document.getElementById("mensajeEstado");
let seccionActual = 0;

// Ocultar todas las secciones excepto la activa
function mostrarSeccion(indice) {
    secciones.forEach((seccion, posicion) => {
        seccion.hidden = posicion !== indice;
    });
    seccionActual = indice;
}

// Limpiar remarques rojos de una sección
function limpiarErroresSeccion(seccion) {
    const campos = seccion.querySelectorAll("input, select, textarea");
    campos.forEach((campo) => campo.classList.remove("campo-invalido"));
    if (mensajeEstado) {
        mensajeEstado.style.display = "none";
        mensajeEstado.className = "";
    }
}

// Controlar botón Siguiente con mensajes y bordes rojos
const botonesSiguiente = formularioRegistro.querySelectorAll(".btn-siguiente");
botonesSiguiente.forEach((boton) => {
    boton.addEventListener("click", function () {
        const seccion = secciones[seccionActual];
        const campos = seccion.querySelectorAll("input, select, textarea");
        let hayError = false;

        // Limpiar errores previos
        limpiarErroresSeccion(seccion);

        // Revisar cada campo de la sección actual
        for (const campo of campos) {
            if (!campo.checkValidity()) {
                campo.classList.add("campo-invalido"); // Poner borde rojo al input
                hayError = true;
            }
        }

        if (hayError) {
            // Mostrar el mensaje superior en rojo
            if (mensajeEstado) {
                mensajeEstado.style.display = "block";
                mensajeEstado.className = "mensaje-error";
                mensajeEstado.textContent = "Este campo es obligatorio. Completa los datos antes de continuar.";
            }

            // Enfocar el primer campo con error y lanzar el globo nativo
            const primerInvalido = seccion.querySelector(".campo-invalido");
            if (primerInvalido) primerInvalido.reportValidity();
            return;
        }

        // Si no hay errores, avanzar de sección
        if (seccionActual < secciones.length - 1) {
            mostrarSeccion(seccionActual + 1);
        }
    });
});

// Quitar la marca roja en cuanto el usuario empiece a escribir/corregir
formularioRegistro.addEventListener("input", function (e) {
    if (e.target.checkValidity()) {
        e.target.classList.remove("campo-invalido");
    }
});

// Activar/Desactivar botón Enviar con Checkbox
const validado = document.getElementById("validado");
const botonEnviar = formularioRegistro.querySelector('input[type="submit"]');

if (validado && botonEnviar) {
    validado.addEventListener("change", function () {
        botonEnviar.disabled = !validado.checked;
    });
}

// Cálculo de Edad
const fechaNacimiento = document.getElementById("fechaNacimiento");
const resultadoEdad = document.getElementById("resultadoEdad");

if (fechaNacimiento && resultadoEdad) {
    fechaNacimiento.addEventListener("change", function () {
        if (fechaNacimiento.value === "") {
            resultadoEdad.textContent = "Selecciona una fecha para calcular tu edad.";
            resultadoEdad.style.color = "#e67e22";
            return;
        }

        const [anio, mes, dia] = fechaNacimiento.value.split("-").map(Number);
        const nacimiento = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (nacimiento > hoy) {
            resultadoEdad.textContent = "Error: no se puede calcular la edad con los datos elegidos. La fecha es futura.";
            resultadoEdad.style.color = "#dc3545";
            return;
        }

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
        const diferenciaDias = hoy.getDate() - nacimiento.getDate();

        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && diferenciaDias < 0)) {
            edad--;
        }

        if (edad >= 18) {
            resultadoEdad.textContent = `Eres mayor de edad. Tienes ${edad} años.`;
            resultadoEdad.style.color = "#28a745";
        } else {
            resultadoEdad.textContent = `Eres menor de edad. Tienes ${edad} años.`;
            resultadoEdad.style.color = "#dc3545";
        }
    });
}

// Evitar error 405 de Live Server y mostrar envío exitoso simulado
formularioRegistro.addEventListener("submit", function (e) {
    e.preventDefault();

    if (mensajeEstado) {
        mensajeEstado.style.display = "block";
        mensajeEstado.style.backgroundColor = "#fff3cd";
        mensajeEstado.style.color = "#856404";
        mensajeEstado.style.border = "1px solid #ffeeba";
        mensajeEstado.textContent = "¡Registro revisado! Envío simulado: los datos no se almacenan.";
    }
});

// Reset del formulario
formularioRegistro.addEventListener("reset", function () {
    secciones.forEach((sec) => limpiarErroresSeccion(sec));
    mostrarSeccion(0);
    if (botonEnviar) botonEnviar.disabled = true;
    if (resultadoEdad) {
        resultadoEdad.textContent = "Selecciona una fecha para calcular tu edad.";
        resultadoEdad.style.color = "#e67e22";
    }
});

// Inicialización
if (secciones.length > 0) mostrarSeccion(0);
if (botonEnviar) botonEnviar.disabled = true;