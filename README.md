# Uma Pedigree App

Aplicación para construir árboles genealógicos de personajes y calcular afinidad (相性) entre chicas caballo. Inspirada en la mecánica de cría de Uma Musume Pretty Derby.

## Tecnologías

- **Web**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Android**: Capacitor 7 (envuelve la web app en una app Android nativa)

## Requisitos previos

### Para desarrollo web
- **Node.js 22+** (recomendado vía [nvm](https://github.com/nvm-sh/nvm))

### Para compilar APK Android (opcional)
- **Android Studio** (latest stable) con:
  - Android SDK Platform 34+
  - Android SDK Build-Tools
  - Gradle (incluido en el proyecto)

## Instalación y ejecución (web)

```bash
# Clonar o navegar al proyecto
cd uma-pedigree-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:5173 en el navegador.

## Build de producción (web)

```bash
npm run build
npm run preview   # previsualizar build en local
```

Los archivos estáticos se generan en `dist/`.

## Generar APK Android

### 1. Instalar Android Studio

Descargar desde https://developer.android.com/studio

Durante la instalación, asegurarse de instalar:
- Android SDK Platform 34+
- Android SDK Build-Tools 34+
- Android Emulator (opcional, para pruebas)

### 2. Configurar variables de entorno

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin
```

Añadir estas líneas a `~/.bashrc` para que sean permanentes.

### 3. Compilar el APK

```bash
# Volver a buildear la web (si se hicieron cambios)
npm run build

# Sincronizar assets web con proyecto Android
npx cap sync

# Abrir en Android Studio y compilar
npx cap open android
```

En Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

El APK se genera en `android/app/build/outputs/apk/debug/app-debug.apk`.

### 4. Instalar en dispositivo (alternativa)

Con un dispositivo Android conectado vía USB (depuración USB activada):

```bash
npx cap run android
```

## Estructura del proyecto

```
uma-pedigree-app/
├── public/assets/{characters,icons}/   # Assets estáticos
├── src/
│   ├── components/
│   │   ├── tree/          # Árbol genealógico (PedigreeTree, CharacterCard, conectores SVG)
│   │   ├── matrix/        # Matriz de afinidad (AffinityMatrix, AffinityBadge ◎○△)
│   │   └── modals/        # Selector de personajes, editor de factores
│   ├── data/              # characters.json (20 chicas), affinityMatrix.json
│   ├── hooks/             # usePedigreeTree (gestión del árbol), useAffinityCalc (cálculo)
│   ├── types/             # Interfaces TypeScript (Personaje, Factor, Nodo, Arbol)
│   ├── utils/             # affinityCalculator.ts (motor de puntuación)
│   ├── App.tsx            # Componente raíz con pestañas Árbol | Matriz
│   └── main.tsx           # Punto de entrada
├── android/               # Proyecto Android (generado por Capacitor)
├── capacitor.config.ts    # Configuración de Capacitor
└── package.json
```

## Uso

1. Ve a la pestaña **Árbol**.
2. Pulsa en cada slot para seleccionar personajes (Objetivo → Padres → Abuelos).
3. Usa el botón **Editar factores** para ajustar estrellas Azul (青), Rojo (赤) y Verde (緑).
4. La puntuación de afinidad se recalcula automáticamente.
5. Cambia a la pestaña **Matriz** para ver la tabla de compatibilidad entre pares con rangos ◎ ○ △.

## Licencia

MIT
