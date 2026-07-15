/**
 * @fileoverview Lógica de base de datos distribuidos y orquestación reactiva de la UI.
 * Gestiona el ciclo CRUD utilizando Firebase Modular SDK v10+.
 * Arquitectura orientada a eventos para mutaciones del DOM.
 */

import { 
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getFirestore,
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

import { 
  mostrarPlatillo, 
  actualizarPlatillo, 
  eliminarPlatillo, 
  inicializarSelectorPedidos,
  inicializarMapaConUbicacion
} from "./index.js";

/** 
 * Configuración de entorno de Firebase.
 * @constant {Object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyC3zhixRvn3XictflC58KNHLT2K3yWb0d4",
  authDomain: "fastfood-6a333.firebaseapp.com",
  projectId: "fastfood-6a333",
  storageBucket: "fastfood-6a333.firebasestorage.app",
  messagingSenderId: "443865980845",
  appId: "1:443865980845:web:24afdf0408d9ab41064b24"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * ============================================================================
 * 1. LECTURA Y ORQUESTACIÓN EN TIEMPO REAL (Suscripción fluida)
 * ============================================================================
 */
const inicializarSuscripcionPlatillos = () => {
  onSnapshot(collection(db, "platillos"), (coleccion) => {
    const contenedorPlatillos = document.querySelector('.recipes');
    const selectorPlatillos = document.querySelector('#dish-selector');

    // Mapeo dinámico para selector en pedidos.html
    if (selectorPlatillos) {
      const catalogo = coleccion.docs.map(documento => ({ 
        id: documento.id, 
        ...documento.data() 
      }));
      inicializarSelectorPedidos(catalogo);
    }

    // Actualización del DOM basada en deltas para index.html
    if (contenedorPlatillos) {
      coleccion.docChanges().forEach((registro) => {
        const data = registro.doc.data();
        const id = registro.doc.id;

        switch (registro.type) {
          case "added":
            mostrarPlatillo(data, id);
            break;
          case "modified":
            actualizarPlatillo(data, id);
            break;
          case "removed":
            eliminarPlatillo(id);
            break;
        }
      });
    }
  }, (error) => {
    console.error("Error en la suscripción de Firestore: ", error);
  });
};

/**
 * ============================================================================
 * 2. CREACIÓN Y ELIMINACIÓN DE CATÁLOGO (index.html)
 * ============================================================================
 */
const inicializarGestionCatalogo = () => {
  const formularioAgregar = document.querySelector(".add-recipe");
  const contenedorPlatillos = document.querySelector(".recipes");

  if (formularioAgregar) {
    formularioAgregar.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const inputBase64 = document.querySelector('#imagen-base64');
      
      const platilloNuevo = {
        nombre: document.querySelector('#title').value.trim(),
        ingredientes: document.querySelector('#ingredients').value.trim(),
        precio: Number(document.querySelector('#precio').value) || 0,
       
        imagen: inputBase64 ? inputBase64.value : null
      };

      // Validación para prevenir campos vacíos

      if (!platilloNuevo.nombre || !platilloNuevo.ingredientes|| !platilloNuevo.precio) {
        M.toast({ html: 'Por favor, completa nombre, ingredientes y precio.' });
        return;
      }

      try {
        await addDoc(collection(db, "platillos"), platilloNuevo);
        formularioAgregar.reset(); 
        
       
        if (inputBase64) inputBase64.value = "";
        const fotoPreview = document.getElementById('foto');
        if (fotoPreview) {
          fotoPreview.src = "";
          fotoPreview.style.display = "none";
        }

        const sideFormNode = document.querySelector('#side-form');
        if (sideFormNode) {
          M.Sidenav.getInstance(sideFormNode)?.close();
        }
      } catch (error) {
        console.error("Error de persistencia al añadir platillo: ", error);
      }
    });
  }

  // Delegación de eventos para optimización de memoria (Event Bubbling)
  if (contenedorPlatillos) {
    contenedorPlatillos.addEventListener("click", async (e) => {
      if (e.target.tagName === "I" && e.target.textContent.trim() === "delete_outline") {
        const id = e.target.getAttribute("data-id");
        if (id) {
          try {
            await deleteDoc(doc(db, "platillos", id));
          } catch (error) {
            console.error("Error de mutación en borrado: ", error);
          }
        }
      }
    });
  }
};

