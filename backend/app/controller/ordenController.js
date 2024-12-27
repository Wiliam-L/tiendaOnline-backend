import sequelize from "../config/db.js";
import crearOrdenConDetalles from "../services/ordenService.js";
import Product from "../model/product.js";
import User from "../model/user.js";

const crearOrden = async (req, res, next) => {
  try {
    await sequelize.transaction(async (t) => {
      const {
        detalles,
        fecha_entrega,
        total_orden,
        direccion,
        nombre_completo,
        estado,
      } = req.body;

      // 2. Validar que los detalles sean válidos
      if (!detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Faltan detalles en la orden." });
      }

      // Validar que los detalles tengan los campos necesarios
      for (let detalle of detalles) {
        if (
          !detalle.Productos_idProductos ||
          !detalle.cantidad ||
          !detalle.precio
        ) {
          return res.status(400).json({
            error: "Cada detalle debe tener un producto, cantidad y precio.",
          });
        }
      }

      // 3. Validar que los campos obligatorios de la orden estén presentes
      if (
        !fecha_entrega ||
        !total_orden ||
        !direccion ||
        !nombre_completo ||
        !estado
      ) {
        return res.status(400).json({
          error:
            "Faltan datos obligatorios en la orden (fecha_entrega, total_orden, direccion, nombre_completo, estado).",
        });
      }

      // 4. Obtener el idusuario del usuario autenticado
      const { id } = req.user;

      // 5. Obtener los datos del usuario (correo, teléfono, etc.)
      const usuario = await User.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      // 6. Obtener la fecha de creación en formato compatible con SQL Server
      const fechaCreacion = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")
        .split(" ")[0]; // Elimina la zona horaria

      // 7. Agregar el idusuario, correo, teléfono, fecha de creación y otros datos a los datos de la orden
      const orden = {
        usuarios_idusuarios: id,
        correo_electronico: usuario.dataValues.correo_electronico,
        telefono: usuario.dataValues.telefono,
        direccion: direccion,
        nombre_completo: nombre_completo,
        fecha_creacion: fechaCreacion, // Fecha de creación en el formato adecuado
        fecha_entrega: fecha_entrega,
        total_orden: total_orden,
        estados_idestados: estado, // El estado de la orden es pasado desde el cuerpo de la solicitud
      };

      // 8. Validar que los productos existan
      for (let detalle of detalles) {
        const producto = await Product.findByPk(detalle.Productos_idProductos);
        if (!producto) {
          return res.status(404).json({
            error: `Producto con ID ${detalle.Productos_idProductos} no encontrado.`,
          });
        }
      }

      // 9. Crear la orden con los detalles dentro de la transacción
      await crearOrdenConDetalles(orden, detalles, t);
    });

    return res.status(201).json({ message: "Orden creada" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default crearOrden;
