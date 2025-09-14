import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function parseIsoDate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date",
}: {
  value: string
  onChange: (nextIso: string) => void
  className?: string
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const selected = parseIsoDate(value) ?? null
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return
      const el = containerRef.current
      if (el && e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn("w-[200px] justify-between font-normal", !selected && "text-muted-foreground")}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {selected ? formatIsoDate(selected) : placeholder}
        <CalendarIcon className="opacity-70" />
      </Button>
      {open && (
        <div
          role="dialog"
          className="absolute z-50 mt-2 rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <Calendar
            selected={selected ?? undefined}
            onSelect={(d) => {
              onChange(formatIsoDate(d))
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DatePicker

