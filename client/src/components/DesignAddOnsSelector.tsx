import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export interface SelectedAddOn {
  id: number;
  name: string;
  pricePerNail: number;
  quantity: number;
}

interface DesignAddOnsSelectorProps {
  onAddOnsChange: (addOns: SelectedAddOn[], totalCost: number) => void;
}

// Pre-defined design add-ons with pricing
const DESIGN_ADD_ONS = [
  { id: 1, name: "Glitters", pricePerNail: 25 },
  { id: 2, name: "Rhinestones", pricePerNail: 25 },
  { id: 3, name: "Charms", pricePerNail: 25 },
  { id: 4, name: "Sticker", pricePerNail: 25 },
  { id: 5, name: "French tip", pricePerNail: 35 },
  { id: 6, name: "Cat eye", pricePerNail: 35 },
  { id: 7, name: "Chrome", pricePerNail: 35 },
  { id: 8, name: "Marble", pricePerNail: 45 },
  { id: 9, name: "Embossed", pricePerNail: 45 },
  { id: 10, name: "Nail art", pricePerNail: 45 },
];

const MAX_TOTAL_NAILS = 10;

export function DesignAddOnsSelector({ onAddOnsChange }: DesignAddOnsSelectorProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);

  // Calculate total nails and cost
  const { totalNails, totalCost } = useMemo(() => {
    const nails = selectedAddOns.reduce((sum, addon) => sum + addon.quantity, 0);
    const cost = selectedAddOns.reduce((sum, addon) => sum + addon.pricePerNail * addon.quantity, 0);
    return { totalNails: nails, totalCost: cost };
  }, [selectedAddOns]);

  const handleAddOnQuantityChange = (addOnId: number, quantity: number) => {
    // Clamp quantity between 0 and 10
    const clampedQuantity = Math.max(0, Math.min(10, quantity));

    setSelectedAddOns((prev) => {
      const existing = prev.find((a) => a.id === addOnId);

      if (clampedQuantity === 0) {
        // Remove if quantity is 0
        return prev.filter((a) => a.id !== addOnId);
      }

      if (existing) {
        // Check if adding this quantity would exceed max total nails
        const otherNails = prev
          .filter((a) => a.id !== addOnId)
          .reduce((sum, a) => sum + a.quantity, 0);

        if (otherNails + clampedQuantity > MAX_TOTAL_NAILS) {
          // Don't update if it exceeds limit
          return prev;
        }

        return prev.map((a) =>
          a.id === addOnId ? { ...a, quantity: clampedQuantity } : a
        );
      } else {
        // Check if adding new add-on would exceed max total nails
        if (totalNails + clampedQuantity > MAX_TOTAL_NAILS) {
          return prev;
        }

        const addOn = DESIGN_ADD_ONS.find((a) => a.id === addOnId);
        if (!addOn) return prev;

        return [
          ...prev,
          {
            id: addOnId,
            name: addOn.name,
            pricePerNail: addOn.pricePerNail,
            quantity: clampedQuantity,
          },
        ];
      }
    });
  };

  const handleRemoveAddOn = (addOnId: number) => {
    setSelectedAddOns((prev) => prev.filter((a) => a.id !== addOnId));
  };

  // Notify parent component of changes
  const handleAddOnChange = (addOns: SelectedAddOn[]) => {
    const cost = addOns.reduce((sum, addon) => sum + addon.pricePerNail * addon.quantity, 0);
    onAddOnsChange(addOns, cost);
  };

  const handleAddOn = (addOnId: number) => {
    const addOn = DESIGN_ADD_ONS.find((a) => a.id === addOnId);
    if (!addOn) return;

    // Check if already selected
    const existing = selectedAddOns.find((a) => a.id === addOnId);
    if (existing) return;

    // Check if adding would exceed max
    if (totalNails >= MAX_TOTAL_NAILS) return;

    const newAddOns = [
      ...selectedAddOns,
      {
        id: addOnId,
        name: addOn.name,
        pricePerNail: addOn.pricePerNail,
        quantity: 1,
      },
    ];

    setSelectedAddOns(newAddOns);
    handleAddOnChange(newAddOns);
  };

  // Update parent when selectedAddOns changes
  const updateParent = (newAddOns: SelectedAddOn[]) => {
    setSelectedAddOns(newAddOns);
    handleAddOnChange(newAddOns);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Design Add-Ons (Per Nail)</h3>
        <span className="text-xs text-muted-foreground">
          {totalNails}/{MAX_TOTAL_NAILS} nails
        </span>
      </div>

      {/* Add-Ons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {DESIGN_ADD_ONS.map((addOn) => {
          const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
          const isDisabled = !isSelected && totalNails >= MAX_TOTAL_NAILS;

          return (
            <Button
              key={addOn.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleAddOn(addOn.id)}
              disabled={isDisabled}
              className="text-xs h-9"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span>{addOn.name}</span>
                <span className="text-xs opacity-75">₱{addOn.pricePerNail}/nail</span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Selected Add-Ons with Quantity */}
      {selectedAddOns.length > 0 && (
        <Card className="p-4 bg-accent/50">
          <div className="space-y-3">
            {selectedAddOns.map((addOn) => (
              <div key={addOn.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{addOn.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₱{addOn.pricePerNail} × {addOn.quantity} nails = {formatCurrency(addOn.pricePerNail * addOn.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={Math.min(10, MAX_TOTAL_NAILS - (totalNails - addOn.quantity))}
                    value={addOn.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 0;
                      const newAddOns = selectedAddOns.map((a) =>
                        a.id === addOn.id ? { ...a, quantity: newQuantity } : a
                      );
                      updateParent(newAddOns.filter((a) => a.quantity > 0));
                    }}
                    className="w-16 h-8 text-center text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAddOn(addOn.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Total Add-Ons Cost */}
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Add-Ons Total:</span>
                <span className="text-sm font-semibold">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {selectedAddOns.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No add-ons selected. Click above to add design options.
        </p>
      )}
    </div>
  );
}
