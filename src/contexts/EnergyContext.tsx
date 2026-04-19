import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface MeterReading {
  id: string;
  date: string; // ISO YYYY-MM-DD
  openingUnits: number;
  closingUnits: number;
  kwh: number;
  billAmount: number;
  notes?: string;
}

export interface Appliance {
  id: string;
  name: string;
  category: "Cooling" | "Kitchen" | "Lighting" | "Electronics" | "Laundry" | "Other";
  wattage: number;
  hoursPerDay: number;
  daysPerMonth: number;
  status: "Active" | "Inactive";
}

interface EnergyContextValue {
  readings: MeterReading[];
  appliances: Appliance[];
  ratePerKwh: number;
  carbonPerKwh: number;
  setRatePerKwh: (n: number) => void;
  addReading: (r: Omit<MeterReading, "id" | "kwh">) => void;
  deleteReading: (id: string) => void;
  addAppliance: (a: Omit<Appliance, "id">) => void;
  updateAppliance: (id: string, patch: Partial<Appliance>) => void;
  deleteAppliance: (id: string) => void;
}

const EnergyContext = createContext<EnergyContextValue | undefined>(undefined);

const READINGS_KEY = "set-readings";
const APPLIANCES_KEY = "set-appliances";
const RATE_KEY = "set-rate";

const uid = () => Math.random().toString(36).slice(2, 10);

const seedReadings = (): MeterReading[] => {
  const out: MeterReading[] = [];
  let cursor = 12450;
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const usage = 220 + Math.round(Math.sin(i / 2) * 60) + Math.round(Math.random() * 50);
    const opening = cursor;
    const closing = cursor + usage;
    cursor = closing;
    out.push({
      id: uid(),
      date: d.toISOString().slice(0, 10),
      openingUnits: opening,
      closingUnits: closing,
      kwh: usage,
      billAmount: Math.round(usage * 8.5),
      notes: i === 0 ? "Current month" : undefined,
    });
  }
  return out;
};

const seedAppliances = (): Appliance[] => [
  { id: uid(), name: "Split AC (Bedroom)", category: "Cooling", wattage: 1500, hoursPerDay: 6, daysPerMonth: 30, status: "Active" },
  { id: uid(), name: "Refrigerator", category: "Kitchen", wattage: 200, hoursPerDay: 24, daysPerMonth: 30, status: "Active" },
  { id: uid(), name: "Washing Machine", category: "Laundry", wattage: 500, hoursPerDay: 1, daysPerMonth: 12, status: "Active" },
  { id: uid(), name: "LED Bulbs (×8)", category: "Lighting", wattage: 72, hoursPerDay: 6, daysPerMonth: 30, status: "Active" },
  { id: uid(), name: "Television", category: "Electronics", wattage: 120, hoursPerDay: 4, daysPerMonth: 30, status: "Active" },
  { id: uid(), name: "Microwave", category: "Kitchen", wattage: 1100, hoursPerDay: 0.3, daysPerMonth: 30, status: "Inactive" },
];

export const EnergyProvider = ({ children }: { children: ReactNode }) => {
  const [readings, setReadings] = useState<MeterReading[]>(() => {
    const raw = localStorage.getItem(READINGS_KEY);
    if (raw) try { return JSON.parse(raw); } catch {}
    return seedReadings();
  });
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    const raw = localStorage.getItem(APPLIANCES_KEY);
    if (raw) try { return JSON.parse(raw); } catch {}
    return seedAppliances();
  });
  const [ratePerKwh, setRatePerKwhState] = useState<number>(() => {
    const raw = localStorage.getItem(RATE_KEY);
    return raw ? Number(raw) : 8.5;
  });

  useEffect(() => { localStorage.setItem(READINGS_KEY, JSON.stringify(readings)); }, [readings]);
  useEffect(() => { localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances)); }, [appliances]);
  useEffect(() => { localStorage.setItem(RATE_KEY, String(ratePerKwh)); }, [ratePerKwh]);

  const setRatePerKwh = (n: number) => setRatePerKwhState(n);

  const addReading: EnergyContextValue["addReading"] = (r) => {
    const kwh = Math.max(0, r.closingUnits - r.openingUnits);
    setReadings((prev) => [{ ...r, id: uid(), kwh }, ...prev]);
    toast.success("Meter reading saved", { description: `${kwh} kWh logged for ${r.date}` });
  };

  const deleteReading = (id: string) => {
    setReadings((p) => p.filter((r) => r.id !== id));
    toast("Reading deleted");
  };

  const addAppliance: EnergyContextValue["addAppliance"] = (a) => {
    setAppliances((prev) => [{ ...a, id: uid() }, ...prev]);
    toast.success("Appliance added", { description: a.name });
  };

  const updateAppliance: EnergyContextValue["updateAppliance"] = (id, patch) => {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const deleteAppliance = (id: string) => {
    setAppliances((p) => p.filter((a) => a.id !== id));
    toast("Appliance removed");
  };

  return (
    <EnergyContext.Provider
      value={{
        readings,
        appliances,
        ratePerKwh,
        carbonPerKwh: 0.82,
        setRatePerKwh,
        addReading,
        deleteReading,
        addAppliance,
        updateAppliance,
        deleteAppliance,
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
};

export const useEnergy = () => {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error("useEnergy must be used within EnergyProvider");
  return ctx;
};
