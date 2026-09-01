const VARIANT_CLASSES = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-200 disabled:text-brand-500',
  secondary:
    'bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 focus-visible:outline-brand-600 disabled:text-brand-200 disabled:border-brand-100',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
