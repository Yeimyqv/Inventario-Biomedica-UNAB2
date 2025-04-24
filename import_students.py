"""
Script para importar datos de estudiantes desde CSV a la base de datos.
"""
import csv
import os
from app import db, app
from models import Usuario

def import_students_from_csv(csv_file):
    """Importar estudiantes desde un archivo CSV."""
    with app.app_context():
        try:
            # Leer el archivo CSV
            with open(csv_file, 'r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                
                # Contador de estudiantes agregados/actualizados
                count = 0
                
                for row in csv_reader:
                    # Formatear datos del CSV
                    id_estudiante = row['IDD'].strip()
                    nombre = row['NOMBRE'].strip()
                    correo = row['Correo_Institucional'].strip()
                    
                    # Verificar si ya existe el usuario
                    estudiante = Usuario.query.filter_by(identificacion=id_estudiante).first()
                    
                    if estudiante:
                        # Actualizar datos si ya existe
                        estudiante.nombre = nombre
                        estudiante.correo = correo
                        print(f"Actualizando estudiante: {id_estudiante} - {nombre}")
                    else:
                        # Crear nuevo usuario tipo estudiante
                        nuevo_estudiante = Usuario(
                            tipo='estudiante',
                            nombre=nombre,
                            identificacion=id_estudiante,
                            correo=correo
                        )
                        db.session.add(nuevo_estudiante)
                        print(f"Nuevo estudiante agregado: {id_estudiante} - {nombre}")
                    
                    count += 1
                    
                    # Guardar cambios en grupos de 100 para evitar sobrecarga
                    if count % 100 == 0:
                        db.session.commit()
                        print(f"Guardados {count} estudiantes...")
                
                # Guardar todos los cambios pendientes
                db.session.commit()
                print(f"Importación completa: {count} estudiantes procesados.")
                
        except Exception as e:
            db.session.rollback()
            print(f"Error durante la importación: {str(e)}")
            raise

if __name__ == '__main__':
    # Ruta al archivo CSV
    csv_path = 'attached_assets/Estudiantes_Biomedica_PostgreSQL.csv'
    
    # Verificar si el archivo existe
    if os.path.exists(csv_path):
        import_students_from_csv(csv_path)
    else:
        print(f"Error: No se encontró el archivo {csv_path}")