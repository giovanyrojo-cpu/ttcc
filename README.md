# Top Ten Command Center (TTCC)

CRM/dashboard mobile-first para Top Ten Property. Next.js + TypeScript +
Tailwind + Supabase. Motor de reglas determinístico (sin IA de pago en
el MVP) con interfaz `AIProvider` desacoplada para conectar Claude API
después sin rehacer nada.

## Qué incluye este paquete
- App Next.js completa (App Router): Dashboard, Leads, Pipeline, Comisiones, Propiedades
- `supabase/schema.sql` — tablas, tipos e índices, con Row Level Security por usuario
- `lib/ai-provider.ts` — scoring y Next Best Action por reglas, listo para reemplazar por IA real
- Datos semilla de ejemplo (`lib/seed-data.ts`) — el dashboard funciona aunque Supabase esté vacío o sin configurar
- Roles preparados en el schema (admin/director/asesor/asistente/solo_lectura) aunque el MVP es de un solo usuario

## 1. Requisitos
- Node.js 18 o superior
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- Una cuenta gratuita en [vercel.com](https://vercel.com)
- Una cuenta en [github.com](https://github.com)

## 2. Probarlo en tu computadora (opcional, antes de subir)
```bash
npm install
cp .env.example .env.local   # y llena tus llaves de Supabase
npm run dev
```
Abre http://localhost:3000

## 3. Crear el proyecto en Supabase
1. Crea un proyecto nuevo en supabase.com
2. Ve a **SQL Editor** → pega el contenido de `supabase/schema.sql` → Run
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. En **Authentication → Providers**, activa Email (o el método que prefieras) y crea tu usuario Director

## 4. Subir el código a GitHub
```bash
git init
git add .
git commit -m "TTCC MVP inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ttcc.git
git push -u origin main
```
(Crea antes el repo vacío "ttcc" en github.com — sin README, para no chocar con este)

## 5. Desplegar en Vercel
1. Entra a vercel.com → **Add New → Project**
2. Importa el repo `ttcc` que acabas de subir a GitHub
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. En 1-2 minutos tienes la URL pública (ej. `ttcc.vercel.app`)

## 6. Datos reales
Reemplaza los datos de `lib/seed-data.ts` insertando directamente en Supabase
(Table Editor) o por script — usando los datos reales de tu Bitácora de
Cierre. Marca explícitamente en `notas` cualquier campo que no tengas
confirmado; no lo inventes.

## Próximos bloques (no incluidos aún)
- Formularios de alta/edición de leads, comisiones y propiedades (hoy es solo lectura)
- Login real conectado (estructura ya lista en `lib/supabase-server.ts` y `lib/supabase-browser.ts`, falta la pantalla)
- Migración real de la Bitácora de Cierre
- Integraciones (Tokko, WhatsApp, Buffer, Calendar, n8n, Meta Ads) como adaptadores
