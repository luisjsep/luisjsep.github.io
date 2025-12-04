# 🧪 INSTRUCCIONES DE PRUEBA - PROBLEMA DE TRANSPARENCIA

## 🔍 **PASO 1: Probar Versión Normal**
1. Abre `index.html` directamente en tu móvil
2. Presiona "¡COMENZAR!"
3. **Observa si los aviones tienen fondo gris sólido o transparente**

## 🐛 **PASO 2: Si persiste el problema, usar Debug**
1. Abre `debug.html` en tu móvil
2. **Panel de debug visible automáticamente**
3. Verificar estado de carga de sprites
4. Usar botón "🧪 Test Transparencia"

## 📊 **PASO 3: Verificar Canvas de Test**
- Se muestra un canvas con patrón de cuadros rojos y blancos
- Si el avión tiene fondo transparente, verás los cuadros a través de él
- Si el avión tiene fondo sólido, verás un recuadro gris sobre los cuadros

## 🖼️ **DIAGNÓSTICO VISUAL:**

### ✅ **TRANSPARENCIA FUNCIONANDO:**
- Avión se ve nítido
- Fondo del juego se ve a través de las partes transparentes
- Bordes limpios sin recuadros grises

### ❌ **TRANSPARENCIA NO FUNCIONANDO:**
- Avión tiene recuadro gris alrededor
- Fondo no se ve a través del avión
- Bordes duros y cuadrados

## 🔧 **SOLUCIONES ALTERNATIVAS:**

### **Si NO funciona la transparencia:**
1. **Opción A:** Puedo convertir las imágenes a WebP con mejor compresión
2. **Opción B:** Recrear las imágenes con fondo negro sólido
3. **Opción C:** Usar formas geométricas simples como fallback

### **Test Rápido:**
En la consola del navegador (F12), busca:
```
✅ Todos los sprites cargados exitosamente
```

Si no aparece este mensaje, las imágenes no se cargan correctamente.

## 📱 **PARA MÓVIL:**
1. **Chrome/Android:** Menú → "Añadir a pantalla de inicio"
2. **Safari/iOS:** Compartir → "Añadir a pantalla de inicio"
3. **El juego funcionará como app nativa**

---
**🎮 ¿Cuál es el resultado de tu prueba? Comparte si ves transparencia o fondo gris.**