#!/usr/bin/env bash
# ==============================================================================
# FOCUS2 - Automated APK Builder Script
# Compiles Vite web bundle, synchronizes Capacitor, and builds Android Debug APK
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "⚡ [1/4] Configurando variables de entorno (Java 21 & Android SDK)..."
export JAVA_HOME="$(echo "$DIR"/.build-tools/jdk-21* 2>/dev/null || which java)"
export ANDROID_HOME="$DIR/.build-tools/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "📦 [2/4] Compilando aplicación web con Vite..."
npm run build

echo "🔄 [3/4] Sincronizando activos con Capacitor Android..."
npx cap sync android

echo "🚀 [4/4] Ensamblando archivo APK con Gradle..."
cd android
./gradlew assembleDebug

cd "$DIR"
cp "$DIR/android/app/build/outputs/apk/debug/app-debug.apk" "$DIR/focus2-debug.apk"
cp "$DIR/android/app/build/outputs/apk/debug/app-debug.apk" "$DIR/public/focus2-debug.apk"

echo ""
echo "================================================================================"
echo "✅ ¡ÉXITO! Archivo APK generado exitosamente en:"
echo "$DIR/focus2-debug.apk"
echo "================================================================================"
