"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-3 w-full",
        caption: "flex justify-between items-center px-2 py-3 mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg",
        caption_label: "text-lg font-bold text-gray-900 dark:text-white min-w-[120px] text-center",
        nav: "flex items-center space-x-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-2 border-indigo-200 dark:border-indigo-700 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md"
        ),
        nav_button_previous: "hover:scale-110 active:scale-95",
        nav_button_next: "hover:scale-110 active:scale-95",
        table: "w-full border-collapse mt-4",
        head_row: "grid grid-cols-7 gap-1 mb-2",
        head_cell:
          "text-gray-600 dark:text-gray-300 font-semibold text-sm flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-800/50 rounded-md uppercase tracking-wider",
        row: "grid grid-cols-7 gap-1 mb-1",
        cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-full p-0 font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-all duration-200 rounded-md border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:from-indigo-700 focus:to-purple-700 font-bold shadow-md border-indigo-500",
        day_today: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold shadow-md ring-2 ring-yellow-300 dark:ring-yellow-600 border-yellow-400",
        day_outside:
          "text-gray-300 dark:text-gray-600 opacity-40 hover:opacity-60 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-gray-200 dark:text-gray-700 opacity-30 cursor-not-allowed hover:bg-transparent",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
