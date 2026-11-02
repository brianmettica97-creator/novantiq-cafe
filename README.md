# NOVANTIQ Café

Página de venta y demo interactiva del sistema para cafeterías de **Novantiq S.A.** ([@novantiq.sa](https://www.instagram.com/novantiq.sa/)).

La cafetería que la visita puede probar todo como si fuera su local:

- **Salón en vivo:** una simulación del café con cámara automática. Los clientes escanean el QR de la mesa, el pedido vuela a la barra, la barista lo prepara y la moza lo lleva. Tiene modo *Sin sistema / Con NOVANTIQ* con los números comparados, un día completo en cámara rápida, el minijuego *Jugar de barista*, sonido y un editor para acomodar las mesas.
- **App del cliente:** carta con fotos, armado del pedido, seguimiento, tarjeta de sellos, ruleta de premios y opiniones.
- **Panel del local:** comandas de la barra, números, clientes, ruleta y reseñas, carta con precios y la marca del café.
- **Personalización:** el nombre que escribe la cafetería aparece en la carta, el panel, el salón y los QR.

Es HTML, CSS y JavaScript sin dependencias de compilación. Las fotos están en `assets/img/`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La página lista para publicar. Se genera con `build.py`, no se edita a mano. |
| `src/page.html` | El contenido de la página (secciones, textos). |
| `src/styles.css` | Estilos. Colores y tipografías arriba de todo, como variables. |
| `src/app.js` | App del cliente, panel del local y la landing. La configuración comercial está al principio. |
| `src/motion.js` | Movimiento de las fotos: vapor de la portada, tira de fotos, paralaje. |
| `src/sim/` | El salón en vivo, en partes numeradas que se unen en orden. |
| `src/icons.json` | Íconos de línea. |
| `assets/img/` | Fotos de la carta, portada, local y barista. `og.jpg` es la vista previa al compartir el link. |
| `build.py` | Une todo y genera `index.html`. |

## Cambiar datos comerciales

Al principio de `src/app.js`, en `CONFIG`:

- `novantiqWhatsapp`: el número de WhatsApp en formato internacional, sin `+` ni espacios (por ejemplo `5492215551234`).
- `novantiqWhatsappText`: cómo se muestra en la página.
- `instagram`, `plans` (precios en dólares), `install` (instalación), `usdArs` y `usdArsLabel` (tipo de cambio de referencia).

Después de cualquier cambio en `src/`:

```bash
python build.py
```

Con `python build.py --inline` se genera `novantiq-cafe.html`, un solo archivo con las fotos adentro, para mandarlo suelto.

## Publicar en GitHub Pages

1. Subí esta carpeta a un repositorio público, por ejemplo `novantiq-cafe`.
2. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, rama `main`, carpeta `/ (root)`, y **Save**.
3. En uno o dos minutos queda en `https://brianmettica97-creator.github.io/novantiq-cafe/`.

Si el repositorio tiene otro nombre, cambiá `SITE_URL` al principio de `build.py` y volvé a correr `python build.py`, así la vista previa al compartir el link apunta bien.

## Links personalizados

- `#cafe-la-esquina` abre la demo con el nombre "La Esquina" en la carta, el panel y el salón.
- `#cafe-la-esquina-mesa-4` además la abre como si el cliente estuviera en la mesa 4.
