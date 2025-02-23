import { showAlert } from "../js/showAlert.js";
import { provinciasSVG } from "./mapas.js";

// URL de la API
const UrlApi = "https://resultados.mininterior.gob.ar/api";

// Constantes para tipo de elección y recuento
const tipoEleccion = 1; // 2 = Generales
const tipoRecuento = 1; // Recuento definitivo

// Atajo para querySelector
const $ = (selector) => document.querySelector(selector);

// Elementos del DOM
const periodosSelect = $("#selectPeriodo");
const cargoSelect = $("#selectCargo");
const distritoSelect = $("#selectDistrito");
const seccionSelect = $("#selectSeccion");
const btnFiltrar = $("#btnFiltrar");
const inputSeccionProvincial = $("#hdSeccionProvincial");
const btnInformes = $("#btnAddInforme");
const tituloPrincipal = $("#tituloPrincipal");
const parrafoPrincipal = $("#parrafoPrincipal");
const tituloProvincia = $("#titulo-provincia");
const mapaProvincia = $("#provincia");
const logoMesas = $("#logoMesas");
const logoParticipacion = $("#logoParticipacion");
const logoElectores = $("#logoElectores");
const resumenVotos = $("#resumenVotos");

const mesasComputadas = $("#mesasComputadas");
const electores = $("#electores");
const porcentaje = $("#porcentaje");

// Objeto para almacenar los datos seleccionados
const seleccion = {
  anio: "",
  cargo: "",
  distrito: "",
  seccion: "",
};

let distritoTitulo = "";
let cargoTitulo = "";
let seccionTitulo = "";

let datosGenerales = null; // Almacena los datos que retorna la API
let resultados; // Almacena los datos que retorna la API

btnFiltrar.disabled = true;
btnInformes.disabled = true;

//Funcion al presionar el filtrar

const actualizarTitulos = () => {
  let eleccion = tipoEleccion === 1 ? "Paso" : "Generales";
  let titulo = `Elecciones ${seleccion.anio} | ${eleccion}`;
  let parrafo = `${seleccion.anio} > ${eleccion} > ${cargoTitulo} > ${distritoTitulo} > ${seccionTitulo}`;

  tituloPrincipal.textContent = `${titulo}`;
  parrafoPrincipal.textContent = `${parrafo}`;
};

const cambiarMapa = () => {
  const provincia = provinciasSVG.find(
    (item) => item.provincia.toUpperCase() === distritoTitulo.toUpperCase()
  );

  if (provincia) {
    tituloProvincia.textContent = provincia.provincia;

    mapaProvincia.innerHTML = provincia.svg;
  } else {
    svgContainer.innerHTML = "<p>La imagen no se pudo cargar</p>";
  }
};

