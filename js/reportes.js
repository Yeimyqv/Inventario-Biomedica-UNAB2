/**
 * Módulo de Reportes para Laboratorista
 * Genera reportes detallados sobre préstamos, usuarios, docentes, materias y productos
 */

// Variables globales para reportes
let reporteActivo = null;
let datosReporte = null;

/**
 * Inicializar módulo de reportes
 */
function inicializarReportes() {
    console.log('Inicializando módulo de reportes...');
    
    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    const fechaInicio = document.getElementById('fecha-inicio-reporte');
    const fechaFin = document.getElementById('fecha-fin-reporte');
    
    if (fechaInicio) fechaInicio.value = haceUnMes.toISOString().split('T')[0];
    if (fechaFin) fechaFin.value = hoy.toISOString().split('T')[0];
    
    // Cargar reporte de préstamos por defecto
    generarReportePrestamos();
}

/**
 * Generar reporte de préstamos realizados
 */
async function generarReportePrestamos() {
    try {
        mostrarCargandoReporte();
        reporteActivo = 'prestamos';
        
        const filtros = obtenerFiltrosReporte();
        const params = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/reportes/prestamos?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        datosReporte = data;
        mostrarReportePrestamos(data);
        
    } catch (error) {
        console.error('Error generando reporte de préstamos:', error);
        mostrarError(`Error generando reporte: ${error.message}`);
    }
}

/**
 * Generar reporte de estudiantes
 */
async function generarReporteEstudiantes() {
    try {
        mostrarCargandoReporte();
        reporteActivo = 'estudiantes';
        
        const filtros = obtenerFiltrosReporte();
        const params = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/reportes/estudiantes?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        datosReporte = data;
        mostrarReporteEstudiantes(data);
        
    } catch (error) {
        console.error('Error generando reporte de estudiantes:', error);
        mostrarError(`Error generando reporte: ${error.message}`);
    }
}

/**
 * Generar reporte de docentes
 */
async function generarReporteDocentes() {
    try {
        mostrarCargandoReporte();
        reporteActivo = 'docentes';
        
        const filtros = obtenerFiltrosReporte();
        const params = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/reportes/docentes?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        datosReporte = data;
        mostrarReporteDocentes(data);
        
    } catch (error) {
        console.error('Error generando reporte de docentes:', error);
        mostrarError(`Error generando reporte: ${error.message}`);
    }
}

/**
 * Generar reporte de materias
 */
async function generarReporteMaterias() {
    try {
        mostrarCargandoReporte();
        reporteActivo = 'materias';
        
        const filtros = obtenerFiltrosReporte();
        const params = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/reportes/materias?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        datosReporte = data;
        mostrarReporteMaterias(data);
        
    } catch (error) {
        console.error('Error generando reporte de materias:', error);
        mostrarError(`Error generando reporte: ${error.message}`);
    }
}

/**
 * Generar reporte de productos más solicitados
 */
async function generarReporteProductos() {
    try {
        mostrarCargandoReporte();
        reporteActivo = 'productos';
        
        const filtros = obtenerFiltrosReporte();
        const limite = document.getElementById('limite-productos')?.value || 10;
        filtros.limite = limite;
        
        const params = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/reportes/productos?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        datosReporte = data;
        mostrarReporteProductos(data);
        
    } catch (error) {
        console.error('Error generando reporte de productos:', error);
        mostrarError(`Error generando reporte: ${error.message}`);
    }
}

/**
 * Obtener filtros del formulario
 */
function obtenerFiltrosReporte() {
    const filtros = {};
    
    const fechaInicio = document.getElementById('fecha-inicio-reporte')?.value;
    const fechaFin = document.getElementById('fecha-fin-reporte')?.value;
    const tipoUsuario = document.getElementById('tipo-usuario-filtro')?.value;
    const materia = document.getElementById('materia-filtro')?.value;
    const buscarEstudiante = document.getElementById('buscar-estudiante')?.value;
    const docenteFiltro = document.getElementById('docente-filtro')?.value;
    
    if (fechaInicio) filtros.fecha_inicio = fechaInicio;
    if (fechaFin) filtros.fecha_fin = fechaFin;
    if (tipoUsuario) filtros.tipo_usuario = tipoUsuario;
    if (materia) filtros.materia = materia;
    if (buscarEstudiante) filtros.buscar_estudiante = buscarEstudiante;
    if (docenteFiltro) filtros.docente = docenteFiltro;
    
    return filtros;
}

/**
 * Mostrar reporte de préstamos
 */
