export function Overview() {
  const data = [
    { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
  ];

  const max = Math.max(...data.map((d) => d.total));

  return (
    <div className="flex items-end justify-between gap-2 h-[350px] w-full pt-6">
      {data.map((item) => (
        <div
          key={item.name}
          className="group relative flex h-full w-full flex-col items-center justify-end gap-2"
        >
          <div
            className="w-full bg-primary/20 hover:bg-primary/50 transition-all rounded-t-md"
            style={{ height: `${(item.total / max) * 100}%` }}
          />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
