"""
Aplicación principal para el Sistema de Gestión de Laboratorio de Bioinstrumentación.
"""

import os
import json
from datetime import datetime, timedelta
from urllib.parse import unquote
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
    from models import Categoria, Elemento, Usuario, Prestamo, Materia
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
    
    def crear_prestamos_de_prueba():
        """Crear préstamos de prueba si no existen en la base de datos."""
        # DESHABILITADO COMPLETAMENTE - El usuario realizará pruebas manuales
        print("Creación automática de préstamos deshabilitada - modo de pruebas manuales")
    
    # Cargar datos iniciales
    # cargar_inventario_inicial()  # Deshabilitado para evitar recargas automáticas
    cargar_estudiantes_iniciales()
    inicializar_usuarios_sistema()
    crear_prestamos_de_prueba()

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
    
    # Si el usuario es estudiante, actualizar información del docente y materia
    if usuario.tipo == 'estudiante':
        docente = data.get('docente')
        materia = data.get('materia')
        
        # Actualizar los datos del estudiante si se proporcionan
        if docente:
            usuario.docente = docente
        if materia:
            usuario.materia = materia
    
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
    
    # Guardar observaciones de devolución si se proporcionan
    if 'observaciones' in data and data['observaciones']:
        prestamo.observaciones = data['observaciones']
    
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

# Nueva ruta para obtener información de un préstamo específico
@app.route('/api/prestamo/<int:prestamo_id>', methods=['GET'])
def obtener_prestamo(prestamo_id):
    """Obtener información de un préstamo específico."""
    prestamo = Prestamo.query.get_or_404(prestamo_id)
    return jsonify(prestamo.to_dict())

# Nueva ruta para buscar información de estudiante por ID
@app.route('/api/estudiante/<identificacion>', methods=['GET'])
def buscar_estudiante(identificacion):
    """Buscar estudiante por ID."""
    # Convertir a mayúsculas para mejorar la compatibilidad
    identificacion_upper = identificacion.strip().upper()
    
    # Log para depuración
    print(f"Buscando estudiante con ID: {identificacion_upper}")
    
    # Buscar primero con coincidencia exacta - solo usuarios activos
    estudiante = Usuario.query.filter_by(
        identificacion=identificacion_upper,
        tipo='estudiante',
        activo=True
    ).first()
    
    if not estudiante:
        # Si no se encuentra, intentar búsqueda parcial (para IDs que podrían estar truncados) - solo usuarios activos
        estudiante = Usuario.query.filter(
            Usuario.identificacion.like(f"{identificacion_upper}%"),
            Usuario.tipo == 'estudiante',
            Usuario.activo == True
        ).first()
    
    if not estudiante:
        print(f"Estudiante no encontrado: {identificacion_upper}")
        return jsonify({'error': 'Estudiante no encontrado'}), 404
    
    # Log del estudiante encontrado
    print(f"Estudiante encontrado: {estudiante.nombre}, ID: {estudiante.identificacion}")
    return jsonify(estudiante.to_dict())

# Nueva ruta para buscar usuario por tipo y nombre (para laboratoristas y docentes)
@app.route('/api/usuario/<tipo>/<nombre>', methods=['GET'])
def buscar_usuario_por_tipo_y_nombre(tipo, nombre):
    """Buscar usuario por tipo y nombre."""
    nombre_decoded = unquote(nombre)
    
    print(f"Buscando usuario {tipo} con nombre: {nombre_decoded}")
    
    usuario = Usuario.query.filter_by(
        tipo=tipo,
        nombre=nombre_decoded,
        activo=True
    ).first()
    
    if not usuario:
        print(f"Usuario no encontrado: {tipo} - {nombre_decoded}")
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    print(f"Usuario encontrado: {usuario.nombre}, ID: {usuario.id}")
    return jsonify(usuario.to_dict())

