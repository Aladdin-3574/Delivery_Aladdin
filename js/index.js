/**
 * Archivo: index.js
 * Descripción: Inicialización de Materialize y renderizado de la UI.
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
function mostrarPlatillo(platillo, id) {
  /*
   * SOLUCIÓN ESTRUCTURAL:
   * Se ha añadido un div 'recipe-image-placeholder' con un icono de Material Icons.
   * Como tu CSS declara 'grid-template-areas: "image details delete";', si no pasamos 
   * un elemento para 'image', el grid de CSS colapsa y desalinea los textos.
   * Cuando agregues imágenes reales, simplemente cambia este div por un tag <img>.
   */
  const htmlTemplate = `
    <div class='card-panel recipe white row' id='${id}'>
      
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
  function actualizarPlatillo(platillo, id) {
    const card = document.querySelector(`.card-panel[data-id="${id}"]`);
    if (card) {
      card.querySelector('.recipe-title').textContent = platillo.nombre || platillo.title;
      card.querySelector('.recipe-ingredients').textContent = `#Ingredientes: ${platillo.ingredientes}`;
      card.querySelector('.recipe-price').textContent = `#Precio: $${platillo.precio}`;
    }
  }

  function eliminarPlatillo(id) {
    const card = document.querySelector(`.card-panel[data-id="${id}"]`);
    if (card) {
      card.remove();
    }
  }  
  
  /* * OPTIMIZACIÓN DE RENDIMIENTO:
   * Mantenemos insertAdjacentHTML. Reemplazar innerHTML previene el "re-pintado" 
   * total del DOM, fundamental cuando debugeas flujos de datos en tiempo real.
   */
  if (container) {
    container.insertAdjacentHTML('beforeend', htmlTemplate);
  }
}