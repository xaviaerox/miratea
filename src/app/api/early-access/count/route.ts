import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const dynamic = 'force-static';

const EARLY_ACCESS_MAX_SPOTS = 20;
// Baseline count for real registration state: 0
const DEFAULT_FALLBACK_COUNT = 0;

export async function GET() {
  let totalFamilies = DEFAULT_FALLBACK_COUNT;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasSupabaseCreds = !!url && !!key && !url.includes('placeholder') && key !== 'placeholder';

    if (hasSupabaseCreds) {
      const supabase = createClient<Database>(url, key, {
        auth: { persistSession: false },
      });
      
      // 1. Try calling RPC function get_family_count
      const { data, error } = await supabase.rpc('get_family_count');
      if (!error && typeof data === 'number') {
        totalFamilies = data;
      } else {
        // 2. Fallback: real count from families table
        const { count: famCount, error: famErr } = await supabase
          .from('families')
          .select('*', { count: 'exact', head: true });
        
        if (!famErr && typeof famCount === 'number') {
          totalFamilies = famCount;
        } else {
          // 3. Fallback: count from early_family_leads
          const { count: leadCount, error: leadErr } = await supabase
            .from('early_family_leads')
            .select('*', { count: 'exact', head: true });
          
          if (!leadErr && typeof leadCount === 'number') {
            totalFamilies = leadCount;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[EarlyAccessCount] Fallback to default count:', err);
  }

  const remainingSpots = Math.max(0, EARLY_ACCESS_MAX_SPOTS - totalFamilies);
  const isEarlyAccessAvailable = remainingSpots > 0;

  return NextResponse.json(
    {
      ok: true,
      totalFamilies,
      maxSpots: EARLY_ACCESS_MAX_SPOTS,
      remainingSpots,
      isEarlyAccessAvailable,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=45',
      },
    }
  );
}
