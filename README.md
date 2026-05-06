# Reto Daily Habit

Aplicación web para crear y completar rutinas de ejercicios diarios con sistema de insignias y retos personalizados. Los usuarios pueden registrarse, establecer metas, realizar rutinas y ganar insignias al completar sus desafíos.

## Descripcion de la Aplicacion

Reto Daily Habit es una plataforma diseñada para motivar a los usuarios a mantener una rutina de ejercicios consistente. La aplicación permite:

- Crear rutinas personalizadas de ejercicios
- Establecer retos diarios y semanales
- Marcar ejercicios como completados
- Ganar insignias al alcanzar objetivos
- Rastrear progreso personal
- Registrarse e iniciar sesión de forma segura

Cada usuario tiene su propio perfil donde puede ver su historial de actividades, insignias ganadas y estadísticas de desempeño.

## Caracteristicas Principales

- Crear y personalizar rutinas de ejercicio
- Sistema de retos diarios con objetivos específicos
- Insignias desbloqueables por logros
- Autenticación segura de usuarios
- Panel de control personal
- Seguimiento del progreso
- Interfaz intuitiva y responsiva

## Tecnologias Utilizadas

| Tecnología | Proposito |
|-----------|-----------|
| **Vite** | Construcción rápida y desarrollo |
| **React** | Biblioteca de interfaz de usuario |
| **TypeScript** | Tipado estático y seguridad |
| **Tailwind CSS** | Estilos CSS modernos |
| **shadcn-ui** | Componentes UI reutilizables |
| **Vitest** | Framework de testing |
| **ESLint** | Linter y análisis de código |

## Inicio Rapido

### Requisitos Previos
- Node.js (v18 o superior)
- npm o yarn

### Instalacion

```sh
# Clonar el repositorio
git clone https://github.com/nestor6942/reto-daily-habit.git

# Navegar al directorio del proyecto
cd reto-daily-habit

# Instalar las dependencias
npm install
```

### Desarrollo Local

```sh
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:5173
```

## Scripts Disponibles

```sh
# Desarrollo
npm run dev          # Inicia servidor con hot reload

# Construcción
npm run build        # Compila para producción

# Linting y Testing
npm run lint         # Ejecuta ESLint
npm run test         # Ejecuta tests con Vitest
npm run test:ui      # Abre UI de tests

# Vista previa
npm run preview      # Previsualiza la construcción local
```

## CI/CD Pipeline

Este proyecto incluye workflows automatizados de GitHub Actions que se ejecutan en cada push y pull request:

- Validacion de Codigo - ESLint valida calidad y estilo
- Tests Automatizados - Vitest ejecuta la suite de tests
- Construccion - Vite compila el proyecto para producción

Los workflows aseguran que el código mantenga altos estándares de calidad antes de ser fusionado.

## Estructura del Proyecto

```
reto-daily-habit/
├── src/
│   ├── components/      # Componentes React reutilizables
│   ├── pages/          # Páginas principales
│   ├── styles/         # Estilos globales
│   ├── utils/          # Funciones utilitarias
│   └── App.tsx         # Componente raíz
├── tests/              # Tests unitarios e integración
├── public/             # Archivos estáticos
├── vite.config.ts      # Configuración de Vite
├── tsconfig.json       # Configuración de TypeScript
├── tailwind.config.js  # Configuración de Tailwind
└── package.json        # Dependencias y scripts
```

## Configuracion

### ESLint
Ejecuta: `npm run lint` para validar el código

### TypeScript
El proyecto usa TypeScript estricto para mayor seguridad de tipos

### Tailwind CSS
Los estilos se aplican usando clases de Tailwind CSS

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (git checkout -b feature/AmazingFeature)
3. Commit tus cambios (git commit -m 'Add some AmazingFeature')
4. Push a la rama (git push origin feature/AmazingFeature)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia MIT. Ver LICENSE para más detalles.

## Autor

**nestor6942** - GitHub Profile: https://github.com/nestor6942

---

Ultima actualizacion: Mayo 6, 2026
