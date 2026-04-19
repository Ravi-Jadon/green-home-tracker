import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sun, Moon, Leaf, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEnergy } from "@/contexts/EnergyContext";
import { Separator } from "@/components/ui/separator";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { ratePerKwh, setRatePerKwh } = useEnergy();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="font-display">Smart Energy Tracker</SheetTitle>
              <SheetDescription>Personalize your tracker experience.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">RJ</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Rishabh Jain</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Agra, India
                </p>
              </div>
            </div>
          </section>

          {/* Theme */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Day / Night mode</p>
                <p className="text-sm text-muted-foreground">Currently {theme === "dark" ? "Night" : "Day"}</p>
              </div>
              <div className="flex rounded-xl border border-border p-1 bg-muted">
                <Button
                  size="sm"
                  variant={theme === "light" ? "default" : "ghost"}
                  className="gap-1.5 h-8"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-3.5 w-3.5" /> Day
                </Button>
                <Button
                  size="sm"
                  variant={theme === "dark" ? "default" : "ghost"}
                  className="gap-1.5 h-8"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-3.5 w-3.5" /> Night
                </Button>
              </div>
            </div>
          </section>

          {/* Rate */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tariff</p>
            <Label htmlFor="rate" className="text-sm">Electricity rate (₹ per kWh)</Label>
            <Input
              id="rate"
              type="number"
              min={0}
              step="0.01"
              value={ratePerKwh}
              onChange={(e) => setRatePerKwh(Number(e.target.value) || 0)}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">Used to estimate monthly cost from kWh consumption.</p>
          </section>

          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            🌱 Together we conserve energy for a greener tomorrow.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
