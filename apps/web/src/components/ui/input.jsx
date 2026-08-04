import React from "react";

const Input = ({
  label,
  type = "text",
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-800"
      />
    </div>
  );
};

export default Input;