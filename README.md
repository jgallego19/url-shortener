# url-shortener
Servicio de acortamiento de URLs, usando NodeJS, Express and MongoDB

# Instalación
Para instalar es necesario clonar el repositorio:

`git clone https://github.com/jgallego19/url-shortener.git`

y en el directorio raíz del proyecto ejecutar:

`npm install`

# Configuración
Este acortador de URLs utiliza una base de datos MongoDB, servida como SaaS por [MongoLab](https://mlab.com/). La conexión en esta base de datos se hace a través de la URI estandar de MongoDB, del tipo:

`mongodb://<dbuser>:<dbpassword>@<host>:<port>/<database>`

por lo que es necesario configurar estos datos en el fichero *config/sample-config.json*, y renombrar dicho fichero con el nombre *config.json*

# Ejecución
Para arrancar la aplicación, ejecutar el comando:

`node server.js`

Para ejecutar la aplicación, acceder a la URL http://localhost:3000, si no se ha configurado otra cosa en el fichero *config/config.json*
