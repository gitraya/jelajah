import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MultiSelect = ({ options, selected = [], onChange, placeholder }) => {
  const [open, setOpen] = React.useState(false);

  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleSelect = (value) => {
    if (safeSelected.includes(value)) {
      onChange(safeSelected.filter((item) => item !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  };

  const handleRemove = (e, value) => {
    e.stopPropagation();
    onChange(safeSelected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white! px-3! border-input! outline-none! hover:border-ring! hover:ring-ring/50! hover:ring-[3px]!"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {safeSelected.length > 0 ? (
              safeSelected.map((value) => {
                const option = options.find((option) => option.value === value);
                return (
                  <Badge key={value} className="mr-1">
                    {option?.label || value}
                    <span
                      className="ml-1 rounded-full outline-none cursor-pointer"
                      onClick={(e) => handleRemove(e, value)}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm font-normal text-muted-foreground">
                {placeholder || "Select items..."}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                className="cursor-pointer"
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    safeSelected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { MultiSelect };
