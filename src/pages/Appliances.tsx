import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { useEnergy, type Appliance } from "@/contexts/EnergyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plug, Trash2, Snowflake, Utensils, Lightbulb, Tv, Shirt, Box } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categories = ["Cooling", "Kitchen", "Lighting", "Electronics", "Laundry", "Other"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(60),
  category: z.enum(categories),
  wattage: z.coerce.number().min(1, "Min 1 W").max(20000),
  hoursPerDay: z.coerce.number().min(0).max(24),
  daysPerMonth: z.coerce.number().min(0).max(31),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

const iconFor = (c: Appliance["category"]) => {
  switch (c) {
    case "Cooling": return Snowflake;
    case "Kitchen": return Utensils;
    case "Lighting": return Lightbulb;
    case "Electronics": return Tv;
    case "Laundry": return Shirt;
    default: return Box;
  }
};

const Appliances = () => {
  const { appliances, addAppliance, deleteAppliance, updateAppliance, ratePerKwh } = useEnergy();

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues, any, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: "Other", wattage: 100, hoursPerDay: 4, daysPerMonth: 30, status: "Active" },
  });

  const w = watch("wattage") || 0;
  const h = watch("hoursPerDay") || 0;
  const d = watch("daysPerMonth") || 0;
  const liveKwh = (Number(w) * Number(h) * Number(d)) / 1000;
  const liveCost = liveKwh * ratePerKwh;

  const totalMonthly = useMemo(
    () => appliances.filter((a) => a.status === "Active").reduce((s, a) => s + (a.wattage * a.hoursPerDay * a.daysPerMonth) / 1000, 0),
    [appliances]
  );

  const onSubmit = (v: FormValues) => {
    addAppliance(v);
    reset();
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <AppLayout title="Appliance Management" subtitle="Track per-appliance energy use">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 gradient-card border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Plug className="h-5 w-5 text-primary" /> Add appliance
            </CardTitle>
            <p className="text-sm text-muted-foreground">kWh/month = (W × hrs/day × days) ÷ 1000</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Appliance name</Label>
                <Input id="name" placeholder="e.g. Living Room AC" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select defaultValue="Other" onValueChange={(v) => setValue("category", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="Active" onValueChange={(v) => setValue("status", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="wattage">Wattage (W)</Label>
                  <Input id="wattage" type="number" {...register("wattage")} />
                </div>
                <div>
                  <Label htmlFor="hours">Hours/day</Label>
                  <Input id="hours" type="number" step="0.1" {...register("hoursPerDay")} />
                </div>
                <div>
                  <Label htmlFor="days">Days/month</Label>
                  <Input id="days" type="number" {...register("daysPerMonth")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Monthly use</p>
                  <p className="font-display text-2xl font-bold text-primary">{liveKwh.toFixed(1)} kWh</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Monthly cost</p>
                  <p className="font-display text-2xl font-bold">₹{liveCost.toFixed(0)}</p>
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-soft">
                Add appliance
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 gradient-card border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Appliances ({appliances.length})</CardTitle>
              <p className="text-sm text-muted-foreground">Tap status to toggle Active/Inactive.</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Active total</p>
              <p className="font-display text-xl font-bold text-primary">{totalMonthly.toFixed(0)} kWh/mo</p>
            </div>
          </CardHeader>
          <CardContent>
            {appliances.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No appliances yet.</div>
            ) : (
              <div className="space-y-2">
                {appliances.map((a) => {
                  const Icon = iconFor(a.category);
                  const kwh = (a.wattage * a.hoursPerDay * a.daysPerMonth) / 1000;
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3 hover:shadow-soft transition-smooth">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.category} • {a.wattage}W • {a.hoursPerDay}h/day × {a.daysPerMonth}d
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">{kwh.toFixed(1)} kWh</p>
                          <p className="text-sm font-semibold">₹{(kwh * ratePerKwh).toFixed(0)}</p>
                        </div>
                        <Select value={a.status} onValueChange={(v) => updateAppliance(a.id, { status: v as Appliance["status"] })}>
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">
                              <Badge className="bg-primary/15 text-primary border-0">Active</Badge>
                            </SelectItem>
                            <SelectItem value="Inactive">
                              <Badge variant="secondary">Inactive</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog open={deleteId === a.id} onOpenChange={(o) => setDeleteId(o ? a.id : null)}>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {a.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This appliance will be deleted from your tracker.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => { deleteAppliance(a.id); setDeleteId(null); }}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Appliances;
