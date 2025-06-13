"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarPopoverProps {
  label?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function CalendarPopover({
  label = "Date",
  value,
  onChange,
  placeholder = "Select date",
  className,
}: CalendarPopoverProps) {
  const [open, setOpen] = React.useState(false)

  // Calculate the minimum date (16 years ago from today)
  const minDate = React.useMemo(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 16)
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  // Calculate the maximum date (today)
  const maxDate = React.useMemo(() => {
    const date = new Date()
    date.setHours(23, 59, 59, 999)
    return date
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={className ?? "w-48 justify-between font-normal"}
          >
            {value ? value.toLocaleDateString() : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
  mode="single"
  selected={value}
  captionLayout="dropdown"
  fromYear={1900}
  toYear={maxDate.getFullYear()}
  disabled={{ after: maxDate }}
  onSelect={(date) => {
    if (date) {
      if (date > maxDate) return;
      onChange?.(date);
      setOpen(false);
    }
  }}
/>
        </PopoverContent>
      </Popover>
    </div>
  )
} 