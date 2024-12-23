---- CÓDIGO:  
---- WILIAM ADALBERTO LÓPEZ GUERRA

CREATE DATABASE GDA00372_OT_WiliamLopez;
USE GDA00372_OT_WiliamLopez;


CREATE TABLE estados (
  idestados INT IDENTITY(1,1),
  nombre VARCHAR(45) UNIQUE NOT NULL,
  CONSTRAINT PK_idestados PRIMARY KEY(idestados)
);

CREATE TABLE rol (
  idrol INT IDENTITY(1,1),
  nombre VARCHAR(45) UNIQUE,
  CONSTRAINT PK_idrol PRIMARY KEY(idrol)
);


CREATE TABLE Clientes (
  idClientes INT IDENTITY(1,1),
  razon_social VARCHAR(245) NOT NULL,
  nombre_comercial VARCHAR(345) NOT NULL,
  direccion_entrega VARCHAR(45) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo_electronico VARCHAR(45) UNIQUE NOT NULL ,
  CONSTRAINT PK_idClientes PRIMARY KEY(idClientes)
);

CREATE TABLE usuarios (
  idusuarios INT IDENTITY(1,1),
  rol_idrol INT NOT NULL,
  estados_idestados INT NOT NULL,
  correo_electronico VARCHAR(45) UNIQUE NOT NULL,
  nombre_completo VARCHAR(45) NOT NULL,
  password VARCHAR(60) NOT NULL, ---para hasheo
  telefono VARCHAR(15) NOT NULL,
  fecha_nacimiento DATE NULL,
  fecha_creacion DATETIME DEFAULT GETDATE(),
  Clientes_idClientes INT NULL,

  CONSTRAINT PK_idusuarios PRIMARY KEY (idusuarios),
  CONSTRAINT FK_rol_idrol FOREIGN KEY (rol_idrol) 
    REFERENCES rol(idrol)
    ON DELETE NO ACTION, -- No eliminar rol si se elimina el usuario
  CONSTRAINT FK_estados_idestados FOREIGN KEY (estados_idestados) 
    REFERENCES estados(idestados)
    ON DELETE NO ACTION, -- No eliminar estado si se elimina el usuario
  CONSTRAINT FK_clientes_idclientes FOREIGN KEY (Clientes_idClientes)
    REFERENCES Clientes(idClientes)
    ON DELETE NO ACTION -- No eliminar cliente si se elimina el usuario
);

CREATE TABLE CategoriaProductos (
  idCategoriaProductos INT IDENTITY(1,1),
  usuarios_idusuarios INT NOT NULL,
  nombre VARCHAR(45) UNIQUE NOT NULL,
  estados_idestados INT NOT NULL,
  fecha_creacion DATETIME DEFAULT GETDATE(),
  CONSTRAINT PK_idCategoriaProducto PRIMARY KEY(idCategoriaProductos),
  CONSTRAINT FK_usuarios_idusuarios FOREIGN KEY (usuarios_idusuarios)
    REFERENCES usuarios(idusuarios)
    ON DELETE NO ACTION -- No eliminar categor�a si se elimina el usuario asociado (preservar historial de categor�as)
);

CREATE TABLE Productos (
  idProductos INT IDENTITY(1,1),
  CategoriaProductos_idCategoriaProductos INT NOT NULL,
  usuarios_idusuarios INT NOT NULL,
  nombre VARCHAR(45) NOT NULL,
  marca VARCHAR(45) NOT NULL,
  codigo VARCHAR(45) UNIQUE NOT NULL,

  stock FLOAT NOT NULL,
  estados_idestados INT NOT NULL,
  precio FLOAT NOT NULL,
  fecha_creacion DATETIME DEFAULT GETDATE(),
  foto VARBINARY(MAX) NOT NULL,

  CONSTRAINT PK_idProducto PRIMARY KEY(idProductos),
  CONSTRAINT FK_CategoriaProductos_idCategoriaProductos_productos FOREIGN KEY (CategoriaProductos_idCategoriaProductos) 
    REFERENCES CategoriaProductos(idCategoriaProductos)
    ON DELETE NO ACTION, -- No eliminar categor�a si se elimina el producto (evitar p�rdida de datos hist�ricos)

  CONSTRAINT FK_usuarios_idusuarios_productos FOREIGN KEY (usuarios_idusuarios) 
    REFERENCES usuarios(idusuarios)
    ON DELETE NO ACTION, -- No eliminar usuario si se elimina el producto (preservar historial de productos)

  CONSTRAINT FK_estados_idestados_productos FOREIGN KEY (estados_idestados) 
    REFERENCES estados(idestados)
    ON DELETE NO ACTION 
);

CREATE TABLE Orden (
  idOrden INT IDENTITY(1,1),
  usuarios_idusuarios INT,
  estados_idestados INT,
  fecha_creacion DATETIME,
  nombre_completo VARCHAR(45),
  direccion VARCHAR(545),
  telefono VARCHAR(15),
  correo_electronico VARCHAR(45),
  fecha_entrega DATE,
  total_orden FLOAT,

  CONSTRAINT PK_idOrden PRIMARY KEY(idOrden),
  CONSTRAINT FK_usuarios_idusuarios_orden FOREIGN KEY(usuarios_idusuarios)
    REFERENCES usuarios(idusuarios)
    ON DELETE NO ACTION, -- No eliminar usuario si se elimina la orden (preservar historial de �rdenes)
  CONSTRAINT FK_estados_idestados_orden FOREIGN KEY(estados_idestados)
    REFERENCES estados(idestados)
    ON DELETE NO ACTION -- Eliminar estado si se elimina la orden (puede ser necesario para mantener integridad referencial)
);

CREATE TABLE OrdenDetalles (
  idOrdenDetalles INT IDENTITY(1,1),
  Orden_idOrden INT,
  Productos_idProductos INT,
  cantidad INT,
  precio FLOAT,
  subtotal FLOAT,

  CONSTRAINT PK_idOrdenDetalles PRIMARY KEY(idOrdenDetalles),
  CONSTRAINT FK_Orden_idOrden FOREIGN KEY(Orden_idOrden) 
    REFERENCES Orden(idOrden)
    ON DELETE CASCADE, -- Eliminar detalle si se elimina la orden (mantener integridad de transacciones)
  CONSTRAINT FK_Productos_idProductos FOREIGN KEY(Productos_idProductos)
    REFERENCES Productos(idProductos)
    ON DELETE NO ACTION -- No eliminar productos al eliminar detalle (evitar p�rdida de datos hist�ricos de productos)
);

------------------------------
-- Procedimientos almacenados
-- INSERT  
-------------------------------

-- Procedimiento para estados
CREATE PROCEDURE NuevoEstado
	@nombre VARCHAR(45)
AS
BEGIN 
	INSERT INTO estados(nombre)
	VALUES(@nombre)
END;
GO

-- Procedimiento para rol
CREATE PROCEDURE NuevoRol
	@nombre VARCHAR(45)
AS
BEGIN 
	INSERT INTO rol(nombre)
	VALUES (@nombre)
END;
GO

-- Procedimiento para clientes
CREATE PROCEDURE NuevoCliente
  @razon_social VARCHAR(245),
  @nombre_comercial VARCHAR(345),
  @direccion_entrega VARCHAR(45),
  @telefono VARCHAR(15),
  @correo_electronico VARCHAR(45)
AS
BEGIN 
	INSERT INTO Clientes(razon_social, nombre_comercial, direccion_entrega, telefono, correo_electronico)
	VALUES (@razon_social, @nombre_comercial, @direccion_entrega, @telefono, @correo_electronico);
END;
GO

--- PROCEDIMIENTO PARA CREAR OPERADOR

CREATE PROCEDURE NuevoUsuario
	@rol_idrol INT,
    @estados_idestados INT,
	@correo_electronico VARCHAR(45),
	@nombre_completo VARCHAR(45),
	@password VARCHAR(60),
	@telefono VARCHAR(15),
	@fecha_nacimiento DATE
