# Use an official Apache httpd image
FROM httpd:2.4

# Install Nano (optional)
RUN apt-get update && \
    apt-get install -y nano && \
    rm -rf /var/lib/apt/lists/*

# Copy SSL certificate and key
COPY lacantina.crt /usr/local/apache2/conf/server.crt
COPY lacantina.key /usr/local/apache2/conf/server.key

# Copy the custom Apache virtual host config
COPY ./my-httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-ssl.conf

# Enable SSL module
RUN sed -i \
    -e 's/^#\(LoadModule ssl_module\)/\1/' \
    -e 's/^#\(LoadModule socache_shmcb_module\)/\1/' \
    -e 's/^#\(Include conf\/extra\/httpd-ssl.conf\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

# Copy your HTML files into the Apache document root
COPY ./public-html/ /usr/local/apache2/htdocs/

# Expose ports
EXPOSE 80 443

# Start Apache in foreground
CMD ["httpd-foreground"]