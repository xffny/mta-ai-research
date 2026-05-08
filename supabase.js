import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

const ROW_ID = 'mta-ai-v5'

export async function loadData() {
  const { data, error } = await supabase
    .from('research_data')
    .select('data')
    .eq('id', ROW_ID)
    .single()
  if (error || !data) return null
  return data.data
}

export async function saveData(payload) {
  const { error } = await supabase
    .from('research_data')
    .upsert({ id: ROW_ID, data: payload, updated_at: new Date().toISOString() })
  if (error) throw error
}
