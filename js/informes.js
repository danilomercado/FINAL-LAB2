import { showAlert } from "../js/showAlert.js";
import { provinciasSVG } from "./mapas.js";
const logoMesa =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-airtable">' +
  '<path stroke="none" d="M0 0h24v24H0z" fill="none" />' +
  '<path d="M3 10v8l7 -3v-2.6z" />' +
  '<path d="M3 6l9 3l9 -3l-9 -3z" />' +
  '<path d="M14 12.3v8.7l7 -3v-8z" />' +
  "</svg>";

const logoElectores =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-friends">' +
  '<path stroke="none" d="M0 0h24v24H0z" fill="none" />' +
  '<path d="M7 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />' +
  '<path d="M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5"/>' +
  '<path d="M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />' +
  '<path d="M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4"/>' +
  "</svg>";

const logoPorcentaje =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-circle-percentage">' +
  '<path stroke="none" d="M0 0h24v24H0z" fill="none" />' +
  '<path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -20 0l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72m3 12.12a1 1 0 0 0 -1 1v.015a1 1 0 0 0 2 0v-.015a1 1 0 0 0 -1 -1m.707 -5.752a1 1 0 0 0 -1.414 0l-6 6a1 1 0 0 0 1.414 1.414l6 -6a1 1 0 0 0 0 -1.414m-6.707 -.263a1 1 0 0 0 -1 1v.015a1 1 0 1 0 2 0v-.015a1 1 0 0 0 -1 -1" />' +
  "</svg>";

// Traigo los colores del css
const rootStyles = getComputedStyle(document.documentElement);
const morado = rootStyles.getPropertyValue("--morado").trim();
const magenta = rootStyles.getPropertyValue("--magenta").trim();
const celeste = rootStyles.getPropertyValue("--celeste").trim();
const gris = rootStyles.getPropertyValue("--borde-Grilla").trim();

let localData = localStorage.getItem("INFORMES");
let data = [];

if (localData) {
  try {
    data = JSON.parse(localData);
  } catch (error) {
    data = localData.split(",");
  }
} else {
  showAlert("error", "Para ver los informes tenés que generar uno!");
}

