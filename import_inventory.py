"""
Script para importar datos de inventario desde CSV a la base de datos.
"""
import csv
import os
import json
from app import db
from models import Categoria, Elemento

def import_inventory_from_csv(csv_file):
    """Importar inventario desde un archivo CSV."""
    print(f"Importando inventario desde {csv_file}...")
    
    categorias_creadas = {}
    elementos_creados = 0
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Limitamos a 100 elementos para evitar sobrecargar la BD en producción
            max_elementos = 100
            contador_filas = 0
            
            for row in reader:
                contador_filas += 1
                if contador_filas > max_elementos:
                    break
                if not row['CATEGORIA'] or row['CATEGORIA'].lower() == 'nan':
                    continue  # Saltamos filas sin categoría definida
                
                # Manejar categoría
                categoria_nombre = row['CATEGORIA'].strip()
                if categoria_nombre not in categorias_creadas:
                    # Verificar si la categoría ya existe en la base de datos
                    categoria = Categoria.query.filter_by(nombre=categoria_nombre).first()
                    if not categoria:
                        categoria = Categoria(nombre=categoria_nombre)
                        db.session.add(categoria)
                        db.session.commit()
                    
                    categorias_creadas[categoria_nombre] = categoria.id
                
                # Manejar elemento
                elemento_nombre = row['ELEMENTO'].strip()
                if not elemento_nombre or elemento_nombre.lower() == 'nan':
                    continue  # Saltamos elementos sin nombre definido
                
                # Verificar si el elemento ya existe
                codigo = f"{categoria_nombre[:3]}-{elementos_creados + 1:04d}"
                elemento = Elemento.query.filter_by(nombre=elemento_nombre, categoria_id=categorias_creadas[categoria_nombre]).first()
                
                if not elemento:
                    # Obtener cantidad, ubicación y descripción
                    try:
                        cantidad = int(row['CANTIDAD']) if row['CANTIDAD'] and row['CANTIDAD'].lower() != 'nan' else 0
                    except ValueError:
                        cantidad = 0
                    
                    ubicacion = row['UBICACION'] if row['UBICACION'] and row['UBICACION'].lower() != 'nan' else None
                    
                    # Combinar enlace y observaciones para la descripción
                    descripcion = ""
                    if row.get('LINK_REFERENCIA') and row['LINK_REFERENCIA'].lower() != 'sin enlace de referencia' and row['LINK_REFERENCIA'].lower() != 'nan':
                        descripcion += f"Referencia: {row['LINK_REFERENCIA']}\n"
                    
                    if row.get('OBSERVACIONES') and row['OBSERVACIONES'].lower() != 'nan':
                        descripcion += row['OBSERVACIONES']
                    
                    # Crear nuevo elemento
                    nuevo_elemento = Elemento(
                        codigo=codigo,
                        nombre=elemento_nombre,
                        descripcion=descripcion,
                        cantidad=cantidad,
                        ubicacion=ubicacion,
                        categoria_id=categorias_creadas[categoria_nombre]
                    )
                    
                    db.session.add(nuevo_elemento)
                    elementos_creados += 1
                    
                    # Commit cada 50 elementos para no sobrecargar la DB
                    if elementos_creados % 50 == 0:
                        db.session.commit()
                        print(f"Procesados {elementos_creados} elementos...")
        
        # Commit final
        db.session.commit()
        print(f"¡Importación completada! Se crearon {len(categorias_creadas)} categorías y {elementos_creados} elementos.")
        return True, f"Se crearon {len(categorias_creadas)} categorías y {elementos_creados} elementos."
    
    except Exception as e:
        db.session.rollback()
        print(f"Error importando inventario: {str(e)}")
        return False, f"Error: {str(e)}"

if __name__ == "__main__":
    # Ruta al archivo CSV
    csv_file = "attached_assets/MATERIALES_PISO_4_PROCESADO.csv"
    
    # Verificar que el archivo existe
    if not os.path.exists(csv_file):
        print(f"El archivo {csv_file} no existe.")
    else:
        from app import app
        with app.app_context():
            success, message = import_inventory_from_csv(csv_file)
            print(message)