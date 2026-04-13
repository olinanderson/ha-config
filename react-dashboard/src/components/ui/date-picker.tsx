import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  /** YYYY-MM-DD string */
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePicker({ value, onChange, min, max, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    if (!value) return undefined;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  const minDate = React.useMemo(() => {
    if (!min) return undefined;
    const [y, m, d] = min.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [min]);

  const maxDate = React.useMemo(() => {
    if (!max) return undefined;
    const [y, m, d] = max.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [max]);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(toDateStr(day));
      setOpen(false);
    }
  };

  const label = selected ? format(selected, 'MMM d, yyyy') : 'Pick date';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 justify-start text-left font-normal gap-1.5 px-2.5',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
          <span className="tabular-nums text-xs">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          classNames={{
            root: 'p-3',
            months: 'flex flex-col sm:flex-row gap-2',
            month: 'flex flex-col gap-3',
            month_caption: 'flex justify-center pt-1 relative items-center text-sm font-medium',
            caption_label: 'text-sm font-medium',
            nav: 'flex items-center gap-1',
            button_previous: 'absolute left-1 top-0 inline-flex items-center justify-center rounded-md h-7 w-7 bg-transparent opacity-50 hover:opacity-100 border border-input',
            button_next: 'absolute right-1 top-0 inline-flex items-center justify-center rounded-md h-7 w-7 bg-transparent opacity-50 hover:opacity-100 border border-input',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex',
            weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
            week: 'flex w-full mt-1',
            day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
            day_button: 'inline-flex items-center justify-center rounded-md h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground',
            selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            today: 'bg-accent text-accent-foreground',
            outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
            disabled: 'text-muted-foreground opacity-50',
            hidden: 'invisible',
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
