@AGENTS.md

# Reglas de Eficiencia y Consumo para este Agente

## Directrices de Lectura y Rendimiento

- NUNCA uses comandos de terminal extensos (como grep o find) que escaneen las carpetas 'node_modules', '.expo', 'android' o 'ios'.
- Tienes prohibido leer archivos de bloqueo de dependencias pesados como 'package-lock.json' o 'yarn.lock'.
- Respeta estrictamente los archivos de exclusión locales del proyecto.
- Sé sumamente directo y minimalista en tus respuestas de código; evita explicaciones teóricas innecesarias para ahorrar tokens en el chat.
- Si necesitas verificar dependencias instaladas, pregunta directamente en el chat en lugar de buscar en el árbol de archivos del sistema.
