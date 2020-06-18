let DB;

const form = document.querySelector("form"),
  nombreMascota = document.querySelector("#mascota"),
  nombreCliente = document.querySelector("#cliente"),
  telefono = document.querySelector("#telefono"),
  fecha = document.querySelector("#fecha"),
  hora = document.querySelector("#hora"),
  sintomas = document.querySelector("#sintomas"),
  citas = document.querySelector("#citas");
headingAdministra = document.querySelector("#administra");
document.addEventListener("DOMContentLoaded", () => {
  // CREAR LA BASE DE DATOS
  let crearDB = window.indexedDB.open("citas", 1);
  //SI HAY UN ERROR LO ENVIA A LA CONSOLA
  crearDB.onerror = function () {
    console.log("hubo un error");
  };
  // SI TODO ESTA BIEN MUESTRA EN LA CONSOLA, Y ASIGNA LA BASE DE DATOS
  crearDB.onsuccess = function () {
    console.log("todo listo");
    DB = crearDB.result;
    mostrarCitas();
  };

  //ME TODO SOLO CORRRE UNA VEZ ES IDEAL PARA EL SCHEMA DE LA BASE DE DATOS
  crearDB.onupgradeneeded = function (e) {
    let db = e.target.result;

    //SE DEFINE EL OBJETO QUE TOMA DOS PARAMETROS
    // INDICE DE LA BASE DE DATOS
    let objectSotre = db.createObjectStore("citas", {
      keyPath: "key",
      autoIncrement: true,
    });

    //Crear los indices y campos de la base de datos, createIndex: 3 parametros , nombre, keypath y opciones
    objectSotre.createIndex("mascota", "mascota", { unique: false });
    objectSotre.createIndex("cliente", "cliente", { unique: false });
    objectSotre.createIndex("telefono", "telefono", { unique: false });
    objectSotre.createIndex("fecha", "fecha", { unique: false });
    objectSotre.createIndex("hora", "hora", { unique: false });
    objectSotre.createIndex("sintomas", "sintomas", { unique: false });
  };
  //CUANDO EL FORMULARIO SE ENVIA
  form.addEventListener("submit", agregarDatos);

  function agregarDatos(e) {
    e.preventDefault();
    //CREA UN OBJETO CON LOS VALORES PARA LA CITA
    const nuevaCita = {
      mascota: nombreMascota.value,
      cliente: nombreCliente.value,
      telefono: telefono.value,
      fecha: fecha.value,
      hora: hora.value,
      sintomas: sintomas.value,
    };
    // en indexedDB se ultilizan las transaciones
    let transaction = DB.transaction(["citas"], "readwrite");
    let objectStore = transaction.objectStore("citas");
    let peticion = objectStore.add(nuevaCita);
    console.log(peticion);

    peticion.onsuccess = () => {
      form.reset();
    };
    transaction.oncomplete = () => {
      console.log("cita agregada");
      mostrarCitas();
    };
    transaction.onerror = () => {
      console.log("hubo un error");
    };
  }
  function mostrarCitas() {
    //Limpiar las citas anteriores
    while (citas.firstChild) {
      citas.removeChild(citas.firstChild);
    }
    // creamos un objectstore
    let objectStore = DB.transaction("citas").objectStore("citas");
    // esto retorna una peticion
    objectStore.openCursor().onsuccess = function (e) {
      //cursos se va a ubicar en el registro indicado para acceder a los datos

      let cursor = e.target.result;

      if (cursor) {
        let citaHMTL = document.createElement("div");
        citaHMTL.setAttribute("data-cita-id", cursor.value.key);
        citaHMTL.classList.add("list-group-item");
        citaHMTL.innerHTML = `<p class="font-weiht-bold"> Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
        <p class="font-weiht-bold"> Mascota: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
        <p class="font-weiht-bold"> Mascota: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
        <p class="font-weiht-bold"> Mascota: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
        <p class="font-weiht-bold"> Mascota: <span class="font-weight-normal">${cursor.value.hora}</span></p>
        <p class="font-weiht-bold"> Mascota: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>`;

        //BOTON BORRAR
        const botonBorrar = document.createElement("button");
        botonBorrar.classList.add("borrar", "btn", "btn-danger");
        botonBorrar.innerHTML = '<span aria-hidden="true">X</span> Borrar';
        botonBorrar.onclick = borrarCita;
        citaHMTL.appendChild(botonBorrar);
        //APEN EN EL PADRE
        citas.appendChild(citaHMTL);
        // TOMAR LOS PROXIMOS REGISTROS
        cursor.continue();
      } else {
        //CUNADO NO HAY REGISTROS
        if (!citas.firstChild) {
          headingAdministra.textContent = "Agrega citas para comenzar";
          let listado = document.createElement("p");
          listado.classList.add("text-center");
          listado.textContent = "No hay registros";
          citas.appendChild(listado);
        } else {
          headingAdministra.textContent = "Administras tus citas";
        }
      }
    };
  }
  function borrarCita(e) {
    let citaID = Number(e.target.parentElement.getAttribute("data-cita-id"));
    let transaction = DB.transaction(["citas"], "readwrite");
    let objectStore = transaction.objectStore("citas");
    let peticion = objectStore.delete(citaID);

    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);
      console.log("se elimino la cita con el ID:", citaID);
      if (!citas.firstChild) {
        headingAdministra.textContent = "Agrega citas para comenzar";
        let listado = document.createElement("p");
        listado.classList.add("text-center");
        listado.textContent = "No hay registros";
        citas.appendChild(listado);
      } else {
        headingAdministra.textContent = "Administras tus citas";
      }
    };
  }
});
