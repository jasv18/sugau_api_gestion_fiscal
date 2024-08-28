const dataTableToExclude = ['cxp_dc_cargos','cxp_dc_scg','cxp_dc_spg','cxp_sol_dc','cxp_dt_solicitudes','cxp_historico_rd','cxp_historico_solicitud','cxp_rd_scg','cxp_rd_spg','cxp_rd_deducciones','cxp_rd_cargos','cxp_rd','cxp_sol_banco','cxp_sol_dc','scb_prog_pago','cxp_solicitudes','scb_dt_cmp_ret','scb_cmp_ret','scb_conciliacion','scb_movbco_fuefinanciamiento','scb_movbco_scg','scb_movbco_spg','scb_movbco_spi','scb_dt_movbco','scb_movbco','scg_dt_cmp','scg_dtmp_cmp','scg_saldos','sep_cuentagasto','sep_dta_cargos','sep_dt_articulos','sep_dts_cargos','sep_dt_servicio','sep_solicitudcargos','soc_enlace_sep','siv_dt_despacho','siv_despacho','soc_solcotsep','sep_dtc_cargos','sep_dt_concepto','sep_solicitud','soc_serviciocargo','siv_cargosarticulo','siv_dt_recepcion','siv_recepcion','siv_dt_movimiento','siv_movimiento','sep_conceptocargos','spg_dt_cmp','spi_dt_cmp','spg_dtmp_cmp','sigesp_cargos','sigesp_cmp','sigesp_cmp_md','sigesp_histcargosservicios','sigesp_histcargosarticulos','soc_dtcot_bienes','soc_dtac_bienes','soc_dtac_servicios','soc_dtcot_servicio','soc_cotizacion','soc_cotxanalisis','soc_cuentagasto','soc_dta_cargos','soc_dt_bienes','soc_dts_cargos','soc_dt_servicio','soc_dtsc_bienes','soc_dtsc_servicios','soc_enlace_sep','soc_solicitudcargos','soc_ordencompra','soc_serviciocargo','soc_servicios','soc_analisicotizacion','soc_sol_cotizacion','soc_cotizacion','spi_cuentas_estructuras','spg_cuentas','spg_cuenta_fuentefinanciamiento','spg_dt_cmp','spi_cuentas','spi_dtmp_cmp','sno_hsubnomina','sno_hsalida','sno_hresumen','sno_hprimasdocentes','sno_hprimadocentepersonal','sno_hprimaconcepto','sno_hprestamosperiodo','sno_hprestamosamortizado','sno_hprestamos','sno_htipoprestamo','sno_hprenomina','sno_hconceptopersonal','sno_hconstantepersonal','sno_hpersonalnomina','sno_hunidadadmin','sno_hpersonalpension','sno_hconstante','sno_hconcepto','sno_hclasificacionobrero','sno_hcargo','sno_hasignacioncargo','sno_hgrado','sno_htabulador','sno_hperiodo','sno_hproyecto','sno_hnomina','sno_thperiodo','sno_thconstante','sno_thclasificacionobrero','sno_thpersonalnomina','sno_thprenomina','sno_thprestamos','sno_thprestamosperiodo','sno_thcodigounicorac','sno_thprimaconcepto','sno_thprimadocentepersonal','sno_thprimasdocentes','sno_thresumen','sno_thsalida','sno_thsubnomina','sno_thtabulador','sno_thtipoprestamo','sno_thunidadadmin','sno_thasignacioncargo','sno_thcargo','sno_thconcepto','sno_thconceptopersonal','sno_thconstantepersonal','sno_thconcepto','sno_thgrado','sno_thnomina','sno_trabajoanterior','sno_thvacacpersonal','sno_thtipoprestamo','sno_thprestamosamortizado','sno_thproyectopersonal','sno_thsubnomina','sno_thproyecto','sss_registro_eventos','sno_conceptopersonal','sno_constantepersonal','sno_salida','sno_resumen','sno_personalpension','sno_prestamosamortizado','sno_prestamosperiodo','sno_prestamos','sno_personalnomina','sno_asignacioncargo','sno_grado','sno_periodo','sno_tabulador','sno_banco','sno_prenomina','sno_primadocentepersonal','sno_subnomina','sno_banco','sno_cargo','sno_conceptopersonal','sno_concepto','sno_constante','sno_dt_scg','sno_dt_spg','sno_tipoprestamo','sno_nomina','sno_periodo','sno_tabulador','sno_personalnomina','sno_banco','sno_prenomina','sno_primadocentepersonal','sno_subnomina','sno_tipoprestamo','sno_cestaticunidadadm','sno_unidadadmin','spg_ep5','spg_ep4','spg_ep3','spg_ep2','spg_ep1','spg_dt_unidadadministrativa','spg_unidadadministrativa','spg_dt_fuentefinanciamiento','sss_derechos_usuarios','sss_permisos_internos']
const payrollTables = ['sno_nomina','sno_dt_scg','sno_dt_spg','sno_banco','sno_constante','sno_subnomina','sno_tabulador','sno_cargo','sno_periodo','sno_concepto','sno_tipoprestamo','sno_grado','sno_asignacioncargo','sno_personalnomina','sno_constantepersonal','sno_personalpension','sno_primadocentepersonal','sno_conceptopersonal','sno_prestamos','sno_prestamosperiodo','sno_prestamosamortizado','sno_resumen','sno_prenomina','sno_salida']

const tableData = [
  { table_name: 'spg_ep1', where_clause: "denestpro1 = 'POR DEFECTO'" },
  { table_name: 'spg_ep2', where_clause: "denestpro2 = 'POR DEFECTO'" },
  { table_name: 'spg_ep3', where_clause: "denestpro3 = 'POR DEFECTO'" },
  { table_name: 'spg_ep4', where_clause: "denestpro4 = 'POR DEFECTO'" },
  { table_name: 'spg_ep5', where_clause: "denestpro5 = 'POR DEFECTO'" },  
  { table_name: 'spg_unidadadministrativa', where_clause: "coduniadm = '----------'" },
  { table_name: 'spg_dt_unidadadministrativa', where_clause: "coduniadm = '----------'" },
  { table_name: 'spg_dt_fuentefinanciamiento', where_clause: "estcla = '-'" },
  { table_name: 'sss_permisos_internos', where_clause: "codintper ='---------------------------------'" },
  { table_name: 'sss_derechos_usuarios', where_clause: "codintper ='---------------------------------'" }
]

export const getSchemaSpecifics = ( payrolls = []) => {
  let tableDataToInclude
    if (!payrolls || payrolls.length === 0) {
      tableDataToInclude = JSON.parse(JSON.stringify(tableData))
      return { dataTableToExclude, tableDataToInclude }
    }
    const stringPayrolls = payrolls.map(value => `'${value}'`).join(',')
    tableDataToInclude = JSON.parse(JSON.stringify(tableData))
    tableDataToInclude.push(
      { table_name: 'sno_unidadadmin', where_clause: `(codemp, minorguniadm, ofiuniadm, uniuniadm, depuniadm, prouniadm) IN (SELECT codemp, minorguniadm, ofiuniadm, uniuniadm, depuniadm, prouniadm FROM sno_personalnomina WHERE (codnom IN (${stringPayrolls})))` }
    )
    const formatPayrollTableData = payrollTables.map( value => { return { table_name: value, where_clause: `(codnom in (${stringPayrolls}))`} })
    tableDataToInclude.push(...formatPayrollTableData)
    return { dataTableToExclude, tableDataToInclude }
}
