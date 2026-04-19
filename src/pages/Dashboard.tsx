import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { useEnergy } from "@/contexts/EnergyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Zap, IndianRupee, CloudFog, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { readings, ratePerKwh, carbonPerKwh } = useEnergy();

  const years = useMemo(() => {
    const set = new Set(readings.map((r) => parseISO(r.date).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [readings]);

  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filtered = useMemo(() => {
    return readings
      .filter((r) => {
        const d = parseISO(r.date);
        if (yearFilter !== "all" && d.getFullYear() !== Number(yearFilter)) return false;
        if (monthFilter !== "all" && d.getMonth() !== Number(monthFilter)) return false;
        if (dateRange?.from && d < dateRange.from) return false;
        if (dateRange?.to && d > dateRange.to) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [readings, yearFilter, monthFilter, dateRange]);

  const totalKwh = filtered.reduce((s, r) => s + r.kwh, 0);
  const totalCost = filtered.reduce((s, r) => s + r.billAmount, 0);
  const carbon = totalKwh * carbonPerKwh;
  const avg = filtered.length ? totalKwh / filtered.length : 0;

  const chartData = filtered.map((r) => ({
    label: format(parseISO(r.date), "MMM yy"),
    kWh: r.kwh,
    cost: r.billAmount,
  }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <AppLayout title="Energy Dashboard" subtitle="Household consumption overview">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <Badge variant="secondary" className="rounded-lg">Filters</Badge>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("gap-2", !dateRange && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yy")}`
                  : format(dateRange.from, "PPP")
                : "Date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
            {dateRange && (
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>Clear</Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {monthNames.map((m, i) => (
              <SelectItem key={m} value={String(i)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Electricity" value={`${totalKwh.toFixed(0)} kWh`} hint={`${avg.toFixed(0)} kWh / month avg`} icon={Zap} accent="solar" />
        <MetricCard label="Energy cost" value={`₹${totalCost.toLocaleString("en-IN")}`} hint={`₹${ratePerKwh}/kWh`} icon={IndianRupee} accent="primary" />
        <MetricCard label="Carbon footprint" value={`${carbon.toFixed(0)} kg`} hint="CO₂ equivalent" icon={CloudFog} accent="leaf" />
        <MetricCard label="Records" value={`${filtered.length}`} hint="Months tracked" icon={TrendingUp} accent="earth" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 gradient-card border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display">Consumption trend (kWh)</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly electricity usage over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="kwhFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Area type="monotone" dataKey="kWh" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#kwhFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 gradient-card border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display">Monthly bill (₹)</CardTitle>
            <p className="text-sm text-muted-foreground">Cost comparison by month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--leaf))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Cost"]}
                />
                <Bar dataKey="cost" fill="url(#barFill)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent table */}
      <Card className="mt-6 gradient-card border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display">Recent readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Opening</th>
                  <th className="py-2 pr-4">Closing</th>
                  <th className="py-2 pr-4">kWh</th>
                  <th className="py-2 pr-4">Bill</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice().reverse().slice(0, 6).map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-smooth">
                    <td className="py-3 pr-4 font-medium">{format(parseISO(r.date), "MMM yyyy")}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.openingUnits}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.closingUnits}</td>
                    <td className="py-3 pr-4"><Badge variant="secondary">{r.kwh} kWh</Badge></td>
                    <td className="py-3 pr-4 font-semibold">₹{r.billAmount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No readings match filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Dashboard;
