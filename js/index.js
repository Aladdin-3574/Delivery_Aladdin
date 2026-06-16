/**
 * Archivo: index.js
 * Descripción: Inicialización de Materialize y manipulación del DOM.
 * Refactorizado para exportar sus funciones de manera modular.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicialización de menús laterales
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right'});
  
  // Inicialización del formulario lateral
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, {edge: 'left'});
});

/**
 * Función para inyectar un platillo en el DOM dinámicamente.
 * @param {Object} platillo - Datos provenientes de Firestore.
 * @param {string} id - Identificador del documento.
 */
// CRÍTICO: Agregamos 'export' para que db.js pueda consumir esta función
export function mostrarPlatillo(platillo, id) {
  const htmlTemplate = `
    <div class='card-panel recipe black row' id='${id}' data-id="${id}">
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
  
  if (container) {
    container.insertAdjacentHTML('beforeend', htmlTemplate);
  }
}

/**
 * Actualiza los nodos de texto de un platillo existente.
 */
export function actualizarPlatillo(platillo, id) {
  // Buscamos la tarjeta usando el atributo data-id en lugar del ID directo para ser más precisos
  const card = document.querySelector(`.recipe[data-id="${id}"]`);
  if (card) {
    card.querySelector('.recipe-title').textContent = platillo.nombre || platillo.title;
    card.querySelector('.recipe-ingredients').textContent = `#Ingredientes: ${platillo.ingredientes}`;
    card.querySelector('.recipe-price').textContent = `#Precio: $${platillo.precio}`;
  }
}

/**
 * Remueve el elemento del árbol DOM.
 * @param {string} id - ID del documento en Firebase.
 */
// Renombrado de borrarPlatillo a eliminarPlatillo para hacer match con db.js
export const eliminarPlatillo = (id) => {
  const platillo = document.querySelector(`.recipe[data-id="${id}"]`);
  if (platillo) {
    platillo.remove();
  }
}