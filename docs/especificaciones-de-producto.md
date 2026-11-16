# Documento de Especificación del Producto (PRD)

## 1. Visión y Propósito del Producto

El producto es un **tracker de visualización cronológica exhaustivo del Universo Cinematográfico de Marvel (UCM) y producciones adyacentes** (multiverso, series de televisión de diversas cadenas, películas de otros estudios como Fox o Sony, cortos y especiales).

Su valor principal es permitir al usuario consumir todo el contenido en el **orden estricto de la historia dentro del universo (orden cronológico interno)**, permitiendo registrar el progreso individual (visto / pendiente), calcular métricas de tiempo y filtrar por conceptos narrativos.

---

## 2. Dominio y Reglas del Negocio

### 2.1. Obras vs. Hitos Cronológicos

Existe una diferencia fundamental entre la **obra como contenido publicado** y el **segmento de visualización cronológico**:

- **Obra Base (Película / Serie / Corto / Especial):** Posee los metadatos globales (título oficial, fecha de estreno en el mundo real, póster/arte, estudio productor).
- **Episodios de Series:** Las series no se consumen como un único bloque; se descomponen por temporadas y capítulos individuales con su propia duración y título.
- **Escenas Post-Créditos desvinculadas temporalmente:** Una película puede ocurrir en un año determinado dentro de la cronología, pero su escena post-créditos puede transcurrir años después (o tras eventos de otras series/películas).
    - _Regla clave:_ La escena post-créditos debe poder posicionarse en un punto cronológico completamente diferente al cuerpo principal de la película.
    - _Regla de integridad:_ Ambas partes deben seguir vinculadas a la misma película original. Si se actualiza la información global de la película (fecha de estreno original, póster, título, etiquetas globales), los segmentos cronológicos asociados deben reflejarlo automáticamente sin duplicación de datos.

### 2.2. Modelo de Ordenamiento: Fractional Indexing

- La línea de tiempo no utiliza ordenamiento por números enteros correlativos rígidos (1, 2, 3...).
- Se define el orden mediante **Fractional Indexing** (claves de ordenación continua/fraccionaria en formato string).
- **Motivo del requerimiento:** Permitir intercalar nuevos lanzamientos, episodios, cortos o escenas post-créditos entre dos elementos existentes de manera determinística, actualizando únicamente el elemento insertado o modificado, sin provocar desplazamientos en cascada en el resto de la lista.

### 2.3. Sistema de Etiquetas (Tags) y Taxonomía

- **Sin campo rígido de "Fase":** El concepto de "Fase" de Marvel solo aplica a ciertas producciones de Marvel Studios y no a series clásicas (ABC, Netflix) ni universos externos (Fox, Sony). Por ende, "Fase" se maneja como una etiqueta más (ej. `Fase 1`, `Fase 4`).
- **Naturaleza multidimensional de los tags:** Un elemento puede tener múltiples etiquetas para permitir agrupaciones flexibles:
    - **Personajes:** `Iron Man`, `Peggy Carter`, `Daredevil`, `Loki`.
    - **Grupos / Equipos:** `Avengers`, `Defenders`, `Guardians of the Galaxy`.
    - **Arcos o Sagas:** `Saga del Infinito`, `Saga del Multiverso`.
    - **Fases:** `Fase 1`, `Fase 2`, etc.

### 2.4. Universos y Realidades (Multiverso)

- Los contenidos abarcan distintas líneas temporales o dimensiones del multiverso Marvel, tal como se especifica en la fuente de datos:
    - Línea principal: `Earth-616 (MCU)`.
    - Realidades alternativas: `Earth-82111 (Captain Carter)`, `Earth-21818 (Star-Lord T'Challa)`, `Earth-10005 (X-Men)`, `Earth-688 (SSU)`, `Earth-1610 (Spiderverse)`, entre otras.
- Cada elemento en la cronología debe tener identificado a qué universo o realidad pertenece.