let processedData = data.map((item) => item.replace(/\"/g, "").split("|"));
console.log("LocalStorage Data:", processedData);

const cambiarMapa = (nombreProvincia) => {
  const provincia = provinciasSVG.find(
    (item) => item.provincia.toUpperCase() === nombreProvincia.toUpperCase()
  );
  if (provincia) {
    return provincia.svg;
  } else {
    return "<p>La imagen no se pudo cargar</p>";
  }
};

const buscarData = async () => {
  processedData.forEach(async (data1) => {
    const info = {
      anio: data1[0],
      recuento: data1[1],
      eleccion: data1[2],
      cargo: data1[3],
      distrito: data1[4],
      seccionProv: data1[5],
      seccion: data1[6],
      circuito: data1[7],
      mesa: data1[8],
      nombreProvincia: data1[9],
      nombreTipoElecciones: data1[10],
      nombreCargo: data1[11],
      nombreLocalidad: data1[12],
    };

    const table = document.querySelector("table");

    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    tr.style.borderBottom = `1px solid ${gris}`;

    const tdProvincia = document.createElement("td");
    const divProvincia = document.createElement("div");
    divProvincia.id = "provincia";
    divProvincia.innerHTML = cambiarMapa(info.nombreProvincia);
    tdProvincia.appendChild(divProvincia);
    tr.appendChild(tdProvincia);

    const tdElecciones = document.createElement("td");

    const pTitulo = document.createElement("p");
    pTitulo.className = "texto-elecciones-chico";
    pTitulo.id = "tituloEleccion";
    pTitulo.textContent = `Elecciones ${info.anio} | ${info.nombreTipoElecciones}`;
    tdElecciones.appendChild(pTitulo);

    const pSubtitulo = document.createElement("p");
    pSubtitulo.className = "texto-path-chico";
    pSubtitulo.id = "subtituloEleccion";
    pSubtitulo.textContent = `${info.anio} > ${info.nombreTipoElecciones} > ${info.nombreCargo} > ${info.nombreProvincia} > ${info.nombreLocalidad}`;
    tdElecciones.appendChild(pSubtitulo);

    tr.appendChild(tdElecciones);

    try {
      const response = await fetch(
        `https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${info.anio}&tipoRecuento=${info.recuento}&tipoEleccion=${info.eleccion}&categoriaId=${info.cargo}&distritoId=${info.distrito}&seccionProvincialId=${info.seccionProv}&seccionId=${info.seccion}&circuitoId=${info.circuito}&mesaId=${info.mesa}`
      );

      if (!response.ok) {
        showAlert("error", "No se procesó la solicitud con éxito");
        return;
      }

      const resultadosFetch = await response.json();
      const estadoDeRecuento = resultadosFetch.estadoRecuento;

      const tdCards = document.createElement("td");
      const cardsContainer = document.createElement("div");
      cardsContainer.id = "cards-container";
      cardsContainer.className = "cards-container";

      cardsContainer.appendChild(
        createCard(
          "Mesas computadas",
          estadoDeRecuento.mesasTotalizadas,
          celeste,
          logoMesa
        )
      );
      cardsContainer.appendChild(
        createCard(
          "Electores",
          estadoDeRecuento.cantidadElectores,
          magenta,
          logoElectores
        )
      );
      cardsContainer.appendChild(
        createCard(
          "Participación sobre estructurado",
          `${estadoDeRecuento.participacionPorcentaje}%`,
          morado,
          logoPorcentaje
        )
      );

      tdCards.appendChild(cardsContainer);
      tr.appendChild(tdCards);

      const agrupaciones = resultadosFetch.valoresTotalizadosPositivos.sort(
        (a, b) => b.votosPorcentaje - a.votosPorcentaje
      );
      let count = 0;
      const tdDpa = document.createElement("td");

      agrupaciones.forEach((agrupacion, index) => {
        //Lo limito a 3 para que quede mas esteico, si no esta la reestrticcion muestra todo
        if (count < 3) {
          count++;
          tdDpa.appendChild(
            createDpa(
              agrupacion.nombreAgrupacion,
              `${agrupacion.votosPorcentaje}%`,
              `${agrupacion.votos} Votos`
            )
          );
        }
      });

      tr.appendChild(tdDpa);

      tbody.appendChild(tr);
      table.appendChild(tbody);
    } catch (error) {
      showAlert("error", "Hubo un problema al obtener los resultados");
      console.error(error);
    }
  });
};

function createCard(title, value, color, logo) {
  const card = document.createElement("div");
  card.className = "container-secundario-der-card1";
  card.style.background = color;
  const logoContainer = document.createElement("div");
  logoContainer.className = "contianer-card1-logo";
  const logoText = document.createElement("p");
  logoText.style.color = "white";
  logoText.innerHTML = logo;
  logoContainer.appendChild(logoText);

  const infoContainer = document.createElement("div");
  infoContainer.className = "container-card1-info";
  const h6 = document.createElement("h6");
  h6.textContent = title;
  const p = document.createElement("p");
  p.style.color = "white";
  p.textContent = value;
  infoContainer.appendChild(h6);
  infoContainer.appendChild(p);

  card.appendChild(logoContainer);
  card.appendChild(infoContainer);

  return card;
}

function createDpa(name, percentage, votes) {
  const containerDpa = document.createElement("div");

  containerDpa.className = "container-dpa";
  containerDpa.style.display = "flex";

  const containerIzq = document.createElement("div");
  containerIzq.className = "container-dpa-izq";
  const h6 = document.createElement("h6");
  h6.textContent = name;
  h6.style.color = "#666";
  h6.style.fontWeight = "444";
  containerIzq.appendChild(h6);

  const containerDer = document.createElement("div");
  containerDer.className = "container-dpa-der";
  containerDer.style.display = "flex";
  containerDer.style.flexDirection = "column";

  const pPercentage = document.createElement("p");
  pPercentage.textContent = percentage;
  const pVotes = document.createElement("p");
  pVotes.textContent = votes;

  containerDer.appendChild(pPercentage);
  containerDer.appendChild(pVotes);

  containerDpa.appendChild(containerIzq);
  containerDpa.appendChild(containerDer);

  return containerDpa;
}

buscarData();
