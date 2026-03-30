import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-700 dark:text-light-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 rounded-lg border border-light-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-800 dark:text-light-50 placeholder-light-300 dark:placeholder-dark-700 focus:outline-none focus:ring-2 focus:ring-orange-brand/50 focus:border-orange-brand transition-colors text-sm ${
            error ? 'border-error focus:ring-error/50' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
