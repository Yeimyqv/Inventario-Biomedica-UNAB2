"""
Script para inicializar la base de datos con usuarios del sistema.
(No se cargan elementos para evitar datos estáticos - los elementos se importan desde CSV)
"""
from app import app, db
from models import Usuario

def init_system_users():
    """Inicializar la base de datos con usuarios de sistema."""
    print("Inicializando usuarios del sistema...")
    
    # Crear usuarios administrativos de ejemplo (solo si no existen)
    docentes = [
        Usuario(tipo='docente', nombre='Docente de Bioinstrumentación', identificacion='DOC001', pin='DOC1234')
    ]
    
    laboratoristas = [
        Usuario(tipo='laboratorista', nombre='Lina Alexandra Quiroz Obando', identificacion='LAB001', pin='LAB5678'),
        Usuario(tipo='laboratorista', nombre='Luis Alexandres Vargas Vargas', identificacion='LAB002', pin='LAB5678'),
        Usuario(tipo='laboratorista', nombre='Juan Camilo Sierra Martinez', identificacion='LAB003', pin='LAB5678')
    ]
    
    # Verificar si ya existen estos usuarios para no duplicarlos
    for docente in docentes:
        existing_user = Usuario.query.filter_by(identificacion=docente.identificacion).first()
        if not existing_user:
            db.session.add(docente)
    
    for laboratorista in laboratoristas:
        existing_user = Usuario.query.filter_by(identificacion=laboratorista.identificacion).first()
        if not existing_user:
            db.session.add(laboratorista)
    
    db.session.commit()
    print("Usuarios del sistema inicializados con éxito.")

if __name__ == '__main__':
    with app.app_context():
        # Inicializar con usuarios administrativos
        init_system_users()