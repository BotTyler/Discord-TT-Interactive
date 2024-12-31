export default function BootstrapSelect({
  data,
  onSelectCallback,
}: {
  data: string[];
  onSelectCallback: (index: number) => void;
}) {
  return (
    <div className="w-100 h-auto">
      <select
        className="form-select form-select-sm"
        aria-label=".form-select-sm example"
        onChange={(e) => {
          onSelectCallback(+e.target.value);
        }}
      >
        <option value={-1}>Select Version</option>
        {data.map((val, i) => {
          return (
            <option value={i} key={`BootStrapSelect-${i}`}>
              {val}
            </option>
          );
        })}
      </select>
    </div>
  );
}
