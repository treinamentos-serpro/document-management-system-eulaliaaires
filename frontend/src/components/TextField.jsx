export default function TextField({ label, id, className = '', ...props }) {
  return (
    <label htmlFor={id} className={`grid gap-1 text-sm font-medium text-brand-700 ${className}`}>
      {label}
      <input
        id={id}
        className="rounded-md border border-brand-200 bg-white px-3 py-2 text-sm text-brand-700 placeholder:text-brand-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        {...props}
      />
    </label>
  );
}
