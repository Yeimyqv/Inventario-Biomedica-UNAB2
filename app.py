"""
Aplicación principal para el Sistema de Gestión de Laboratorio de Bioinstrumentación.
"""

import os
import json
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, render_template, send_from_directory, abort, Response
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
    
    # Inicializar inventario automáticamente
    def cargar_inventario_inicial():
        """Cargar inventario inicial desde CSV si la base de datos está vacía."""
        try:
            # Limpiar datos existentes de elementos y categorías
            print("Actualizando base de datos con nuevo inventario...")
            Prestamo.query.delete()  # Primero eliminamos préstamos (dependencia de FK)
            Elemento.query.delete()  # Luego elementos
            Categoria.query.delete() # Finalmente categorías
            db.session.commit()
            print("Base de datos limpiada. Cargando inventario actualizado...")
            
            from import_inventory import import_inventory_from_csv
            
            # Ruta al archivo CSV actualizado
            csv_file = "attached_assets/MATERIALES_PISO_4_PROCESADO (1).csv"
            
            if os.path.exists(csv_file):
                success, message = import_inventory_from_csv(csv_file)
                print(f"Resultado de la carga de inventario: {message}")
            else:
                print(f"ADVERTENCIA: Archivo de inventario {csv_file} no encontrado")
                
                # Intentar con el archivo anterior como respaldo
                csv_file_backup = "attached_assets/MATERIALES_PISO_4_PROCESADO.csv"
                if os.path.exists(csv_file_backup):
                    print(f"Intentando con archivo de respaldo: {csv_file_backup}")
                    success, message = import_inventory_from_csv(csv_file_backup)
                    print(f"Resultado de la carga de inventario de respaldo: {message}")
            
            # Contar elementos después de la carga
            elementos_count = Elemento.query.count()
            categorias_count = Categoria.query.count()
            print(f"Base de datos actualizada con {categorias_count} categorías y {elementos_count} elementos")
        except Exception as e:
            print(f"Error cargando inventario inicial: {str(e)}")
    
    # Inicializar datos de estudiantes automáticamente
    def cargar_estudiantes_iniciales():
        """Cargar datos de estudiantes desde CSV si no hay estudiantes en la base de datos."""
        try:
            # Verificar si ya hay estudiantes en la base de datos
            estudiantes_count = Usuario.query.filter_by(tipo='estudiante').count()
            
            if estudiantes_count == 0:
                print("No hay estudiantes en la base de datos. Cargando datos iniciales...")
                from import_students import import_students_from_csv
                
                # Ruta al archivo CSV
                csv_file = "attached_assets/Estudiantes_Biomedica_PostgreSQL.csv"
                
                if os.path.exists(csv_file):
                    import_students_from_csv(csv_file)
                else:
                    print(f"ADVERTENCIA: Archivo de estudiantes {csv_file} no encontrado")
            else:
                print(f"Ya existen {estudiantes_count} estudiantes en la base de datos")
        except Exception as e:
            print(f"Error cargando datos de estudiantes: {str(e)}")
    
    # Inicializar usuarios del sistema (docentes y laboratoristas)
    def inicializar_usuarios_sistema():
        """Crear usuarios de sistema (docentes y laboratoristas) si no existen."""
        try:
            # Verificar si ya hay laboratoristas y docentes en la base de datos
            lab_count = Usuario.query.filter_by(tipo='laboratorista').count()
            doc_count = Usuario.query.filter_by(tipo='docente').count()
            
            if lab_count == 0:
                print("Creando usuarios laboratoristas predeterminados...")
                # Crear laboratoristas predeterminados
                laboratoristas = [
                    {
                        'nombre': 'Lina Alexandra Quiroz Obando',
                        'identificacion': 'LAB001',
                        'pin': 'LAB5678'
                    },
                    {
                        'nombre': 'Luis Alexandres Vargas Vargas',
                        'identificacion': 'LAB002',
                        'pin': 'LAB5678'
                    },
                    {
                        'nombre': 'Juan Camilo Sierra Martinez',
                        'identificacion': 'LAB003',
                        'pin': 'LAB5678'
                    }
                ]
                
                for lab_data in laboratoristas:
                    nuevo_lab = Usuario(
                        tipo='laboratorista',
                        nombre=lab_data['nombre'],
                        identificacion=lab_data['identificacion'],
                        pin=lab_data['pin']
                    )
                    db.session.add(nuevo_lab)
                    print(f"Laboratorista creado: {lab_data['nombre']}")
                
                db.session.commit()
            
            if doc_count == 0:
                print("Creando usuario docente predeterminado...")
                # Crear docente predeterminado
                nuevo_docente = Usuario(
                    tipo='docente',
                    nombre='Docente de Bioinstrumentación',
                    identificacion='DOC001',
                    pin='DOC1234'
                )
                db.session.add(nuevo_docente)
                db.session.commit()
                print("Docente creado: Docente de Bioinstrumentación")
            
            print(f"Usuarios del sistema: {lab_count} laboratoristas y {doc_count} docentes")
        
        except Exception as e:
            print(f"Error creando usuarios del sistema: {str(e)}")
    
    # Cargar datos iniciales
    cargar_inventario_inicial()
    cargar_estudiantes_iniciales()
    inicializar_usuarios_sistema()

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

# API para importar inventario desde CSV (solo admin)
@app.route('/api/importar-inventario', methods=['POST'])
def importar_inventario():
    """Importar inventario desde un archivo CSV (ruta en attached_assets)."""
    # Esta API solo debe ser llamada por administradores
    try:
        from import_inventory import import_inventory_from_csv
        
        # Ruta al archivo CSV
        csv_file = "attached_assets/MATERIALES_PISO_4_PROCESADO.csv"
        
        if not os.path.exists(csv_file):
            return jsonify({'error': f'El archivo {csv_file} no existe'}), 404
            
        # Importar inventario
        success, message = import_inventory_from_csv(csv_file)
        
        if success:
            return jsonify({'success': True, 'message': message})
        else:
            return jsonify({'error': message}), 500
            
    except Exception as e:
        return jsonify({'error': f'Error al importar inventario: {str(e)}'}), 500

# Punto de entrada
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)