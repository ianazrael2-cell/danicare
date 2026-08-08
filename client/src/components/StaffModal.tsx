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
import { toast } from "sonner";
import type { Staff } from "@/lib/types";

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSuccess?: () => void;
}

export function StaffModal({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    specializations: "",
  });

  const createMutation = trpc.staff.create.useMutation({
    onSuccess: () => {
      toast.success("Staff member created successfully");
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        specializations: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create staff member");
    },
  });

  const updateMutation = trpc.staff.update.useMutation({
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update staff member");
    },
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone || "",
        specializations: staff.specializations || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        specializations: "",
      });
    }
  }, [staff, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const staffData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      specializations: formData.specializations || undefined,
    };

    if (staff) {
      updateMutation.mutate({
        id: staff.id,
        ...staffData,
      });
    } else {
      createMutation.mutate(staffData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {staff ? "Edit Staff Member" : "New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {staff
              ? "Update the staff member information"
              : "Add a new staff member to your salon"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specializations">Specializations</Label>
            <Textarea
              id="specializations"
              placeholder="e.g., Gel nails, Nail art, Extensions (comma-separated)"
              value={formData.specializations}
              onChange={(e) =>
                setFormData({ ...formData, specializations: e.target.value })
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
                : staff
                  ? "Update Staff Member"
                  : "Create Staff Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
