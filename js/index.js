/**
 * @fileoverview index.js - Módulo de interfaz y utilidades.
 * Gestiona la manipulación reactiva del DOM, inicialización de componentes de Materialize,
 * orquestación del mapa de Leaflet y control periférico estricto (cámara).
 */

let mapaInstancia = null;
let marcadorActual = null;

/**
 * ============================================================================
 * 1. CONTROL PERIFÉRICO (WEBCAM - MEDIA DEVICES API)
 * ============================================================================
 * Se mueve al principio para que sus funciones de limpieza (apagarCamara)
 * estén disponibles en el ámbito léxico cuando Materialize inicialice el DOM.
 */
let streaming = false;
const width = 320;
let height = 0;
let mediaStream = null;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const foto = document.getElementById('foto');
const btnIniciarCamara = document.getElementById('btnIniciarCamara');
const btnFoto = document.getElementById('btnFoto');
const camaraContainer = document.getElementById('camara');

/**
 * Detiene los tracks de video, libera el hardware de la cámara y resetea el estado de la UI.
 * @returns {void}
 */
const apagarCamara = () => {
  if (mediaStream) {
    // Apaga el hardware deteniendo cada pista (track) de manera explícita
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null; // Liberación de la referencia para el Garbage Collector
  }
  
  streaming = false; // CRÍTICO: Resetear la bandera de estado del flujo

  if (camaraContainer && btnIniciarCamara) {
    camaraContainer.style.display = 'none';
    btnIniciarCamara.style.display = 'inline-block';
    btnIniciarCamara.innerHTML = '<i class="material-icons left">camera_alt</i> Activar Cámara';
  }
};

const iniciarCamara = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("La API de cámara no está soportada en tu navegador actual.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" },
      audio: false 
    });
    
    mediaStream = stream;
    if (video) video.srcObject = stream;
    
    if (camaraContainer && btnIniciarCamara) {
      camaraContainer.style.display = 'block';
      btnIniciarCamara.style.display = 'none';
    }
    
    if (video) video.play();
  } catch (err) {
    console.error("Error al acceder a la cámara: ", err);
    alert("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
  }
};

const tomarFoto = () => {
  if (!streaming || !canvas || !video || !foto) return;

  const context = canvas.getContext('2d');
  
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    
    context.drawImage(video, 0, 0, width, height);
    
    const dataUrl = canvas.toDataURL('image/png');
    
    foto.setAttribute('src', dataUrl);
    foto.style.display = 'block';
    
    // Auto-apagado tras la captura exitosa
    apagarCamara();
  }
};

if (btnIniciarCamara && btnFoto && video) {
  btnIniciarCamara.addEventListener('click', iniciarCamara);
  
  btnFoto.addEventListener('click', (e) => {
    e.preventDefault();
    tomarFoto();
  });

  video.addEventListener('canplay', (e) => {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);
      if (isNaN(height)) height = width / (4/3);
      
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      
      streaming = true;
    }
  }, false);
}

/**
 * ============================================================================
 * 2. INICIALIZACIÓN DE MATERIALIZE (CICLO DE VIDA DOM)
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de menús de navegación regulares
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, { edge: 'right' });
  
  // Inicialización del formulario lateral con inyección de lógica de seguridad
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, { 
    edge: 'left',
    /**
     * Hook de Materialize que se dispara en cuanto la animación de cierre comienza.
     * Actúa como un destructor (teardown) para los procesos vinculados al menú.
     */
    onCloseStart: () => {
      // Si la cámara quedó encendida al cerrar el menú, se fuerza su apagado
      if (streaming || mediaStream) {
        apagarCamara();
      }
    }
  });
});


/**
 * ============================================================================
 * 3. POBLACIÓN DE SELECTORES DINÁMICOS
 * ============================================================================
 */
