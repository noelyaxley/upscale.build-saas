"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  HardHat,
  Plus,
  Sun,
  Thermometer,
  Truck,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateDiaryEntryDialog } from "@/components/create-diary-entry-dialog";

type WeatherCondition = Database["public"]["Enums"]["weather_condition"];

type DiaryEntry = Tables<"site_diary_entries"> & {
  created_by: { id: string; full_name: string | null } | null;
  diary_labor_entries: { id: string }[];
  diary_equipment_entries: { id: string }[];
  diary_visitors: { id: string }[];
};

type Company = {
  id: string;
  name: string;
};

interface SiteDiaryViewProps {
  project: { id: string; code: string; name: string };
  entries: DiaryEntry[];
  companies: Company[];
}

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  sunny: <Sun className="size-4 text-yellow-500" />,
  partly_cloudy: <CloudSun className="size-4 text-blue-400" />,
  cloudy: <Cloud className="size-4 text-gray-500" />,
  light_rain: <CloudRain className="size-4 text-blue-500" />,
  heavy_rain: <CloudRain className="size-4 text-blue-700" />,
  storm: <Zap className="size-4 text-purple-500" />,
  windy: <Wind className="size-4 text-teal-500" />,
  hot: <Thermometer className="size-4 text-red-500" />,
  cold: <Thermometer className="size-4 text-cyan-500" />,
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

export function SiteDiaryView({
  project,
  entries,
  companies,
}: SiteDiaryViewProps) {

  // Group entries by month
  const entriesByMonth = entries.reduce<Record<string, DiaryEntry[]>>(
    (acc, entry) => {
      const monthKey = new Date(entry.entry_date).toLocaleDateString("en-AU", {
        month: "long",
        year: "numeric",
      });
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(entry);
      return acc;
    },
    {}
  );

  // Calculate stats
  const totalWorkers = entries.reduce((sum, e) => {
    return sum + e.diary_labor_entries.length;
  }, 0);

  const totalIncidents = entries.reduce((sum, e) => sum + (e.safety_incidents ?? 0), 0);

  const totalDelayHours = entries.reduce(
    (sum, e) => sum + Number(e.delays_hours || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <span>Site Diary</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateDiaryEntryDialog projectId={project.id} companies={companies}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Entry
          </Button>
        </CreateDiaryEntryDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="size-4 text-blue-500" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4 text-green-500" />
              Labor Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalWorkers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <HardHat className="size-4 text-yellow-500" />
              Safety Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalIncidents}</p>
            {totalIncidents === 0 && (
              <p className="text-xs text-green-600">No incidents reported</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Truck className="size-4 text-orange-500" />
              Delay Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDelayHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Diary Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Entries</CardTitle>
          <CardDescription>
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No diary entries yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first site diary entry
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
                <div key={month}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {month}
                  </h3>
                  <div className="space-y-2">
                    {monthEntries.map((entry) => (
                      <Link
                        key={entry.id}
                        href={`/projects/${project.id}/site-diary/${entry.id}`}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-12">
                            <span className="text-lg font-bold">
                              {new Date(entry.entry_date).getDate()}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase">
                              {new Date(entry.entry_date).toLocaleDateString(
                                "en-AU",
                                { weekday: "short" }
                              )}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {entry.weather_condition && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {weatherIcons[entry.weather_condition]}
                                  {weatherLabels[entry.weather_condition]}
                                </Badge>
                              )}
                              {entry.temperature_high !== null && (
                                <span className="text-xs text-muted-foreground">
                                  {entry.temperature_low !== null
                                    ? `${entry.temperature_low}° - ${entry.temperature_high}°`
                                    : `${entry.temperature_high}°`}
                                </span>
                              )}
                            </div>
                            {entry.work_summary && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {entry.work_summary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {entry.diary_labor_entries.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {entry.diary_labor_entries.length}
                              </span>
                            )}
                            {entry.diary_equipment_entries.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Truck className="size-3" />
                                {entry.diary_equipment_entries.length}
                              </span>
                            )}
                            {entry.diary_visitors.length > 0 && (
                              <span className="flex items-center gap-1">
                                <HardHat className="size-3" />
                                {entry.diary_visitors.length}
                              </span>
                            )}
                            {(entry.safety_incidents ?? 0) > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {entry.safety_incidents} incident
                                {entry.safety_incidents !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className="size-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
