/**
 * @fileoverview Script de prueba de conexión a Firestore.
 * Réplica de la iteración de colección completa (Snapshot) del profesor, 
 * adaptada a Firebase Modular API (v10+).
 */

import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/**
 * Establece un listener en tiempo real sobre la colección "platillos".
 * Cada vez que hay un cambio en la base de datos, Firestore envía una 'coleccion' 
 * (snapshot) con todos los documentos actuales que cumplen la consulta.
 * * @param {import('@firebase/firestore').CollectionReference} collection() - Referencia a la colección en la DB.
 * @param {Function} callback - Iteración completa sobre el snapshot.
 */
onSnapshot(collection(window.db, "platillos"), (coleccion) => {
  // Limpiamos la consola en cada actualización para no amontonar logs si hay múltiples cambios
  console.clear();
  console.log("Estado actual de la colección 'platillos':");
  
  /**
   * Iteramos sobre cada documento (registro) dentro del snapshot actual.
   * El método .data() extrae el objeto JSON puro (nombre, ingredientes).
   */
  coleccion.forEach((registro) => {
    mostrarPlatillo(registro.data(), registro.id);
  });
});


