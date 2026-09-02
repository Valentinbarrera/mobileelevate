-- ============================================================================
-- Pantorrilla en las mediciones del alumno
-- ============================================================================
-- El coach pidió sumar "Pantorrilla" a la lista de medidas, entre Muslo y el
-- % graso. La tabla `anthropometry` no tiene columna para eso, así que hasta
-- que esto se corra el campo NO existe en la app.
--
-- Es aditivo y no destructivo: agrega una columna que admite NULL, no toca
-- ninguna fila existente ni ninguna policy de RLS. Las mediciones ya cargadas
-- quedan con `calf_cm` en NULL y la app las sigue mostrando igual.
--
-- CÓMO CORRERLO: Supabase → SQL Editor → pegar y ejecutar. Es idempotente
-- (`if not exists`), así que correrlo dos veces no rompe nada.
--
-- DESPUÉS DE CORRERLO hay que habilitar el campo en el código, en 4 lugares:
--   1. src/hooks/useSaveMeasurement.ts  → `calf_cm` en MeasurementInput y en
--      NUMERIC_FIELDS.
--   2. src/components/progress/MeasurementSheet.tsx → la fila
--      { key: "calf_cm", label: "Pantorrilla", unit: "cm" } después de Muslo,
--      y `calf_cm: ""` en emptyForm().
--   3. src/pages/Measurements.tsx → <MeasurementCard label="Pantorrilla"
--      value={latest.calf_cm} unit="cm" /> después de Muslo.
--   4. src/integrations/supabase/types.ts → regenerar los tipos (o agregar
--      `calf_cm: number | null` a mano en Row/Insert/Update de anthropometry).
-- ============================================================================

alter table public.anthropometry
  add column if not exists calf_cm numeric;

comment on column public.anthropometry.calf_cm is
  'Perímetro de pantorrilla en cm. Lo carga el alumno a mano o llega del informe de antropometría.';

-- Verificación: debería devolver una fila.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'anthropometry'
  and column_name = 'calf_cm';
