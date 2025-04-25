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
        # No borraremos nada, solo agregaremos elementos nuevos
        print("Verificando elementos y categorías existentes...")
        
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Procesamos todos los elementos del archivo CSV
            contador_filas = 0
            
            for row in reader:
                contador_filas += 1
                if contador_filas % 20 == 0:
                    print(f"Procesados {contador_filas} elementos...")
                
                # Manejar categoría
                categoria_nombre = row.get('CATEGORIA', '').strip()
                if not categoria_nombre or categoria_nombre.lower() == 'nan':
                    print(f"Omitiendo fila {contador_filas}: Sin categoría")
                    continue  # Saltamos filas sin categoría definida
                
                # Crear o recuperar categoría
                if categoria_nombre not in categorias_creadas:
                    # Buscar si ya existe la categoría
                    categoria = Categoria.query.filter_by(nombre=categoria_nombre).first()
                    
                    if not categoria:
                        # Crear nueva categoría si no existe
                        categoria = Categoria(nombre=categoria_nombre)
                        db.session.add(categoria)
                        db.session.flush()  # Para obtener el ID generado
                        print(f"Creada categoría: {categoria_nombre} (ID: {categoria.id})")
                    else:
                        print(f"Usando categoría existente: {categoria_nombre} (ID: {categoria.id})")
                    
                    categorias_creadas[categoria_nombre] = categoria.id
                
                # Manejar elemento
                elemento_nombre = row.get('ELEMENTO', '').strip()
                if not elemento_nombre or elemento_nombre.lower() == 'nan':
                    print(f"Omitiendo fila {contador_filas}: Sin nombre de elemento")
                    continue  # Saltamos elementos sin nombre definido
                
                # Verificar si el elemento ya existe en esta categoría
                elemento_existente = Elemento.query.filter_by(
                    nombre=elemento_nombre,
                    categoria_id=categorias_creadas[categoria_nombre]
                ).first()
                
                if elemento_existente:
                    print(f"Elemento ya existe: {elemento_nombre} (Categoría: {categoria_nombre})")
                    continue
                
                # Generar código único
                codigo = f"{categoria_nombre[:3]}-{elementos_creados + 1:04d}"
                
                # Obtener cantidad, ubicación y descripción
                try:
                    cantidad_str = row.get('CANTIDAD', '0').strip()
                    cantidad = int(cantidad_str) if cantidad_str and cantidad_str.lower() != 'nan' else 0
                except ValueError:
                    print(f"Error al convertir cantidad '{row.get('CANTIDAD')}' para {elemento_nombre}. Usando 0.")
                    cantidad = 0
                
                ubicacion = row.get('UBICACION', '') 
                if not ubicacion or ubicacion.lower() == 'nan':
                    ubicacion = "No especificada"
                
                # Combinar enlace y observaciones para la descripción
                descripcion = ""
                link_ref = row.get('LINK_REFERENCIA', '')
                if link_ref and link_ref.lower() != 'sin enlace de referencia' and link_ref.lower() != 'nan':
                    descripcion += f"Referencia: {link_ref}\n"
                
                obs = row.get('OBSERVACIONES', '')
                if obs and obs.lower() != 'nan':
                    descripcion += obs
                
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
                
                print(f"Elemento {elementos_creados} creado: {elemento_nombre} (Categoría: {categoria_nombre})")
                
                # Commit cada 20 elementos para no sobrecargar la DB
                if elementos_creados % 20 == 0:
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