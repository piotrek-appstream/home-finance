import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate()
}

function startOfMonth(year: number, month0: number) {
  return new Date(year, month0, 1)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export type CalendarProps = {
  className?: string
  selected?: Date | null
  onSelect?: (date: Date) => void
  month?: Date
  onMonthChange?: (month: Date) => void
}

export function Calendar({ className, selected, onSelect, month: monthProp, onMonthChange }: CalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const [month, setMonth] = React.useState<Date>(monthProp ?? new Date(selected ? selected.getFullYear() : today.getFullYear(), selected ? selected.getMonth() : today.getMonth(), 1))
  React.useEffect(() => {
    if (monthProp) setMonth(monthProp)
  }, [monthProp])

  const year = month.getFullYear()
  const month0 = month.getMonth()
  const total = daysInMonth(year, month0)
  const first = startOfMonth(year, month0)
  // Compute ISO week starting Monday
  // JS getDay: 0=Sun..6=Sat. We want 0=Mon..6=Sun for leading blanks
  const lead = (first.getDay() + 6) % 7
  const weeks: (Date | null)[][] = []
  let week: (Date | null)[] = []
  for (let i = 0; i < lead; i++) week.push(null)
  for (let d = 1; d <= total; d++) {
    week.push(new Date(year, month0, d))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  function changeMonth(offset: number) {
    const next = new Date(year, month0 + offset, 1)
    setMonth(next)
    onMonthChange?.(next)
  }

  return (
    <div className={cn("w-[280px] select-none", className)}>
      <div className="flex items-center justify-between px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <ChevronLeft />
        </Button>
        <div className="text-sm font-medium">
          {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label="Next month">
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 px-2 pb-2">
        {weekdayLabels.map((d) => (
          <div key={d} className="text-xs text-muted-foreground text-center">{d}</div>
        ))}
        {weeks.map((w, i) => (
          <React.Fragment key={i}>
            {w.map((date, j) => {
              const isSelected = !!selected && !!date && isSameDay(date, selected as Date)
              const isToday = !!date && isSameDay(date, today)
              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  disabled={!date}
                  onClick={() => date && onSelect?.(date)}
                  className={cn(
                    "h-9 w-9 justify-self-center rounded-md text-sm font-medium outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    !date && "opacity-50 cursor-default",
                    isToday && !isSelected && "ring-2 ring-ring/50"
                  )}
                >
                  {date ? date.getDate() : ""}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default Calendar

