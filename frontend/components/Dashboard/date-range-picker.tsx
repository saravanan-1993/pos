"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateRangePreset = "today" | "last7days" | "last30days" | "custom";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  preset,
  onPresetChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetChange = (value: DateRangePreset) => {
    onPresetChange(value);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (value) {
      case "today":
        onDateRangeChange({
          from: today,
          to: today,
        });
        break;
      case "last7days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        onDateRangeChange({
          from: last7Days,
          to: today,
        });
        break;
      case "last30days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);
        onDateRangeChange({
          from: last30Days,
          to: today,
        });
        break;
      case "custom":
        // Keep existing date range or clear it
        break;
    }
  };

  const getDisplayText = () => {
    if (!dateRange?.from) {
      return "Pick a date range";
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
        dateRange.to,
        "MMM dd, yyyy"
      )}`;
    }

    return format(dateRange.from, "MMM dd, yyyy");
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                if (range?.from && range?.to) {
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
