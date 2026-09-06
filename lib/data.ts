import { createClient } from "@/lib/supabase-server";
import { Lead, Comision, Property, Meta } from "@/types/domain";
import {
  seedLeads,
  seedProperties,
  seedComisiones,
  seedMetas,
} from "@/lib/seed-data";

// Si Supabase no está configurado (o la tabla aún no existe), el dashboard
// sigue funcionando con datos semilla en vez de romperse. Quita el fallback
// cuando la migración real esté cargada.

export async function getLeads(): Promise<Lead[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("leads").select("*");
    if (error || !data || data.length === 0) return seedLeads;
    return data as Lead[];
  } catch {
    return seedLeads;
  }
}

export async function getProperties(): Promise<Property[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("properties").select("*");
    if (error || !data || data.length === 0) return seedProperties;
    return data as Property[];
  } catch {
    return seedProperties;
  }
}

export async function getComisiones(): Promise<Comision[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("comisiones").select("*");
    if (error || !data) return seedComisiones;
    return data as Comision[];
  } catch {
    return seedComisiones;
  }
}

export async function getMetas(): Promise<Meta[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("metas").select("*");
    if (error || !data || data.length === 0) return seedMetas;
    return data as Meta[];
  } catch {
    return seedMetas;
  }
}
