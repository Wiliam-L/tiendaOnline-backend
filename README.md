# 🛒 **TiendaOnline Backend**

Backend para una tienda online construida con **Node.js** y **Express**.

---

## 🚀 **Requisitos previos**

Antes de ejecutar el proyecto, asegúrate de tener los siguientes:

- **Node.js** (versión 14 o superior)
- **npm** (gestor de paquetes de Node.js)
- **Base de datos SQL Server** 

---

## ⚙️ **Pasos para configurar el proyecto**

### 1️⃣ **Crear la base de datos:**
   - Ejecuta el script SQL para crear la base de datos.
   - **⚠️ Nota importante:** El script SQL cargado en este repositorio ya está corregido y debe ser el que se utilice. Asegúrate de usar este script actualizado para evitar problemas de compatibilidad al crear los procedimientos almacenados.

### 2️⃣ **Crear las tablas:**
   - Asegúrate de que las tablas necesarias estén creadas en la base de datos.

### 3️⃣ **Crear los procedimientos almacenados de Insert:**
   - Ejecuta los procedimientos almacenados necesarios para las operaciones de inserción de datos.

### 4️⃣ **Crear los procedimientos almacenados de Update:**
   - Ejecuta los procedimientos almacenados necesarios para las operaciones de actualización de datos.

### 5️⃣ **Clonar o descargar el repositorio:**
   - Clona el repositorio o descarga el proyecto desde el repositorio de GitHub.

### 6️⃣ **Instalar las dependencias:**
   - Ejecuta el siguiente comando para instalar las dependencias del proyecto:
     ```bash
     npm install
     ```

### 7️⃣ **Configurar las variables de entorno:**
   - Renombra el archivo `.env_example` a `.env`.
   - Configura las variables de entorno según el ejemplo proporcionado en el archivo `.env_example`. Asegúrate de que las credenciales de la base de datos y otros parámetros de configuración sean correctos.

### 8️⃣ **Iniciar el servidor:**
   - Ejecuta el siguiente comando para iniciar el servidor y crear automáticamente los roles, estados y el operador:
     ```bash
     npm run dev
     ```
   - Durante la ejecución, se crearán los roles necesarios, los estados y un operador con rol de **administrador**. Este operador será el que se usará para acceder al sistema y acceder a rutas protegidas, así como para crear otros usuarios administradores.

### 9️⃣ **Acceder al sistema:**
   - Una vez que el servidor esté en ejecución, podrás acceder al sistema con el operador creado como administrador.

---

## 🛠️ **Scripts disponibles**

| **Script**      | **Descripción**                                        |
|-----------------|--------------------------------------------------------|
| `npm run dev`   | Inicia el servidor en modo desarrollo.                 |

---

## 📁 **Estructura del proyecto**

El proyecto está organizado de la siguiente manera:

---

## ⚠️ **Notas importantes**

- **⚡️ Asegúrate de tener configurada la base de datos correctamente** antes de ejecutar el servidor.
- El operador creado al iniciar el servidor será el **administrador** del sistema temporalmente, luego se puede eliminar o modificar según sea necesario.
- El operador generado automáticamente podrá utilizar rutas protegidas, por ejemplo, para crear usuarios con rol de **administrador** o **operador**.
- **❗ Advertencia:** **No crees usuarios directamente desde la base de datos**, ya que las contraseñas no se hashean de la manera adecuada. Al hacerlo, cuando intentes iniciar sesión, la comparación de la contraseña no funcionará correctamente, ya que se utiliza **bcrypt** para comparar el hash generado durante el registro a través del endpoint de registro.

---
