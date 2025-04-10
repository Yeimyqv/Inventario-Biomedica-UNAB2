document.addEventListener('DOMContentLoaded', function() {
  console.log('Aplicación de Gestión de Laboratorio iniciada');
});

document.getElementById('user-type').addEventListener('change', (e) => {
  const tipo = e.target.value;
  const pinSection = document.getElementById('pin-section');
  if (tipo === 'docente' || tipo === 'laboratorista') {
    pinSection.style.display = 'block';
  } else {
    pinSection.style.display = 'none';
    if (tipo === 'estudiante') {
      cargarInterfaz(tipo);
    }
  }
});

function verifyPin() {
  const tipo = document.getElementById('user-type').value;
  const pin = document.getElementById('pin-input').value;
  
  if (pin === '') {
    alert("Por favor ingresa un PIN");
    return;
  }
  
  if (PINES[tipo] === pin) {
    cargarInterfaz(tipo);
  } else {
    alert("PIN incorrecto. Intenta nuevamente.");
  }
}

function cargarInterfaz(tipo) {
  document.getElementById('user-selection').style.display = 'none';
  const interfaz = document.getElementById('interface');
  interfaz.style.display = 'block';
  
  // Títulos según rol
  let tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  
  // Interfaces específicas según el rol
  let contenido = '';
  
  if (tipo === 'estudiante') {
    contenido = `
      <div class="alert alert-info">
        <h3>Bienvenido Estudiante</h3>
        <p>Acceso de solo consulta al inventario.</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h4>Inventario Disponible</h4>
        </div>
        <div class="card-body">
          <div id="lista-inventario">
            ${generarListaInventario()}
          </div>
        </div>
      </div>
    `;
  } else if (tipo === 'docente') {
    contenido = `
      <div class="alert alert-success">
        <h3>Bienvenido Docente</h3>
        <p>Puede solicitar préstamos y ver el inventario.</p>
      </div>
      <div class="card">
        <div class="card-header">
          <h4>Inventario Disponible</h4>
        </div>
        <div class="card-body">
          <div id="lista-inventario">
            ${generarListaInventario(true)}
          </div>
        </div>
      </div>
    `;
  } else if (tipo === 'laboratorista') {
    contenido = `
      <div class="alert alert-warning">
        <h3>Bienvenido Laboratorista</h3>
        <p>Control total sobre el inventario y préstamos.</p>
      </div>
      <div class="card mb-4">
        <div class="card-header">
          <h4>Panel de Control</h4>
        </div>
        <div class="card-body">
          <button class="btn btn-primary mb-2">Gestionar Inventario</button>
          <button class="btn btn-info mb-2">Ver Préstamos</button>
          <button class="btn btn-success mb-2">Registrar Devolución</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h4>Inventario Completo</h4>
        </div>
        <div class="card-body">
          <div id="lista-inventario">
            ${generarListaInventario(true, true)}
          </div>
        </div>
      </div>
    `;
  }
  
  interfaz.innerHTML = contenido;
}

function generarListaInventario(conBotonPrestamo = false, conEdicion = false) {
  let html = '<div class="accordion" id="accordionInventario">';
  
  INVENTARIO.forEach((categoria, index) => {
    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
            ${categoria.categoria}
          </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-bs-parent="#accordionInventario">
          <div class="accordion-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Elemento</th>
                  <th>Cantidad</th>
                  ${conBotonPrestamo ? '<th>Acción</th>' : ''}
                  ${conEdicion ? '<th>Editar</th>' : ''}
                </tr>
              </thead>
              <tbody>
    `;
    
    categoria.elementos.forEach(elemento => {
      html += `
        <tr>
          <td>${elemento.nombre}</td>
          <td>${elemento.cantidad}</td>
          ${conBotonPrestamo ? '<td><button class="btn btn-sm btn-primary">Solicitar</button></td>' : ''}
          ${conEdicion ? '<td><button class="btn btn-sm btn-warning">Editar</button></td>' : ''}
        </tr>
      `;
    });
    
    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}
