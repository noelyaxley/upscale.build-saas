"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  HardHat,
  Plus,
  Sun,
  Thermometer,
  Trash2,
  Truck,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type WeatherCondition = Database["public"]["Enums"]["weather_condition"];

type DiaryEntry = Tables<"site_diary_entries"> & {
  created_by: { id: string; full_name: string | null } | null;
};

type LaborEntry = Tables<"diary_labor_entries"> & {
  company: { id: string; name: string } | null;
};

type EquipmentEntry = Tables<"diary_equipment_entries"> & {
  company: { id: string; name: string } | null;
};

type Visitor = Tables<"diary_visitors">;

type Company = {
  id: string;
  name: string;
};

interface DiaryEntryDetailProps {
  project: { id: string; code: string; name: string };
  entry: DiaryEntry;
  laborEntries: LaborEntry[];
  equipmentEntries: EquipmentEntry[];
  visitors: Visitor[];
  companies: Company[];
}

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  sunny: <Sun className="size-5 text-yellow-500" />,
  partly_cloudy: <CloudSun className="size-5 text-blue-400" />,
  cloudy: <Cloud className="size-5 text-gray-500" />,
  light_rain: <CloudRain className="size-5 text-blue-500" />,
  heavy_rain: <CloudRain className="size-5 text-blue-700" />,
  storm: <Zap className="size-5 text-purple-500" />,
  windy: <Wind className="size-5 text-teal-500" />,
  hot: <Thermometer className="size-5 text-red-500" />,
  cold: <Thermometer className="size-5 text-cyan-500" />,
};

