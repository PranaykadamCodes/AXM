'use client'

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  modifiers?: {
    [key: string]: (date: Date) => boolean
  }
  modifiersStyles?: {
    [key: string]: React.CSSProperties
  }
  className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CustomCalendar({
  selected,
  onSelect,
  modifiers = {},
  modifiersStyles = {},
  className
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Get previous month's last days
  const prevMonth = new Date(year, month - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const handleDateClick = (date: Date) => {
    onSelect?.(date)
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const isSelected = (date: Date) => {
    return selected && date.toDateString() === selected.toDateString()
  }
  
  const getModifierStyle = (date: Date) => {
    for (const [key, predicate] of Object.entries(modifiers)) {
      if (predicate(date)) {
        return modifiersStyles[key] || {}
      }
    }
    return {}
  }
  
  const hasModifier = (date: Date) => {
    return Object.values(modifiers).some(predicate => predicate(date))
  }
  
  // Generate calendar days
  const calendarDays = []
  
  // Previous month's trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    calendarDays.push({
      date,
      isCurrentMonth: false,
      day
    })
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    calendarDays.push({
      date,
      isCurrentMonth: true,
      day
    })
  }
  
  // Next month's leading days
  const remainingCells = 42 - calendarDays.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day)
    calendarDays.push({
      date,
      isCurrentMonth: false,
      day
    })
  }
  
  return (
    <div className={cn("p-4 w-full", className)}>
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-3 mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevMonth}
          className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-2 border-indigo-200 dark:border-indigo-700 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </Button>
        
        <h2 className="text-lg font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
          {MONTHS[month]} {year}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-2 border-indigo-200 dark:border-indigo-700 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
        >
          <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </Button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-gray-600 dark:text-gray-300 font-semibold text-sm flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-800/50 rounded-md uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth, day }, index) => {
          const modifierStyle = getModifierStyle(date)
          const hasModifierClass = hasModifier(date)
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              style={modifierStyle}
              className={cn(
                "h-10 w-full p-0 font-medium text-sm transition-all duration-200 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                // Base styles
                isCurrentMonth
                  ? "text-gray-900 dark:text-white hover:bg-indigo-100 dark:hover:bg-indigo-800/50 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm"
                  : "text-gray-300 dark:text-gray-600 opacity-40 hover:opacity-60",
                // Today styles
                isToday(date) && !hasModifierClass && "bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold shadow-md ring-2 ring-yellow-300 dark:ring-yellow-600 border-yellow-400",
                // Selected styles
                isSelected(date) && !hasModifierClass && "bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 font-bold shadow-md border-indigo-500"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
