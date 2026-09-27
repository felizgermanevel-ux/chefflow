# ChefFlow

Base inicial de un MVP web para inventarios de restaurantes. El objetivo es reducir el tiempo de inventario con una interfaz simple, táctil y preparada para tablet o teléfono.

## Inicio rápido

1. Copia la configuración local: `cp .env.example .env`.
2. Instala dependencias: `npm install`.
3. Crea la base local y el cliente Prisma: `npx prisma migrate dev --name init`.
4. Inicia el proyecto: `npm run dev`.
5. Abre `http://localhost:3000`.

## Comandos de calidad

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Arquitectura

- `src/app`: rutas y composición de páginas de Next.js.
- `src/components`: componentes visuales reutilizables y sin lógica de negocio.
- `src/features`: módulos por dominio. Cada dominio podrá contener su lógica, validación, interfaz y acceso a datos.
- `prisma/schema.prisma`: modelo de datos y relaciones del MVP.

El esquema contempla productos, categorías, zonas, inventarios fechados y sus líneas. Las cantidades y precios se guardan en cada línea de inventario para conservar el histórico y permitir comparativas futuras.

## Alcance actual

Esta entrega prepara la estructura, modelo de datos, validación de producto, cálculos puros con pruebas y una pantalla inicial responsive. No implementa aún el alta de datos, capturas de inventario, comparativas visuales, compras, proveedores, IA ni otras funciones fuera del alcance acordado.
