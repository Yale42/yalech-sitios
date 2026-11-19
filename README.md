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

## Otros archivos

- `index.html` y `estilos.css` — portada con los ejemplos (mismo estilo que el catálogo principal).
- `assets/cotizar.js` / `cotizar.css` — cotizador en 1 minuto. `assets/carrusel.js` / `carrusel.css` — señales del carrusel.
- `assets/motion.js` — animaciones al bajar (respeta «reducir movimiento»).
- `assets/plantillas/` — capturas que usa la portada (si cambias un sitio, vuelve a tomar la suya).
- `<carpeta>/assets/og.jpg` — imagen al compartir el enlace. Al publicar, pon su URL completa en `og:image`.
- `404.html` — página de error. `_headers` — encabezados de seguridad (Netlify o Cloudflare Pages).

El catálogo completo y el link en bio están en el repositorio `yalech-web-link-in-bio`. Los enlaces hacia allá usan
`https://yale42.github.io/yalech-web-link-in-bio/`: cámbialos por tu dominio cuando lo tengas.

Hecho a mano: HTML, CSS y JavaScript, sin herramientas de compilación. Para verlo, sirve la carpeta con
`python3 -m http.server` y abre `http://localhost:8000`.