/**
 * ============================================================================
 * 3. PROCESAMIENTO DE PEDIDOS (pedidos.html)
 * ============================================================================
 */
const inicializarGestionPedidos = () => {
  const formularioPedido = document.querySelector(".add-order");
  
  if (!formularioPedido) return;

  const modalResumen = document.querySelector('#summary-modal') || document.querySelector('#Sumary-modal');
  if (modalResumen) M.Modal.init(modalResumen);

  const selectPlatillo = document.querySelector('#dish-selector');
  const inputCantidad = document.querySelector('#cantidad');
  const displayResumen = document.querySelector('#total-display');

  /**
   * Recalcula el monto en tiempo real tras interacción del usuario.
   * @returns {void}
   */
  const actualizarTotalReactivo = () => {
    if (!selectPlatillo || !inputCantidad) return;
    
    const optionSeleccionado = selectPlatillo.options[selectPlatillo.selectedIndex];
    const precio = optionSeleccionado ? parseFloat(optionSeleccionado.getAttribute('data-precio')) || 0 : 0;
    const cantidad = parseInt(inputCantidad.value, 10) || 1;

    if (displayResumen) {
      displayResumen.textContent = `Total: $${(precio * cantidad).toFixed(2)}`;
    }
  };

  selectPlatillo?.addEventListener('change', actualizarTotalReactivo);
  inputCantidad?.addEventListener('input', actualizarTotalReactivo);

  // Inicialización de la API del mapa
  inicializarMapaConUbicacion('btnUbicacion', 'mapa', 'cliente-direccion');

  formularioPedido.addEventListener('submit', async (e) => {
    e.preventDefault();

    const optionSeleccionado = selectPlatillo.options[selectPlatillo.selectedIndex];
    const precioUnitario = parseFloat(optionSeleccionado.getAttribute('data-precio')) || 0;
    const nombrePlatillo = optionSeleccionado.getAttribute('data-nombre') || "Platillo Desconocido";
    const cantidadFinal = parseInt(inputCantidad.value, 10) || 1;

    /** @type {Object} */
    const nuevoPedido = {
      cliente: document.querySelector('#cliente-nombre').value.trim(),
      direccion: document.querySelector('#cliente-direccion').value.trim(),
      platilloId: selectPlatillo.value,
      nombrePlatillo: nombrePlatillo,
      cantidad: cantidadFinal,
      totalFacturado: precioUnitario * cantidadFinal,
      fecha: new Date().toISOString(),
      estado: "Pendiente"
    };

    try {
      // 1. Escritura asíncrona en Firestore
      await addDoc(collection(db, "pedidos"), nuevoPedido);
      
      // 2. Inyección de datos en el DOM para el ticket
      const mapeoResumen = {
        '#res-nombre': nuevoPedido.cliente,
        '#res-platillo': nuevoPedido.nombrePlatillo,
        '#res-cantidad': nuevoPedido.cantidad,
        '#res-direccion': nuevoPedido.direccion,
        '#res-total': nuevoPedido.totalFacturado.toFixed(2)
      };

      Object.entries(mapeoResumen).forEach(([selector, valor]) => {
        const nodo = document.querySelector(selector);
        if (nodo) nodo.textContent = valor;
      });

      // 3. Despliegue de modal confirmatorio
      if (modalResumen) {
        M.Modal.getInstance(modalResumen)?.open();
      }
      
      // 4. Limpieza del estado local
      formularioPedido.reset();
      if (selectPlatillo) M.FormSelect.init(selectPlatillo);
      actualizarTotalReactivo(); 
      
    } catch (error) {
      console.error("Transacción fallida en la generación del pedido:", error);
      alert("Error crítico en la red. Intenta de nuevo.");
    }
  });
};

// Bootstrap de la aplicación modular
inicializarSuscripcionPlatillos();
inicializarGestionCatalogo();
inicializarGestionPedidos();