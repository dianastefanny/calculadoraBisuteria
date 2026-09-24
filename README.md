# Cuenta Cuentas

App móvil (Expo / React Native) para calcular el precio de venta de piezas de bisutería a partir de sus costos de materiales, empaque, mano de obra, costos indirectos y prestaciones, con un margen de ganancia configurable. Es el frontend de [`calculadora-bisuteria-api`](../calculadora-bisuteria-api), un backend en Laravel.

## Stack

- Expo (React Native) + Expo Router (navegación por archivos)
- TypeScript
- NativeWind (Tailwind para React Native)
- axios + expo-secure-store / localStorage para la sesión

## Pantallas

- **Login / Registro / Recuperar contraseña**
- **Materiales**: catálogo de insumos con categoría, unidad, costo y stock.
- **Diseños**: piezas compuestas por materiales y cantidades.
- **Empaques**: catálogo de empaques y su costo.
- **Cálculos**: cotizador — combina un diseño, un empaque, el tiempo de mano de obra y si se incluyen o no los costos indirectos/prestaciones legales, y llama al backend para obtener el desglose de costos y el precio de venta sugerido.
- **Historial**: cotizaciones ya calculadas, con su vigencia (5 días) y el desglose completo bajo demanda; el backend borra automáticamente los registros con más de 30 días.
- **Configuraciones**: datos de la cuenta, cambio de contraseña, apariencia (claro/oscuro), preferencias de cálculo (salario, horas productivas, margen por defecto) y costos indirectos.

## Requisitos

- Node.js
- El backend (`calculadora-bisuteria-api`) corriendo y accesible desde el dispositivo/emulador donde pruebes la app — la URL del backend se configura en `src/api/client.js`.

## Instalación

```bash
npm install
```

## Levantar la app

```bash
npm start
```

Desde ahí puedes abrir la app en:

- Navegador (`w`) — Expo Web
- Simulador de iOS (`i`)
- Emulador/celular Android (`a`, o escaneando el QR con Expo Go)

## Estructura

- `src/app/` — una pantalla por archivo (ruteo de Expo Router).
- `src/components/` — componentes reutilizables (botones, tarjetas, modales de formulario, etc.).
- `src/api/client.js` — cliente HTTP hacia el backend; todas las llamadas a la API pasan por aquí.
- `src/constants/` — tema visual, moneda activa y reglas de validación de formularios.
