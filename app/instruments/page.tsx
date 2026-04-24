'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type InstrumentRow = Record<string, unknown>

export default function Page() {
  const [data, setData] = useState<InstrumentRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient()
      setLoading(true)
      const { data: instruments, error: dbError } = await supabase
        .from('instruments')
        .select()

      if (dbError) {
        console.error('Error fetching instruments:', dbError)
        setError(`${dbError.message} (Code: ${dbError.code})`)
      } else {
        setData(instruments)
      }
      setLoading(false)
    }
    getData()
  }, [])

  if (loading) return <div>Loading instruments...</div>
  if (error) return <div>Error: {error}</div>
  if (!data || data.length === 0) {
    return <div>No instruments found. Check if the instruments table exists and has data.</div>
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
