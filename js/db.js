/**
 * @fileoverview Lógica de base de datos y orquestación.
 */

import { collection, onSnapshot, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// CRÍTICO: Asegúrate de importar inicializarSelectorPedidos
import { mostrarPlatillo, actualizarPlatillo, eliminarPlatillo, inicializarSelectorPedidos } from "./index.js";

/**
 * ============================================================================
 * 1. LECTURA Y ORQUESTACIÓN EN TIEMPO REAL
 * ============================================================================
 */
onSnapshot(collection(window.db, "platillos"), (coleccion) => {
  // Verificamos en qué página estamos buscando los contenedores
  const contenedorPlatillos = document.querySelector('.recipes');
  const selectorPlatillos = document.querySelector('#dish-selector');

  // Si estamos en pedidos.html, extraemos el catálogo completo y llenamos el select
  if (selectorPlatillos) {
    const catalogo = coleccion.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });
    inicializarSelectorPedidos(catalogo);
  }

  // Si estamos en index.html, procesamos los cambios quirúrgicos para pintar las tarjetas
  if (contenedorPlatillos) {
    coleccion.docChanges().forEach((registro) => {
      const data = registro.doc.data();
      const id = registro.doc.id;

      if (registro.type === "added") mostrarPlatillo(data, id);
      if (registro.type === "modified") actualizarPlatillo(data, id);
      if (registro.type === "removed") eliminarPlatillo(id);
    });
  }
});

/**
 * ============================================================================
 * 2. CREACIÓN DE CATÁLOGO (Solo se ejecuta en index.html)
 * ============================================================================
 */
const formularioAgregar = document.querySelector(".add-recipe");
// BLINDAJE: Solo agregamos el listener si el formulario existe en la página actual
if (formularioAgregar) {
  formularioAgregar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const platilloNuevo = {
      nombre: document.querySelector('#title').value,
      ingredientes: document.querySelector('#ingredients').value,
      precio: document.querySelector('#precio') ? Number(document.querySelector('#precio').value) : 0
    };

    try {
      await addDoc(collection(window.db, "platillos"), platilloNuevo);
      formularioAgregar.reset(); 
      const sideFormInstance = M.Sidenav.getInstance(document.querySelector('#side-form'));
      if (sideFormInstance) sideFormInstance.close();
    } catch (error) {
      console.error("Error al agregar el platillo: ", error);
    }
  });
}

/**
 * ============================================================================
 * 3. ELIMINACIÓN DE DATOS (Solo se ejecuta en index.html)
 * ============================================================================
 */
const contenedorPlatillos = document.querySelector(".recipes");
if (contenedorPlatillos) {
  contenedorPlatillos.addEventListener("click", async (e) => {
    if (e.target.tagName === "I" && e.target.textContent === "delete_outline") {
      const id = e.target.getAttribute("data-id");
      if (id) {
        await deleteDoc(doc(window.db, "platillos", id));
      }
    }
  });
}

/**
 * ============================================================================
 * 4. PROCESAMIENTO DE PEDIDOS (Solo se ejecuta en pedidos.html)
 * ============================================================================
 */
const formularioPedido = document.querySelector(".add-order");
// BLINDAJE: Solo agregamos el listener si estamos en pedidos.html
if (formularioPedido) {
  formularioPedido.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Construimos el objeto del pedido
    const nuevoPedido = {
      cliente: document.querySelector('#cliente-nombre').value,
      direccion: document.querySelector('#cliente-direccion').value,
      platilloId: document.querySelector('#dish-selector').value,
      cantidad: Number(document.querySelector('#cantidad').value),
      fecha: new Date().toISOString(), // Guarda la fecha exacta del servidor
      estado: "Pendiente"
    };

    try {
      // Guardamos en una NUEVA colección llamada "pedidos"
      await addDoc(collection(window.db, "pedidos"), nuevoPedido);
      console.log("Pedido generado exitosamente");
      alert("¡Tu pedido ha sido recibido y está en proceso!");
      
      // Reseteamos el formulario
      formularioPedido.reset();
      
      // Reinicializamos el select de Materialize para que regrese al placeholder
      M.FormSelect.init(document.querySelector('#dish-selector'));
      
    } catch (error) {
      console.error("Error al generar pedido:", error);
      alert("Hubo un error al procesar tu pedido.");
    }
  });
}