# Nueva ruta para crear usuario docente si no existe
@app.route('/api/usuario/crear-docente', methods=['POST'])
def crear_usuario_docente():
    """Crear usuario docente si no existe."""
    data = request.json
    
    if not data or 'nombre' not in data:
        return jsonify({'error': 'Nombre requerido'}), 400
    
    nombre = data['nombre'].strip()
    
    # Verificar si ya existe (verificar tanto activos como inactivos)
    usuario_existente = Usuario.query.filter_by(
        tipo='docente',
        nombre=nombre
    ).first()
    
    if usuario_existente:
        return jsonify(usuario_existente.to_dict())
    
    # Crear nuevo usuario docente
    # Generar ID único para docente
    ultimo_docente = Usuario.query.filter_by(tipo='docente').order_by(Usuario.id.desc()).first()
    if ultimo_docente and ultimo_docente.identificacion.startswith('D'):
        try:
            ultimo_num = int(ultimo_docente.identificacion[1:])
            nuevo_num = ultimo_num + 1
        except:
            nuevo_num = 100
    else:
        nuevo_num = 100
    
    nueva_identificacion = f"D{nuevo_num:03d}"
    
    # Mapeo de correos específicos para docentes conocidos
    correos_docentes = {
        'Yeimy Liseth Quintana Villamizar': 'yquintana@unab.edu.co',
        'Mario Fernando Morales Cordero': 'mmorales@unab.edu.co',
        'Víctor Alfonso Solarte David': 'vsolarte@unab.edu.co',
        'Manuel Hernando Franco Arias': 'mfranco@unab.edu.co',
        'Alejandro Arboleda Carvajal': 'aarboleda@unab.edu.co',
        'Leidy Rocío Pico Martínez': 'lpico47@unab.edu.co',
        'Luis Felipe Buitrago Castro': 'lbuitrago411@unab.edu.co',
        'Lusvin Javier Amado Forero': 'lamado175@unab.edu.co',
        'Mateo Escobar Jaramillo': 'mescobar844@unab.edu.co'
    }
    
    # Usar el correo específico si existe, sino generar uno
    if nombre in correos_docentes:
        correo = correos_docentes[nombre]
    else:
        # Generar correo institucional como fallback
        nombres = nombre.split()
        if len(nombres) >= 2:
            primer_nombre = nombres[0].lower()
            primer_apellido = nombres[-1].lower()
            correo = f"{primer_nombre[0]}{primer_apellido}@unab.edu.co"
        else:
            correo = f"{nombre.lower().replace(' ', '')}@unab.edu.co"
    
    nuevo_usuario = Usuario(
        tipo='docente',
        nombre=nombre,
        identificacion=nueva_identificacion,
        correo=correo,
        pin=None  # Los docentes usan PIN genérico
    )
    
    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        print(f"Docente creado: {nuevo_usuario.nombre}, ID: {nuevo_usuario.id}")
        return jsonify(nuevo_usuario.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error creando docente: {e}")
        return jsonify({'error': 'Error al crear docente'}), 500

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

# ======= APIs DE REPORTES PARA LABORATORISTA =======

@app.route('/api/reportes/prestamos', methods=['GET'])
def reporte_prestamos():
    """Reporte de préstamos realizados con filtros."""
    try:
        # Obtener parámetros de filtro
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        tipo_usuario = request.args.get('tipo_usuario')
        materia = request.args.get('materia')
        elemento_id = request.args.get('elemento_id')
        buscar_estudiante = request.args.get('buscar_estudiante')
        
        print(f"[DEBUG] Reporte préstamos - buscar_estudiante: '{buscar_estudiante}'")
        
        # Construir consulta base
        query = db.session.query(Prestamo).join(Usuario).join(Elemento)
        
        # Aplicar filtros de fecha
        if fecha_inicio:
            query = query.filter(Prestamo.fecha_prestamo >= datetime.strptime(fecha_inicio, '%Y-%m-%d'))
        if fecha_fin:
            query = query.filter(Prestamo.fecha_prestamo <= datetime.strptime(fecha_fin, '%Y-%m-%d'))
        
        # Aplicar filtros adicionales
        if tipo_usuario:
            query = query.filter(Usuario.tipo == tipo_usuario)
        if materia:
            query = query.filter(Usuario.materia.ilike(f'%{materia}%'))
        if elemento_id:
            query = query.filter(Prestamo.elemento_id == elemento_id)
        
        # Filtro de búsqueda de estudiante
        if buscar_estudiante and buscar_estudiante.strip():
            buscar_term = buscar_estudiante.strip()
            print(f"[DEBUG] Aplicando filtro de búsqueda en préstamos: '{buscar_term}'")
            query = query.filter(
                db.or_(
                    Usuario.nombre.ilike(f'%{buscar_term}%'),
                    Usuario.identificacion.ilike(f'%{buscar_term}%')
                )
            )
        
        prestamos = query.all()
        
        # Preparar respuesta
        resultado = {
            'total_prestamos': len(prestamos),
            'prestamos': [prestamo.to_dict() for prestamo in prestamos],
            'filtros_aplicados': {
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin,
                'tipo_usuario': tipo_usuario,
                'materia': materia,
                'elemento_id': elemento_id
            }
        }
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': f'Error generando reporte de préstamos: {str(e)}'}), 500

@app.route('/api/reportes/estudiantes', methods=['GET'])
def reporte_estudiantes():
    """Reporte de número de préstamos por estudiante."""
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        buscar_estudiante = request.args.get('buscar_estudiante')
        
        print(f"[DEBUG] Filtros recibidos - fecha_inicio: {fecha_inicio}, fecha_fin: {fecha_fin}, buscar_estudiante: '{buscar_estudiante}'")
        
        # Consulta para contar préstamos por estudiante
        query = db.session.query(
            Usuario.id,
            Usuario.nombre,
            Usuario.identificacion,
            Usuario.correo,
            Usuario.materia,
            Usuario.docente,
            db.func.count(Prestamo.id).label('total_prestamos')
        ).join(Prestamo).filter(Usuario.tipo == 'estudiante')
        
        # Aplicar filtros de fecha
        if fecha_inicio:
            query = query.filter(Prestamo.fecha_prestamo >= datetime.strptime(fecha_inicio, '%Y-%m-%d'))
        if fecha_fin:
            query = query.filter(Prestamo.fecha_prestamo <= datetime.strptime(fecha_fin, '%Y-%m-%d'))
        
        # Filtro de búsqueda de estudiante - mejorado para ser más flexible
        if buscar_estudiante and buscar_estudiante.strip():
            buscar_term = buscar_estudiante.strip()
            print(f"[DEBUG] Aplicando filtro de búsqueda: '{buscar_term}'")
            query = query.filter(
                db.or_(
                    Usuario.nombre.ilike(f'%{buscar_term}%'),
                    Usuario.identificacion.ilike(f'%{buscar_term}%')
                )
            )
        
        estudiantes = query.group_by(Usuario.id).order_by(db.desc('total_prestamos')).all()
        
        print(f"[DEBUG] Encontrados {len(estudiantes)} estudiantes")
        if buscar_estudiante and buscar_estudiante.strip():
            print(f"[DEBUG] Primeros 3 estudiantes encontrados: {[est.nombre for est in estudiantes[:3]]}")
        
        resultado = {
            'total_estudiantes': len(estudiantes),
            'estudiantes': [
                {
                    'id': est.id,
                    'nombre': est.nombre,
                    'identificacion': est.identificacion,
                    'correo': est.correo,
                    'materia': est.materia,
                    'docente': est.docente,
                    'total_prestamos': est.total_prestamos
                }
                for est in estudiantes
            ]
        }
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': f'Error generando reporte de estudiantes: {str(e)}'}), 500

@app.route('/api/reportes/docentes', methods=['GET'])
def reporte_docentes():
    """Reporte de docentes que más utilizaron insumos."""
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        # Consulta para docentes con préstamos directos
        query_docentes = db.session.query(
            Usuario.id,
            Usuario.nombre,
            Usuario.identificacion,
            Usuario.correo,
            db.func.count(Prestamo.id).label('numero_prestamos'),
            db.func.sum(Prestamo.cantidad).label('total_productos')
        ).join(Prestamo).filter(Usuario.tipo == 'docente')
        
        # Consulta para docentes a través de estudiantes
        query_estudiantes = db.session.query(
            Usuario.docente.label('nombre_docente'),
            db.func.count(Prestamo.id).label('numero_prestamos'),
            db.func.sum(Prestamo.cantidad).label('total_productos')
        ).join(Prestamo).filter(
            Usuario.tipo == 'estudiante',
            Usuario.docente.isnot(None)
        )
        
        # Aplicar filtros de fecha a ambas consultas
        if fecha_inicio:
            fecha_inicio_dt = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            query_docentes = query_docentes.filter(Prestamo.fecha_prestamo >= fecha_inicio_dt)
            query_estudiantes = query_estudiantes.filter(Prestamo.fecha_prestamo >= fecha_inicio_dt)
        if fecha_fin:
            fecha_fin_dt = datetime.strptime(fecha_fin, '%Y-%m-%d')
            query_docentes = query_docentes.filter(Prestamo.fecha_prestamo <= fecha_fin_dt)
            query_estudiantes = query_estudiantes.filter(Prestamo.fecha_prestamo <= fecha_fin_dt)
        
        docentes_directos = query_docentes.group_by(Usuario.id).all()
        docentes_estudiantes = query_estudiantes.group_by(Usuario.docente).all()
        
        # Combinar resultados
        ranking_docentes = {}
        
        # Agregar préstamos directos de docentes
        for doc in docentes_directos:
            ranking_docentes[doc.nombre] = {
                'nombre': doc.nombre,
                'identificacion': doc.identificacion,
                'correo': doc.correo,
                'numero_prestamos': doc.numero_prestamos,
                'total_productos': doc.total_productos,
                'tipo': 'directo'
            }
        
        # Agregar préstamos a través de estudiantes
        for doc in docentes_estudiantes:
            if doc.nombre_docente in ranking_docentes:
                ranking_docentes[doc.nombre_docente]['numero_prestamos'] += doc.numero_prestamos
                ranking_docentes[doc.nombre_docente]['total_productos'] += doc.total_productos
                ranking_docentes[doc.nombre_docente]['tipo'] = 'mixto'
            else:
                ranking_docentes[doc.nombre_docente] = {
                    'nombre': doc.nombre_docente,
                    'identificacion': 'N/A',
                    'numero_prestamos': doc.numero_prestamos,
                    'total_productos': doc.total_productos,
                    'tipo': 'estudiantes'
                }
        
        # Ordenar por total de productos
        docentes_ordenados = sorted(
            ranking_docentes.values(),
            key=lambda x: x['total_productos'],
            reverse=True
        )
        
        resultado = {
            'total_docentes': len(docentes_ordenados),
            'docentes': docentes_ordenados
        }
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': f'Error generando reporte de docentes: {str(e)}'}), 500

@app.route('/api/reportes/materias', methods=['GET'])
def reporte_materias():
    """Reporte de materias con mayor uso de insumos."""
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        docente_filtro = request.args.get('docente')
        
        query = db.session.query(
            Usuario.materia,
            Usuario.docente,
            db.func.count(Prestamo.id).label('numero_prestamos'),
            db.func.sum(Prestamo.cantidad).label('total_productos'),
            db.func.count(db.distinct(Usuario.id)).label('numero_estudiantes')
        ).join(Prestamo).filter(
            Usuario.tipo == 'estudiante',
            Usuario.materia.isnot(None)
        )
        
        # Aplicar filtros
        if fecha_inicio:
            query = query.filter(Prestamo.fecha_prestamo >= datetime.strptime(fecha_inicio, '%Y-%m-%d'))
        if fecha_fin:
            query = query.filter(Prestamo.fecha_prestamo <= datetime.strptime(fecha_fin, '%Y-%m-%d'))
        if docente_filtro:
            query = query.filter(Usuario.docente.ilike(f'%{docente_filtro}%'))
        
        materias = query.group_by(Usuario.materia, Usuario.docente).order_by(db.desc('total_productos')).all()
        
        resultado = {
            'total_materias': len(materias),
            'materias': [
                {
                    'materia': mat.materia,
                    'docente': mat.docente,
                    'numero_prestamos': mat.numero_prestamos,
                    'total_productos': mat.total_productos,
                    'numero_estudiantes': mat.numero_estudiantes
                }
                for mat in materias
            ]
        }
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': f'Error generando reporte de materias: {str(e)}'}), 500

@app.route('/api/reportes/productos', methods=['GET'])
def reporte_productos():
    """Reporte de productos más solicitados."""
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        materia_filtro = request.args.get('materia')
        tipo_usuario = request.args.get('tipo_usuario')
        limite = int(request.args.get('limite', 10))
        
        query = db.session.query(
            Elemento.id,
            Elemento.nombre,
            Categoria.nombre.label('categoria'),
            db.func.count(Prestamo.id).label('numero_prestamos'),
            db.func.sum(Prestamo.cantidad).label('total_solicitado')
        ).join(Prestamo).join(Usuario).join(Categoria)
        
        # Aplicar filtros
        if fecha_inicio:
            query = query.filter(Prestamo.fecha_prestamo >= datetime.strptime(fecha_inicio, '%Y-%m-%d'))
        if fecha_fin:
            query = query.filter(Prestamo.fecha_prestamo <= datetime.strptime(fecha_fin, '%Y-%m-%d'))
        if materia_filtro:
            query = query.filter(Usuario.materia.ilike(f'%{materia_filtro}%'))
        if tipo_usuario:
            query = query.filter(Usuario.tipo == tipo_usuario)
        
        productos = query.group_by(Elemento.id, Categoria.nombre).order_by(db.desc('total_solicitado')).limit(limite).all()
        
        resultado = {
            'total_productos': len(productos),
            'limite_aplicado': limite,
            'productos': [
                {
                    'id': prod.id,
                    'nombre': prod.nombre,
                    'categoria': prod.categoria,
                    'numero_prestamos': prod.numero_prestamos,
                    'total_solicitado': prod.total_solicitado
                }
                for prod in productos
            ]
        }
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': f'Error generando reporte de productos: {str(e)}'}), 500

# =============================================================================
# MÓDULO DE GESTIÓN ADMINISTRATIVA (Solo para laboratoristas)
# =============================================================================

@app.route('/api/admin/usuarios', methods=['GET'])
def admin_obtener_usuarios():
    """Obtener todos los usuarios por tipo."""
    try:
        tipo = request.args.get('tipo', 'todos')
        incluir_inactivos = request.args.get('incluir_inactivos', 'false').lower() == 'true'
        
        # Construir query base
        query = Usuario.query
        
        # Filtrar por tipo si se especifica
        if tipo != 'todos':
            query = query.filter_by(tipo=tipo)
        
        # Filtrar por estado activo si no se incluyen inactivos
        if not incluir_inactivos:
            query = query.filter_by(activo=True)
        
        usuarios = query.order_by(Usuario.identificacion.desc()).all()
        
        usuarios_data = []
        for usuario in usuarios:
            usuarios_data.append({
                'id': usuario.id,
                'tipo': usuario.tipo,
                'nombre': usuario.nombre,
                'identificacion': usuario.identificacion,
                'correo': usuario.correo,
                'pin': usuario.pin,
                'docente': usuario.docente,
                'materia': usuario.materia,
                'activo': usuario.activo
            })
        
        return jsonify({'usuarios': usuarios_data})
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo usuarios: {str(e)}'}), 500

@app.route('/api/admin/usuarios', methods=['POST'])
def admin_crear_usuario():
    """Crear nuevo usuario."""
    try:
        data = request.json
        
        # Validar datos requeridos
        if not all(k in data for k in ('tipo', 'nombre', 'identificacion')):
            return jsonify({'error': 'Datos incompletos'}), 400
        
        # Validar que la identificación no exista
        if Usuario.query.filter_by(identificacion=data['identificacion']).first():
            return jsonify({'error': 'La identificación ya existe'}), 400
        
        # Validar email si se proporciona
        if data.get('correo'):
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data['correo']):
                return jsonify({'error': 'Formato de correo inválido'}), 400
        
        # Crear usuario
        usuario = Usuario(
            tipo=data['tipo'],
            nombre=data['nombre'],
            identificacion=data['identificacion'],
            correo=data.get('correo'),
            pin=data.get('pin'),
            docente=data.get('docente'),
            materia=data.get('materia')
        )
        
        db.session.add(usuario)
        db.session.commit()
        
        return jsonify({'mensaje': 'Usuario creado exitosamente', 'usuario': usuario.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error creando usuario: {str(e)}'}), 500

@app.route('/api/admin/usuarios/<int:usuario_id>', methods=['GET'])
def admin_obtener_usuario(usuario_id):
    """Obtener usuario por ID."""
    try:
        usuario = Usuario.query.get_or_404(usuario_id)
        return jsonify({
            'usuario': {
                'id': usuario.id,
                'tipo': usuario.tipo,
                'nombre': usuario.nombre,
                'identificacion': usuario.identificacion,
                'correo': usuario.correo,
                'pin': usuario.pin,
                'docente': usuario.docente,
                'materia': usuario.materia
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo usuario: {str(e)}'}), 500

@app.route('/api/admin/usuarios/<int:usuario_id>', methods=['PUT'])
def admin_actualizar_usuario(usuario_id):
    """Actualizar usuario existente."""
    try:
        usuario = Usuario.query.get_or_404(usuario_id)
        data = request.json
        
        # Validar identificación única si se cambió
        if 'identificacion' in data and data['identificacion'] != usuario.identificacion:
            if Usuario.query.filter_by(identificacion=data['identificacion']).first():
                return jsonify({'error': 'La identificación ya existe'}), 400
        
        # Validar email si se proporciona
        if data.get('correo'):
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data['correo']):
                return jsonify({'error': 'Formato de correo inválido'}), 400
        
        # Actualizar campos
        if 'nombre' in data:
            usuario.nombre = data['nombre']
        if 'identificacion' in data:
            usuario.identificacion = data['identificacion']
        if 'correo' in data:
            usuario.correo = data['correo']
        if 'pin' in data:
            usuario.pin = data['pin']
        if 'docente' in data:
            usuario.docente = data['docente']
        if 'materia' in data:
            usuario.materia = data['materia']
        
        db.session.commit()
        
        return jsonify({'mensaje': 'Usuario actualizado exitosamente', 'usuario': usuario.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error actualizando usuario: {str(e)}'}), 500

@app.route('/api/admin/usuarios/<int:usuario_id>/toggle-activo', methods=['PATCH'])
def admin_toggle_activo_usuario(usuario_id):
    """Activar/Inactivar usuario."""
    try:
        usuario = Usuario.query.get_or_404(usuario_id)
        
        # Verificar si el usuario tiene préstamos activos antes de inactivar
        if usuario.activo:  # Si está activo y queremos inactivarlo
            prestamos_activos = Prestamo.query.filter_by(usuario_id=usuario_id, estado='prestado').count()
            if prestamos_activos > 0:
                return jsonify({'error': 'No se puede inactivar el usuario porque tiene préstamos activos. Debe devolver todos los préstamos antes de inactivar el usuario.'}), 400
        
        # Cambiar el estado activo
        usuario.activo = not usuario.activo
        db.session.commit()
        
        estado_str = "activado" if usuario.activo else "inactivado"
        return jsonify({'mensaje': f'Usuario {usuario.nombre} {estado_str} exitosamente'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error actualizando estado del usuario: {str(e)}'}), 500

@app.route('/api/docentes-activos', methods=['GET'])
def obtener_docentes_activos():
    """Obtener lista de docentes activos para dropdown."""
    try:
        docentes = Usuario.query.filter_by(tipo='docente', activo=True).order_by(Usuario.nombre).all()
        docentes_list = [{'id': d.id, 'nombre': d.nombre} for d in docentes]
        return jsonify({'docentes': docentes_list})
    except Exception as e:
        return jsonify({'error': f'Error obteniendo docentes: {str(e)}'}), 500

@app.route('/api/materias-activas', methods=['GET'])
def obtener_materias_activas():
    """Obtener lista de materias activas para dropdown."""
    try:
        materias = Materia.query.filter_by(activo=True).order_by(Materia.nombre).all()
        materias_list = [{'id': m.id, 'nombre': m.nombre} for m in materias]
        return jsonify({'materias': materias_list})
    except Exception as e:
        return jsonify({'error': f'Error obteniendo materias: {str(e)}'}), 500

@app.route('/api/admin/materias', methods=['GET'])
def admin_obtener_materias():
    """Obtener todas las materias."""
    try:
        materias = Materia.query.all()
        return jsonify({'materias': [materia.to_dict() for materia in materias]})
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo materias: {str(e)}'}), 500

@app.route('/api/admin/materias', methods=['POST'])
def admin_crear_materia():
    """Crear nueva materia."""
    try:
        data = request.json
        
        # Validar datos requeridos
        if not data.get('nombre'):
            return jsonify({'error': 'El nombre de la materia es requerido'}), 400
        
        # Validar que el nombre no exista
        if Materia.query.filter_by(nombre=data['nombre']).first():
            return jsonify({'error': 'Ya existe una materia con este nombre'}), 400
        
        # Crear materia
        materia = Materia(
            nombre=data['nombre'],
            codigo=data.get('codigo'),
            activa=data.get('activa', True)
        )
        
        db.session.add(materia)
        db.session.commit()
        
        return jsonify({'mensaje': 'Materia creada exitosamente', 'materia': materia.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error creando materia: {str(e)}'}), 500

@app.route('/api/admin/materias/<int:materia_id>', methods=['PUT'])
def admin_actualizar_materia(materia_id):
    """Actualizar materia existente."""
    try:
        materia = Materia.query.get_or_404(materia_id)
        data = request.json
        
        # Validar nombre único si se cambió
        if 'nombre' in data and data['nombre'] != materia.nombre:
            if Materia.query.filter_by(nombre=data['nombre']).first():
                return jsonify({'error': 'Ya existe una materia con este nombre'}), 400
        
        # Actualizar campos
        if 'nombre' in data:
            materia.nombre = data['nombre']
        if 'codigo' in data:
            materia.codigo = data['codigo']
        if 'activa' in data:
            materia.activa = data['activa']
        
        db.session.commit()
        
        return jsonify({'mensaje': 'Materia actualizada exitosamente', 'materia': materia.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error actualizando materia: {str(e)}'}), 500

@app.route('/api/admin/materias/<int:materia_id>', methods=['DELETE'])
def admin_eliminar_materia(materia_id):
    """Eliminar materia (marcar como inactiva para preservar historial)."""
    try:
        materia = Materia.query.get_or_404(materia_id)
        
        # En lugar de eliminar, marcar como inactiva para preservar historial
        materia.activa = False
        db.session.commit()
        
        return jsonify({'mensaje': f'Materia {materia.nombre} desactivada exitosamente'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error eliminando materia: {str(e)}'}), 500

# Punto de entrada
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)