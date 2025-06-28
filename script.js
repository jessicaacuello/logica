const nombresPermitidos = ["ALDANA", "ELIANA", "JESSICA", "PRUEBA", "FEDERICO", "SOFIA", "MANUEL"];
const respuestasCorrectas = [2, 5, 2, 5, 3, 3, 2, 3, 6, 1, 3, 2, 6, 6, 4];
let respuestasJugador = [];
let nombreJugador = "";
let tiempoRestante = 30 * 60;
let intervalo;
let preguntaActual = 0;
let inicioTiempo;

function iniciarJuego() {
  const inputNombre = document.getElementById("nombre").value.trim().toUpperCase();
  const error = document.getElementById("errorNombre");

  if (!nombresPermitidos.includes(inputNombre)) {
    error.textContent = "Nombre no permitido. Intenta con uno válido.";
    return;
  }

  const yaJugado = localStorage.getItem(`jugador_${inputNombre}`);
  if (yaJugado === "finalizado") {
    error.textContent = "YA COMPLETASTE EL JUEGO ANTES. NO HAGAS TRAMPA, NO SEAS MANUEL";
    return;
  }

  error.textContent = "";
  nombreJugador = inputNombre;
  localStorage.setItem("nombreJugador", nombreJugador);
  localStorage.setItem("respuestasJugador", JSON.stringify([]));
  localStorage.setItem("inicioTiempo", Date.now().toString());
  localStorage.setItem(`jugador_${nombreJugador}`, "en_progreso");

  document.getElementById("inicio").classList.add("hidden");
  document.getElementById("juego").classList.remove("hidden");
  mostrarPregunta();
  inicioTiempo = Date.now();
  intervalo = setInterval(actualizarTemporizador, 1000);
}

function mostrarPregunta() {
  const container = document.getElementById("preguntaContainer");
  if (preguntaActual >= 15) {
    terminarJuego();
    return;
  }
  container.innerHTML = `
    <p>Pregunta ${preguntaActual + 1}:</p>
    <img src="img/pregunta${preguntaActual + 1}.png" alt="Pregunta ${preguntaActual + 1}">
    <div>
      ${[1, 2, 3, 4, 5, 6].map(n => `<label><input type="radio" name="respuesta" value="${n}"> ${n}</label>`).join("<br>")}
    </div>
  `;
}

function siguientePregunta() {
  const seleccion = document.querySelector('input[name="respuesta"]:checked');
  if (!seleccion) {
    alert("Seleccioná una opción.");
    return;
  }
  respuestasJugador.push(parseInt(seleccion.value));
  localStorage.setItem("respuestasJugador", JSON.stringify(respuestasJugador));
  preguntaActual++;
  mostrarPregunta();
}

function actualizarTemporizador() {
  tiempoRestante--;
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  document.getElementById("temporizador").textContent = `Tiempo restante: ${minutos}:${segundos.toString().padStart(2, "0")}`;
  if (tiempoRestante <= 0) {
    terminarJuego();
  }
}

