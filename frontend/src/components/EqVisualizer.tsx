const BAR_COUNT = 20;

export function EqVisualizer({ active }: { active: boolean }) {
  return (
    <div className="eq-bars">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className={`eq-bar ${active ? "active" : ""}`}
          style={{ animationDelay: `${i * 0.12}s`, animationDuration: `${0.7 + (i % 3) * 0.15}s` }}
        />
      ))}
    </div>
  );
}
