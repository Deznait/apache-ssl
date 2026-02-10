# La Cantina - Servidor Web con Docker

Aplicación web con **PHP 8.2**, **Apache** y **SSL/HTTPS** ejecutándose en Docker.

## Requisitos Previos

- Docker instalado ([Descargar Docker](https://www.docker.com/get-started))
- Docker Compose instalado (incluido con Docker Desktop)

## Estructura del Proyecto

```
apache-ssl/
├── Dockerfile                    # Configuración del contenedor
├── docker-compose.yml            # Orquestación de servicios
├── lacantina-vhosts.conf        # Configuración de Apache
├── lacantina.crt                # Certificado SSL
├── lacantina.key                # Clave privada SSL
├── .gitignore                   # Archivos ignorados por Git
├── public-html/
│   └── public/                     # DocumentRoot (accesible vía web)
│       └── <estructura de la aplicación>
└── README.md                    # Este archivo
```

## Instalación y Uso

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/Deznait/apache-ssl.git
cd apache-ssl
```

### Paso 2: Generar certificados SSL (si no los tienes)

```bash
# Generar certificado y clave privada autofirmados (válido por 365 días)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout lacantina.key \
  -out lacantina.crt \
  -subj "/C=ES/ST=Catalunya/L=Barcelona/O=LaCantina/CN=localhost"
```

### Paso 3: Levantar el contenedor

```bash
# Construir y levantar
docker-compose up -d --build

# Solo levantar (sin reconstruir)
docker-compose up -d
```

### Paso 4: Acceder a la aplicación

- **HTTPS**: https://localhost (recomendado)
- **HTTP**: http://localhost (redirige a HTTPS)

**Nota**: Como el certificado es autofirmado, el navegador mostrará una advertencia de seguridad. Puedes aceptarla de forma segura en localhost.

## Comandos Útiles

### Ver logs del contenedor

```bash
# Logs en tiempo real
docker-compose logs -f

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Reiniciar el contenedor

```bash
# Reiniciar completamente
docker-compose restart

# Recargar Apache sin parar el contenedor
docker-compose exec web apache2ctl graceful
```

### Entrar al contenedor

```bash
# Abrir shell interactivo
docker-compose exec web bash

# Editar configuración de Apache
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

## Desarrollo

### Modificar archivos de la aplicación

Los archivos en `public-html/` están montados como volumen:

**Cambios instantáneos** - Modifica HTML, PHP, CSS, JS  
**No necesitas reiniciar** - Solo refresca el navegador (F5)  
**Desarrollo en vivo** - Los cambios se reflejan inmediatamente

```bash
# Ejemplo: editar un archivo
nano public-html/public/index.html
# Guardar y refrescar navegador
```

### Modificar configuración de Apache

Si modificas `lacantina-vhosts.conf`:

```bash
# Reiniciar para aplicar cambios
docker-compose restart

# O recargar gracefully (sin downtime)
docker-compose exec web apache2ctl graceful
```

## Protección con htpasswd (Autenticación Básica)

Puedes proteger directorios específicos usando autenticación HTTP básica.

### Paso 1: Generar archivo .htpasswd

**Opción A: Con htpasswd (recomendado)**

```bash
# Instalar htpasswd si no lo tienes:
# Ubuntu/Debian: sudo apt-get install apache2-utils
# CentOS/RHEL: sudo yum install httpd-tools
# macOS: ya viene instalado

# Crear archivo con primer usuario
htpasswd -c .htpasswd admin

# Añadir más usuarios (sin -c para no sobrescribir)
htpasswd .htpasswd usuario2
```

**Opción B: Generar hash online**

1. Ve a: https://hostingcanada.org/htpasswd-generator/
2. Introduce usuario y contraseña
3. Copia el resultado en `.htpasswd`

**Opción C: Con OpenSSL**

```bash
# Generar hash
openssl passwd -apr1

# Luego crea .htpasswd manualmente con formato:
# usuario:hash_generado
```

### Paso 2: Configurar protección en lacantina-vhosts.conf

Añade un bloque `<Directory>` para el directorio que quieres proteger:

```apache
# Ejemplo: Proteger /admin
<Directory "/var/www/html/public/admin">
    AuthType Basic
    AuthName "Área Restringida - Administración"
    AuthUserFile "/var/www/html/.htpasswd"
    Require valid-user
</Directory>
```

### Paso 3: Reiniciar el contenedor

```bash
docker-compose restart
```

### Verificar la protección

Accede al directorio protegido (ej: `https://localhost/admin`) y deberías ver un cuadro de diálogo solicitando usuario y contraseña.

### Comandos útiles para htpasswd

```bash
# Ver usuarios en .htpasswd
cat .htpasswd | cut -d: -f1

# Cambiar contraseña de usuario existente
htpasswd .htpasswd usuario_existente

# Eliminar usuario
htpasswd -D .htpasswd usuario_a_eliminar

# Verificar hash de contraseña
htpasswd -v .htpasswd usuario
```

### Proteger múltiples directorios

Puedes usar el mismo archivo `.htpasswd` para varios directorios:

```apache
<Directory "/var/www/html/public/admin">
    AuthType Basic
    AuthName "Área de Administración"
    AuthUserFile "/var/www/html/.htpasswd"
    Require valid-user
</Directory>

<Directory "/var/www/html/public/private">
    AuthType Basic
    AuthName "Área Privada"
    AuthUserFile "/var/www/html/.htpasswd"
    Require valid-user
</Directory>
```

O usar diferentes archivos `.htpasswd` para cada área:

```apache
<Directory "/var/www/html/public/admin">
    AuthUserFile "/var/www/html/.htpasswd-admin"
    # ...
</Directory>

<Directory "/var/www/html/public/ventas">
    AuthUserFile "/var/www/html/.htpasswd-ventas"
    # ...
</Directory>
```

## URLs Limpias (sin extensiones)

Para ocultar las extensiones `.php` y `.html` de las URLs, puedes configurarlo de dos formas:

### Opción 1: En lacantina-vhosts.conf (Recomendado)

Añade reglas de rewrite en el bloque `<Directory>`:

```apache
<Directory "/var/www/html/public">
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
    
    # Habilitar rewrite
    RewriteEngine On
    
    # Remover extensión .php
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME}\.php -f
    RewriteRule ^(.*)$ $1.php [L]
    
    # Remover extensión .html
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME}\.html -f
    RewriteRule ^(.*)$ $1.html [L]
    
    # Redirigir 301 si alguien accede con la extensión
    RewriteCond %{THE_REQUEST} ^[A-Z]{3,}\s([^.]+)\.(php|html) [NC]
    RewriteRule ^ %1 [R=301,L]
    
    DirectoryIndex index.html index.php
</Directory>
```

### Opción 2: Con .htaccess

Crea `public-html/public/.htaccess`:

```apache
RewriteEngine On
DirectoryIndex index.html index.php

# Remover extensión .php
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\.php -f
RewriteRule ^(.*)$ $1.php [L]

# Remover extensión .html
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.*)$ $1.html [L]

# Redirigir si se accede con extensión
RewriteCond %{THE_REQUEST} ^[A-Z]{3,}\s([^.]+)\.(php|html) [NC]
RewriteRule ^ %1 [R=301,L]
```

**Resultado:**
- `https://localhost/info.php` → `https://localhost/info`
- `https://localhost/contacto.html` → `https://localhost/contacto`

## Solución de Problemas

### Error: "Port 80 is already in use"

```bash
# Ver qué proceso usa el puerto 80
sudo lsof -i :80

# O cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar puerto 8080 en lugar de 80
  - "8443:443" # Usar puerto 8443 en lugar de 443
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

### Cambios no se reflejan

```bash
# Verificar que el volumen está montado correctamente
docker-compose exec web ls -la /var/www/html/public

# Recargar Apache
docker-compose exec web apache2ctl graceful
```

### Error "Internal Server Error" con htpasswd

```bash
# Ver logs de Apache
docker-compose logs web

# Verificar que existe .htpasswd
docker-compose exec web ls -la /var/www/html/.htpasswd

# Verificar sintaxis de configuración
docker-compose exec web apache2ctl configtest
```

### La autenticación no aparece

```bash
# Verificar que el módulo auth está habilitado
docker-compose exec web apache2ctl -M | grep auth

# Revisar configuración de vhosts
docker-compose exec web cat /etc/apache2/sites-available/my-ssl.conf
```

## Extensiones PHP Adicionales

Si necesitas instalar extensiones PHP, modifica el `Dockerfile`:

```dockerfile
# Ejemplo: instalar mysqli y pdo_mysql
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Ejemplo: instalar GD para procesamiento de imágenes
RUN apt-get update && \
    apt-get install -y libpng-dev libjpeg-dev && \
    docker-php-ext-configure gd --with-jpeg && \
    docker-php-ext-install gd

# Ejemplo: instalar extensiones comunes
RUN docker-php-ext-install \
    bcmath \
    exif \
    opcache \
    zip
```

Luego reconstruir:

```bash
docker-compose up -d --build
```

## Seguridad para Producción

**Importante**: Esta configuración es para desarrollo. Para producción:

1. **Certificado SSL válido**: Usa Let's Encrypt o certificado comercial
2. **Contraseñas seguras**: Cambia las credenciales de htpasswd por defecto
3. **Variables de entorno**: No hardcodear credenciales en código
4. **Permisos restrictivos**: Configura permisos adecuados en archivos
5. **Firewall**: Configura reglas de firewall apropiadas
6. **Actualizaciones**: Mantén Docker y las imágenes actualizadas
7. **Logs**: Monitoriza logs de acceso y errores
8. **HTTPS only**: Fuerza HTTPS en todas las conexiones

### Certificado SSL de producción con Let's Encrypt

```bash
# Instalar certbot
sudo apt-get install certbot

# Obtener certificado (requiere dominio real apuntando a tu servidor)
sudo certbot certonly --standalone -d tudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem lacantina.crt
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem lacantina.key

# Reconstruir contenedor
docker-compose up -d --build
```

## Recursos Adicionales

- [Documentación oficial de PHP](https://www.php.net/docs.php)
- [Documentación de Apache](https://httpd.apache.org/docs/)
- [Documentación de Docker](https://docs.docker.com/)
- [Docker Hub - PHP Official Images](https://hub.docker.com/_/php)
- [Let's Encrypt - Certificados SSL gratuitos](https://letsencrypt.org/)

## Soporte

Si encuentras problemas:

1. **Revisa los logs**: `docker-compose logs -f`
2. **Verifica la configuración**: `docker-compose exec web apache2ctl configtest`
3. **Comprueba archivos**: `docker-compose exec web ls -la /var/www/html`
4. **Verifica permisos**: `ls -la lacantina.crt lacantina.key`

## Licencia

Este es un proyecto de ejemplo para propósitos educativos.

---

**¡Disfruta desarrollando!**