AS
BEGIN
    --- Obtener para el estado
	DECLARE @idestado INT;

    -- Verificar si se pasó el estado, si no, asignar el estado "activo"
    IF @estados_idestados IS NULL
    BEGIN
	    SELECT @idestado = idestados from estados
	    WHERE LOWER(nombre) = 'activo';
    END
    ELSE
    BEGIN
        -- se se pasa el idestado se usa ese valor
        SET @idestado = @estados_idestados
    END
	
    --- si no se encontró el estado activo
    IF @idestado IS NULL
    BEGIN
        RETURN;
    END

    --- insertar el nuevo usuario
    INSERT INTO usuarios(
		rol_idrol, estados_idestados, 
		correo_electronico, nombre_completo, password, 
		telefono, fecha_nacimiento, 
		fecha_creacion, Clientes_idClientes)
	VALUES (
		@rol_idrol, @idestado, @correo_electronico, 
		@nombre_completo, @password, @telefono,
		@fecha_nacimiento, GETDATE(), null);
END;
GO


-- Procedimiento para Producto
CREATE PROCEDURE NuevoProducto
		@CategoriaProductos_idCategoriaProductos INT,
		@usuarios_idusuarios INT,
		@nombre VARCHAR(45), 
		@marca VARCHAR(45), 
		@codigo VARCHAR(45), 
		@stock FLOAT, 
		@estados_idestados INT, 
		@precio FLOAT, 
		@foto BINARY
AS 
BEGIN 
	INSERT INTO Productos(
		CategoriaProductos_idCategoriaProductos, 
		usuarios_idusuarios, nombre, marca, codigo, stock, 
		estados_idestados, precio, fecha_creacion, foto)
	VALUES(
		@CategoriaProductos_idCategoriaProductos, 
		@usuarios_idusuarios, @nombre, @marca, 
		@codigo, @stock, @estados_idestados, 
		@precio, GETDATE(), @foto);
END
GO

-- Procedimiento para ORDEN
CREATE PROCEDURE NuevaOrden
  @idOrden INT,
  @usuarios_idusuarios INT,
  @estados_idestados INT,
  --@fecha_creacion DATETIME,
  @nombre_completo VARCHAR(45),
  @direccion VARCHAR(545),
  @telefono VARCHAR(15),
  @correo_electronico VARCHAR(45),
  @fecha_entrega DATE
AS
BEGIN
	INSERT INTO Orden(
		idOrden, usuarios_idusuarios, estados_idestados,
		fecha_creacion, nombre_completo, direccion, 
		telefono, correo_electronico, fecha_entrega)
	VALUES(
		@idOrden, @usuarios_idusuarios, 
		@estados_idestados, GETDATE(), 
		@nombre_completo, @direccion, @telefono,
		@correo_electronico, @fecha_entrega)
END
GO


-- PA: OrdenDetalle
CREATE PROCEDURE NuevaOrdenDetalle
  @idOrdenDetalles INT,
  @Orden_idOrden INT,
  @Productos_idProductos INT,
  @cantidad INT
AS
BEGIN

	--- Obtener el estado del producto
	DECLARE @estadoProducto NVARCHAR(50);
	SELECT @estadoProducto = e.nombre
	FROM Productos as p
	INNER JOIN Estados as e ON p.estados_idestados = e.idestados
	WHERE p.idProductos = @Productos_idProductos;
	
	---Verificar si el producto esta disponible
	IF LOWER(@estadoProducto) != 'activo'
	BEGIN
		RAISERROR('El producto no est� disponible', 16, 1);
		RETURN;
	END;

	-- Validar que la cantidad sea mayor a cero
	IF @cantidad <= 0 
	BEGIN 
		RAISERROR('La cantidad debe ser mayor que cero.', 16, 1); 
		RETURN;
	END;

	-- Obtener stock actual
	DECLARE @stockActual FLOAT
	SELECT @stockActual = stock FROM Productos WHERE idProductos = @Productos_idProductos;

	-- Validar que la cantidad sea menor o igual al stock actual del producto
	IF @cantidad > @stockActual
	BEGIN 
		RAISERROR('Cantidad solicitada excede el stock disponible.', 16, 1); 
		RETURN;
	END;

	--- Obtener precio producto
	DECLARE @precioProducto FLOAT;
	SELECT @precioProducto = precio FROM Productos WHERE idProductos = @Productos_idProductos;
	
	-- Calcular el subtotal
	DECLARE @subtotal FLOAT;
	SET @subtotal = @cantidad * @precioProducto;

	
	BEGIN TRANSACTION 
	BEGIN TRY
		-- Insertar el detalle de la orden
		INSERT INTO OrdenDetalles(idOrdenDetalles, Orden_idOrden, Productos_idProductos, cantidad, precio, subtotal)
		VALUES(@idOrdenDetalles, @Orden_idOrden, @Productos_idProductos, @cantidad, @precioProducto, @subtotal);
		
		-- Actualizar el stock del producto
		UPDATE Productos
		SET stock = stock - @cantidad
		WHERE idProductos = @Productos_idProductos;

		---Validar  si el stock lleg� a 0 cambiar estado -> Agotado
		DECLARE @nuevoStock FLOAT;
		SELECT @nuevoStock = stock FROM Productos WHERE idProductos = @Productos_idProductos;

		IF @nuevoStock = 0
		BEGIN 
			---obtener el ID del estado 'Agotado' de: tabla estados
			DECLARE @idEstadoAgotado INT;
			SELECT @idEstadoAgotado = idestados FROM estados WHERE LOWER(nombre) = 'agotado';

			---actualizar
			UPDATE Productos
			SET estados_idestados = @idEstadoAgotado
			WHERE idProductos = @Productos_idProductos;
			
		END;	


		-- Calcular el nuevo total de la orden
		DECLARE @nuevoTotal Float;
		SELECT @nuevoTotal = SUM(@subtotal) FROM OrdenDetalles WHERE Orden_idOrden = @Orden_idOrden;

		-- Actualizar el total de la orden
		UPDATE Orden SET total_orden = @nuevoTotal WHERE idOrden = @Orden_idOrden;
				
		COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH
		-- Revertir la transacci�n
		ROLLBACK TRANSACTION;
	END CATCH
END
GO

------------------------------
-- Procedimientos almacenados
-- UPDATE  
-------------------------------

--- ACTUALIZAR ESTADO
CREATE PROCEDURE ActualizarEstado
	@idestados INT,
	@nombre VARCHAR(45)
AS 
BEGIN
	UPDATE estados
	SET nombre = @nombre WHERE idestados = @idestados;
END;
GO


--- ACTUALIZAR ROL
CREATE PROCEDURE ActualizarRol
	@idrol INT,
	@nombre VARCHAR(45)
AS
BEGIN
	UPDATE rol
	SET nombre = @nombre WHERE idrol = @idrol;
END;
GO

--- ACTUALIZAR CLIENTE
CREATE PROCEDURE ActualizarCliente
	@idClientes INT,
	@razon_social VARCHAR(245) = NULL,
	@nombre_comercial VARCHAR(345) = NULL,
	@direccion_entrega VARCHAR(45) = NULL,
	@telefono VARCHAR(15) = NULL,
	@correo_electronico VARCHAR(45) = NULL
AS
BEGIN
	UPDATE Clientes
	SET
		razon_social = COALESCE(@razon_social, razon_social),
		nombre_comercial = COALESCE(@nombre_comercial, nombre_comercial),
		direccion_entrega = COALESCE(@direccion_entrega, direccion_entrega),
		telefono = COALESCE(@telefono, telefono),
		@correo_electronico = COALESCE(@correo_electronico, @correo_electronico)
	WHERE idClientes = @idClientes;
END;
GO

--- ACTUALIZAR ESTADO
CREATE PROCEDURE ActualizarUsuario
	@idusuarios INT,
	@rol_idrol INT = NUll,
	@estados_idestados INT = NULL,
	@correo_electronico VARCHAR(45) = NULL,
	@nombre_completo VARCHAR(45) = NULL,
	@password VARCHAR(64) = NULL,
	@telefono VARCHAR(15) = NULL,
	@fecha_nacimiento DATE = NULL,
	@fecha_creacion DATETIME = NULL,
	@Clientes_idClientes INT = NULL

