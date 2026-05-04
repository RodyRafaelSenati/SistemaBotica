💊 Sistema de Gestión - Botica "Nova Salud"

Este proyecto consiste en una aplicación web integral diseñada para automatizar el inventario y las ventas de una botica comercial. Utiliza una arquitectura desacoplada para garantizar escalabilidad, seguridad y eficiencia operativa.
🚀 Características Principales

    Gestión de Inventario: Registro centralizado con control de stock en tiempo real.

    Ventas Automatizadas: Registro de transacciones con descuento automático de existencias.

    Módulo de Alertas: Notificaciones para productos con bajo stock o próximos a vencer.

    Arquitectura Desacoplada: Separación total entre el Frontend (React) y el Backend (Node.js).

    Base de Datos en la Nube: Almacenamiento persistente en MS SQL Server 2022 Express mediante la plataforma Somee.

🛠️ Stack Tecnológico

    Frontend: React.js, Axios (para consumo de API).

    Backend: Node.js, Express.js.

    Base de Datos: MS SQL Server 2022 Express (Hosting en Somee).

    Seguridad: CORS configurado, variables de entorno (.env) y control de roles.

📂 Estructura del Proyecto

El repositorio sigue la siguiente jerarquía de directorios:
Plaintext

/proyecto-nova-salud
├── /frontend   # Interfaz de usuario (React)
└── /backend    # Lógica de negocio y API REST (Node.js)

⚙️ Configuración e Instalación
1. Requisitos Previos

    Node.js instalado.

    Cuenta en Somee con una base de datos MS SQL configurada.

2. Configuración del Backend

Navega a la carpeta del backend e instala las dependencias:
Bash

cd backend
npm install

Crea un archivo .env en la raíz de /backend con tus credenciales de Somee:
Fragmento de código

PORT=3000
DB_SERVER=someeraodyrafael.mssql.somee.com
DB_USER=bustinciocalsin
DB_PASSWORD=tu_password_aqui
DB_NAME=nombre_de_tu_db
JWT_SECRET=tu_secreto_aqui

Inicia el servidor:
Bash

node src/app.js

3. Configuración del Frontend

En una nueva terminal, navega a la carpeta del frontend:
Bash

cd frontend
npm install
npm run dev

🌐 Endpoints Principales (API REST)

    GET /api/productos - Lista todos los medicamentos e insumos.

    POST /api/ventas - Registra una venta y actualiza el stock.

    GET /api/alertas - Obtiene productos críticos (bajo stock/vencimiento).

    POST /api/login - Autenticación de usuarios.

🛡️ Normas Técnicas y Seguridad

    Seguridad: Las credenciales de la base de datos están protegidas mediante variables de entorno, evitando su exposición en el código fuente.

    CORS: Solo se permiten solicitudes desde el origen del frontend (localhost:5173).

    Integridad: Uso de T-SQL para garantizar la coherencia de los datos en MS SQL Server.
