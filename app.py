import os
import logging
from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize Flask-SQLAlchemy
db = SQLAlchemy(model_class=Base)

# Create Flask app
app = Flask(__name__, static_folder='.')
app.secret_key = os.environ.get("SESSION_SECRET", "lab_management_secret_key")

# Configure the database connection
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Import models after db initialization to avoid circular imports
with app.app_context():
    import models
    db.create_all()

@app.route('/')
def index():
    """Serve the main index page."""
    return render_template('index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('.', path)

# API Endpoints para la aplicación
@app.route('/api/categorias')
def get_categorias():
    """Obtener todas las categorías."""
    from models import Categoria
    categorias = Categoria.query.all()
    return jsonify([{"id": c.id, "nombre": c.nombre} for c in categorias])

@app.route('/api/elementos/categoria/<int:categoria_id>')
def get_elementos_by_categoria(categoria_id):
    """Obtener elementos por categoría."""
    from models import Elemento
    elementos = Elemento.query.filter_by(categoria_id=categoria_id).all()
    return jsonify([{
        "id": e.id,
        "codigo": e.codigo,
        "nombre": e.nombre,
        "descripcion": e.descripcion,
        "cantidad": e.cantidad,
        "ubicacion": e.ubicacion,
        "imagen_url": e.imagen_url
    } for e in elementos])

@app.route('/api/elemento/<int:elemento_id>')
def get_elemento(elemento_id):
    """Obtener detalle de un elemento específico."""
    from models import Elemento
    elemento = Elemento.query.get_or_404(elemento_id)
    return jsonify({
        "id": elemento.id,
        "codigo": elemento.codigo,
        "nombre": elemento.nombre,
        "descripcion": elemento.descripcion,
        "cantidad": elemento.cantidad,
        "ubicacion": elemento.ubicacion,
        "imagen_url": elemento.imagen_url,
        "categoria_id": elemento.categoria_id
    })

@app.route('/api/prestar', methods=['POST'])
def prestar_elemento():
    """Realizar préstamo de elemento."""
    from models import Elemento, Usuario, Prestamo
    from datetime import datetime, timedelta
    
    data = request.json
    elemento_id = data.get('elemento_id')
    usuario_id = data.get('usuario_id')
    cantidad = data.get('cantidad', 1)
    
    # Verificar disponibilidad
    elemento = Elemento.query.get_or_404(elemento_id)
    if elemento.cantidad < cantidad:
        return jsonify({"error": "No hay suficientes unidades disponibles"}), 400
    
    # Crear préstamo
    prestamo = Prestamo(
        elemento_id=elemento_id,
        usuario_id=usuario_id,
        cantidad=cantidad,
        fecha_prestamo=datetime.utcnow(),
        fecha_devolucion_esperada=datetime.utcnow() + timedelta(days=7),
        estado='prestado'
    )
    
    # Actualizar inventario
    elemento.cantidad -= cantidad
    
    db.session.add(prestamo)
    db.session.commit()
    
    return jsonify({"message": "Préstamo realizado con éxito", "prestamo_id": prestamo.id})

@app.route('/api/retornar', methods=['POST'])
def retornar_elemento():
    """Retornar un elemento prestado."""
    from models import Elemento, Prestamo
    from datetime import datetime
    
    data = request.json
    prestamo_id = data.get('prestamo_id')
    
    # Buscar el préstamo
    prestamo = Prestamo.query.get_or_404(prestamo_id)
    if prestamo.estado != 'prestado':
        return jsonify({"error": "Este préstamo ya fue retornado o está en otro estado"}), 400
    
    # Actualizar el préstamo
    prestamo.estado = 'devuelto'
    prestamo.fecha_devolucion_real = datetime.utcnow()
    
    # Actualizar inventario
    elemento = Elemento.query.get(prestamo.elemento_id)
    elemento.cantidad += prestamo.cantidad
    
    db.session.commit()
    
    return jsonify({"message": "Elemento retornado con éxito"})

# Endpoints para administración (laboratorista)
@app.route('/api/elemento', methods=['POST'])
def crear_elemento():
    """Crear un nuevo elemento (solo laboratorista)."""
    from models import Elemento
    
    data = request.json
    elemento = Elemento(
        codigo=data.get('codigo'),
        nombre=data.get('nombre'),
        descripcion=data.get('descripcion'),
        cantidad=data.get('cantidad', 0),
        ubicacion=data.get('ubicacion'),
        imagen_url=data.get('imagen_url'),
        categoria_id=data.get('categoria_id')
    )
    
    db.session.add(elemento)
    db.session.commit()
    
    return jsonify({"message": "Elemento creado con éxito", "id": elemento.id})

@app.route('/api/elemento/<int:elemento_id>', methods=['DELETE'])
def eliminar_elemento(elemento_id):
    """Eliminar un elemento (solo laboratorista)."""
    from models import Elemento
    
    elemento = Elemento.query.get_or_404(elemento_id)
    db.session.delete(elemento)
    db.session.commit()
    
    return jsonify({"message": "Elemento eliminado con éxito"})