AS
BEGIN
	---hash para la contrase�a
	-- Hash para la contrase�a
    DECLARE @hashed_password VARCHAR(64);
    SET @hashed_password = CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @password), 1); 
	IF @password IS NOT NULL
	BEGIN 
        SET @hashed_password = CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @password ), 1);
	END

	UPDATE usuarios
	SET
		rol_idrol = COALESCE(@rol_idrol, rol_idrol),
		estados_idestados = COALESCE(@estados_idestados, estados_idestados),
		correo_electronico = COALESCE(@correo_electronico, correo_electronico),
		nombre_completo = COALESCE(@nombre_completo, nombre_completo),
		password = COALESCE(@hashed_password, password),
		telefono = COALESCE(@telefono, telefono),
		fecha_nacimiento = COALESCE(@fecha_nacimiento, fecha_nacimiento),
		fecha_creacion = COALESCE(@fecha_creacion, fecha_creacion),
		Clientes_idClientes = COALESCE(@Clientes_idClientes, Clientes_idClientes)
	WHERE idusuarios = @idusuarios;
END;
GO


--- ACTUALIZAR PRODUCTO
CREATE PROCEDURE ActualizarProducto
	@idProductos INT,
	@CategoriaProductos_idCategoriaProductos INT = NULL,
	@usuarios_idusuarios INT = NULL,
	@nombre VARCHAR(45) = NULL,
	@marca VARCHAR(45) = NULL,
	@codigo VARCHAR(45) = NULL,
	@stock FLOAT = NULL,
	@estados_idestados INT = NULL,
	@precio FLOAT = NULL,
	@fecha_creacion DATETIME = NULL,
	@foto BINARY = NULL
AS
BEGIN
	UPDATE Productos
	SET 
		CategoriaProductos_idCategoriaProductos = COALESCE(@CategoriaProductos_idCategoriaProductos, CategoriaProductos_idCategoriaProductos), 
		usuarios_idusuarios = COALESCE(@usuarios_idusuarios, usuarios_idusuarios), 
		nombre = COALESCE(@nombre, nombre),
		marca = COALESCE(@marca, marca), 
		codigo = COALESCE(@codigo, codigo), 
		stock = COALESCE(@stock, stock), 
		estados_idestados = COALESCE(@estados_idestados, estados_idestados), 
		precio = COALESCE(@precio, precio), 
		fecha_creacion = COALESCE(@fecha_creacion, fecha_creacion),
		foto = COALESCE(@foto, foto)
	WHERE idProductos = @idProductos
END
GO

-- ACTUALIZAR CATEGORIA PRODUCTO
CREATE PROCEDURE ActualizarCategoriaProducto
	@idCategoriaProductos INT,
	@usuarios_idusuarios INT = NULL,
	@nombre VARCHAR(45) = NULL,
	@estados_idestados INT = NULL,
	@fecha_creacion DATETIME = NULL
AS
BEGIN
	UPDATE CategoriaProductos
	SET
		usuarios_idusuarios = COALESCE(@usuarios_idusuarios, usuarios_idusuarios),
		nombre = COALESCE(@nombre, nombre),
		estados_idestados = COALESCE(@estados_idestados, estados_idestados),
		fecha_creacion = COALESCE(@fecha_creacion, fecha_creacion)
	WHERE idCategoriaProductos = @idCategoriaProductos
END;
GO

--- ACTUALIZAR ORDEN
CREATE PROCEDURE ActualizarOrden
	@idOrden INT,
	@usuarios_idusuarios INT = NULL, 
	@estados_idestados INT = NULL, 
	@fecha_creacion DATETIME = NULL,
	@nombre_completo VARCHAR(45) = NULL,
	@direccion VARCHAR(545) = NULL,
	@telefono VARCHAR(15) = NULL, 
	@correo_electronico VARCHAR(45) = NULL, 
	@fecha_entrega DATE = NULL
AS
BEGIN 
	UPDATE Orden 
	SET
		usuarios_idusuarios = COALESCE(@usuarios_idusuarios, usuarios_idusuarios), 
		estados_idestados = COALESCE(@estados_idestados, estados_idestados), 
		fecha_creacion = COALESCE(@fecha_creacion, fecha_creacion), 
		nombre_completo = COALESCE(@nombre_completo, nombre_completo), 
		direccion = COALESCE(@direccion, direccion), 
		telefono = COALESCE(@telefono, telefono), 
		correo_electronico = COALESCE(@correo_electronico, correo_electronico), 
		fecha_entrega = COALESCE(@fecha_entrega, fecha_entrega)
	WHERE idOrden = @idOrden; 
END;
GO


--- ACTIALIZAR ORDEN DETALLE
CREATE PROCEDURE ActualizarOrdenDetalles
	@idOrdenDetalles INT, 
	@Productos_idProductos INT = NULL,
	@cantidad INT = NULL
AS
BEGIN
	---VARIABLES
	DECLARE @cantidadOriginal INT;
	DECLARE @Productos_idOriginal INT;
	DECLARE @Orden_idOrden INT;

	---Obtener datos originales de detalle orden
	SELECT @cantidadOriginal = cantidad, @Productos_idOriginal = Productos_idProductos, @Orden_idOrden = Orden_idOrden
	FROM OrdenDetalles
	WHERE idOrdenDetalles = @idOrdenDetalles;

	---validar que la nueva cantidad no exceda el stock disponible
	IF @cantidad IS NOT NULL
	BEGIN
		DECLARE @stockActual FLOAT;
		SELECT @stockActual = stock FROM Productos WHERE idProductos = COALESCE(@Productos_idProductos, @Productos_idOriginal);

		IF @cantidad > @stockActual
		BEGIN
			RAISERROR('Cantidad solicitada excede el stock disponible.', 16, 1);
			RETURN;
		END;
	END;

	---Calcular el nuevo subtotal si se proporciona una nueva cantidad o producto
	DECLARE @precioProducto FLOAT;
	DECLARE @nuevoSubtotal FLOAT;
	SELECT @precioProducto = precio FROM Productos
	WHERE idProductos = COALESCE(@Productos_idProductos, @Productos_idOriginal);
	SET @nuevoSubtotal = @precioProducto * COALESCE(@cantidad, @cantidadOriginal);

	BEGIN TRANSACTION
	BEGIN TRY
		---Actualizar el detalle de la orden
		UPDATE OrdenDetalles
			SET
				Productos_idProductos = COALESCE(@Productos_idProductos, Productos_idProductos),
				cantidad = COALESCE(@cantidad, cantidad),
				precio = @precioProducto,
				subtotal = @nuevoSubtotal
			WHERE idOrdenDetalles = @idOrdenDetalles;
			PRINT('SE ACTUALIZO LA ORDEN_DETALLES CORRECTAMENTE')

		-- Revertir el stock del producto original 
		UPDATE Productos 
			SET stock = stock + @cantidadOriginal 
			WHERE idProductos = @Productos_idOriginal;
			PRINT('se revertio el stock')

		-- Actualizar el stock del nuevo producto 
		UPDATE Productos 
			SET stock = stock - COALESCE(@cantidad, @cantidadOriginal) 
			WHERE idProductos = COALESCE(@Productos_idProductos, @Productos_idOriginal);
			select * from productos

		--Calcular el nuevo total de la orden
		DECLARE @nuevoTotal FLOAT;
		SELECT @nuevoTotal = SUM(subtotal) FROM OrdenDetalles
			WHERE Orden_idOrden = @Orden_idOrden;

		--Actualizar el total de la orden
		UPDATE Orden
			SET total_orden = @nuevoTotal
			WHERE idOrden = @Orden_idOrden;

		COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH
		ROLLBACK TRANSACTION;
		PRINT('Problemas al actualizar Orden Detalle')
	END CATCH;
END;
GO

---------------------
---- PROCEDIMINETO
---- 'INACTIVAR'
---------------------

