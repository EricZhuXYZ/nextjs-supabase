'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type NoteRow = {
  id?: string | number
  title?: string
} & Record<string, unknown>

export default function Page() {
  const [notes, setNotes] = useState<NoteRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient()
      setLoading(true)
      const { data, error: dbError } = await supabase.from('notes').select()

      if (dbError) {
        console.error('Error fetching notes:', dbError)
        setError(`${dbError.message} (Code: ${dbError.code})`)
      } else {
        setNotes(data)
      }
      setLoading(false)
    }
    getData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading notes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        Error: {error}
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">
        No notes found. Check if the notes table exists and has data.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {notes.length} notes
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {notes.map((note, index) => (
          <Card key={note.id ?? index} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium leading-tight">
                {note.title ?? 'Untitled note'}
              </CardTitle>
              <div className="mt-2 text-xs text-muted-foreground">ID: #{note.id ?? index}</div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
