# FastFood

**Tipo de aplicación:** Progressive Web App (PWA)

Plataforma de pedidos de comida rápida estilo delivery con geolocalización, sincronización en tiempo real y validación por código QR.

**Alumno:** Liam Alain Millán Martinez
**Materia:** Programación Avanzada II
**Carrera:** Ingeniería en Sistemas Computacionales
**Grupo:** ISC 182
**Institución:** Universidad Multicultural CUDEC

**Repositorio:** [GitHub - Delivery_Aladdin](https://github.com/Aladdin-3574/Delivery_Aladdin)  
**Sitio publicado:** [FastFood Live](https://aladdin-3574.github.io/Delivery_Aladdin/)

## 2. Descripción del proyecto
FastFood es una aplicación web progresiva (PWA) enfocada en el servicio de entrega de comida a domicilio (modelo similar a Uber Eats). La plataforma resuelve los problemas de conectividad intermitente y descentralización en el flujo de ventas, permitiendo a los usuarios (clientes finales) explorar un menú de platillos sincronizado en tiempo real, seleccionar sus preferencias y generar un pedido. Su propósito principal es digitalizar y automatizar el ciclo de compra-entrega, integrando la detección de ubicación del usuario (geolocalización), captura de imágenes nativas del dispositivo para el registro de inventario, y la generación de un código QR de validación que resume la orden, facilitando la logística de los repartidores. 

## 3. Objetivos

### Objetivo general
Desarrollar una aplicación web progresiva (PWA) para la gestión integral de pedidos de comida a domicilio, que integre geolocalización, captura nativa de imágenes, validación de órdenes mediante códigos QR y sincronización de datos en la nube en tiempo real para operar de manera resiliente.

### Objetivos específicos
- Implementar la arquitectura PWA (Service Workers y Web App Manifest) para asegurar instalabilidad en múltiples plataformas y disponibilidad offline parcial.
- Integrar la API de Media Devices para capturar fotografías de los productos directamente desde la cámara del dispositivo.
- Orquestar un mapa interactivo para la captura de coordenadas de entrega utilizando la API de Geolocalización y resolución inversa (Nominatim).
- Persistir y sincronizar el estado global del catálogo y los pedidos utilizando el SDK modular de Firebase (Cloud Firestore).

## 4. Características principales
- **Inicio:** Exploración del catálogo de productos con sincronización reactiva en tiempo real.
- **Registrar platillo:** Formulario con soporte para captura fotográfica en Base64 utilizando la cámara web/móvil del dispositivo.
- **Realizar pedido:** Flujo de compra escalonado con cálculo automático de totales, selección de cantidades y geolocalización de entregas renderizada sobre mapas interactivos de OpenStreetMap.
- **Validación de entrega:** Generación automatizada de códigos QR con el payload (resumen) de la orden al confirmar el pedido.
- **Acerca / Contacto:** Vistas informativas estáticas navegables desde el menú lateral.
- Instalabilidad nativa en dispositivos móviles y de escritorio.

## 5. Tecnologías utilizadas
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+ Modules).
- **Framework UI:** Materialize CSS v1.0.0.
- **Backend / Base de Datos:** Firebase Cloud Firestore (Modular SDK v10+).
- **APIs Web Nativas:** Media Devices API (Webcam), Geolocation API.
- **Librerías Externas:** Leaflet.js / OpenStreetMap, Nominatim (Geocodificación inversa), QR Server API.
- **Arquitectura PWA:** Service Workers, Web API Cache, App Manifest.

## 6. Estructura del proyecto
```text
UBEREATSCUDEC/
├── .vscode/
│   └── settings.json
├── css/
│   ├── materialize.min.css
│   └── styles.css
├── icons/
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-48x48.png
│   ├── icon-64x64.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-180x180.png
│   ├── icon-192x192-maskable.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512-maskable.png
│   └── icon-512x512.png
├── img/
│   ├── about.png
│   ├── contacto.png
│   ├── desktop.ini
│   ├── dish.png
│   ├── inicio.png
│   ├── logo.jpg
│   ├── pedidos_1.png
│   ├── pedidos_3.png
│   └── pedidos_4.png
├── js/
│   ├── db.js
│   ├── index.js
│   └── materialize.min.js
├── pages/
│   ├── about.html
│   ├── contact.html
│   └── pedidos.html
├── index.html
├── manifest.json
├── README.md
└── sw.js
```

## 7. Evidencias / capturas de pantalla
- **Inicio:**  
  `![Captura Inicio](./img/inicio.png)`
- **Registrar platillo:**  
  `![Captura Registrar](./img/dish.png)`
- **Realizar pedido (al terminar de hacer el pedido):**  
  `![Captura Pedido Paso 3](./img/pedidos_3.png)`  
  `![Captura Pedido Finalizado](./img/pedidos_4.png)`
- **Acerca:**  
  `![Captura Acerca](./img/about.png)`
- **Contacto:**  
  `![Captura Contacto](./img/contacto.png)`

## 8. Base de datos
**Motor utilizado:** Firebase Cloud Firestore (NoSQL orientada a documentos).

**Colecciones principales:**
- `platillos`: Almacena el catálogo de productos. Atributos: `nombre`, `ingredientes`, `precio`, `imagen` (cadena Base64).
- `pedidos`: Almacena las transacciones generadas. Atributos: `cliente`, `direccion` (geocodificada), `platilloId`, `nombrePlatillo`, `cantidad`, `totalFacturado`, `fecha`, `estado`.

## 9. Licencia

**Licencia Académica**

Este proyecto fue desarrollado con fines académicos como parte de la carrera Ingeniería en Sistemas Computacionales, para la materia Programación Avanzada II, del grupo ISC 182 en la Universidad Multicultural CUDEC.
