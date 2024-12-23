import { Orden, OrdenDetalles } from "../model/order.js";

const crearOrdenConDetalles = async (ordenData, detallesData, transaction) => {
  try {
    const nuevaOrden = await Orden.create(
      {
        ...ordenData, 
        fecha_creacion: new Date(), 
      },
      { transaction }
    );

    // Crear los detalles de la orden dentro de la transacción
    const detallesOrden = detallesData.map((detalle) => ({
      ...detalle,
      Orden_idOrden: nuevaOrden.idOrden,
    }));

    await OrdenDetalles.bulkCreate(detallesOrden, { transaction });

    return nuevaOrden;
  } catch (error) {
    console.log(error.name);
    throw error;
  }
};

export default crearOrdenConDetalles;
