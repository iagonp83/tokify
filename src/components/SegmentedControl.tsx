type Option<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentedControlProps<TValue extends string> = {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<Option<TValue>>;
  value: TValue;
};

export function SegmentedControl<TValue extends string>({
  label,
  onChange,
  options,
  value
}: SegmentedControlProps<TValue>) {
  return (
    <fieldset className="segmented-control">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            aria-pressed={option.value === value}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
