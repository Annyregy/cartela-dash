import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RouteStat {
  name: string;
  pendentes: number;
  concluidas: number;
}

export function DeliveriesChart({ data }: { data: RouteStat[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <BarChart3 className="size-3.5" />
          Entregas por rota (hoje)
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Nenhuma entrega registrada hoje.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <BarChart3 className="size-3.5" />
        Entregas por rota (hoje)
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={56}
              stroke="var(--border)"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.3 }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                color: "var(--foreground)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar
              dataKey="pendentes"
              name="Pendentes"
              stackId="a"
              fill="var(--gold)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="concluidas"
              name="Concluídas"
              stackId="a"
              fill="var(--success)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
