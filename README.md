# La Cantina - Servidor Web con Docker

Aplicación web de ejemplo con **PHP 8.2**, **Apache** y **SSL/HTTPS** ejecutándose en Docker.

## Requisitos Previos

- Docker instalado ([Descargar Docker](https://www.docker.com/get-started))
- Docker Compose instalado (incluido con Docker Desktop)

## Estructura del Proyecto

```
lacantina/
├── Dockerfile                   # Configuración del contenedor
├── docker-compose.yml           # Orquestación de servicios
├── lacantina-vhosts.conf        # Configuración de Apache
├── lacantina.crt                # Certificado SSL
├── lacantina.key                # Clave privada SSL
├── public-html/
│   └── public/                  # DocumentRoot (accesible vía web)
│       ├── index.html           # Página principal
│       └── info.php             # Información del sistema
└── README.md                    # Este archivo
```

## Instalación y Configuración

### Paso 1: Clonar o crear el proyecto

```bash
# Crear directorio del proyecto
mkdir lacantina
cd lacantina
```

### Paso 2: Crear los archivos de configuración

#### Dockerfile

```dockerfile
# Use an official PHP image with Apache
FROM php:8.2-apache

# Install Nano (optional)
RUN apt-get update && \
    apt-get install -y nano && \
    rm -rf /var/lib/apt/lists/*

# Copy SSL certificate and key (solo una vez, no se modificarán)
COPY lacantina.crt /etc/ssl/certs/lacantina.crt
COPY lacantina.key /etc/ssl/private/lacantina.key

# Set proper permissions for SSL files
RUN chmod 600 /etc/ssl/private/lacantina.key && \
    chmod 644 /etc/ssl/certs/lacantina.crt

# Copy the custom Apache virtual host config
COPY ./lacantina-vhosts.conf /etc/apache2/sites-available/my-ssl.conf

# Enable SSL module and rewrite
RUN a2enmod ssl && \
    a2enmod rewrite && \
    a2dissite 000-default default-ssl && \
    a2ensite my-ssl

EXPOSE 80 443
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./public-html:/var/www/html
      - ./lacantina-vhosts.conf:/etc/apache2/sites-available/my-ssl.conf:ro
    container_name: lacantina-web
```

#### lacantina-vhosts.conf

```apache
<VirtualHost *:443>
    DocumentRoot "/var/www/html/public"
    ServerName localhost
    
    SSLEngine on
    SSLCertificateFile "/etc/ssl/certs/lacantina.crt"
    SSLCertificateKeyFile "/etc/ssl/private/lacantina.key"
    
    <Directory "/var/www/html/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Para que /php sea accesible como alias
    Alias /php "/var/www/html/php"
    <Directory "/var/www/html/php">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

<VirtualHost *:80>
    ServerName localhost
    Redirect permanent / https://localhost/
</VirtualHost>
```

### Paso 3: Generar certificados SSL autofirmados

```bash
# Generar certificado y clave privada (válido por 365 días)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout lacantina.key \
  -out lacantina.crt \
  -subj "/C=ES/ST=Catalunya/L=Barcelona/O=LaCantina/CN=localhost"
```

### Paso 4: Crear estructura de directorios

```bash
# Crear directorios
mkdir -p public-html/public

# Copiar los archivos de la aplicación (ya mostrados anteriormente)
# - public-html/public/index.html
# - public-html/public/info.php
```

## Comandos de Uso

### Construir y levantar el contenedor

```bash
# Primera vez o después de cambiar Dockerfile/certificados
docker-compose up -d --build

# Solo levantar (sin reconstruir)
docker-compose up -d
```

### Ver logs del contenedor

```bash
# Logs en tiempo real
docker-compose logs -f

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Reiniciar el contenedor

```bash
# Después de modificar lacantina-vhosts.conf
docker-compose restart

# O recargar Apache sin parar el contenedor
docker-compose exec web apache2ctl graceful
```

### Entrar al contenedor

```bash
# Abrir shell interactivo
docker-compose exec web bash

# Editar archivo con nano
docker-compose exec web nano /etc/apache2/sites-available/my-ssl.conf
```

### Detener el contenedor

```bash
# Parar contenedor
docker-compose stop

# Parar y eliminar contenedor
docker-compose down

# Parar, eliminar contenedor y volúmenes
docker-compose down -v
```

### Ver estado del contenedor

```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats lacantina-web
```

## Acceso a la Aplicación

Una vez levantado el contenedor:

- **HTTPS**: https://localhost (recomendado)
- **HTTP**: http://localhost (redirige a HTTPS)

### Páginas disponibles:

1. **Inicio**: https://localhost/
2. **Información PHP**: https://localhost/info.php

**Nota sobre SSL**: Como el certificado es autofirmado, tu navegador mostrará una advertencia de seguridad. Puedes aceptarla de forma segura en localhost.

## Desarrollo

### Modificar archivos HTML/PHP

Los archivos en `public-html/` están montados como volumen, por lo que:

**Cambios instantáneos** en archivos `.html`  
**No necesitas reiniciar** el contenedor  
Solo **refresca el navegador** (F5)

```bash
# Ejemplo: editar página principal
nano public-html/public/index.html
# Guardar y refrescar navegador
```

### Modificar configuración de Apache

Si modificas `lacantina-vhosts.conf`:

```bash
# Reiniciar para aplicar cambios
docker-compose restart

# O recargar gracefully
docker-compose exec web apache2ctl graceful
```

### Añadir nuevas páginas PHP

```bash
# Crear nueva página
nano public-html/public/mipagina.php
```

Contenido de ejemplo:
```php
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi Página</title>
</head>
<body>
    <h1>Hola Mundo</h1>
    <p>Hora del servidor: <?php echo getServerTime(); ?></p>
</body>
</html>
```

Acceder en: https://localhost/mipagina.php

## Solución de Problemas

### Error: "Port 80 is already in use"

```bash
# Ver qué proceso usa el puerto 80
sudo lsof -i :80

# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Cambiar 80 por 8080
  - "8443:443" # Cambiar 443 por 8443
```

### Error: "Permission denied" en certificados

```bash
# Dar permisos correctos
chmod 644 lacantina.crt
chmod 600 lacantina.key
```

### Apache no arranca

```bash
# Ver logs completos
docker-compose logs web

# Verificar sintaxis de configuración
docker-compose exec web apache2ctl configtest

# Verificar que los módulos SSL están habilitados
docker-compose exec web apache2ctl -M | grep ssl
```

### Cambios en PHP no se reflejan

```bash
# Verificar que el volumen está montado correctamente
docker-compose exec web ls -la /var/www/html/public

# Limpiar caché de PHP (si usas OPcache)
docker-compose exec web service apache2 reload
```

### Error "PR_END_OF_FILE_ERROR" en navegador

```bash
# Verificar que Apache escucha en puerto 443
docker-compose exec web netstat -tlnp | grep 443

# Verificar configuración SSL
docker-compose exec web apache2ctl -S
```

## Extensiones PHP Adicionales

Si necesitas instalar extensiones PHP adicionales, modifica el `Dockerfile`:

```dockerfile
# Ejemplo: instalar mysqli y pdo_mysql
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Ejemplo: instalar GD para procesamiento de imágenes
RUN apt-get update && \
    apt-get install -y libpng-dev libjpeg-dev && \
    docker-php-ext-configure gd --with-jpeg && \
    docker-php-ext-install gd
```

Luego reconstruir:
```bash
docker-compose up -d --build
```

## Seguridad

### Producción

Para usar en producción:

1. **Certificado SSL real**: Usa Let's Encrypt o un certificado comercial
2. **Variables de entorno**: No hardcodear credenciales
3. **Permisos**: Ajustar permisos de archivos y directorios
4. **Firewall**: Configurar reglas de firewall apropiadas
5. **Actualizaciones**: Mantener Docker y la imagen PHP actualizados

### Certificado SSL de producción con Let's Encrypt

```bash
# Instalar certbot
sudo apt-get install certbot

# Obtener certificado (requiere dominio real)
sudo certbot certonly --standalone -d tudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem lacantina.crt
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem lacantina.key
```

## Recursos Adicionales

- [Documentación oficial de PHP](https://www.php.net/docs.php)
- [Documentación de Apache](https://httpd.apache.org/docs/)
- [Documentación de Docker](https://docs.docker.com/)
- [Docker Hub - PHP Official Images](https://hub.docker.com/_/php)

## Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica la configuración: `docker-compose exec web apache2ctl configtest`
3. Comprueba que los archivos existen: `docker-compose exec web ls -la /var/www/html`

## Licencia

Este es un proyecto de ejemplo para propósitos educativos.

---

**¡Disfruta desarrollando!**