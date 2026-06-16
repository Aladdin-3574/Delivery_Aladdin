/**
 * @fileoverview Lógica de base de datos para UberEatsCUDEC.
 * Implementa CRUD (Create, Read, Delete) con Firebase Modular API (v10+).
 */

// 1. Importamos doc y deleteDoc para la funcionalidad de borrado
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Importamos explícitamente las funciones de la UI desde index.js
import { mostrarPlatillo, actualizarPlatillo, eliminarPlatillo } from "./index.js";

/**
 * ============================================================================
 * 1. LECTURA DE DATOS EN TIEMPO REAL (Read)
 * ============================================================================
 */
onSnapshot(collection(window.db, "platillos"), (coleccion) => {
  coleccion.docChanges().forEach((registro) => {
    const data = registro.doc.data();
    const id = registro.doc.id;

    if (registro.type === "added") {
      mostrarPlatillo(data, id); // Removemos el 3er argumento redundante
    }
    if (registro.type === "modified") {
      actualizarPlatillo(data, id);
    }
    if (registro.type === "removed") {
      eliminarPlatillo(id);
    }
  });
});

/**
 * ============================================================================
 * 2. ESCRITURA DE DATOS (Create)
 * ============================================================================
 */
const formularioAgregar = document.querySelector(".add-recipe");

// Scope correctamente aislado en el nivel superior
formularioAgregar.addEventListener("submit", async (e) => {
  e.preventDefault();

  const platilloNuevo = {
    nombre: document.querySelector('#title').value,
    ingredientes: document.querySelector('#ingredients').value,
    precio: document.querySelector('#precio') ? Number(document.querySelector('#precio').value) : 0
  };

  try {
    await addDoc(collection(window.db, "platillos"), platilloNuevo);
    console.log("Platillo agregado exitosamente a Firestore");
    formularioAgregar.reset(); 
    
    const sideFormInstance = M.Sidenav.getInstance(document.querySelector('#side-form'));
    if (sideFormInstance) sideFormInstance.close();

  } catch (error) {
    console.error("Error al agregar el platillo: ", error);
    alert("Hubo un error al guardar el platillo. Revisa la consola.");
  }
});

/**
 * ============================================================================
 * 3. ELIMINACIÓN DE DATOS (Delete)
 * ============================================================================
 */
// Corregido: .recipes (con punto) para seleccionar por clase
const contenedorPlatillos = document.querySelector(".recipes");

// Implementación de Delegación de Eventos en el scope superior
contenedorPlatillos.addEventListener("click", async (e) => {
  // Evaluamos que el clic haya sido exactamente en el icono de borrar
  if (e.target.tagName === "I" && e.target.textContent === "delete_outline") {
    
    const id = e.target.getAttribute("data-id");
    
    if (id) {
      const confirmacion = confirm("¿Estás seguro de que deseas eliminar este platillo?");
      if (confirmacion) {
        try {
          // Uso de la API Modular v10+: doc() y deleteDoc()
          const documentoReferencia = doc(window.db, "platillos", id);
          await deleteDoc(documentoReferencia);
          
          console.log(`[EXITO] Platillo ${id} eliminado de la base de datos.`);
          // NOTA: NO llamamos a eliminarPlatillo(id) aquí. onSnapshot lo detectará y lo borrará del DOM.
        } catch (error) {
          console.error("Error al eliminar el platillo: ", error);
        }
      }
    } else {
      console.error("Error: No se encontró el data-id en el icono clickeado.");
    } 
  }
});