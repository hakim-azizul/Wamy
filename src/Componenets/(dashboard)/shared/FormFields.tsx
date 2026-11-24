"use client";

import type { FieldMeta, SelectOption } from "@/lib/studentDetailsMeta";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm text-[#1E4831] outline-none transition-colors placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  ltr?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  textarea?: boolean;
  name?: string;
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  ltr = false,
  placeholder,
  options,
  textarea = false,
  name,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-[#1E4831]">
        {label}
        {required && <span className="mr-1 text-[#DE2F2C]">*</span>}
      </label>

      {options ? (
        <select
          id={name}
          required={required}
          dir={ltr ? "ltr" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={INPUT_CLASS}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          id={name}
          required={required}
          dir={ltr ? "ltr" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className={INPUT_CLASS}
        />
      ) : (
        <input
          id={name}
          type={type}
          required={required}
          dir={ltr ? "ltr" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          step={type === "number" ? "any" : undefined}
          className={INPUT_CLASS}
        />
      )}
    </div>
  );
}

export function MetaField({
  meta,
  value,
  onChange,
}: {
  meta: FieldMeta;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      name={meta.name}
      label={meta.label}
      type={meta.type === "tags" ? "text" : meta.type}
      required={meta.required}
      ltr={meta.ltr}
      placeholder={meta.placeholder}
      options={meta.options}
      textarea={meta.type === "textarea"}
      value={value}
      onChange={onChange}
    />
  );
}

export function FormMessage({ text, tone }: { text: string; tone: "error" | "success" }) {
  return (
    <p
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        tone === "error"
          ? "border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#931815]"
          : "border-[#1E4831]/20 bg-[#DCE6E0] text-[#1E4831]"
      }`}
    >
      {text}
    </p>
  );
}
