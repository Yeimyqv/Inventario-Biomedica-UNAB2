"""
Modelos para el Sistema de Gestión de Laboratorio de Bioinstrumentación.
"""

from datetime import datetime
from app import db

class Categoria(db.Model):
    """Modelo para categorías de elementos."""
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    elementos = db.relationship('Elemento', backref='categoria', lazy=True)
    
    def __repr__(self):
        return f'<Categoria {self.nombre}>'
    
    def to_dict(self):
        """Convertir objeto a diccionario."""
        return {
            'id': self.id,
            'nombre': self.nombre
        }

class Elemento(db.Model):
    """Modelo para elementos del inventario."""
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), nullable=False, unique=True)
    nombre = db.Column(db.String(1000), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    cantidad = db.Column(db.Integer, default=0)
    ubicacion = db.Column(db.String(100), nullable=True)
    imagen_url = db.Column(db.String(255), nullable=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)
    prestamos = db.relationship('Prestamo', backref='elemento', lazy=True)
    
    def __repr__(self):
        return f'<Elemento {self.codigo} - {self.nombre}>'
    
    def to_dict(self):
        """Convertir objeto a diccionario."""
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'cantidad': self.cantidad,
            'ubicacion': self.ubicacion,
            'imagen_url': self.imagen_url,
            'categoria_id': self.categoria_id,
            'categoria_nombre': self.categoria.nombre
        }
    
    def disponibles(self):
        """Calcular la cantidad disponible teniendo en cuenta los préstamos activos."""
        prestamos_activos = Prestamo.query.filter_by(
            elemento_id=self.id, 
            estado='prestado'
        ).all()
        
        cantidad_prestada = sum(prestamo.cantidad for prestamo in prestamos_activos)
        return self.cantidad - cantidad_prestada

class Usuario(db.Model):
    """Modelo para usuarios del sistema."""
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)  # estudiante, docente, laboratorista
    nombre = db.Column(db.String(100), nullable=False)
    identificacion = db.Column(db.String(20), nullable=False, unique=True)
    pin = db.Column(db.String(20), nullable=True)  # Solo para docentes y laboratoristas
    correo = db.Column(db.String(100), nullable=True)  # Correo institucional
    docente = db.Column(db.String(100), nullable=True)  # Docente asociado (solo para estudiantes)
    materia = db.Column(db.String(100), nullable=True)  # Materia o curso (solo para estudiantes)
    prestamos = db.relationship('Prestamo', backref='usuario', lazy=True)
    
    def __repr__(self):
        return f'<Usuario {self.tipo} - {self.nombre}>'
    
    def to_dict(self):
        """Convertir objeto a diccionario."""
        data = {
            'id': self.id,
            'tipo': self.tipo,
            'nombre': self.nombre,
            'identificacion': self.identificacion,
            'correo': self.correo
        }
        
        # Agregar campos adicionales solo si son relevantes para el tipo de usuario
        if self.tipo == 'estudiante':
            data.update({
                'docente': self.docente,
                'materia': self.materia
            })
            
        return data

class Prestamo(db.Model):
    """Modelo para préstamos de elementos."""
    id = db.Column(db.Integer, primary_key=True)
    elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=1)
    fecha_prestamo = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_devolucion_esperada = db.Column(db.DateTime, nullable=True)
    fecha_devolucion_real = db.Column(db.DateTime, nullable=True)
    estado = db.Column(db.String(20), default='prestado')  # prestado, devuelto, vencido
    observaciones = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<Prestamo {self.id} - {self.elemento.nombre} a {self.usuario.nombre}>'
    
    def to_dict(self):
        """Convertir objeto a diccionario."""
        return {
            'id': self.id,
            'elemento_id': self.elemento_id,
            'elemento_nombre': self.elemento.nombre,
            'elemento_codigo': self.elemento.codigo,
            'usuario_id': self.usuario_id,
            'usuario_nombre': self.usuario.nombre,
            'usuario_identificacion': self.usuario.identificacion,
            'usuario_correo': self.usuario.correo,
            'cantidad': self.cantidad,
            'fecha_prestamo': self.fecha_prestamo.strftime('%Y-%m-%d %H:%M'),
            'fecha_devolucion_esperada': self.fecha_devolucion_esperada.strftime('%Y-%m-%d %H:%M') if self.fecha_devolucion_esperada else None,
            'fecha_devolucion_real': self.fecha_devolucion_real.strftime('%Y-%m-%d %H:%M') if self.fecha_devolucion_real else None,
            'estado': self.estado,
            'observaciones': self.observaciones
        }