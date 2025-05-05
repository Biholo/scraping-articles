import type React from "react"
import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, type = "text", error, className = "", ...props }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className={`
            appearance-none rounded-lg relative block w-full px-3 py-2 
            border border-gray-300 placeholder-gray-500 text-gray-900 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            focus:z-10 sm:text-sm transition duration-150 ease-in-out
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  },
)

Input.displayName = "Input"

