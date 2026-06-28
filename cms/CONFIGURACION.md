# Westur CMS — Guía de configuración

## Qué hace este sistema

El gerente edita una planilla de Google Sheets y los cambios aparecen automáticamente en la web al recargar la página. No hace falta tocar código.

---

## Paso 1 — Crear la carpeta en Google Drive

1. Ir a drive.google.com
2. Crear carpeta: **"Westur CMS"**
3. Dentro crear subcarpeta: **"Imágenes"**
4. Dentro de Imágenes crear 4 subcarpetas:
   - Paquetes
   - Ofertas
   - Salidas Grupales
   - Circuitos

---

## Paso 2 — Crear el Google Sheet

1. Dentro de "Westur CMS" crear una Hoja de cálculo de Google
2. Nombrarla: **"Westur CMS"**
3. Crear 4 pestañas con estos nombres exactos:
   - `Paquetes`
   - `Ofertas`
   - `Salidas Grupales`
   - `Circuitos`

---

## Paso 3 — Estructura de cada pestaña

### Pestaña: Paquetes

Copiar estos encabezados en la fila 1 (una columna por celda):

```
Activo | Nombre | Destino | Descripción | Precio | Moneda | Duración | Categoría | Badge | Tipo Badge | Fecha Límite | Imagen 1 | Imagen 2 | Imagen 3
```

**Valores posibles:**
- **Activo**: SI / NO (solo las filas con SI aparecen en la web)
- **Moneda**: USD o $ (pesos)
- **Categoría**: caribe / europa / nacional / cruceros (para el filtro)
- **Tipo Badge**: cupos (amarillo) / promo (verde) / hot (rojo)
- **Fecha Límite**: formato AAAA-MM-DD (ej: 2026-08-15) — activa el contador regresivo
- **Imagen 1/2/3**: URL de Google Drive (ver Paso 5)

**Ejemplo de fila:**
```
SI | Punta Cana | Punta Cana | Arena blanca y agua turquesa | 1490 | USD | 7 noches | caribe | Solo 4 cupos | cupos | 2026-08-15 | https://drive.google.com/... | | 
```

---

### Pestaña: Ofertas

```
Activo | Nombre | Descripción | Precio Original | Precio Nuevo | Moneda | Fecha Vencimiento | Badge Urgencia | Imagen 1 | Imagen 2 | Imagen 3
```

**Ejemplo:**
```
SI | Punta Cana — 7 noches | Vuelo + Hotel Todo Incluido | 1890 | 1490 | USD | 2026-08-15 | Solo 4 cupos disponibles | https://drive.google.com/... | |
```

---

### Pestaña: Salidas Grupales

```
Activo | Destino | Ruta | Dia | Mes | Duración | Cupos Totales | Cupos Disponibles | Precio | Moneda | Imagen 1 | Imagen 2 | Imagen 3
```

**Ejemplo:**
```
SI | Turquía & Grecia | Estambul · Capadocia · Atenas · Santorini | 18 | Jul | 14 noches | 20 | 3 | 2190 | USD | https://drive.google.com/... | |
```

> El campo **Ruta** usa · (punto medio) para separar ciudades.
> Cuando **Cupos Disponibles** es 5 o menos, el número aparece en naranja automáticamente.

---

### Pestaña: Circuitos

```
Activo | Nombre | Ruta | Duración | Precio | Moneda | Badge | Guia Incluido | Imagen 1 | Imagen 2 | Imagen 3
```

**Ejemplo:**
```
SI | Europa Clásica | París · Roma · Barcelona · Amsterdam | 16 noches | 3400 | USD | Alta demanda | SI | https://drive.google.com/... | |
```

---

## Paso 4 — Configurar Apps Script

1. En el Sheet ir a **Extensiones → Apps Script**
2. Borrar el código que aparece
3. Copiar y pegar el contenido del archivo `westur-cms.gs`
4. Guardar (Ctrl+S)
5. Ir a **Implementar → Nueva implementación**
6. Tipo: **Aplicación web**
7. Ejecutar como: **Yo**
8. Quién tiene acceso: **Cualquier usuario**
9. Clic en **Implementar**
10. Copiar la URL que aparece (empieza con `https://script.google.com/macros/s/...`)

---

## Paso 5 — Conectar la URL al sitio web

1. Abrir el archivo `cms/westur-cms.js`
2. En la línea 4 reemplazar:
   ```
   const SCRIPT_URL = 'PEGAR_URL_DEL_APPS_SCRIPT_AQUI';
   ```
   por la URL copiada en el paso anterior:
   ```
   const SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
   ```
3. Guardar el archivo

---

## Paso 6 — Subir imágenes a Drive

1. Ir a la subcarpeta correspondiente (ej: Imágenes → Paquetes)
2. Subir la imagen (JPG o PNG, mínimo 800px de ancho)
3. Click derecho sobre la imagen → **Obtener enlace**
4. Cambiar a **"Cualquier persona con el enlace"** → Copiar enlace
5. Pegar esa URL en la columna **Imagen 1**, **Imagen 2** o **Imagen 3** del Sheet

El sistema convierte automáticamente la URL de Drive en una imagen directa.

---

## Cómo actualizar el contenido

1. Abrir el Google Sheet "Westur CMS"
2. Ir a la pestaña correspondiente (Paquetes, Ofertas, etc.)
3. Editar la fila que querés cambiar (precio, descripción, cupos, etc.)
4. Para ocultar un item temporalmente: cambiar **Activo** de SI a NO
5. Para agregar uno nuevo: agregar una fila nueva con todos los datos y poner **Activo = SI**
6. Guardar — los cambios aparecen en la web al recargar la página

**No hace falta tocar código nunca.**

---

## Preguntas frecuentes

**¿Cuánto tarda en verse el cambio?**
Al instante. En cuanto guardás el Sheet y recargás la web, el cambio aparece.

**¿Puedo tener un paquete listo pero que no se vea todavía?**
Sí. Poné **Activo = NO** y cuando quieras publicarlo cambialo a **SI**.

**¿Qué pasa si borro una fila?**
Desaparece de la web. Para ocultarla temporalmente es mejor usar Activo = NO.

**¿Puedo reordenar los paquetes?**
Sí. El orden en la web sigue el orden de las filas en el Sheet.

**¿Cuántas imágenes puedo poner por item?**
3 imágenes (Imagen 1, Imagen 2, Imagen 3). La Imagen 1 es la que aparece en la card principal.
