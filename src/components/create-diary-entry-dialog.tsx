"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
import type { Database } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type WeatherCondition = Database["public"]["Enums"]["weather_condition"];

type Company = {
  id: string;
  name: string;
};

interface CreateDiaryEntryDialogProps {
  projectId: string;
  companies: Company[];
  children: ReactNode;
}

const weatherOptions: { value: WeatherCondition; label: string }[] = [
  { value: "sunny", label: "Sunny" },
  { value: "partly_cloudy", label: "Partly Cloudy" },
  { value: "cloudy", label: "Cloudy" },
  { value: "light_rain", label: "Light Rain" },
  { value: "heavy_rain", label: "Heavy Rain" },
  { value: "storm", label: "Storm" },
  { value: "windy", label: "Windy" },
  { value: "hot", label: "Hot" },
  { value: "cold", label: "Cold" },
];

export function CreateDiaryEntryDialog({
  projectId,
  companies,
  children,
}: CreateDiaryEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  // Default to today's date in local timezone
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    entryDate: today,
    weatherCondition: "" as WeatherCondition | "",
    temperatureHigh: "",
    temperatureLow: "",
    weatherNotes: "",
    workSummary: "",
    safetyIncidents: "0",
    safetyNotes: "",
    delaysHours: "0",
    delayReason: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("site_diary_entries")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          entry_date: formData.entryDate,
          weather_condition: formData.weatherCondition || null,
          temperature_high: formData.temperatureHigh
            ? parseInt(formData.temperatureHigh)
            : null,
          temperature_low: formData.temperatureLow
            ? parseInt(formData.temperatureLow)
            : null,
          weather_notes: formData.weatherNotes || null,
          work_summary: formData.workSummary || null,
          safety_incidents: parseInt(formData.safetyIncidents) || 0,
          safety_notes: formData.safetyNotes || null,
          delays_hours: parseFloat(formData.delaysHours) || 0,
          delay_reason: formData.delayReason || null,
          notes: formData.notes || null,
          created_by_user_id: profile.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        entryDate: today,
        weatherCondition: "",
        temperatureHigh: "",
        temperatureLow: "",
        weatherNotes: "",
        workSummary: "",
        safetyIncidents: "0",
        safetyNotes: "",
        delaysHours: "0",
        delayReason: "",
        notes: "",
      });

      // Navigate to the new entry detail page
      router.push(`/projects/${projectId}/site-diary/${data.id}`);
      router.refresh();
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("duplicate key value")
      ) {
        setError("An entry for this date already exists");
      } else {
        setError(err instanceof Error ? err.message : "Failed to create entry");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Site Diary Entry</DialogTitle>
            <DialogDescription>
              Record daily site activities, weather, and incidents
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entry-date" className="text-right">
                Date
              </Label>
              <Input
                id="entry-date"
                type="date"
                className="col-span-3"
                value={formData.entryDate}
                onChange={(e) =>
                  setFormData({ ...formData, entryDate: e.target.value })
                }
                required
              />
            </div>

            {/* Weather Section */}
            <div className="col-span-4">
              <h4 className="font-medium text-sm mb-2 ml-[calc(25%+1rem)]">
                Weather
              </h4>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weather" className="text-right">
                Condition
              </Label>
              <Select
                value={formData.weatherCondition}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    weatherCondition: value as WeatherCondition,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temp-low" className="text-right">
                Temp Range
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="temp-low"
                  type="number"
                  placeholder="Low"
                  className="w-20"
                  value={formData.temperatureLow}
                  onChange={(e) =>
                    setFormData({ ...formData, temperatureLow: e.target.value })
                  }
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  id="temp-high"
                  type="number"
                  placeholder="High"
                  className="w-20"
                  value={formData.temperatureHigh}
                  onChange={(e) =>
                    setFormData({ ...formData, temperatureHigh: e.target.value })
                  }
                />
                <span className="text-muted-foreground">°C</span>
              </div>
            </div>

            {/* Work Summary */}
            <div className="col-span-4 mt-2">
              <h4 className="font-medium text-sm mb-2 ml-[calc(25%+1rem)]">
                Work Activities
              </h4>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="work-summary" className="text-right pt-2">
                Summary
              </Label>
              <Textarea
                id="work-summary"
                placeholder="Describe work completed today..."
                className="col-span-3"
                rows={3}
                value={formData.workSummary}
                onChange={(e) =>
                  setFormData({ ...formData, workSummary: e.target.value })
                }
              />
            </div>

            {/* Safety */}
            <div className="col-span-4 mt-2">
              <h4 className="font-medium text-sm mb-2 ml-[calc(25%+1rem)]">
                Safety
              </h4>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="incidents" className="text-right">
                Incidents
              </Label>
              <Input
                id="incidents"
                type="number"
                min="0"
                className="w-20"
                value={formData.safetyIncidents}
                onChange={(e) =>
                  setFormData({ ...formData, safetyIncidents: e.target.value })
                }
              />
            </div>

            {parseInt(formData.safetyIncidents) > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="safety-notes" className="text-right pt-2">
                  Details
                </Label>
                <Textarea
                  id="safety-notes"
                  placeholder="Describe the incident(s)..."
                  className="col-span-3"
                  value={formData.safetyNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, safetyNotes: e.target.value })
                  }
                />
              </div>
            )}

            {/* Delays */}
            <div className="col-span-4 mt-2">
              <h4 className="font-medium text-sm mb-2 ml-[calc(25%+1rem)]">
                Delays
              </h4>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delays" className="text-right">
                Hours
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="delays"
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-20"
                  value={formData.delaysHours}
                  onChange={(e) =>
                    setFormData({ ...formData, delaysHours: e.target.value })
                  }
                />
                <span className="text-muted-foreground">hours</span>
              </div>
            </div>

            {parseFloat(formData.delaysHours) > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="delay-reason" className="text-right pt-2">
                  Reason
                </Label>
                <Textarea
                  id="delay-reason"
                  placeholder="Explain the cause of delay..."
                  className="col-span-3"
                  value={formData.delayReason}
                  onChange={(e) =>
                    setFormData({ ...formData, delayReason: e.target.value })
                  }
                />
              </div>
            )}

            {/* Notes */}
            <div className="grid grid-cols-4 items-start gap-4 mt-2">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                className="col-span-3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
