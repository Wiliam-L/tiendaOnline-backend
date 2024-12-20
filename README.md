# tiendaOnline-backend

Backend para una tienda online construida con Node.js y Express.

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener los siguientes requisitos instalados:

- Node.js (versión 14 o superior)
- npm (gestor de paquetes de Node.js)
- Base de datos SQL Server

## Pasos para configurar el proyecto

1. **Crear la base de datos:**
   - Ejecuta el script SQL para crear la base de datos, las tablas y los procedimientos almacenados necesarios.
   - Asegúrate de que la base de datos esté correctamente configurada antes de proceder con el siguiente paso.

2. **Configurar las variables de entorno:**
   - Renombra el archivo `.env_example` a `.env`.
   - Configura las variables de entorno según el ejemplo proporcionado en el archivo `.env_example`. Asegúrate de que las credenciales de la base de datos y otros parámetros de configuración sean correctos.

3. **Instalar las dependencias:**
   - Ejecuta el siguiente comando para instalar las dependencias del proyecto:
     ```
     npm install
     ```

4. **Iniciar el servidor:**
   - Ejecuta el siguiente comando para iniciar el servidor y crear automáticamente los roles, estados y el operador:
     ```
     npm run dev
     ```
   - Durante la ejecución, se crearán los roles necesarios, los estados y un operador con rol de administrador. Este operador será el que se usará para acceder al sistema.

5. **Acceder al sistema:**
   - Una vez que el servidor esté en ejecución, podrás acceder al sistema con el operador creado como administrador.

## Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo.

## Estructura del proyecto


## Notas

- Asegúrate de tener configurada la base de datos correctamente antes de ejecutar el servidor.
- El operador creado al iniciar el servidor será el administrador del sistema temporalmente, luego se puede eliminar.
- El operador generado automáticamente podrá utilizar la ruta protegida para crear otros usuarios (operador, administrador)
---