export const inicializarSelectorPedidos = (catalogoPlatillos) => {
  const selectElement = document.querySelector('#dish-selector');
  if (!selectElement) return;

  selectElement.innerHTML = '<option value="" data-precio="0" disabled selected>Elige tu platillo...</option>';
  const fragmento = document.createDocumentFragment();

  catalogoPlatillos.forEach(platillo => {
    const option = document.createElement('option');
    option.value = platillo.id;
    option.setAttribute('data-precio', platillo.precio);
    option.setAttribute('data-nombre', platillo.nombre);
    option.textContent = `${platillo.nombre} - $${platillo.precio}`;
    fragmento.appendChild(option);
  });

  selectElement.appendChild(fragmento);
  M.FormSelect.init(selectElement);
};

/**
 * ============================================================================
 * 4. MUTACIONES DEL DOM: CATÁLOGO DE PLATILLOS
 * ============================================================================
 */
export function mostrarPlatillo(platillo, id) {
  const htmlTemplate = `
    <div class='card-panel recipe black row' data-id="${id}">
      <div class="recipe-image-placeholder">
        <i class="material-icons">fastfood</i>
      </div>
      <div class='recipe-details'>
        <div class='recipe-title'>${platillo.nombre || platillo.title}</div>
        <div class='recipe-ingredients'>#Ingredientes: ${platillo.ingredientes}</div>
        <div class='recipe-price'>#Precio: $${platillo.precio}</div>
      </div>
      <div class='recipe-delete'>
        <i class='material-icons' data-id="${id}">delete_outline</i>
      </div>
    </div>
  `;

  const container = document.querySelector('.recipes');
  if (container) container.insertAdjacentHTML('beforeend', htmlTemplate);
}

export function actualizarPlatillo(platillo, id) {
  const card = document.querySelector(`.recipe[data-id="${id}"]`);
  if (card) {
    card.querySelector('.recipe-title').textContent = platillo.nombre || platillo.title;
    card.querySelector('.recipe-ingredients').textContent = `#Ingredientes: ${platillo.ingredientes}`;
    card.querySelector('.recipe-price').textContent = `#Precio: $${platillo.precio}`;
  }
}

export const eliminarPlatillo = (id) => {
  const platillo = document.querySelector(`.recipe[data-id="${id}"]`);
  if (platillo) platillo.remove();
};

/**
 * ============================================================================
 * 5. GEOLOCALIZACIÓN Y MAPA REUTILIZABLE
 * ============================================================================
 */
export const inicializarMapaConUbicacion = (idBoton, idContenedorMapa, idInputDireccion) => {
  const btnUbicacion = document.getElementById(idBoton);
  const mapaDiv = document.getElementById(idContenedorMapa);
  
  if (!btnUbicacion || !mapaDiv) return;

  const exito = async (posicion) => {
    const latitude = posicion.coords.latitude;
    const longitude = posicion.coords.longitude;

    if (idInputDireccion) {
      try {
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
          headers: { 'User-Agent': 'UberEatsCUDEC (App Interna)' }
        });
        
        if (!respuesta.ok) throw new Error("Fallo en la resolución HTTP de Nominatim");
        
        const data = await respuesta.json();
        const inputDireccion = document.getElementById(idInputDireccion);
        
        if (inputDireccion && data?.display_name) {
          inputDireccion.value = data.display_name;
          M.updateTextFields(); 
        }
      } catch (error) {
        console.error("Error en geocodificación inversa:", error);
      }
    }

    const contenedorPadre = mapaDiv.parentElement;
    if (contenedorPadre) {
      contenedorPadre.style.display = 'block';
    }

    if (!mapaInstancia) {
      mapaInstancia = L.map(idContenedorMapa).setView([latitude, longitude], 17);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapaInstancia);
    } else {
      mapaInstancia.setView([latitude, longitude], 17);
    }

    if (marcadorActual) mapaInstancia.removeLayer(marcadorActual);
    
    marcadorActual = L.marker([latitude, longitude]).addTo(mapaInstancia)
      .bindPopup('<b>¡Estás aquí!</b>')
      .openPopup();

    setTimeout(() => {
      mapaInstancia.invalidateSize();
    }, 200);
  };

  const error = (err) => {
    console.error("Error de hardware/permisos de GPS: ", err);
    alert("No se pudo obtener tu ubicación. Revisa los permisos del navegador.");
  };

  btnUbicacion.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(exito, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
};