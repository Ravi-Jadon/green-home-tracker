import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEnergy } from "@/contexts/EnergyContext";
import { Gauge, Trash2, IndianRupee, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
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

const schema = z
  .object({
    date: z.string().nonempty("Pick a date"),
    openingUnits: z.coerce.number().min(0, "Must be ≥ 0").max(9999999),
    closingUnits: z.coerce.number().min(0, "Must be ≥ 0").max(9999999),
    billAmount: z.coerce.number().min(0).max(9999999),
    notes: z.string().max(300).optional(),
  })
  .refine((d) => d.closingUnits >= d.openingUnits, {
    path: ["closingUnits"],
    message: "Closing must be ≥ opening",
  });

type FormValues = z.infer<typeof schema>;

const DataEntry = () => {
  const { readings, addReading, deleteReading, ratePerKwh } = useEnergy();
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, openingUnits: 0, closingUnits: 0, billAmount: 0, notes: "" },
  });

  const opening = watch("openingUnits") || 0;
  const closing = watch("closingUnits") || 0;
  const liveKwh = Math.max(0, Number(closing) - Number(opening));
  const liveCost = liveKwh * ratePerKwh;

  const onSubmit = (values: FormValues) => {
    addReading({
      date: values.date,
      openingUnits: Number(values.openingUnits),
      closingUnits: Number(values.closingUnits),
      billAmount: Number(values.billAmount) || Math.round(liveCost),
      notes: values.notes,
    });
    reset({ date: today, openingUnits: Number(values.closingUnits), closingUnits: 0, billAmount: 0, notes: "" });
  };

  const sorted = useMemo(() => readings.slice().sort((a, b) => b.date.localeCompare(a.date)), [readings]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <AppLayout title="Manual Data Entry" subtitle="Log meter readings & bills">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-2 gradient-card border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              New meter reading
            </CardTitle>
            <p className="text-sm text-muted-foreground">kWh auto-calculated from opening & closing units.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="date">Reading date</Label>
                <Input id="date" type="date" max={today} {...register("date")} />
                {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="opening">Opening (units)</Label>
                  <Input id="opening" type="number" inputMode="decimal" {...register("openingUnits")} />
                  {errors.openingUnits && <p className="text-xs text-destructive mt-1">{errors.openingUnits.message}</p>}
                </div>
                <div>
                  <Label htmlFor="closing">Closing (units)</Label>
                  <Input id="closing" type="number" inputMode="decimal" {...register("closingUnits")} />
                  {errors.closingUnits && <p className="text-xs text-destructive mt-1">{errors.closingUnits.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Calculated kWh</p>
                  <p className="font-display text-2xl font-bold text-primary">{liveKwh.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Estimated cost</p>
                  <p className="font-display text-2xl font-bold">₹{liveCost.toFixed(0)}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="bill">Bill amount (₹)</Label>
                <Input id="bill" type="number" inputMode="decimal" placeholder={liveCost ? `Suggested: ₹${liveCost.toFixed(0)}` : "0"} {...register("billAmount")} />
                {errors.billAmount && <p className="text-xs text-destructive mt-1">{errors.billAmount.message}</p>}
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" rows={2} placeholder="e.g. high AC usage" {...register("notes")} />
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-soft" disabled={isSubmitting}>
                Save reading
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="lg:col-span-3 gradient-card border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display">Logged readings</CardTitle>
            <p className="text-sm text-muted-foreground">{sorted.length} entries stored locally.</p>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No readings yet.</div>
            ) : (
              <div className="space-y-2">
                {sorted.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3 hover:shadow-soft transition-smooth">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold">{format(parseISO(r.date), "dd MMM yyyy")}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.openingUnits} → {r.closingUnits} units
                          {r.notes && ` • ${r.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" />{r.kwh} kWh</Badge>
                      <span className="font-semibold flex items-center"><IndianRupee className="h-3.5 w-3.5" />{r.billAmount.toLocaleString("en-IN")}</span>
                      <AlertDialog open={deleteId === r.id} onOpenChange={(o) => setDeleteId(o ? r.id : null)}>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this reading?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the meter reading from {format(parseISO(r.date), "dd MMM yyyy")}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => { deleteReading(r.id); setDeleteId(null); }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DataEntry;
