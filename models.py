from app import db
from datetime import datetime

# Modelo para categorías de inventario
class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    elementos = db.relationship('Elemento', backref='categoria', lazy=True)
    
    def __repr__(self):
        return f'<Categoria {self.nombre}>'

# Modelo para elementos del inventario
class Elemento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), nullable=False, unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    cantidad = db.Column(db.Integer, default=0)
    ubicacion = db.Column(db.String(100), nullable=True)
    imagen_url = db.Column(db.String(255), nullable=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)
    prestamos = db.relationship('Prestamo', backref='elemento', lazy=True)
    
    def __repr__(self):
        return f'<Elemento {self.nombre}>'

# Modelo para usuarios
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)  # estudiante, docente, laboratorista
    nombre = db.Column(db.String(100), nullable=False)
    identificacion = db.Column(db.String(20), nullable=False, unique=True)
    pin = db.Column(db.String(20), nullable=True)  # Solo para docentes y laboratoristas
    prestamos = db.relationship('Prestamo', backref='usuario', lazy=True)
    
    def __repr__(self):
        return f'<Usuario {self.nombre} ({self.tipo})>'

# Modelo para préstamos
class Prestamo(db.Model):
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
        return f'<Prestamo {self.id} - {self.estado}>'