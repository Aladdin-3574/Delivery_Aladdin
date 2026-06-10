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
 
  coleccion.docChanges().forEach((registro) => {
    if (registro.type === "added"){
      mostrarPlatillo(registro.doc.data(), registro.doc.id, registro.doc.data().precio);
    }
    if (registro.type === "modified") {
      actualizarPlatillo(registro.doc.data(), registro.doc.id, registro.doc.data().precio);
    }
    if (registro.type === "removed") {
      eliminarPlatillo(registro.doc.id);
    }
  });
})


