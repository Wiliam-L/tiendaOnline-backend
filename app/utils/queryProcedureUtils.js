export const queryProcedureNuevoUsers = () => {
  return `
    EXEC NuevoUsuario
      @rol_idrol = :rol_id, 
      @estados_idestados = :idestado,
      @correo_electronico = :correo, 
      @nombre_completo = :nombre, 
      @password = :password,
      @telefono = :telefono,
      @fecha_nacimiento = :fecha_nacimiento;
    `;
};
