# 📊 IMPLEMENTACIÓN DE ESTADÍSTICAS REALES

## 🎯 OBJETIVO

Reemplazar los datos mock (842 vistas, +12% esta semana, 124 vistas por reporte) con **datos reales** basados en la actividad del usuario.

## 📝 CAMBIOS NECESARIOS

### 1. **Crear tabla de vistas en Supabase**

Necesitamos crear una tabla para rastrear las vistas de cada reporte:

```sql
-- Crear tabla pet_views
CREATE TABLE pet_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- puede ser null para usuarios anónimos
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,  -- opcional, para rastrear vistas anónimas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_pet_views_pet_id ON pet_views(pet_id);
CREATE INDEX idx_pet_views_viewed_at ON pet_views(viewed_at);
CREATE INDEX idx_pet_views_viewer_id ON pet_views(viewer_id);

-- RLS (Row Level Security)
ALTER TABLE pet_views ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar vistas
CREATE POLICY "Anyone can insert pet views"
    ON pet_views FOR INSERT
    WITH CHECK (true);

-- Política: Dueños pueden ver estadísticas de sus mascota
s
CREATE POLICY "Owners can view their pet statistics"
    ON pet_views FOR SELECT
    USING (
        pet_id IN (
            SELECT id FROM pets WHERE owner_id = auth.uid()
        )
    );
```

### 2. **Actualizar página de reportes**

Modificar `src/app/dashboard/reports/page.tsx` para:
- Obtener vistas reales de cada reporte
- Calcular vistas totales
- Calcular porcentaje de cambio vs semana anterior

### 3. **Agregar tracking en página de detalle**

Cuando alguien ve un reporte en `/mascotas/[id]`, registrar una vista.

---

## ✅ SOLUCIÓN SIMPLIFICADA (SIN TABLA NUEVA)

Si no queremos crear una tabla nueva por ahora, podemos:

### **Opción A: Usar vistas estimadas**
- Basarse en el número de sightings (avistamientos)
- Multiplicar por un factor (ej: 10 vistas por cada avistamiento)
- Mostrar como "estimado"

### **Opción B: Agregar campo a pets**
- Agregar campo `view_count` a la tabla `pets`
- Incrementarlo cada vez que alguien ve el reporte
- Más simple pero menos preciso

---

## 💡 RECOMENDACIÓN

**Para empezar (hoy)**: Implementar Opción B (campo simple)
**Para el futuro**: Implementar tabla completa de vistas

---

## 🚀 ¿QUÉ PREFIERES?

1. **Crear tabla completa** (más robusto, rastreo detallado)
2. **Campo simple en pets** (rápido, funcional)
3. **Vistas estimadas** (sin cambios en BD, solo cálculos)

Dime cuál prefieres y lo implemento ahora mismo. 🎯
