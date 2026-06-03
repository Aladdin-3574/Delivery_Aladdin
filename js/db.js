/**
 * @fileoverview Script minimalista de prueba de conexión a Firestore.
 * Réplica de la instrucción académica adaptada a Firebase Modular API.
 */

import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/**
 * Establece un listener en tiempo real sobre la colección "platillos".
 * Esta es la versión corregida de: db.collection("platillos").onSnapshot(...)
 * * @param {import('@firebase/firestore').CollectionReference} collection() - Referencia a la colección.
 * @param {Function} callback - Ejecuta el console.log con los cambios del documento.
 */
onSnapshot(collection(window.db, "platillos"), (snapshot) => {
  console.log(snapshot.docChanges());
});