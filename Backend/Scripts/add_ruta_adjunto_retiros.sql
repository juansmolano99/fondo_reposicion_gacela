-- Agregar columna para archivos adjuntos en retiros.
-- Ejecutar una sola vez. Si la columna ya existe, ignorar el error.
ALTER TABLE fondo_repo_retiros_produc
ADD COLUMN ruta_adjunto VARCHAR(500) NULL;
