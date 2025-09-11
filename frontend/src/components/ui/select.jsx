import Select from "react-select";

import { cn } from "@/lib/utils";

function SelectInput({ ...props }) {
  return (
    <Select
      classNames={{
        control: (state) =>
          cn(
            "border-input! rounded-md! border! bg-transparent! shadow-xs! transition-[color,box-shadow]! outline-none!",
            {
              "border-ring! ring-ring/50! ring-[3px]!": state.isFocused,
              "ring-destructive/20! border-destructive!": props.ariaInvalid,
              "pointer-events-none! cursor-not-allowed! opacity-50!":
                state.isDisabled,
            }
          ),
        placeholder: () => "text-muted-foreground!",
        option: () => "text-sm!",
      }}
      {...props}
    />
  );
}

export { SelectInput as Select };