---

## 3. Entidades Fundamentales de Información

1. **Obra (Media):**
    - Título oficial.
    - Tipo de medio (Película, Serie de TV, Corto, Especial).
    - Estudio responsable (Marvel Studios, ABC, Netflix, Sony, Fox, etc.).
    - Plataforma original / Distribución (Disney+, Netflix, Cine, etc.).
    - Fecha de estreno real.
    - URL o referencia de póster / imagen de portada.

2. **Episodio (Episode):**
    - Pertenencia obligatoria a una Serie.
    - Número de temporada.
    - Número de episodio dentro de la temporada.
    - Título del capítulo.
    - Duración (tiempo de reproducción).
    - Fecha de emisión original.

3. **Ítem de Línea de Tiempo (Timeline Item):**
    - El elemento indivisible que compone la lista cronológica.
    - Puede representar:
        - Una película completa.
        - La historia principal de una película (sin la escena post-créditos).
        - Una escena post-créditos específica.
        - Un episodio individual de una serie.
        - Un cortometraje o especial.
    - Clave de ordenamiento fraccionario (`order_key`).
    - Universo / Tierra (`Earth-616`, `Earth-10005`, etc.).
    - Duración en minutos de ese segmento específico.
    - Título contextual o aclaración si es un segmento (ej: _"Escena post-créditos"_).

4. **Etiquetas (Tags):**
    - Identificador o nombre (slug).
    - Tipo o categoría del tag (Personaje, Equipo, Fase, Temática).

5. **Estado de Seguimiento (User Watch Progress):**
    - Marca de visualización por ítem de la línea de tiempo (Visto / Pendiente).
    - Fecha y hora en la que se marcó como visto.

---

## 4. Métricas y Cálculos del Producto

El sistema debe ser capaz de determinar:

- **Porcentaje de completitud:** Proporción entre ítems vistos y total de ítems en la línea de tiempo.
- **Conteo de títulos:** Cantidad total de elementos vistos frente al total (ej. `87/556`).
- **Tiempo total invertido (Time Watched):** Suma total de las duraciones de los ítems marcados como vistos, expresable en días, horas y minutos (ej. `3d 9h 46m`).
- **Tiempo restante (Time Remaining):** Suma de duraciones de los ítems pendientes.

---

## 5. Requerimientos Funcionales

1. **Gestión de la Línea de Tiempo:**
    - Visualizar la lista completa ordenada por la clave de ordenamiento fraccionario.
    - Capacidad de filtrar la cronología por:
        - Universo / Dimensión.
        - Tipo de producción (Películas, Series, Cortos).
        - Etiquetas asociadas (por personaje, equipo o fase).
        - Estado de visualización (vistos vs. pendientes).
2. **Reordenamiento:**
    - Capacidad de insertar o mover cualquier ítem dentro de la cronología recalculando su posición mediante una clave fraccionaria intermedia entre dos ítems contiguos.
3. **Tracking de Usuario:**
    - Marcar o desmarcar un ítem como visto.
    - Marcar bloques completos (ej. marcar todos los ítems anteriores a una fecha u orden).
    - Consultar el resumen de progreso y tiempos de consumo.
4. **Mantenimiento y Coherencia:**
    - La edición de datos globales de una película o serie debe propagarse a todos los segmentos cronológicos asociados de forma consistente e instantánea.

---

## 6. Restricciones Técnicas y de Alcance

- **Desarrollo a mano (Bare-metal / Custom):** Sin frameworks de infraestructura integral o BaaS (Backend as a Service) que abstraigan el control (prohibido depender de Supabase, Firebase, NextJS o herramientas con lógica prehecha de backend).
- **Lógica e Integración propia:** La arquitectura debe diseñarse desde cero utilizando librerías puntuales sobre Node.js puro, controlando manualmente el enrutamiento, la validación, la conexión y el esquema de almacenamiento de datos.