function terminarJuego() {
  clearInterval(intervalo);
  document.getElementById("juego").classList.add("hidden");
  const finTiempo = Math.floor((Date.now() - inicioTiempo) / 1000);
  let correctas = respuestasJugador.filter((r, i) => r === respuestasCorrectas[i]).length;

  localStorage.setItem(`jugador_${nombreJugador}`, "finalizado");
  localStorage.removeItem("respuestasJugador");
  localStorage.removeItem("inicioTiempo");
  localStorage.removeItem("nombreJugador");

  let mensaje = "";

  if (correctas === 15) {
    mensaje = `¡${nombreJugador}, ¡EXCELENTE, RESPONDISTE TODAS BIEN! SIERVO SUPREMO 🔥`;
  } else if (correctas >= 12) {
    mensaje = `${correctas} RESPUESTAS CORRECTAS. ${nombreJugador}, REE BIEN, SE VE QUE ESTÁS UN PASO ARRIBA 😎 VEREMOS RESULTADOS AL FINAL`;
  } else if (correctas >= 9) {
    mensaje = `${correctas} RESPUESTAS CORRECTAS. ${nombreJugador}, BIEN EH! SIERVO A TENER EN CUENTA. CAPAZ GANAS EL JUEGO 👀`;
  } else if (correctas >= 7) {
    mensaje = `${correctas} RESPUESTAS CORRECTAS. ${nombreJugador}, TRANQUI, QUIZAS HAYA PREMIO CONSUELO 😬 O GANAS EL JUEGO. LA FE ES LO ULTIMO QUE SE PIERDE `;
  } else if (correctas >= 5) {
    mensaje = `${correctas} RESPUESTAS CORRECTAS. ${nombreJugador}, NO SOS UN DESASTRE TOTAL... PERO 😅 ESPEREMOS QUE A OTRO LE VAYA MAL`;
  } else {
    mensaje = `${correctas} RESPUESTAS CORRECTAS. ${nombreJugador}, ¿VINISTE A JUGAR O A HACER TURISMO? 💀`;
  }

  const nombresFemeninos = ["ALDANA", "ELIANA", "JESSICA", "PRUEBA", "SOFIA"];
  const esFemenino = nombresFemeninos.includes(nombreJugador);

  function adaptarGenero(texto, esFemenino) {
    if (esFemenino) {
      texto = texto
        .replace(/\bsiervo\b/gi, "SIERVA")
        .replace(/\bsupremo\b/gi, "SUPREMA")
        .replace(/\bdesapercibido\b/gi, "DESAPERCIBIDA");
    } else {
      texto = texto
        .replace(/\bsierva\b/gi, "SIERVO")
        .replace(/\bsuprema\b/gi, "SUPREMO")
        .replace(/\bdesapercibida\b/gi, "DESAPERCIBIDO");
    }
    return texto;
  }

  mensaje = adaptarGenero(mensaje, esFemenino);

  document.getElementById("resultado").classList.remove("hidden");
  document.getElementById("resultado").innerHTML = `<h2>${mensaje}</h2><p>Nombre: ${nombreJugador}<br>Tiempo: ${finTiempo}s</p>`;

  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLScwy35OwEB1bDtli4lDxfemKTjq1HQjc0W3X4eE4v7Z5PIMww/formResponse";
  const formData = new FormData();
  formData.append("entry.1945396543", nombreJugador);
  formData.append("entry.596207591", respuestasJugador.join(","));
  formData.append("entry.1321275396", correctas);
  formData.append("entry.1228944409", finTiempo);

  fetch(formUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}

document.getElementById("playerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  iniciarJuego();
});

window.addEventListener("beforeunload", function () {
  const nombre = localStorage.getItem("nombreJugador");
  const estado = localStorage.getItem(`jugador_${nombre}`);

  if (nombre && estado === "en_progreso") {
    const respuestas = JSON.parse(localStorage.getItem("respuestasJugador") || "[]");
    const tiempoInicio = parseInt(localStorage.getItem("inicioTiempo") || Date.now());
    const tiempoFinal = Math.floor((Date.now() - tiempoInicio) / 1000);
    const correctas = respuestas.filter((r, i) => r === respuestasCorrectas[i]).length;

    localStorage.setItem(`jugador_${nombre}`, "finalizado");

    const formData = new FormData();
    formData.append("entry.1945396543", nombre);
    formData.append("entry.596207591", respuestas.join(","));
    formData.append("entry.1321275396", correctas);
    formData.append("entry.1228944409", tiempoFinal);

    navigator.sendBeacon(
      "https://docs.google.com/forms/d/e/1FAIpQLScwy35OwEB1bDtli4lDxfemKTjq1HQjc0W3X4eE4v7Z5PIMww/formResponse",
      formData
    );

    localStorage.removeItem("respuestasJugador");
    localStorage.removeItem("inicioTiempo");
    localStorage.removeItem("nombreJugador");
  }
});
