# Inventario - Sistema de Pedidos y Reportes

App web **sin servidor propio**: se aloja en cualquier hosting estático (GitHub Pages, etc.)
y usa tu **Google Sheets** como base de datos. Un **Google Apps Script** guarda cada pedido/reporte
en la hoja de cálculo y **envía el email a 2 correos** automáticamente.

- 🧑 Acceso por **contraseña** (una para "Usuario" y otra para "Admin"), sin registro
- 📋 **Pedidos con varios productos** (lista desplegable con buscador + ubicación desplegable)
- ⚠️ Reportar daños (objeto, descripción, foto opcional)
- 📧 Email automático a los correos que tú configures
- 📱 Botón "Enviar por WhatsApp" con mensaje prellenado
- 🔎 Historial con filtros: hoy, semana, mes, rango personalizado y búsqueda por texto
- 📱 Diseño **responsivo** (funciona en celular)

---

## PASO 1 — Configurar Google Sheets (15 min, una sola vez)

1. Entra a **https://sheets.google.com** → **Nueva hoja de cálculo**. Cámbiale el nombre
   (ej. "Inventario").
2. Menú **Extensiones → Apps Script** (se abre una pestaña nueva con un editor).
3. Borra el contenido y pega **todo** el código de **`google-apps-script/Code.gs`**.
4. En el código, configura la lista de correos destino (línea `ADMIN_EMAILS`):

```js
var ADMIN_EMAILS = [
  'carolinablanco8419@gmail.com',  // primer correo
  'otro-correo@gmail.com'          // segundo correo
];
```

5. Guarda (**Ctrl+S**). En la barra de arriba selecciona la función **`setup`** y dale **Ejecutar**.
   Acepta los permisos (primera vez pide autorización). Esto crea la hoja **Registros**.
6. Dale a **Implementar → Nueva implementación → Aplicación web**:
   - **Descripción**: Inventario
   - **Ejecutar como**: Yo
   - **Quién tiene acceso**: Cualquier persona
   - **Implementar** → acepta permisos → **copia la URL** (termina en `/exec`).
7. Pega esa URL en **`frontend/src/config.js`**:

```js
export const SCRIPT_URL = 'https://script.google.com/.../exec';
```

---

## PASO 2 — Configurar contraseñas y catálogo

Todo se edita en el frontend, en texto plano:

- **`frontend/src/config.js`** → contraseñas de acceso:
  ```js
  export const ADMIN_PASSWORD = 'admin123';    // contraseña de Admin
  export const USER_PASSWORD = 'usuario123';   // contraseña de Usuario
  ```
  No hay registro: al entrar se elige "🧑 Usuario" o "👑 Admin" y se teclea su contraseña.

- **`frontend/src/catalog.js`** → **productos organizados por categorías** y **ubicaciones**.
  Cada categoría tiene su propia lista desplegable. Agrega o borra nombres así:
  ```js
  export const CATEGORIAS = [
    { categoria: 'Mezcladores', items: ['Coca Cola normal', 'Soda'] },
    { categoria: 'Decoración',  items: ['Jarrón'] },
    // ... más categorías
  ];
  ```
  La app los muestra en orden alfabético dentro de cada categoría, con buscador.

---

## PASO 3 — Publicar (opcional pero recomendado)

1. Sube este proyecto a un repositorio de GitHub.
2. En el frontend, instala dependencias (solo la primera vez):
   ```
   cd frontend
   npm install
   ```
3. Publica:
   ```
   npm run deploy
   ```
   (usa `gh-pages`, sube la carpeta `dist/` a la rama `gh-pages`).
4. En GitHub: **Settings → Pages** → Source: `gh-pages`. La app queda en
   `https://<tu-usuario>.github.io/<repositorio>/`

> También puedes probarla localmente de forma temporal con:
> ```
> cd frontend
> npm run dev      → http://localhost:5173
> ```

---

## Estructura

```
frontend/                 App (React + Vite) → sale a estático
  src/
    config.js             URL del Apps Script + contraseñas de acceso
    catalog.js            Lista de productos y ubicaciones (editable)
    api.js                Conexión con Google Sheets
    components/Combobox   Lista desplegable con buscador
    pages/                Login, Dashboard, Historial
google-apps-script/
  Code.gs                 "Servidor": guarda en Sheets y envía emails
```

## Cómo funciona

- **Guardar**: El frontend hace un POST a tu aplicación web de Apps Script con los datos.
- **Email**: El Apps Script usa GmailApp para enviar el correo a los `ADMIN_EMAILS`
  (pedidos con la lista de productos y su cantidad; reportes con su descripción y la foto adjunta).
- **Historial**: El frontend hace un GET de la hoja **Registros** y filtra en pantalla
  (por fecha, semana, mes, rango y texto). Admin y Usuario acceden al historial.
- **WhatsApp**: El enlace wa.me se genera en el navegador, sin costo.

> ⚠️ La contraseña se compara en código dentro del navegador (sin servidor no hay seguridad real).
> Es ideal para uso interno del negocio. En la hoja **Registros** se guarda quién hizo cada
> pedido/reporte (el rol), no la contraseña.