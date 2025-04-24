"""
Aplicación principal para el Sistema de Gestión de Laboratorio de Bioinstrumentación.
"""

import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, render_template, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Configuración de la base de datos
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "clave_secreta_para_desarrollo")
app.config['TEMPLATES_AUTO_RELOAD'] = True  # Forzar recarga de plantillas

# Configurar la base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

# Importación tardía para evitar dependencia circular
with app.app_context():
    from models import Categoria, Elemento, Usuario, Prestamo
    db.create_all()

# Rutas para archivos estáticos
@app.route('/')
def index():
    """Serve the landing page."""
    return send_from_directory('.', 'index.html')

@app.route('/sede-jardin')
def sede_jardin():
    """Serve the main application interface for Sede Jardin."""
    return render_template('index.html')

@app.route('/static/<path:path>')
def serve_static_files(path):
    """Serve files from the static folder."""
    return send_from_directory('static', path)

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    # Primero buscar en carpetas específicas
    if path.startswith(('css/', 'js/', 'img/')):
        folder = path.split('/')[0]
        file_path = '/'.join(path.split('/')[1:])
        return send_from_directory(folder, file_path)
    # Verificar archivos en attached_assets
    elif path.startswith('attached_assets/'):
        folder = 'attached_assets'
        file_path = '/'.join(path.split('/')[1:])
        return send_from_directory(folder, file_path)
    return render_template('index.html')

# API para categorías
@app.route('/api/categorias')
def get_categorias():
    """Obtener todas las categorías."""
    categorias = Categoria.query.all()
    return jsonify([categoria.to_dict() for categoria in categorias])

# API para elementos por categoría
@app.route('/api/elementos/categoria/<int:categoria_id>')
def get_elementos_by_categoria(categoria_id):
    """Obtener elementos por categoría."""
    elementos = Elemento.query.filter_by(categoria_id=categoria_id).all()
    return jsonify([elemento.to_dict() for elemento in elementos])

# API para obtener detalle de un elemento
@app.route('/api/elemento/<int:elemento_id>')
def get_elemento(elemento_id):
    """Obtener detalle de un elemento específico."""
    elemento = Elemento.query.get_or_404(elemento_id)
    return jsonify(elemento.to_dict())

# API para realizar préstamo
@app.route('/api/prestar', methods=['POST'])
def prestar_elemento():
    """Realizar préstamo de elemento."""
    data = request.json
    
    # Validar datos
    if not all(k in data for k in ('elemento_id', 'usuario_id', 'cantidad')):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Obtener elemento y usuario
    elemento = Elemento.query.get(data['elemento_id'])
    usuario = Usuario.query.get(data['usuario_id'])
    
    if not elemento:
        return jsonify({'error': 'Elemento no encontrado'}), 404
    
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    cantidad = int(data['cantidad'])
    
    # Verificar disponibilidad
    if elemento.disponibles() < cantidad:
        return jsonify({'error': 'No hay suficientes unidades disponibles'}), 400
    
    # Crear préstamo
    fecha_devolucion = datetime.utcnow() + timedelta(days=7)  # Por defecto: 7 días
    
    prestamo = Prestamo(
        elemento_id=elemento.id,
        usuario_id=usuario.id,
        cantidad=cantidad,
        fecha_prestamo=datetime.utcnow(),
        fecha_devolucion_esperada=fecha_devolucion,
        estado='prestado'
    )
    
    db.session.add(prestamo)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'mensaje': f'Préstamo de {cantidad} unidad(es) de {elemento.nombre} realizado correctamente',
        'prestamo': prestamo.to_dict()
    })

# API para retornar elemento
@app.route('/api/retornar', methods=['POST'])
def retornar_elemento():
    """Retornar un elemento prestado."""
    data = request.json
    
    # Validar datos
    if 'prestamo_id' not in data:
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Obtener préstamo
    prestamo = Prestamo.query.get(data['prestamo_id'])
    
    if not prestamo:
        return jsonify({'error': 'Préstamo no encontrado'}), 404
    
    if prestamo.estado != 'prestado':
        return jsonify({'error': 'Este préstamo ya ha sido devuelto o cancelado'}), 400
    
    # Actualizar préstamo
    prestamo.estado = 'devuelto'
    prestamo.fecha_devolucion_real = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'mensaje': f'Retorno de {prestamo.cantidad} unidad(es) de {prestamo.elemento.nombre} registrado correctamente',
        'prestamo': prestamo.to_dict()
    })

# API para crear elemento (solo laboratorista)
@app.route('/api/elemento', methods=['POST'])
def crear_elemento():
    """Crear un nuevo elemento (solo laboratorista)."""
    data = request.json
    
    # Validar datos mínimos
    if not all(k in data for k in ('codigo', 'nombre', 'categoria_id')):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Verificar si ya existe un elemento con ese código
    if Elemento.query.filter_by(codigo=data['codigo']).first():
        return jsonify({'error': 'Ya existe un elemento con ese código'}), 400
    
    # Verificar que la categoría exista
    if not Categoria.query.get(data['categoria_id']):
        return jsonify({'error': 'Categoría no encontrada'}), 404
    
    # Crear elemento
    elemento = Elemento(
        codigo=data['codigo'],
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        cantidad=data.get('cantidad', 0),
        ubicacion=data.get('ubicacion', ''),
        imagen_url=data.get('imagen_url', ''),
        categoria_id=data['categoria_id']
    )
    
    db.session.add(elemento)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'mensaje': f'Elemento {elemento.nombre} creado correctamente',
        'elemento': elemento.to_dict()
    })

# API para eliminar elemento (solo laboratorista)
@app.route('/api/elemento/<int:elemento_id>', methods=['DELETE'])
def eliminar_elemento(elemento_id):
    """Eliminar un elemento (solo laboratorista)."""
    elemento = Elemento.query.get_or_404(elemento_id)
    
    # Verificar si tiene préstamos activos
    prestamos_activos = Prestamo.query.filter_by(
        elemento_id=elemento.id,
        estado='prestado'
    ).count()
    
    if prestamos_activos > 0:
        return jsonify({
            'error': 'No se puede eliminar un elemento con préstamos activos'
        }), 400
    
    # Eliminar el elemento
    db.session.delete(elemento)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'mensaje': f'Elemento {elemento.nombre} eliminado correctamente'
    })

# Nueva ruta para buscar información de estudiante por ID
@app.route('/api/estudiante/<identificacion>', methods=['GET'])
def buscar_estudiante(identificacion):
    """Buscar estudiante por ID."""
    # Convertir a mayúsculas para mejorar la compatibilidad
    identificacion_upper = identificacion.strip().upper()
    
    # Log para depuración
    print(f"Buscando estudiante con ID: {identificacion_upper}")
    
    # Buscar primero con coincidencia exacta
    estudiante = Usuario.query.filter_by(
        identificacion=identificacion_upper,
        tipo='estudiante'
    ).first()
    
    if not estudiante:
        # Si no se encuentra, intentar búsqueda parcial (para IDs que podrían estar truncados)
        estudiante = Usuario.query.filter(
            Usuario.identificacion.like(f"{identificacion_upper}%"),
            Usuario.tipo == 'estudiante'
        ).first()
    
    if not estudiante:
        print(f"Estudiante no encontrado: {identificacion_upper}")
        return jsonify({'error': 'Estudiante no encontrado'}), 404
    
    # Log del estudiante encontrado
    print(f"Estudiante encontrado: {estudiante.nombre}, ID: {estudiante.identificacion}")
    return jsonify(estudiante.to_dict())

# Punto de entrada
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)