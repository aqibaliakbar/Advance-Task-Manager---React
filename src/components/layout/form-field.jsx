import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        className={error ? "border-destructive" : ""}
        required={required}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
