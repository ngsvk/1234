import React from "react";

interface VisibilityToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ checked, onChange }) => {
  return (
    <label
      className="relative inline-block align-middle h-[1.75em] w-[3.5em] cursor-pointer rounded-full bg-[hsl(0,0%,7%)] shadow-[0px_1px_3px_0px_rgba(18,18,18,0.25),0px_2px_4px_0px_rgba(18,18,18,0.35)] transition-all duration-200 hover:shadow-[0px_2px_6px_0px_rgba(18,18,18,0.4)] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background"
    >
      <span className="absolute inset-[0.06em] rounded-full border border-[hsl(0,0%,25%)]" />
      <div className="absolute left-[0.25em] top-1/2 flex h-[1.25em] w-[1.25em] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[inset_0px_1px_1px_0px_hsl(0,0%,85%)]">
        <div className="h-[0.9em] w-[0.9em] rounded-full bg-[hsl(0,0%,7%)] shadow-[0px_1px_1px_0px_hsl(0,0%,85%)]" />
      </div>
      <div className="absolute right-[0.25em] top-1/2 h-[0.18em] w-[0.9em] -translate-y-1/2 rounded-full bg-[hsl(0,0%,50%)] shadow-[inset_0px_1px_1px_0px_hsl(0,0%,40%)]" />
      <input
        type="checkbox"
        className="peer h-[1em] w-[1em] opacity-0"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="absolute left-[0.14em] top-1/2 flex h-[1.55em] w-[1.55em] -translate-y-1/2 items-center justify-center rounded-full bg-[rgb(26,26,26)] shadow-[inset_2px_2px_2px_0px_rgba(64,64,64,0.25),inset_-2px_-2px_2px_0px_rgba(16,16,16,0.5)] duration-300 peer-checked:left-[calc(100%-1.7em)]">
        <span className="relative h-full w-full rounded-full">
          <span className="absolute inset-[0.06em] rounded-full border border-[hsl(0,0%,50%)]" />
        </span>
      </span>
    </label>
  );
};
