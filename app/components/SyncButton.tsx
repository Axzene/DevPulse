"use client"

import { useState } from "react"

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/sync", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        setResult(`Error: ${data.error}`)
      } else {
        setResult(`Synced ${data.count} day(s). Check console for details.`)
        console.log(data.results)
      }
    } catch (err) {
      setResult("Request failed")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={handleSync} disabled={loading}>
        {loading ? "Syncing..." : "Sync GitHub Data"}
      </button>
      {result && <p>{result}</p>}
    </div>
  )
}