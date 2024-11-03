import { Docente } from "./Docente.js";
import { Estudiante } from "./Estudiante.js";

let db;

// Conectar con IndexedDB y preparar la base de datos
const openDB = indexedDB.open("AcademiaDB", 1);

openDB.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("personas", { keyPath: "id", autoIncrement: true });
};

openDB.onsuccess = (event) => {
  db = event.target.result;
};

// Crear una cookie segura siguiendo recomendaciones de OWASP
function setSecureCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}${expires}; path=/; Secure; SameSite=Strict`;
}

// Configuración inicial de la cookie de sesión
setSecureCookie("sessionToken", "usuarioLogueado", 7);

// Actualizar campos según tipo de persona
document.getElementById("tipoPersona").addEventListener("change", (event) => {
  const tipo = event.target.value;
  document.getElementById("extraFieldDocente").style.display =
    tipo === "docente" ? "block" : "none";
  document.getElementById("extraFieldEstudiante").style.display =
    tipo === "estudiante" ? "block" : "none";
});

// Guardar datos parciales en IndexedDB antes de cerrar o recargar la página
window.addEventListener("beforeunload", () => {
  const tipo = document.getElementById("tipoPersona").value;
  const nombre = document.getElementById("nombre").value;
  const edad = document.getElementById("edad").value;
  const especialidad = document.getElementById("especialidad").value;
  const curso = document.getElementById("curso").value;

  const data = { tipo, nombre, edad, especialidad, curso, incompleto: true };

  const transaction = db.transaction(["personas"], "readwrite");
  const store = transaction.objectStore("personas");
  store.put(data, "incompleteForm");
});

// Al cargar la página, revisar si hay datos incompletos
window.addEventListener("load", () => {
  const transaction = db.transaction(["personas"], "readonly");
  const store = transaction.objectStore("personas");
  const request = store.get("incompleteForm");

  request.onsuccess = (event) => {
    const data = event.target.result;
    if (data && data.incompleto) {
      document.getElementById("tipoPersona").value = data.tipo;
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("edad").value = data.edad || "";

      if (data.tipo === "docente") {
        document.getElementById("especialidad").value = data.especialidad || "";
        document.getElementById("extraFieldDocente").style.display = "block";
      } else if (data.tipo === "estudiante") {
        document.getElementById("curso").value = data.curso || "";
        document.getElementById("extraFieldEstudiante").style.display = "block";
      }
    }
  };
});

// Funciones CRUD
function addPersona() {
  const tipo = document.getElementById("tipoPersona").value;
  const nombre = document.getElementById("nombre").value;
  const edad = parseInt(document.getElementById("edad").value);
  const especialidad = document.getElementById("especialidad").value;
  const curso = document.getElementById("curso").value;

  let persona;
  if (tipo === "docente") {
    persona = new Docente(nombre, edad, especialidad);
  } else {
    persona = new Estudiante(nombre, edad, curso);
  }

  const transaction = db.transaction(["personas"], "readwrite");
  const store = transaction.objectStore("personas");
  const request = store.add(persona);

  request.onsuccess = () => {
    console.log("Persona agregada");
    fetchPersonas();

    // Eliminar datos incompletos tras completar el registro
    store.delete("incompleteForm");
  };

  request.onerror = () => {
    console.error("Error al agregar persona");
  };
}

function updatePersona() {
  const id = parseInt(prompt("Ingrese el ID de la persona a actualizar:"));
  const tipo = document.getElementById("tipoPersona").value;
  const nombre = document.getElementById("nombre").value;
  const edad = parseInt(document.getElementById("edad").value);
  const especialidad = document.getElementById("especialidad").value;
  const curso = document.getElementById("curso").value;

  let persona;
  if (tipo === "docente") {
    persona = new Docente(nombre, edad, especialidad);
  } else {
    persona = new Estudiante(nombre, edad, curso);
  }
  persona.id = id;

  const transaction = db.transaction(["personas"], "readwrite");
  const store = transaction.objectStore("personas");
  const request = store.put(persona);

  request.onsuccess = () => {
    console.log("Persona actualizada");
    fetchPersonas();
  };

  request.onerror = () => {
    console.error("Error al actualizar persona");
  };
}

function deletePersona() {
  const id = parseInt(prompt("Ingrese el ID de la persona a eliminar:"));

  const transaction = db.transaction(["personas"], "readwrite");
  const store = transaction.objectStore("personas");
  const request = store.delete(id);

  request.onsuccess = () => {
    console.log("Persona eliminada");
    fetchPersonas();
  };

  request.onerror = () => {
    console.error("Error al eliminar persona");
  };
}

function fetchPersonas() {
  const transaction = db.transaction(["personas"], "readonly");
  const store = transaction.objectStore("personas");
  const request = store.openCursor();
  const list = document.getElementById("personaList");
  list.innerHTML = ""; // Limpiar la lista antes de mostrar los elementos

  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const persona = cursor.value;
      
      // Crear el elemento de lista con las clases de Bootstrap
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      
      // Crear el contenido de texto
      let content = `ID: ${persona.id}, Nombre: ${persona.nombre}, Edad: ${persona.edad}, Tipo: ${persona.tipo}`;
      if (persona.tipo === "docente") {
        content += `, Especialidad: ${persona.especialidad}`;
      } else {
        content += `, Curso: ${persona.curso}`;
      }
      li.textContent = content;
      
      // Agregar el elemento a la lista
      list.appendChild(li);
      cursor.continue();
    }
  };
}


// Asignar funciones al objeto global
window.addPersona = addPersona;
window.updatePersona = updatePersona;
window.deletePersona = deletePersona;
window.fetchPersonas = fetchPersonas;