const weatherLabels: Record<WeatherCondition, string> = {
  sunny: "Sunny",
  partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  light_rain: "Light Rain",
  heavy_rain: "Heavy Rain",
  storm: "Storm",
  windy: "Windy",
  hot: "Hot",
  cold: "Cold",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DiaryEntryDetail({
  project,
  entry,
  laborEntries,
  equipmentEntries,
  visitors,
  companies,
}: DiaryEntryDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const { isAdmin } = useOrganisation();

  // Add Labor Dialog
  const [laborDialogOpen, setLaborDialogOpen] = useState(false);
  const [laborForm, setLaborForm] = useState({
    trade: "",
    workerCount: "1",
    hoursWorked: "8",
    companyId: "",
    notes: "",
  });
  const [laborLoading, setLaborLoading] = useState(false);

  // Add Equipment Dialog
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    equipmentName: "",
    quantity: "1",
    hoursUsed: "",
    companyId: "",
    notes: "",
  });
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Add Visitor Dialog
  const [visitorDialogOpen, setVisitorDialogOpen] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: "",
    company: "",
    purpose: "",
    timeIn: "",
    timeOut: "",
  });
  const [visitorLoading, setVisitorLoading] = useState(false);

  const handleAddLabor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaborLoading(true);
    try {
      await supabase.from("diary_labor_entries").insert({
        diary_entry_id: entry.id,
        trade: laborForm.trade,
        worker_count: parseInt(laborForm.workerCount) || 1,
        hours_worked: parseFloat(laborForm.hoursWorked) || 0,
        company_id: laborForm.companyId || null,
        notes: laborForm.notes || null,
      });
      setLaborDialogOpen(false);
      setLaborForm({
        trade: "",
        workerCount: "1",
        hoursWorked: "8",
        companyId: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to add labor entry:", err);
    } finally {
      setLaborLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEquipmentLoading(true);
    try {
      await supabase.from("diary_equipment_entries").insert({
        diary_entry_id: entry.id,
        equipment_name: equipmentForm.equipmentName,
        quantity: parseInt(equipmentForm.quantity) || 1,
        hours_used: equipmentForm.hoursUsed
          ? parseFloat(equipmentForm.hoursUsed)
          : null,
        company_id: equipmentForm.companyId || null,
        notes: equipmentForm.notes || null,
      });
      setEquipmentDialogOpen(false);
      setEquipmentForm({
        equipmentName: "",
        quantity: "1",
        hoursUsed: "",
        companyId: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to add equipment entry:", err);
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorLoading(true);
    try {
      await supabase.from("diary_visitors").insert({
        diary_entry_id: entry.id,
        visitor_name: visitorForm.visitorName,
        company: visitorForm.company || null,
        purpose: visitorForm.purpose || null,
        time_in: visitorForm.timeIn || null,
        time_out: visitorForm.timeOut || null,
      });
      setVisitorDialogOpen(false);
      setVisitorForm({
        visitorName: "",
        company: "",
        purpose: "",
        timeIn: "",
        timeOut: "",
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to add visitor:", err);
    } finally {
      setVisitorLoading(false);
    }
  };

  const handleDeleteLabor = async (id: string) => {
    await supabase.from("diary_labor_entries").delete().eq("id", id);
    router.refresh();
  };

  const handleDeleteEquipment = async (id: string) => {
    await supabase.from("diary_equipment_entries").delete().eq("id", id);
    router.refresh();
  };

  const handleDeleteVisitor = async (id: string) => {
    await supabase.from("diary_visitors").delete().eq("id", id);
    router.refresh();
  };

  // Calculate totals
  const totalWorkers = laborEntries.reduce((sum, l) => sum + l.worker_count, 0);
  const totalManHours = laborEntries.reduce(
    (sum, l) => sum + l.worker_count * Number(l.hours_worked),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/site-diary`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projects/${project.id}/site-diary`}
              className="hover:underline"
            >
              Site Diary
            </Link>
            <ChevronRight className="size-4" />
            <span>{formatDate(entry.entry_date)}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {formatDate(entry.entry_date)}
          </h1>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Weather */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entry.weather_condition ? (
              <div className="flex items-center gap-2">
                {weatherIcons[entry.weather_condition]}
                <span className="font-medium">
                  {weatherLabels[entry.weather_condition]}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
            {(entry.temperature_low !== null ||
              entry.temperature_high !== null) && (
              <p className="text-sm text-muted-foreground mt-1">
                {entry.temperature_low !== null && entry.temperature_high !== null
                  ? `${entry.temperature_low}° - ${entry.temperature_high}°C`
                  : entry.temperature_high !== null
                  ? `${entry.temperature_high}°C`
                  : `${entry.temperature_low}°C`}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Workers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4 text-green-500" />
              Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalWorkers}</p>
            <p className="text-sm text-muted-foreground">
              {totalManHours.toFixed(1)} man-hours
            </p>
          </CardContent>
        </Card>

        {/* Safety */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <HardHat className="size-4 text-yellow-500" />
              Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(entry.safety_incidents ?? 0) > 0 ? (
              <Badge variant="destructive" className="text-lg">
                {entry.safety_incidents} incident
                {entry.safety_incidents !== 1 ? "s" : ""}
              </Badge>
            ) : (
              <p className="text-lg font-medium text-green-600">No incidents</p>
            )}
          </CardContent>
        </Card>

        {/* Delays */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Truck className="size-4 text-orange-500" />
              Delays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Number(entry.delays_hours || 0).toFixed(1)}h
            </p>
            {entry.delay_reason && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {entry.delay_reason}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work Summary */}
      {entry.work_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Work Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{entry.work_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Safety Notes */}
      {entry.safety_notes && (
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-yellow-600 dark:text-yellow-400">
              <HardHat className="size-4" />
              Safety Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{entry.safety_notes}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Labor Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Labor</CardTitle>
              <CardDescription>Workers on site</CardDescription>
            </div>
            <Dialog open={laborDialogOpen} onOpenChange={setLaborDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 size-4" />
                  Add Labor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddLabor}>
                  <DialogHeader>
                    <DialogTitle>Add Labor Entry</DialogTitle>
                    <DialogDescription>
                      Record workers on site for this day
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="trade" className="text-right">
                        Trade
                      </Label>
                      <Input
                        id="trade"
                        placeholder="e.g., Electrician, Plumber"
                        className="col-span-3"
                        value={laborForm.trade}
                        onChange={(e) =>
                          setLaborForm({ ...laborForm, trade: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="workers" className="text-right">
                        Workers
                      </Label>
                      <Input
                        id="workers"
                        type="number"
                        min="1"
                        className="col-span-3"
                        value={laborForm.workerCount}
                        onChange={(e) =>
                          setLaborForm({
                            ...laborForm,
                            workerCount: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hours" className="text-right">
                        Hours
                      </Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.5"
                        min="0"
                        className="col-span-3"
                        value={laborForm.hoursWorked}
                        onChange={(e) =>
                          setLaborForm({
                            ...laborForm,
                            hoursWorked: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="company" className="text-right">
                        Company
                      </Label>
                      <Select
                        value={laborForm.companyId}
                        onValueChange={(value) =>
                          setLaborForm({ ...laborForm, companyId: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="labor-notes" className="text-right pt-2">
                        Notes
                      </Label>
                      <Textarea
                        id="labor-notes"
                        className="col-span-3"
                        value={laborForm.notes}
                        onChange={(e) =>
                          setLaborForm({ ...laborForm, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={laborLoading}>
                      {laborLoading ? "Adding..." : "Add Entry"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {laborEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No labor entries recorded
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Workers</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Man-Hours</TableHead>
                  {isAdmin && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborEntries.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.trade}</TableCell>
                    <TableCell>{l.company?.name || "-"}</TableCell>
                    <TableCell className="text-right">{l.worker_count}</TableCell>
                    <TableCell className="text-right">
                      {Number(l.hours_worked).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(l.worker_count * Number(l.hours_worked)).toFixed(1)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => handleDeleteLabor(l.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Equipment Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Equipment</CardTitle>
              <CardDescription>Equipment on site</CardDescription>
            </div>
            <Dialog
              open={equipmentDialogOpen}
              onOpenChange={setEquipmentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 size-4" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddEquipment}>
                  <DialogHeader>
                    <DialogTitle>Add Equipment Entry</DialogTitle>
                    <DialogDescription>
                      Record equipment used on site
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="equipment" className="text-right">
                        Equipment
                      </Label>
                      <Input
                        id="equipment"
                        placeholder="e.g., Excavator, Crane"
                        className="col-span-3"
                        value={equipmentForm.equipmentName}
                        onChange={(e) =>
                          setEquipmentForm({
                            ...equipmentForm,
                            equipmentName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        className="col-span-3"
                        value={equipmentForm.quantity}
                        onChange={(e) =>
                          setEquipmentForm({
                            ...equipmentForm,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="equip-hours" className="text-right">
                        Hours Used
                      </Label>
                      <Input
                        id="equip-hours"
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Optional"
                        className="col-span-3"
                        value={equipmentForm.hoursUsed}
                        onChange={(e) =>
                          setEquipmentForm({
                            ...equipmentForm,
                            hoursUsed: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="equip-company" className="text-right">
                        Company
                      </Label>
                      <Select
                        value={equipmentForm.companyId}
                        onValueChange={(value) =>
                          setEquipmentForm({
                            ...equipmentForm,
                            companyId: value,
                          })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="equip-notes" className="text-right pt-2">
                        Notes
                      </Label>
                      <Textarea
                        id="equip-notes"
                        className="col-span-3"
                        value={equipmentForm.notes}
                        onChange={(e) =>
                          setEquipmentForm({
                            ...equipmentForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={equipmentLoading}>
                      {equipmentLoading ? "Adding..." : "Add Entry"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {equipmentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No equipment recorded
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  {isAdmin && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.equipment_name}
                    </TableCell>
                    <TableCell>{e.company?.name || "-"}</TableCell>
                    <TableCell className="text-right">{e.quantity}</TableCell>
                    <TableCell className="text-right">
                      {e.hours_used !== null
                        ? Number(e.hours_used).toFixed(1)
                        : "-"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => handleDeleteEquipment(e.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Visitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visitors</CardTitle>
              <CardDescription>Visitor log</CardDescription>
            </div>
            <Dialog open={visitorDialogOpen} onOpenChange={setVisitorDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 size-4" />
                  Add Visitor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddVisitor}>
                  <DialogHeader>
                    <DialogTitle>Add Visitor</DialogTitle>
                    <DialogDescription>Record site visitor</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="visitor-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="visitor-name"
                        className="col-span-3"
                        value={visitorForm.visitorName}
                        onChange={(e) =>
                          setVisitorForm({
                            ...visitorForm,
                            visitorName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="visitor-company" className="text-right">
                        Company
                      </Label>
                      <Input
                        id="visitor-company"
                        className="col-span-3"
                        value={visitorForm.company}
                        onChange={(e) =>
                          setVisitorForm({
                            ...visitorForm,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="visitor-purpose" className="text-right">
                        Purpose
                      </Label>
                      <Input
                        id="visitor-purpose"
                        placeholder="e.g., Site inspection"
                        className="col-span-3"
                        value={visitorForm.purpose}
                        onChange={(e) =>
                          setVisitorForm({
                            ...visitorForm,
                            purpose: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time-in" className="text-right">
                        Time In
                      </Label>
                      <Input
                        id="time-in"
                        type="time"
                        className="col-span-3"
                        value={visitorForm.timeIn}
                        onChange={(e) =>
                          setVisitorForm({
                            ...visitorForm,
                            timeIn: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time-out" className="text-right">
                        Time Out
                      </Label>
                      <Input
                        id="time-out"
                        type="time"
                        className="col-span-3"
                        value={visitorForm.timeOut}
                        onChange={(e) =>
                          setVisitorForm({
                            ...visitorForm,
                            timeOut: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={visitorLoading}>
                      {visitorLoading ? "Adding..." : "Add Visitor"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {visitors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No visitors recorded
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  {isAdmin && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      {v.visitor_name}
                    </TableCell>
                    <TableCell>{v.company || "-"}</TableCell>
                    <TableCell>{v.purpose || "-"}</TableCell>
                    <TableCell>{v.time_in || "-"}</TableCell>
                    <TableCell>{v.time_out || "-"}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => handleDeleteVisitor(v.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {entry.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