--- INACTIVAR PRODUCTO
CREATE PROCEDURE InactivarProducto
    @idProductos INT
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Buscar el ID del estado "Inactivo"
        DECLARE @idEstadoInactivo INT;

        SELECT @idEstadoInactivo = idestados 
        FROM estados
        WHERE nombre = 'Inactivo';

        -- Validar si se encontr� el estado "Inactivo"
        IF @idEstadoInactivo IS NULL
        BEGIN
            RAISERROR('No se encontr� el estado "Inactivo" en la tabla estados.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Actualizar el estado del producto a "Inactivo"
        UPDATE Productos
        SET estados_idestados = @idEstadoInactivo
        WHERE idProductos = @idProductos;

        -- Confirmar transacci�n
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
		PRINT('Error al inactivar producto')
    END CATCH;
END;
GO



--------------------------
--- EJECUTAR PROCEDIMIENTOS
---	'INSERT'
--------------------------

---- NUEVOS ESTADOS
EXEC NuevoEstado @nombre = 'Activo';
EXEC NuevoEstado @nombre = 'Inactivo';
EXEC NuevoEstado @nombre = 'Suspendido';
EXEC NuevoEstado @nombre = 'Agotado';
EXEC NuevoEstado @nombre = 'Pendiente';
EXEC NuevoEstado @nombre = 'Finalizado';
EXEC NuevoEstado @nombre = 'Procesando';
EXEC NuevoEstado @nombre = 'Entregado';
EXEC NuevoEstado @nombre = 'Devuelto';
EXEC NuevoEstado @nombre = 'Cancelado';
EXEC NuevoEstado @nombre = 'En Progreso';
EXEC NuevoEstado @nombre = 'Revisando';
EXEC NuevoEstado @nombre = 'Completado';
EXEC NuevoEstado @nombre = 'Rechazado';
EXEC NuevoEstado @nombre = 'Recibido';
EXEC NuevoEstado @nombre = 'Anulado';
EXEC NuevoEstado @nombre = 'Por Confirmar';


----NUEVO ROL
EXEC NuevoRol @nombre = 'Operador';
EXEC NuevoRol @nombre = 'Cliente';

SELECT * FROM usuarios

---NUEVO CLIENTE
EXEC NuevoCliente @razon_social = 'Comercial ABC', @nombre_comercial = 'ABC', @direccion_entrega = 'Av. Siempre Viva 123', @telefono = '555-111-0001', @correo_electronico = 'abc@correo.com';
EXEC NuevoCliente @razon_social = 'Empresa XYZ', @nombre_comercial = 'XYZ', @direccion_entrega = 'Calle Falsa 456', @telefono = '555-111-0002', @correo_electronico = 'xyz@correo.com';
EXEC NuevoCliente @razon_social = 'Corporaci�n LMN', @nombre_comercial = 'LMN', @direccion_entrega = 'Boulevard Central 789', @telefono = '555-111-0003', @correo_electronico = 'lmn@correo.com';
EXEC NuevoCliente @razon_social = 'Grupo 123', @nombre_comercial = 'Grupo123', @direccion_entrega = 'Calle 10', @telefono = '555-111-0004', @correo_electronico = 'grupo123@correo.com';
EXEC NuevoCliente @razon_social = 'Distribuidora QRS', @nombre_comercial = 'Distribuidores', @direccion_entrega = 'Calle Inventada 555', @telefono = '555-111-0005', @correo_electronico = 'qrs@correo.com';
EXEC NuevoCliente @razon_social = 'Compa��a ABCD', @nombre_comercial = 'ABCD', @direccion_entrega = 'Calle Secundaria', @telefono = '555-111-0006', @correo_electronico = 'abcd@correo.com';
EXEC NuevoCliente @razon_social = 'Empresa 789', @nombre_comercial = '789Co', @direccion_entrega = 'Av. Industrial', @telefono = '555-111-0007', @correo_electronico = '789co@correo.com';
EXEC NuevoCliente @razon_social = 'Distribuidores LMN', @nombre_comercial = 'Distribuidores LMN', @direccion_entrega = 'Zona Norte 123', @telefono = '555-111-0008', @correo_electronico = 'distribuidoreslmn@correo.com';
EXEC NuevoCliente @razon_social = 'Log�stica ABC', @nombre_comercial = 'Log�stica', @direccion_entrega = 'Calle Log�stica', @telefono = '555-111-0009', @correo_electronico = 'logistica@correo.com';
EXEC NuevoCliente @razon_social = 'Cadena Supermercados', @nombre_comercial = 'SuperCadena', @direccion_entrega = 'Zona Centro', @telefono = '555-111-0010', @correo_electronico = 'supercadena@correo.com';
EXEC NuevoCliente @razon_social = 'Comercial GT', @nombre_comercial = 'GT Co', @direccion_entrega = 'Calle Final', @telefono = '555-111-0011', @correo_electronico = 'comercialgt@correo.com';
EXEC NuevoCliente @razon_social = 'Empresa ABC Logistics', @nombre_comercial = 'ABCL', @direccion_entrega = 'Zona Log�stica 678', @telefono = '555-111-0012', @correo_electronico = 'abcl@correo.com';
EXEC NuevoCliente @razon_social = 'Retail Global', @nombre_comercial = 'RetailCo', @direccion_entrega = 'Zona Retail', @telefono = '555-111-0013', @correo_electronico = 'retail@correo.com';
EXEC NuevoCliente @razon_social = 'Corporaci�n Andina', @nombre_comercial = 'Andina Corp', @direccion_entrega = 'Av. Andina', @telefono = '555-111-0014', @correo_electronico = 'andinacorp@correo.com';
EXEC NuevoCliente @razon_social = 'Super Almac�n', @nombre_comercial = 'Super Almac�n', @direccion_entrega = 'Almac�n Centro', @telefono = '555-111-0015', @correo_electronico = 'superalmacen@correo.com';

--- NUEVO USUARIO
EXEC NuevoUsuario 
	@rol_idrol = 45,
    @correo_electronico = 'abc@correo.com', 
    @nombre_completo = 'Usuario de prueba', 
    @password = 'password123', 
	@telefono = '555-111-0001',
    @fecha_nacimiento = '1990-01-01'
GO



EXEC NuevoUsuario 
    @rol_idrol = 2,
    @correo_electronico = 'usuario2@correo.com', 
    @nombre_completo = 'Usuario Dos', 
    @password = 'password123', 
	@telefono = '0asd2sdd',
    @fecha_nacimiento = '1991-02-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4,
    @correo_electronico = 'usuario3@correo.com', 
    @nombre_completo = 'Usuario Tres', 
    @password = 'password123', 
	@telefono = 'lsdkl230',
    @fecha_nacimiento = '1992-03-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4, 
    @correo_electronico = 'usuario4@correo.com', 
    @nombre_completo = 'Usuario Cuatro', 
    @password = 'password123', @telefono = '92903sdfasd',
    @fecha_nacimiento = '1993-04-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4,
    @correo_electronico = 'usuario5@correo.com', 
    @nombre_completo = 'Usuario Cinco', 
    @password = 'password123', @telefono = '929sdklf',
    @fecha_nacimiento = '1994-05-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4,
    @correo_electronico = 'usuario6@correo.com', 
    @nombre_completo = 'Usuario Seis', 
    @password = 'password123', @telefono = '298ksds',
    @fecha_nacimiento = '1995-06-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4,
	@correo_electronico = 'usuario7@correo.com', 
    @nombre_completo = 'Usuario Siete', 
    @password = 'password123', @telefono = '88sdklsd',
    @fecha_nacimiento = '1996-07-01'
GO

delete usuarios
select * from rol
SELECT * FROM usuarios WHERE correo_electronico = 'operador@example.com'

EXEC NuevoUsuario 
    @rol_idrol = 4,
    @correo_electronico = 'usuario8@correo.com', 
    @nombre_completo = 'Usuario Ocho', 
    @password = 'password123', @telefono = '98kjsdld',
    @fecha_nacimiento = '1997-08-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4,
    @correo_electronico = 'usuario9@correo.com', 
    @nombre_completo = 'Usuario Nueve', 
    @password = 'password123', @telefono = '829sdkld',
    @fecha_nacimiento = '1998-09-01'
GO

EXEC NuevoUsuario 
    @rol_idrol = 4,
    @correo_electronico = 'usuario10@correo.com', 
    @nombre_completo = 'Usuario Diez', 
    @password = 'password123', @telefono = '1234567899',
    @fecha_nacimiento = '1999-10-01'
GO




--- NUEVA CATEGOR�A PRODUCTO
EXEC NuevaCategoriaProducto 
    @usuarios_idusuarios = 3, 
    @nombre = 'Electr�nicos', 
    @estados_idestados = 1;



EXEC NuevaCategoriaProducto 
    @usuarios_idusuarios = 2, 
    @nombre = 'Ropa', 
    @estados_idestados = 2;

EXEC NuevaCategoriaProducto 
    @usuarios_idusuarios = 2, 
    @nombre = 'Alimentos', 
    @estados_idestados = 1;

EXEC NuevaCategoriaProducto 
    @usuarios_idusuarios = 2, 
    @nombre = 'Hogar', 
    @estados_idestados = 2;

EXEC NuevaCategoriaProducto 
    @usuarios_idusuarios = 2, 
    @nombre = 'Juguetes', 
    @estados_idestados = 1;


--- NUEVO PRODUCTO
EXEC NuevoProducto 
    @CategoriaProductos_idCategoriaProductos = 1, 
    @usuarios_idusuarios = 3, 
    @nombre = 'Smartphone', 
    @marca = 'Samsung', 
    @codigo = 'ABC123', 
    @stock = 50, 
    @estados_idestados = 1, 
    @precio = 599.99, 
    @foto = 0x89504e470d0a1a0a0000000d4948445200000336000001c30806000000f68f8fc2000000017352474200aece1ce90000000467414d410000b18f0bfc6105000000097048597300000ec300000ec301c76fa864000084e249444154785eedbd7fb35c5756deff7d2be00937c3041232147353548521a9a452352455219626bf08a9fc2089258b50815024361155c49633e349c6ca80c09243ccd8a494196b0858b2676c298ced8c250396184b802c84258125b0de437ff339aea7b3eed23adde7f6dd57dda7eff3c7a7bacf5e6bafbdf6deadeef5dc7dbaf5ff7dcbb77ccbc418638c31c61863c68c858d31c618638c3166f458d818638c31c61863468f858d31c618638c3166f458d818638c31c61863468f85cd8a71e1c2858ecab62a1c39726472fbf6edc98913274afb6ec2da5cb97265b26fdfbe0e9e9f3973a6b3e97a37d78fb9dfbc79b37bacec6675f8b55ffbb5c99ffee99f4e7ef9977f79f2addffaada5cf6e71fcf8f1c9ddbb77bbd7e6fd1efb7ec0bfb577de796772e3c68dc94ffcc44face51c8d31c68c8fa5089b03070e74c5211ffc91552fe8ef07631036e4273171bf616c0b9bc5f9c4273ed115ddbff77bbf37f9933ff993eedf1d8fbff33bbf33f987fff01f967dc6caaffeeaaf4e05f82a0b1bde0fbffef5af4ffee88ffe68fa5ec8f32f7ef18b2b2b18f8b776e9d2a5c9b56bd726fffa5fff6b0b1b638c312bc15285cd227ff1cfc5ecbab1eac2863d93b0a8ecad18b2cfcb782d8c59d8205cde7efbeda99861edbef18d6f7405eabbefbedbfdbbacfaad3a9ffad4a726afbefaeae4f77ffff757660e4385cdd34f3fdd892f7c6fddbad5fddb3f7ffe7c2718fed7fffa5fa3120cbcbede7cf3cdeef5b47ffffed2c718638cd94d2c6c568c551736f70b0b9bb67cec631f9bbcf6da6b5d01fd9bbff99b93bffff7ff7ee93746781d5cbe7cb9db9783070f963ef79b21c2e63ffc87ffd09dccbcfffefb935ff8855f98fcb93ff7e74abfb1f0d0430f75b7a6f16fd2c2c61863cc3258596143714f6120f0a598d45f37452c6a791e6d5920a810969d587d05ea3c5fcda1cfce73cd31facd2bc22b61d3725ecaebd4a953d3b5e49af990ab62a82df6adf644b6ede4403f7ce9a3b6f89aa09f72135ab7b83e1a53b6789df38928ef3c4ece09e2dae3cbba91679cdbbcd702c4b585bc8799bce771ad79aeb58af9479f0c45f41ffff11f4f7ef7777f77ee2d677feb6ffdadeeb4801304e2ea56b5471e7964eaa3fc9e7ffef94e30e10367cf9e9dfcd5bffa57273ffff33fdf7dbfe5b77eebb726dff77ddf37ed77faf4e9c9071f7cd0f5e39adb987efbb77fbbeb4b3bf9691cf64282e5e8d1a3dd890c3e88014e3af0a95e2bf823709423eb227171f8f0e16e2e8c878d3972cb1a390f195371fef13ffec793fffdbfff77274a88433cd641af9f21c2067fd668de2d67dc3ef8ecb3cf4eae5fbfdee502e4f55ffecb7f99f6e3352851413cf2c58fefc11c3a74684b1b6bccba2fda8f31e33ab1d6ac313ecc59101381439edcfa881dbef9cd6f4e7ee8877ea8db3bd6ef99679e99397f638c3166282b296c28066291899f7c69c3864fec43a1484c6247bf182716c540919a0b5031cb57c554cc81fcf830579ef2893961ab8ade481e97e72de7a5bcd45ff15488c4b618937ec4d5759ecb7672a06fcc1ff26b423954fbac71b24f5f9f3e1bb72fe5758d73c037aebd728cf3d67ac6b8cc21bf16e8a73ec4616cf96788452ee4c4b5c6503cc58f3e39d7cc2ffdd22f757d5e78e185d22e28f0b93d8d0294c21501f2faebaf7785fb1ffee11f4e7efcc77fbcf3633ce2210cb8fd0871c073fad107f174f5ead5ae68a640a68fd69802fd5ffecb7fd9c522e67befbd37f9f297bfdcc11cb0ffe88ffe68e74f0e8c4d9c5ffff55f9fe6c2587c691d81f1dc73cf757d2892bff4a52f75020471a61c592f0ae7cf7ce6339d0f7cf5ab5f9dfccffff93fbb5bbec819c1c589c9bc31ffedbffdb7dd5c1e7ffcf1aed0ffca57bed28d8f5862ac575e79a51b6b9eb0f9bb7ff7ef76fdffe00ffe60f2233ff223f7d805276d2fbef8629723b99233b96b1e9ffdec67bbf8ec3bf9deb973a7133df8717b2139b036f42557e589e0fce4273fb9703fad13fb85b0618f597b72a2dfaffccaaf74c2f0f39fff7c278c9827b1815bd5e8c3eb1a7f0b1b638c31ad58a91f0f50e1968be4888a230a06b5e5c2b16aaffaf531cfb72fbfd8ce98b118852139e4182de705554c728cc5badaf0eb2b94b587f86d3707fae04f3fb5c5785cf7c58ceb937d66e5419f3c66867ef2c9f988bc7e319f486c9fb796117c2826e35e408e97f7ab2f5fc1dce2bfb13e9e7cf2c9aec8e5bb383ac500840bfdb5b68a8740a3f8a68d0295021c2140a1fab5af7dadbba61d3bf992f71b6fbcd18908440085edcffccccf4cc74124101771c43e503c930f053276c6e23b289c74702a449bfc987fbc150db1a239736ac42d78311620b028ba29eea398921ff3c863d2c6298ae60d3ff9933fd98d8f00f8811ff8816e4cad5755b4b35f8cc9eb6dd66d5b8837e22236fee93ffda7d3f663c78e75f9f09a602d150f11c189176322c2e8cb5c3ef7b9cf756d081084a404d5d07e0f3ffcf0967e79cdf1a96e45fbc55ffcc52ecfdff88ddf986c6e6e766d79ed8c31c69856ace4898d0aa05cbc011fa8b978254e55b4ca57e3a8d8606c7288be993edf1c3312f3206ffac6fcabdc33b9806d3daf2a2ffae7be551b7dd813c6128be4806f9e177de8ab787d6b15d727fbf4f52166f55a0262c5f9282f7c1118792e71fd349e728ec439ca8ff8b3f61eaa3516f17591d739af5f86931a62e816b03e38a1c08f139ed8aebc9403f3c02f8e177d2874112c08170919fa502c239efef6dffedbd335a9c0977553f11ce71a050bd7d1af4fd82060381de296a8bff7f7feded407102d7a7d0c89c5dc3811622d397de02487131deccc89a21e3fcd03ff381efcf37ffecfbbd71782e5877ff887efb10b8401e2f0a5975eda1287f58822225f479f38469e5fd54f026556bf7cdd276cfec93ff927dd9ab316ac13ebf80ffec13fe86cc618634c6b56fac703541cc4a2940f543e386381881f6dd8d4167df3382acac8815ca22d937dfb6242cc837ce9a3bca1ca3d4351180bd8d6f3aaf2224eee93dbc829ee03edd817c9a19a578ed7b756717db24fd5a72f4fe6110b75a09ff2c2de4ad8a84db9b03e795ea26fdc08b1f3faf6cd5370fa40f14d214e515ef9404b61c3387c9f825b937eeaa77eaa5b0fae69d7da51ec3ef6d8635dfe11eca0e299368db36c61c3e90f628df5e4748a366e73632ecc6988b02106a762c4d02950f68116c226b6e5f9553e9540c9fdf2759fb0014efeb8350fa1c45cd807ffdf37c618637683951636c007281f942a04f3355090108f47b5cd6a87ede4907d63711d89edd5d855ee99793166b5c3bc79557df1a58dbe555b1573d638f372a8c6231f8a4bf5e95babb83e435e1bd13f820fbef4a9da723e826b15c15cf7c5ef6b876a6c316feda05abf79fd1013881a0a4b6e01eb1337fad23fb9c75bd14e9e3cd915eadc92c6357388e202b466f455d1caa906f128ccb1a93fc42fcfab2dc2faa8788e735d44d8f093d0cc9f1cf85e8a7cb8bd8b821bf1f5affed5bf1a148b5c7201cf776e88ad36fcf0679dfa0af89ffbb99feb840db778fdeccffe6ce9f7d33ffdd3dd6d627c1f872fdcab9defafd057a761554e555b9e5fe5d352d8f01ae2d6339e73fb19dfd7615d3841b4b031c618d39a951436d597ba291064af8a46ae8999fbc98f6b7eb18947ae67e530cf57055ccc091b6d2a7879a48fae4139c57e993cb796f3822a2f7ce318b9adca9bf155e86d3707d9154ff1154f7e792d725bce2b5ff398e725f29c590f15a69a07e3441fe59df779de6b81eb382f7ce338993c2ec41f63c8b983728be364f4657dd659a737fc5000b950dc1303c173f1e2c54e0051b8224cf4e5794e92fec5bff8175d2ce690f74b6b41fe2a5af9cb3c2719826bf97352c3ad6ac4660c7ef90b01c48f11b036a0e239ce350b1b9d7e90336363e78426e6483e12128c997f3c802fbee313c7ec1336ba8d8c58e4cb8f1ee89ab5a4a8c70f7f72e82be029f4f5c30080b8e2f48839b04ffc321da285efa760670c72d68f07b09efcca1bf1599f650b9b7ff48ffe51f78311ac03ef079cfe2164f1e375045aa7fffa5fff6bf77a611efef100638c31ad58a91f0fa00d1b1fecb13d168da0022adb66f5e383980fea688f455964886fcc01947bb4d3c6a3da1437cf27c21c20b7c55c169d175479e19ff3cf6d79be14dad8f1db6e0e805dbec4d578b15f1c53738eeb93d7335ee77c231a23ae2bfd28c678240ef6eca3fc788ceb97c78aeb0671ae90c7a8c87bae3983728863f03caf5f05ff7fcdb973e7ba5300c5e667a0f9cbbf727af0c1073b1f8a4eec14a2880d0a5ec5618db1c5f1b40ee4aa4295e29d625d73a050973f206ef493caf890d7cb2fbfdc8915f251f11ce79a850d70628230a09d789cc4c41c950f3f3dacf12426fefb7fffefd3bce2987dc2865814e614ffb411835bade8c3de0e1536c0fa709b20b7c8b1cef4e11101f0852f7ca1ebcba907271d0819d9f99182471f7d741a9bf559b6b0c18f5be7c893b5e517d45807d6a75a6ff6ccc2c618634c4b96226c8c31c618638c31a6251636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d16361638c31c618638c193d1636c618638c31c698d1b37461f397fed25f9a7cea539f9a3cf8e083937dfbf619638c31c618b3b650f352fb52037febb77e6b591f9bc5589ab0f9b37ff6cf769b0adff77ddfd76deee6e6a65961f8c758b51b638c31c6986150f3fee5bffc97277ff36ffecdae0efee8473f5ad6ca66fb2c4dd8b0917fedaffdb572c3cd6a6261638c31c618d38ebff137fe465713fbe4a60d4b1136bafdacda60b3ba58d818638c31c6b4e5077ee0077c5b5a2396226c74fb59b5b96675b1b031c618638c69cb273ff9499fda346229c2862f4df93b35e3c3c2c618638c31a62ddffbbddf3bf93b7fe7ef58d8346029c2c605f238f1be19638c31c6b4873ffa5bd8ec1c0b1b3318ef9b31c618634c7b2c6cda60616306e37d33c618638c698f854d1b2c6ccc60bc6fc618638c31edb1b06983858d198cf7cd18638c31a63d16366db0b03183f1be19638c31c6b4c7c2a60da31036cf3ffffce4eeddbb25b76edd9a1c3e7c78f2d24b2f4d2e5fbe3cf9b11ffbb13286d9398b089b7ff7effe5db747daaf0f3ef860f2eebbef4e7ef1177fb1f4df0dbefffbbf7ff2ca2baf4c7ef7777f7772f0e0c1d247e0ebd79231c61863ee2716366d1885b079e4914726274f9eecb878f1e2e44ffee44f26afbefa6a77fdc52f7e71f2e33ffee3930b172e4cde7befbdc9a38f3e5ac6303b6727c2e6ead5abdd7efdfaaffffae4e6cd9b93f7df7f7ff2e4934f967d5ac3b857ae5c99fce88ffe68698ffce00ffee03dafa5975f7eb91363cc25fb1b638c31c6ec140b9b368cee563404cd9d3b7726478f1e2ded66f7d889b0f9eddffeed69dbd34f3fdd89d3175f7c718befaa42eeccc1c2c618638c31bb81854d1bd646d8c4e253c534a73bdc56843f85f437bef18dc93ffb67ffacf3dfbf7f7f67c38f5ba4b2dddc4b2b61f3852f7ca1db13848decefbcf3cee4d2a54bd3bdfda99ffaa9c96ffee66f76fba25b0ebff4a52f75b78a1143fbfd2bbff22bdde98a6e713b72e4c8741c9e734b1931b0ffe11ffee1e4f8f1e39ded539ffa54b7ffb76fdfeee2f388e08ab17ffee77f7ef2fbbffffbd3dbe840f39815db18638c31663b58d8b461ad850d45e7ebafbfdef9fe9ffff37fba0294feface05f6af7ffdeb93cf7dee7393dff88ddfe8aeb90d89db91626cf3212d840ddf5b4170222458f7b857122e7c0fe6f77eeff7baf62f7ff9cbddfe4944f07d2be210ef4ffff44fbbefcd2048bef295af743111223ff2233f32f9999ff999c98d1b37267ff0077f30f9e55ffee5ce87e7f83cf5d453935ffaa55feafaf3fac0f7ecd9b393679f7d761a9bb1f9eed6bff937ff66f23bbff33bddf5e73ffff92eb779b13577638c31c6982158d8b461ad850ddfabf8e11ffee1ce7ee8d0a1aef8a460a62fdff3e084402286821a51f3477ff447939ffdd99fdd12db7cc84e844d3cf540a020445873d9112e3ff4433fd4f5e17b53880e448de2fce44ffe647732f3cd6f7eb3db33f65be2483eafbdf65af7da40807cf5ab5fedc63976ecd8d48e2f7df08bc206b1422e9ce2e0175f4bd5f5bcd86a33c618638c1982854d1bd65ad8d0263b7fc5e7aff9f03ffec7ffe862102bc6e88b6d3e6427c2463f1ec06d681230d11ef70ae190f721ee1fcfb3d880b87fdcc696ed712c6e45d4389ce42172f5e3023976be9e175b6dc618638c3143b0b069c35a0b1bfd751f;

GO

EXEC NuevoProducto 
    @idProductos = 2, 
    @CategoriaProductos_idCategoriaProductos = 2, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Camiseta', 
    @marca = 'Nike', 
    @codigo = 'DEF456', 
    @stock = 100, 
    @estados_idestados = 1, 
    @precio = 29.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto 
    @idProductos = 3, 
    @CategoriaProductos_idCategoriaProductos = 3, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Pan', 
    @marca = 'Bimbo', 
    @codigo = 'GHI789', 
    @stock = 200, 
    @estados_idestados = 1, 
    @precio = 1.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto 
    @idProductos = 4, 
    @CategoriaProductos_idCategoriaProductos = 4, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Silla', 
    @marca = 'IKEA', 
    @codigo = 'JKL012', 
    @stock = 30, 
    @estados_idestados = 1, 
    @precio = 120.50, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto 
    @idProductos = 5, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Triciclo', 
    @marca = 'FisherPrice', 
    @codigo = 'MNO345', 
    @stock = 15, 
    @estados_idestados = 1, 
    @precio = 89.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 6, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Patineta', 
    @marca = 'Razor', 
    @codigo = 'PQR678', 
    @stock = 20, 
    @estados_idestados = 1, 
    @precio = 59.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 7, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Bicicleta', 
    @marca = 'Trek', 
    @codigo = 'STU901', 
    @stock = 12, 
    @estados_idestados = 1, 
    @precio = 299.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 8, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Skateboard', 
    @marca = 'Element', 
    @codigo = 'VWX234', 
    @stock = 18, 
    @estados_idestados = 1, 
    @precio = 49.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 9, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Ciclomotor', 
    @marca = 'Yamaha', 
    @codigo = 'YZA567', 
    @stock = 8, 
    @estados_idestados = 1, 
    @precio = 1599.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 10, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Patines', 
    @marca = 'K2', 
    @codigo = 'BCD123', 
    @stock = 25, 
    @estados_idestados = 1, 
    @precio = 79.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 11, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Silla de Paseo', 
    @marca = 'Chicco', 
    @codigo = 'DEF456', 
    @stock = 10, 
    @estados_idestados = 1, 
    @precio = 120.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 12, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Andador', 
    @marca = 'FisherPrice', 
    @codigo = 'GHI789', 
    @stock = 14, 
    @estados_idestados = 1, 
    @precio = 99.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 13, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Bicicross', 
    @marca = 'GT', 
    @codigo = 'JKL101', 
    @stock = 9, 
    @estados_idestados = 1, 
    @precio = 109.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 14, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Tienda de juegos', 
    @marca = 'Hasbro', 
    @codigo = 'MNO102', 
    @stock = 30, 
    @estados_idestados = 1, 
    @precio = 29.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 15, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Mu�eca', 
    @marca = 'Mattel', 
    @codigo = 'PQR202', 
    @stock = 18, 
    @estados_idestados = 1, 
    @precio = 49.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 16, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Cohete de juguete', 
    @marca = 'SpaceX', 
    @codigo = 'STU303', 
    @stock = 6, 
    @estados_idestados = 1, 
    @precio = 129.99, 
    @foto = 0xFFD8FFD;

EXEC NuevoProducto  
    @idProductos = 17, 
    @CategoriaProductos_idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Lego City', 
    @marca = 'LEGO', 
    @codigo = 'VWX404', 
    @stock = 20, 
    @estados_idestados = 1, 
    @precio = 59.99, 
    @foto = 0xFFD8FFD;

--- NUEVA ORDEN
EXEC NuevaOrden @idOrden = 1, @usuarios_idusuarios = 3, @estados_idestados = 7, 
    @nombre_completo = 'Cliente Orden 1', @direccion = 'Calle 1', @telefono = '1111111111', 
    @correo_electronico = 'cliente1@correo.com', @fecha_entrega = '2024-10-08';

EXEC NuevaOrden @idOrden = 2, @usuarios_idusuarios = 3, @estados_idestados = 7, 
    @nombre_completo = 'Cliente Orden 2', @direccion = 'Calle 2', @telefono = '2222222222', 
    @correo_electronico = 'cliente2@correo.com', @fecha_entrega = '2024-11-08';

EXEC NuevaOrden @idOrden = 3, @usuarios_idusuarios = 3, @estados_idestados = 7, 
    @nombre_completo = 'Cliente Orden 3', @direccion = 'Calle 3', @telefono = '3333333333', 
    @correo_electronico = 'cliente3@correo.com', @fecha_entrega = '2024-12-12';

EXEC NuevaOrden @idOrden = 4, @usuarios_idusuarios = 4, @estados_idestados = 10, 
    @nombre_completo = 'Cliente Orden 4', @direccion = 'Calle 4', @telefono = '4444444444', 
    @correo_electronico = 'cliente4@correo.com', @fecha_entrega = '2024-12-13';

EXEC NuevaOrden @idOrden = 5, @usuarios_idusuarios = 4, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 5', @direccion = 'Calle 5', @telefono = '5555555555', 
    @correo_electronico = 'cliente5@correo.com', @fecha_entrega = '2024-08-08';
EXEC NuevaOrden @idOrden = 5, @usuarios_idusuarios = 4, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 5', @direccion = 'Calle 5', @telefono = '5555555555', 
    @correo_electronico = 'cliente5@correo.com', @fecha_entrega = '2024-08-08';

EXEC NuevaOrden @idOrden = 6, @usuarios_idusuarios = 5, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 6', @direccion = 'Calle 6', @telefono = '6666666666', 
    @correo_electronico = 'cliente6@correo.com', @fecha_entrega = '2024-08-12';

EXEC NuevaOrden @idOrden = 7, @usuarios_idusuarios = 6, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 7', @direccion = 'Calle 7', @telefono = '7777777777', 
    @correo_electronico = 'cliente7@correo.com', @fecha_entrega = '2024-08-18';

EXEC NuevaOrden @idOrden = 8, @usuarios_idusuarios = 6, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 8', @direccion = 'Calle 8', @telefono = '8888888888', 
    @correo_electronico = 'cliente8@correo.com', @fecha_entrega = '2024-08-21';

EXEC NuevaOrden @idOrden = 9, @usuarios_idusuarios = 7, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 9', @direccion = 'Calle 9', @telefono = '9999999999', 
    @correo_electronico = 'cliente9@correo.com', @fecha_entrega = '2024-08-08';

EXEC NuevaOrden @idOrden = 10, @usuarios_idusuarios = 7, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 10', @direccion = 'Calle 10', @telefono = '1010101010', 
    @correo_electronico = 'cliente10@correo.com', @fecha_entrega = '2024-08-13';

EXEC NuevaOrden @idOrden = 11, @usuarios_idusuarios = 7, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 11', @direccion = 'Calle 11', @telefono = '1111111111', 
    @correo_electronico = 'cliente11@correo.com', @fecha_entrega = '2024-08-18';

EXEC NuevaOrden @idOrden = 12, @usuarios_idusuarios = 3, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 12', @direccion = 'Calle 12', @telefono = '2222222222', 
    @correo_electronico = 'cliente12@correo.com', @fecha_entrega = '2024-08-10';

EXEC NuevaOrden @idOrden = 13, @usuarios_idusuarios = 3, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 13', @direccion = 'Calle 13', @telefono = '3333333333', 
    @correo_electronico = 'cliente13@correo.com', @fecha_entrega = '2024-08-15';

EXEC NuevaOrden @idOrden = 14, @usuarios_idusuarios = 7, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 14', @direccion = 'Calle 14', @telefono = '4444444444', 
    @correo_electronico = 'cliente14@correo.com', @fecha_entrega = '2024-08-18';

EXEC NuevaOrden @idOrden = 15, @usuarios_idusuarios = 8, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 15', @direccion = 'Calle 15', @telefono = '5555555555', 
    @correo_electronico = 'cliente15@correo.com', @fecha_entrega = '2024-08-22';

EXEC NuevaOrden @idOrden = 16, @usuarios_idusuarios = 9, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 16', @direccion = 'Calle 16', @telefono = '6666666666', 
    @correo_electronico = 'cliente16@correo.com', @fecha_entrega = '2024-08-25';

EXEC NuevaOrden @idOrden = 17, @usuarios_idusuarios = 10, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 17', @direccion = 'Calle 17', @telefono = '7777777777', 
    @correo_electronico = 'cliente17@correo.com', @fecha_entrega = '2024-08-28';

EXEC NuevaOrden @idOrden = 18, @usuarios_idusuarios = 2, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 18', @direccion = 'Calle 18', @telefono = '8888888888', 
    @correo_electronico = 'cliente18@correo.com', @fecha_entrega = '2024-08-30';

EXEC NuevaOrden @idOrden = 19, @usuarios_idusuarios = 1, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 18', @direccion = 'Calle 18', @telefono = '8888888888', 
    @correo_electronico = 'cliente18@correo.com', @fecha_entrega = '2024-08-30';

EXEC NuevaOrden @idOrden = 20, @usuarios_idusuarios = 9, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 20', @direccion = 'Calle 18', @telefono = '8888888888', 
    @correo_electronico = 'cliente18@correo.com', @fecha_entrega = '2024-08-30';

EXEC NuevaOrden @idOrden = 21, @usuarios_idusuarios = 10, @estados_idestados = 6, 
    @nombre_completo = 'Cliente Orden 21', @direccion = 'Calle 18', @telefono = '8888888888', 
    @correo_electronico = 'cliente18@correo.com', @fecha_entrega = '2024-08-30';
	

--- NUEVA ORDEN DETALLE
EXEC NuevaOrdenDetalle @idOrdenDetalles = 1, @Orden_idOrden = 5, @Productos_idProductos = 1, @cantidad = 10;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 2, @Orden_idOrden = 6, @Productos_idProductos = 2, @cantidad = 15;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 3, @Orden_idOrden = 7, @Productos_idProductos = 3, @cantidad = 7;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 4, @Orden_idOrden = 8, @Productos_idProductos = 4, @cantidad = 12;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 5, @Orden_idOrden = 9, @Productos_idProductos = 5, @cantidad = 5;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 6, @Orden_idOrden = 10, @Productos_idProductos = 6, @cantidad = 8;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 7, @Orden_idOrden = 11, @Productos_idProductos = 7, @cantidad = 6;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 8, @Orden_idOrden = 12, @Productos_idProductos = 8, @cantidad = 10;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 9, @Orden_idOrden = 13, @Productos_idProductos = 9, @cantidad = 15;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 10, @Orden_idOrden = 14, @Productos_idProductos = 10, @cantidad = 7;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 11, @Orden_idOrden = 15, @Productos_idProductos = 11, @cantidad = 5;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 12, @Orden_idOrden = 16, @Productos_idProductos = 12, @cantidad = 10;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 13, @Orden_idOrden = 17, @Productos_idProductos = 13, @cantidad = 8;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 14, @Orden_idOrden = 18, @Productos_idProductos = 14, @cantidad = 10;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 15, @Orden_idOrden = 19, @Productos_idProductos = 14, @cantidad = 10;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 16, @Orden_idOrden = 20, @Productos_idProductos = 14, @cantidad = 10;
EXEC NuevaOrdenDetalle @idOrdenDetalles = 17, @Orden_idOrden = 21, @Productos_idProductos = 14, @cantidad = 10;


--------------------------
--- EJECUTAR PROCEDIMIENTOS
---	'UPDATE'
--------------------------

--- ACTUALIZAR ESTADO
EXEC ActualizarEstado
    @idestados = 17,
    @nombre = 'estado actualizado'
GO

--- ACTUALIZAR ROL
EXEC ActualizarRol
    @idrol = 2,
    @nombre = 'Gerente actualizado'
GO



--- ACTUALIZAR CLIENTE
EXEC ActualizarCliente 
    @idClientes = 1, 
    @razon_social = 'Compa��a XYZ', 
    @nombre_comercial = 'XYZ Tech', 
    @direccion_entrega = 'Avenida Siempre Viva 742', 
    @telefono = '555-1234', 
    @correo_electronico = 'contacto@xyztech.com';
Go

EXEC ActualizarCliente 
    @idClientes = 2, 
    @telefono = '5557654321', 
    @correo_electronico = 'nuevoemail@empresa.com';
GO


--- ACTUALIZAR USUARIO
EXEC ActualizarUsuario 
    @idusuarios = 2, 
    @rol_idrol = 2, 
    @estados_idestados = 2, 
    @correo_electronico = 'nuevo_usuario@correo.com', 
    @nombre_completo = 'Usuario Actualizado', 
    @password = 'nuevo_password123', 
    @telefono = '123-456-7890', 
    @fecha_nacimiento = '1990-05-15';
GO

EXEC ActualizarUsuario 
    @idusuarios = 1, 
    @telefono = '5559876543', 
    @nombre_completo = 'Usuario Actualizado'
GO

--- ACTUALIZAR PRODUCTO
EXEC ActualizarProducto 
    @idProductos = 4, 
    @CategoriaProductos_idCategoriaProductos = 2, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Bicicleta de Monta�a', 
    @marca = 'Giant', 
    @codigo = 'ABC123', 
    @stock = 20, 
    @estados_idestados = 4, --- 'Agotado'
    @precio = 599.99
GO

EXEC ActualizarProducto 
    @idProductos = 1, 
    @stock = 45, 
	@CategoriaProductos_idCategoriaProductos = 1,
    @estados_idestados = 3, -- 'Suspendido'
	@precio = 199.99
GO


--- ACTUALIZAR CATEGORIA PRODUCTO
EXEC ActualizarCategoriaProducto 
    @idCategoriaProductos = 1, 
    @nombre = 'Electr�nica de Consumo';
GO

EXEC ActualizarCategoriaProducto
    @idCategoriaProductos = 5, 
    @usuarios_idusuarios = 2, 
    @nombre = 'Electr�nica de Consumo', 
    @estados_idestados = 1, 
    @fecha_creacion = '2024-10-10'
GO


--- ACTUALIZAR ORDEN
EXEC ActualizarOrden 
    @idOrden = 10, 
    @usuarios_idusuarios = 3, 
    @estados_idestados = 2, 
    @fecha_creacion = '2024-12-08',
    @nombre_completo = 'Cliente Actualizado', 
    @direccion = 'Nueva Direcci�n 123', 
    @telefono = '987-654-3210', 
    @correo_electronico = 'cliente@correo.com', 
    @fecha_entrega = '2024-12-15';
GO

EXEC ActualizarOrden 
    @idOrden = 1, 
    @fecha_entrega = '2024-09-2',
	@fecha_creacion = '2024-05-08'
GO



--- ACTUALIZAR ORDEN DETALLES
EXEC ActualizarOrdenDetalles 
    @idOrdenDetalles = 8, 
    @Productos_idProductos = 5, 
    @cantidad = 10;
GO

EXEC ActualizarOrdenDetalles 
    @idOrdenDetalles = 1, 
    @Productos_idProductos = 2, 
    @cantidad = 5;
GO


--------------------------
--- EJECUTAR PROCEDIMIENTOS
---	'INACTIVAR'
--------------------------

--- INACTIVAR PRODUCTO
EXEC InactivarProducto 
    @idProductos = 3
GO

--------------------------
--- VISTAS
--------------------------

---- PRODUCTOS ACTIVOS, STOCK > 0
CREATE VIEW Vista_ProductoActivo AS
SELECT COUNT(*) AS 'Productos activos'
FROM Productos p
INNER JOIN estados e ON p.estados_idestados = e.idestados
WHERE p.stock > 0 AND LOWER(e.nombre) = 'activo';
GO

CREATE VIEW Vista_TotalOrdenes_Agosto2024 AS
SELECT 
    CONCAT('Q ', FORMAT(CAST(SUM(o.total_orden) AS DECIMAL(10,2)), 'N2')) 
    AS Total_Quetzales
FROM Orden AS o
WHERE 
    MONTH(o.fecha_entrega) = 8 AND
    YEAR(o.fecha_entrega) = 2024;
GO


--- TOP 10 PRODUCTOS M�S VENDIDOS
CREATE VIEW Vista_Top10_Producto_Vendido AS
SELECT TOP 10
	p.nombre as 'Producto',
	SUM(od.cantidad) AS [Cantidad vendido]
FROM Orden as o
INNER JOIN OrdenDetalles as od
	ON o.idOrden = od.Orden_idOrden
INNER JOIN Productos as p
	ON od.Productos_idProductos = p.idProductos
GROUP BY 
	p.nombre
ORDER BY
	[Cantidad vendido] ASC;
GO

--- TOP 10 CLIENTES CON MAYOR CONSUMO DE ORDESNES DE TODOS EL HISTORICO
CREATE VIEW Vista_Top10_Cliente_Mayor_Cosumo AS
SELECT TOP 10
	u.nombre_completo as 'Cliente',
	SUM(o.total_orden) as [Consumo total]
FROM Orden as o
INNER JOIN usuarios as u
	ON o.usuarios_idusuarios = u.idusuarios
GROUP BY 
		u.nombre_completo
ORDER BY 
	[Consumo total] DESC;
GO

---------------------------------------------------
----	EJECUCI�N DE LAS VISTAS
----------------------------------------------------
SELECT * FROM Vista_ProductoActivo;

SELECT * FROM Vista_TotalOrdenes_Agosto2024;

SELECT * FROM Vista_Top10_Producto_Vendido;

SELECT * FROM Vista_Top10_Cliente_Mayor_Cosumo;

select * from productos