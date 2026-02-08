"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  FeasibilityState,
  FeasibilityAction,
  FeasibilitySummary,
  LandLot,
} from "@/lib/feasibility/types";
import { LandLotCard } from "./land-lot-card";
import { LineItemsTable } from "./line-items-table";
import { formatCurrency } from "./currency-helpers";

interface LandTabProps {
  state: FeasibilityState;
  dispatch: React.Dispatch<FeasibilityAction>;
  summary: FeasibilitySummary;
}

export function LandTab({ state, dispatch, summary }: LandTabProps) {
  const [activeLotIndex, setActiveLotIndex] = useState(0);
  const activeLot = state.landLots[activeLotIndex] ?? null;

  const handleAddLot = () => {
    const newLot: LandLot = {
      id: crypto.randomUUID(),
      scenario_id: state.scenario.id,
      name: `Lot ${state.landLots.length + 1}`,
      land_size_m2: null,
      address: null,
      suburb: null,
      state: state.scenario.state || "NSW",
      postcode: null,
      entity_gst_registered: false,
      land_purchase_gst_included: false,
      margin_scheme_applied: false,
      land_rate: 0,
      purchase_price: 0,
      deposit_amount: 0,
      deposit_pct: 10,
      sort_order: state.landLots.length,
    };
    dispatch({ type: "ADD_LAND_LOT", payload: newLot });
    setActiveLotIndex(state.landLots.length);
  };

  const handleDeleteLot = (id: string) => {
    dispatch({ type: "REMOVE_LAND_LOT", payload: id });
    setActiveLotIndex(Math.max(0, activeLotIndex - 1));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {/* Lot selector pills */}
        <div className="flex flex-wrap items-center gap-2">
          {state.landLots.map((lot, idx) => (
            <Button
              key={lot.id}
              variant={idx === activeLotIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLotIndex(idx)}
            >
              {lot.name}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddLot}>
            <Plus className="mr-1 size-3.5" />
            Add Lot
          </Button>
        </div>

        {/* Active lot card */}
        {activeLot ? (
          <>
            <LandLotCard
              lot={activeLot}
              onUpdate={(changes) =>
                dispatch({
                  type: "UPDATE_LAND_LOT",
                  payload: { id: activeLot.id, changes },
                })
              }
              onDelete={() => handleDeleteLot(activeLot.id)}
            />

            {/* Acquisition costs for this lot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acquisition Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <LineItemsTable
                  items={state.lineItems}
                  section="acquisition"
                  tabName="Default"
                  scenarioId={state.scenario.id}
                  summary={summary}
                  landLotId={activeLot.id}
                  onAdd={(item) =>
                    dispatch({
                      type: "ADD_LINE_ITEM",
                      payload: { ...item, land_lot_id: activeLot.id },
                    })
                  }
                  onUpdate={(id, changes) =>
                    dispatch({
                      type: "UPDATE_LINE_ITEM",
                      payload: { id, changes },
                    })
                  }
                  onRemove={(id) =>
                    dispatch({ type: "REMOVE_LINE_ITEM", payload: id })
                  }
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Add a land lot to get started
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleAddLot}>
                <Plus className="mr-1 size-3.5" />
                Add Lot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-lime-500" />
              Land Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Land Cost</span>
              <span className="font-medium">{formatCurrency(summary.landCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Acquisition</span>
              <span className="font-medium">
                {formatCurrency(summary.acquisitionCosts)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Land Size</span>
              <span className="font-medium">
                {summary.totalLandSize.toFixed(0)} m2
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lots</span>
              <span className="font-medium">{summary.lotCount}</span>
            </div>
            {summary.totalLandSize > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg $/m2</span>
                <span className="font-medium">
                  {formatCurrency(
                    Math.round(summary.landCost / summary.totalLandSize)
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
