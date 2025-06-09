# Sistema-de-inventario---QUALITYCORE-SERVICES-
# Instalación del ambiente
## BACKEND
### Ubuntu Linux / MacOS
Instalación de gestor de ambientes virtuales de Python
~~~
sudo apt install python3-venv
~~~
Creación del ambiente virtual
~~~
python3 -m venv .venv
~~~
Activación del ambiente virtual
~~~
source .venv/bin/activate
~~~
Instalación de dependencias de este proyecto
~~~
pip3 install -r requirements.txt
~~~
En caso de querer desactivar el ambiente usar
~~~
deactivate
~~~
### Windows
Instalación de gestor de ambientes virtuales de Python
~~~
pip install virtualenv
~~~
Creación del ambiente virtual
~~~
py -m venv .venv
~~~
Activación del ambiente virtual para CMD
~~~
.venv\Scripts\activate
~~~
Activación del ambiente virtual para PowerShell
~~~
.venv\Scripts\activate.ps1
~~~
Instalación de dependencias de este proyecto
~~~
pip install -r requirements.txt
~~~
En caso de querer desactivar el ambiente usar
~~~
deactivate
~~~

## Comandos útiles

### Generar archivos de migración
#### Linux o MacOS
~~~
python3 manage.py makemigrations
~~~
#### Windows
~~~
python manage.py makemigrations
~~~

### Migrar a bases de datos
#### Linux o MacOS
~~~
python3 manage.py migrate
~~~
#### Windows
~~~
python manage.py migrate
~~~

### Iniciar servidor
#### Linux o MacOS
~~~
python3 manage.py runserver
~~~
#### Windows
~~~
python manage.py runserver
~~~


### Crear Súper Usuario
#### Linux o MacOS
~~~
python3 manage.py createsuperuser
~~~
#### Windows
~~~
python manage.py createsuperuser
~~~

### Almacenar depdendencias y librerías instaladas
#### Linux o MacOS
~~~
pip3 freeze > requirements.txt
~~~
#### Windows
~~~
pip freeze > requirements.txt
~~~


## FRONTEND
Descarga e instala todas las dependencias
~~~
npm install
~~~
Iniciar servidor
~~~
npm start
~~~
