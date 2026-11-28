# yalech · sitios web

Muestrario de sitios web de Yael González (@yalech). Cada ejemplo es un negocio ficticio con varias páginas, vive en
su carpeta y se puede probar en vivo: agendar, comprar, reservar o inscribirse por WhatsApp.

| Carpeta | Negocio | Páginas | Lo especial |
| --- | --- | --- | --- |
| `dental/` | Consultorio dental | Inicio, tratamientos, agenda | Agenda que respeta días y turnos, llega con el tratamiento elegido |
| `veterinaria/` | Veterinaria | Inicio, vacunas, citas | Calendario de vacunas según la fecha de nacimiento (perro o gato), «Abierto ahora», urgencias |
| `barberia/` | Barbería | Inicio, servicios, agenda | Elige servicio, barbero, día y hora libre |
| `yoga/` | Estudio de yoga | Inicio, horario | Horario de la semana con lugares por clase, lista de espera, primera clase gratis |
| `restaurante/` | Restaurante | Inicio, menú, visítanos | Abierto ahora, reservas que respetan el horario |
| `vivero/` | Tienda en línea | Inicio, tienda, cuidados | Carrito que se guarda, filtros, envío gratis, pedido por WhatsApp |
| `cabanas/` | Hospedaje | Inicio, cabañas, reservar | Calcula noches, fines de semana y mascota; cuida el cupo de cada cabaña |
| `academia/` | Escuela de inglés | Inicio, grupos, examen | Examen de ubicación de 10 preguntas con nivel A1–C1, grupos con lugares disponibles |

Los tres nuevos (veterinaria, yoga y academia) están ilustrados con CSS y SVG: no usan fotos.

## Cómo funciona

- Cada sitio tiene sus páginas `.html`, un `styles.css` y un `site.js`. El encabezado y el pie se repiten en cada
  página: si cambias uno, cambia los demás.
- **Datos del negocio al inicio de `site.js`:** WhatsApp, horario, vacunas, grupos, clases de la semana, etc.
- **WhatsApp:** los formularios arman el mensaje y abren WhatsApp; no se envía nada a un servidor. En los ejemplos
  el número es `520000000000`.
- Lo que escribe el visitante se muestra como texto, nunca como HTML.

## Al usar un ejemplo con un cliente real

1. Copia la carpeta del ejemplo a un repositorio nuevo, junto con lo que use de `assets/`.
2. Borra lo que solo sirve para mostrar el ejemplo (la barra y el script traen un comentario que lo indica):
   - el bloque `<div class="mu-barra">` del inicio del `<body>` (barra «Ejemplo ficticio · ← Más ejemplos · Quiero uno así»);
   - la línea `<script src="…/assets/muestra.js…">` y el `<link>` a `muestra.css` del `<head>`. Sin ellas, los botones de
     WhatsApp, llamar y correo vuelven a abrir de verdad.
3. Deja `assets/errores.js`: hace que los errores de los formularios se vean igual en todos lados (el campo se marca en
   rojo, el cursor salta a él, los lectores de pantalla anuncian el aviso y se quita en cuanto la persona lo corrige).
4. Cambia los datos del negocio: WhatsApp, teléfonos, correo, dirección y horario. Las etiquetas `og:` de la vista previa
   necesitan la dirección completa del sitio (`https://…/assets/og.jpg`).
5. Si agregas íconos o tipografías, corre los programas de `assets/iconos/` y `assets/fuentes/` (abajo).

## Archivos compartidos (iguales en los 7 repos)

- `assets/muestra.js` y `muestra.css` — modo muestra: en vez de abrir WhatsApp, llamar o mandar correo al número de prueba,
  enseña lo que pasaría de verdad y ofrece «Quiero uno así». También acomoda los encabezados fijos debajo de la barra de
  ejemplo. Se configura en la etiqueta `<script>` de cada ejemplo (`data-servicio`, `data-ejemplo`, `data-para`).
- `assets/errores.js` — mismo comportamiento de errores en todos los formularios (ver el paso 3).
- `assets/iconos/actualizar.py` — recorta Font Awesome a los íconos que usa este repo (de unos 400 KB a menos de 15 KB).
  Córrelo si agregas un ícono y sale un cuadrito vacío; las instrucciones están al inicio del archivo.
- `assets/fuentes/actualizar.py` — sirve las tipografías de Google desde este mismo sitio y precarga las del texto, para que
  la página no brinque al cambiar de letra. Córrelo si una página nueva trae un `<link>` a `fonts.googleapis.com`.

## Otros archivos

- `index.html` y `estilos.css` — portada con los ejemplos (mismo estilo que el catálogo principal).
- `assets/cotizar.js` / `cotizar.css` — cotizador en 1 minuto. `assets/carrusel.js` / `carrusel.css` — señales del carrusel.
- `assets/motion.js` — animaciones al bajar (respeta «reducir movimiento»).
- `assets/plantillas/` — capturas que usa la portada (si cambias un sitio, vuelve a tomar la suya).
- `<carpeta>/assets/og.jpg` — imagen al compartir el enlace. Al publicar, pon su URL completa en `og:image`.
- `404.html` — página de error. `_headers` — encabezados de seguridad (Netlify o Cloudflare Pages).

El catálogo completo y el link en bio están en el repositorio `yalech-web-link-in-bio`. Los enlaces hacia allá son
relativos (`../yalech-web-link-in-bio/`): funcionan igual en tu compu y en GitHub Pages mientras todos los repos vivan bajo
la misma dirección. Solo `404.html` usa la dirección completa, porque se muestra desde cualquier ruta.

Hecho a mano: HTML, CSS y JavaScript, sin herramientas de compilación. Para verlo, sirve la carpeta con
`python3 -m http.server` y abre `http://localhost:8000`.
