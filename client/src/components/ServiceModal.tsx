import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Service } from "@/lib/types";

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Manicure",
  "Pedicure",
  "Nail Art",
  "Extension",
  "Gel",
  "Acrylic",
  "Dip Powder",
  "Other",
];

export function ServiceModal({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "60",
    category: "Manicure",
  });

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully");
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        durationMinutes: "60",
        category: "Manicure",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create service");
    },
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update service");
    },
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        price: service.price,
        durationMinutes: service.durationMinutes.toString(),
        category: service.category,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        durationMinutes: "60",
        category: "Manicure",
      });
    }
  }, [service, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.durationMinutes) {
      toast.error("Please fill in all required fields");
      return;
    }

    const serviceData = {
      name: formData.name,
      description: formData.description || undefined,
      price: formData.price,
      durationMinutes: parseInt(formData.durationMinutes),
      category: formData.category,
    };

    if (service) {
      updateMutation.mutate({
        id: service.id,
        ...serviceData,
      });
    } else {
      createMutation.mutate(serviceData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit Service" : "New Service"}
          </DialogTitle>
          <DialogDescription>
            {service
              ? "Update the service information"
              : "Add a new service to your catalog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₱) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this service..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="resize-none"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : service
                  ? "Update Service"
                  : "Create Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