function removerHijos(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

const filtrarResultados = async () => {
  let seccionProvincialId = 0;
  let circuitoId = "";
  let mesaId = "";
  const url = `https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${periodosSelect.value}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${cargoSelect.value}&distritoId=${distritoSelect.value}&seccionProvincialId=${seccionProvincialId}&seccionId=${seccionSelect.value}&circuitoId=${circuitoId}&mesaId=${mesaId}`;
  console.log("url", url);

  const result = await fetch(url);

  if (!result.ok) {
    showAlert(
      "error",
      `Error al conectar al servidor. Código: ${result.status}`
    );
  } else {
    resultados = await result.json();
    console.log(resultados);

    let porcentajeNotNull = resultados.estadoRecuento.participacionPorcentaje
      ? resultados.estadoRecuento.participacionPorcentaje
      : 0;

    mesasComputadas.textContent = `${resultados.estadoRecuento.mesasTotalizadas}`;
    electores.textContent = `${resultados.estadoRecuento.cantidadElectores}`;
    porcentaje.textContent = `${porcentajeNotNull}%`;
    porcentaje.hidden = false;
    electores.hidden = false;
    mesasComputadas.hidden = false;
    actualizarTitulos();
    cambiarMapa();
    completarResumenVotos();
    completarResumenAgrupaciones();
  }
};

// Cargar períodos dinámicamente
const cargarPeriodos = async () => {
  try {
    const response = await fetch(`${UrlApi}/menu/periodos`);
    const periodos = await response.json();

    console.log(periodos);

    periodos.forEach((anio) => {
      const option = document.createElement("option");
      option.value = anio;
      option.textContent = anio;
      periodosSelect.appendChild(option);
    });
  } catch (err) {
    alert("no");
  }
};

// Cargar cargos dinámicamente
const cargarCargos = async () => {
  try {
    seleccion.anio = periodosSelect.value;
    const response = await fetch(`${UrlApi}/menu?año=${seleccion.anio}`);
    datosGenerales = await response.json();

    const elecciones = datosGenerales.filter(
      (e) => e.IdEleccion === tipoEleccion
    );
    cargoSelect.innerHTML = "<option value='' disabled selected>Cargo</option>";

    elecciones.forEach((eleccion) => {
      eleccion.Cargos.forEach((cargo) => {
        const option = document.createElement("option");
        option.value = cargo.IdCargo;
        option.textContent = cargo.Cargo;
        cargoSelect.appendChild(option);
      });
    });
  } catch (err) {
    showAlert("error", "Error al cargar los cargos.");
  }
};

const cargarDistrito = () => {
  cargoTitulo = cargoSelect.options[cargoSelect.selectedIndex].textContent;
  console.log("Datos generales:", datosGenerales);

  if (!datosGenerales) {
    console.error("Error: datosGenerales no tiene datos.");
    return;
  }

  limpiarSelect(distritoSelect);
  limpiarSelect(seccionSelect);

  seleccion.cargo = cargoSelect.value;
  console.log("Cargo seleccionado:", seleccion.cargo);

  datosGenerales.forEach((eleccion) => {
    if (eleccion.IdEleccion == tipoEleccion) {
      eleccion.Cargos.forEach((cargo) => {
        if (cargo.IdCargo === seleccion.cargo) {
          cargo.Distritos.forEach((distrito) => {
            const option = document.createElement("option");
            option.value = distrito.IdDistrito;
            option.textContent = distrito.Distrito;
            distritoSelect.appendChild(option);
          });
        }
      });
    }
  });
};

const limpiarSelect = (selectElement) => {
  selectElement.innerHTML =
    "<option value='' disabled selected>Seleccione</option>";
};

const completarResumenVotos = () => {
  const agrupaciones = resultados.valoresTotalizadosPositivos.sort(
    (a, b) => b.votosPorcentaje - a.votosPorcentaje
  );

  let cont = 0;

  while (resumenVotos.firstChild) {
    resumenVotos.removeChild(resumenVotos.firstChild);
  }

  agrupaciones.forEach((agrupacion) => {
    if (cont < 7) {
      const divBarra = document.createElement("div");
      divBarra.classList.add("bar");
      divBarra.style.width = `${agrupacion.votosPorcentaje}%`;
      const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
      divBarra.style.background = randomColor;
      divBarra.dataset.name = agrupacion.nombreAgrupacion;
      divBarra.title = `${agrupacion.nombreAgrupacion} ${agrupacion.votosPorcentaje}%`;
      cont++;
      resumenVotos.style.display = "block";
      resumenVotos.appendChild(divBarra);
    }
  });
};

const completarResumenAgrupaciones = () => {
  const agrupaciones = resultados.valoresTotalizadosPositivos;
  const tablaAgrupaciones = document.querySelector(".grid-1 tbody");

  while (tablaAgrupaciones.firstChild) {
    tablaAgrupaciones.removeChild(tablaAgrupaciones.firstChild);
  }

  agrupaciones.forEach((agrupacion) => {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    if (agrupacion.subTitulo) {
      const subTitulo = document.createElement("h3");
      subTitulo.classList.add("sub-titulo");
      subTitulo.textContent = agrupacion.subTitulo;
      celda.appendChild(subTitulo);
    }

    const divText = document.createElement("div");
    divText.classList.add("text");

    const partido = document.createElement("p");
    partido.classList.add("partido-politico");
    partido.textContent = agrupacion.nombreAgrupacion;

    const votos = document.createElement("p");
    const porcentajeVotos = `${agrupacion.votosPorcentaje}%`;
    votos.innerHTML = `${porcentajeVotos}<br />${agrupacion.votos} VOTOS`;

    divText.appendChild(partido);
    divText.appendChild(votos);

    celda.appendChild(divText);

    // Barra de progreso
    const divProgress = document.createElement("div");
    divProgress.classList.add("progress");
    divProgress.style.background = "#f4f4f4";

    const divProgressBar = document.createElement("div");
    divProgressBar.classList.add("progress-bar");
    divProgressBar.style.width = `${agrupacion.votosPorcentaje}%`;
    const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)})`;
    divProgressBar.style.background = randomColor;
    divProgressBar.innerHTML = `<span class="progress-bar-text">${agrupacion.votosPorcentaje}%</span>`;

    divProgress.appendChild(divProgressBar);
    celda.appendChild(divProgress);

    fila.appendChild(celda);
    tablaAgrupaciones.appendChild(fila);
  });
};

const cargarSeccion = () => {
  distritoTitulo =
    distritoSelect.options[distritoSelect.selectedIndex].textContent;
  seleccion.distrito = distritoSelect.value;

  seccionSelect.innerHTML =
    "<option value='' disabled selected>Seleccione</option>";

  datosGenerales.forEach((eleccion) => {
    if (eleccion.IdEleccion == tipoEleccion) {
      eleccion.Cargos.forEach((cargo) => {
        if (cargo.IdCargo == seleccion.cargo) {
          cargo.Distritos.forEach((distrito) => {
            if (distrito.IdDistrito == seleccion.distrito) {
              distrito.SeccionesProvinciales.forEach((seccionProvincial) => {
                inputSeccionProvincial.id =
                  seccionProvincial.IDSeccionProvincial;
                seccionProvincial.Secciones.forEach((seccion) => {
                  const option = document.createElement("option");
                  option.value = seccion.IdSeccion;
                  option.textContent = seccion.Seccion;
                  seccionSelect.appendChild(option);
                });
              });
            }
          });
        }
      });
    }
  });
};
function agregarInforme() {
  const informe = {
    anio: periodosSelect.value,
    tipoRecuento: tipoRecuento,
    tipoEleccion: tipoEleccion,
    categoriaId: cargoSelect.value,
    distritoId: distritoSelect.value,
    seccionProvincialId: 0,
    seccionId: seccionSelect.value,
    circuitoId: "",
    mesaId: "",
  };

  const nuevoInforme = `${informe.anio}|${informe.tipoRecuento}|${
    informe.tipoEleccion
  }|${informe.categoriaId}|${informe.distritoId}|${
    informe.seccionProvincialId
  }|${informe.seccionId}|${informe.circuitoId}|${
    informe.mesaId
  }|${distritoTitulo}|${
    tipoEleccion === 1 ? "Paso" : "Generales"
  }|${cargoTitulo}|${seccionTitulo}`;
  let informes = localStorage.getItem("INFORMES")
    ? JSON.parse(localStorage.getItem("INFORMES"))
    : [];

  if (informes.includes(nuevoInforme)) {
    showAlert("warning", "El informe ya se encuentra añadido.");
  } else {
    informes.push(nuevoInforme);
    localStorage.setItem("INFORMES", JSON.stringify(informes));
    showAlert("success", "Informe agregado con éxito.");
  }
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  cargarPeriodos();
});

btnInformes.addEventListener("click", agregarInforme);
periodosSelect.addEventListener("change", cargarCargos);
cargoSelect.addEventListener("change", cargarDistrito);
distritoSelect.addEventListener("change", cargarSeccion);
seccionSelect.addEventListener("change", () => {
  seccionTitulo =
    seccionSelect.options[seccionSelect.selectedIndex].textContent;
  btnFiltrar.disabled = false;
});

btnFiltrar.addEventListener("click", () => {
  seleccion.seccion = seccionSelect.value;
  console.log(seleccion);
  const camposIncompletos = Object.keys(seleccion).some(
    (key) => !seleccion[key]
  );

  if (camposIncompletos) {
    showAlert("warning", "Debe completar todos los campos.");
    return;
  }

  showAlert("success", "Consulta realizada correctamente.");
  console.log("seleccion", seleccion);
  btnInformes.disabled = false;
  filtrarResultados();
});