function mostrarReportePrestamos(data) {
    const contenido = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="alert alert-info">
                    <strong>Total de préstamos:</strong> ${data.total_prestamos}
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Tipo</th>
                        <th>Elemento</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                        <th>Materia</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.prestamos.map(prestamo => `
                        <tr>
                            <td>${formatearFecha(prestamo.fecha_prestamo)}</td>
                            <td>${prestamo.usuario_nombre || 'N/A'}</td>
                            <td>
                                <span class="badge ${prestamo.usuario_tipo === 'estudiante' ? 'bg-primary' : 'bg-success'}">
                                    ${prestamo.usuario_tipo}
                                </span>
                            </td>
                            <td>${prestamo.elemento_nombre || 'N/A'}</td>
                            <td>${prestamo.cantidad}</td>
                            <td>
                                <span class="badge ${obtenerClaseEstado(prestamo.estado)}">
                                    ${prestamo.estado}
                                </span>
                            </td>
                            <td>${prestamo.usuario_materia || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contenido-reporte').innerHTML = contenido;
    ocultarCargandoReporte();
}

/**
 * Mostrar reporte de estudiantes
 */
function mostrarReporteEstudiantes(data) {
    const contenido = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="alert alert-info">
                    <strong>Total de estudiantes con préstamos:</strong> ${data.total_estudiantes}
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Ranking</th>
                        <th>Identificación</th>
                        <th>Nombre</th>
                        <th>Materia</th>
                        <th>Docente</th>
                        <th>Total Préstamos</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.estudiantes.map((estudiante, index) => `
                        <tr ${index < 3 ? 'class="table-warning"' : ''}>
                            <td>
                                <strong>#${index + 1}</strong>
                                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                            </td>
                            <td>${estudiante.identificacion}</td>
                            <td>${estudiante.nombre}</td>
                            <td>${estudiante.materia || 'N/A'}</td>
                            <td>${estudiante.docente || 'N/A'}</td>
                            <td>
                                <span class="badge bg-primary fs-6">${estudiante.total_prestamos}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contenido-reporte').innerHTML = contenido;
    ocultarCargandoReporte();
}

/**
 * Mostrar reporte de docentes
 */
function mostrarReporteDocentes(data) {
    const contenido = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="alert alert-info">
                    <strong>Total de docentes:</strong> ${data.total_docentes}
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Ranking</th>
                        <th>Docente</th>
                        <th>Identificación</th>
                        <th>Número de Préstamos</th>
                        <th>Total Productos</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.docentes.map((docente, index) => `
                        <tr ${index < 3 ? 'class="table-warning"' : ''}>
                            <td>
                                <strong>#${index + 1}</strong>
                                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                            </td>
                            <td>${docente.nombre}</td>
                            <td>${docente.identificacion}</td>
                            <td>
                                <span class="badge bg-info">${docente.numero_prestamos}</span>
                            </td>
                            <td>
                                <span class="badge bg-primary fs-6">${docente.total_productos}</span>
                            </td>
                            <td>
                                <span class="badge ${obtenerClaseTipoDocente(docente.tipo)}">${docente.tipo}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contenido-reporte').innerHTML = contenido;
    ocultarCargandoReporte();
}

/**
 * Mostrar reporte de materias
 */
function mostrarReporteMaterias(data) {
    const contenido = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="alert alert-info">
                    <strong>Total de materias:</strong> ${data.total_materias}
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Ranking</th>
                        <th>Materia</th>
                        <th>Docente</th>
                        <th>Número de Préstamos</th>
                        <th>Total Productos</th>
                        <th>Estudiantes</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.materias.map((materia, index) => `
                        <tr ${index < 3 ? 'class="table-warning"' : ''}>
                            <td>
                                <strong>#${index + 1}</strong>
                                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                            </td>
                            <td>${materia.materia}</td>
                            <td>${materia.docente || 'N/A'}</td>
                            <td>
                                <span class="badge bg-info">${materia.numero_prestamos}</span>
                            </td>
                            <td>
                                <span class="badge bg-primary fs-6">${materia.total_productos}</span>
                            </td>
                            <td>
                                <span class="badge bg-success">${materia.numero_estudiantes}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contenido-reporte').innerHTML = contenido;
    ocultarCargandoReporte();
}

/**
 * Mostrar reporte de productos
 */
function mostrarReporteProductos(data) {
    const contenido = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="alert alert-info">
                    <strong>Top ${data.limite_aplicado} productos más solicitados</strong> 
                    (Total encontrados: ${data.total_productos})
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Ranking</th>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Número de Préstamos</th>
                        <th>Total Solicitado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.productos.map((producto, index) => `
                        <tr ${index < 3 ? 'class="table-warning"' : ''}>
                            <td>
                                <strong>#${index + 1}</strong>
                                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                            </td>
                            <td><code>${producto.codigo}</code></td>
                            <td>${producto.nombre}</td>
                            <td><span class="badge bg-secondary">${producto.categoria}</span></td>
                            <td>
                                <span class="badge bg-info">${producto.numero_prestamos}</span>
                            </td>
                            <td>
                                <span class="badge bg-primary fs-6">${producto.total_solicitado}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contenido-reporte').innerHTML = contenido;
    ocultarCargandoReporte();
}

/**
 * Exportar reporte a PDF
 */
function exportarReportePDF() {
    if (!datosReporte) {
        mostrarError('No hay datos de reporte para exportar');
        return;
    }
    
    // Implementar exportación a PDF usando jsPDF o similar
    mostrarNotificacion('Exportación a PDF', 'Funcionalidad en desarrollo', 'info');
}

/**
 * Exportar reporte a Excel
 */
function exportarReporteExcel() {
    if (!datosReporte) {
        mostrarError('No hay datos de reporte para exportar');
        return;
    }
    
    // Implementar exportación a Excel usando SheetJS o similar
    mostrarNotificacion('Exportación a Excel', 'Funcionalidad en desarrollo', 'info');
}

/**
 * Funciones auxiliares
 */
function mostrarCargandoReporte() {
    document.getElementById('contenido-reporte').innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Generando reporte...</span>
            </div>
            <p class="mt-3">Generando reporte...</p>
        </div>
    `;
}

function ocultarCargandoReporte() {
    // El contenido se reemplaza por el reporte, no necesita acción adicional
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerClaseEstado(estado) {
    switch (estado) {
        case 'prestado': return 'bg-warning';
        case 'devuelto': return 'bg-success';
        case 'vencido': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function obtenerClaseTipoDocente(tipo) {
    switch (tipo) {
        case 'directo': return 'bg-primary';
        case 'estudiantes': return 'bg-info';
        case 'mixto': return 'bg-success';
        default: return 'bg-secondary';
    }
}

function mostrarError(mensaje) {
    document.getElementById('contenido-reporte').innerHTML = `
        <div class="alert alert-danger">
            <strong>Error:</strong> ${mensaje}
        </div>
    `;
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('reportes') || document.getElementById('contenido-reporte')) {
        inicializarReportes();
    }
});