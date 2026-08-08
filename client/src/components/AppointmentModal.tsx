import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Appointment } from "@/lib/types";
import { Calendar, Clock, User, Briefcase, FileText, DollarSign, Tag } from "lucide-react";


interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSuccess?: () => void;
}

export function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    staffId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "appointment" as "appointment" | "rest" | "other",
    status: "pending" as "confirmed" | "pending" | "completed" | "cancelled",
    notes: "",
    price: "",
  });



  const { data: clients } = trpc.clients.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();
  const { data: staff } = trpc.staff.list.useQuery();

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Appointment created successfully");
      onOpenChange(false);
      setFormData({
        clientId: "",
        staffId: "",
        serviceId: "",
        appointmentDate: "",
        appointmentTime: "",
        type: "appointment" as "appointment" | "rest" | "other",
        status: "pending" as "confirmed" | "pending" | "completed" | "cancelled",
        notes: "",
        price: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create appointment");
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Appointment updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update appointment");
    },
  });

  const handleServiceChange = (value: string) => {
    setFormData({ ...formData, serviceId: value });
    const selectedService = services?.find(s => s.id.toString() === value);
    if (selectedService) {
      setFormData(prev => ({ ...prev, price: selectedService.price.toString() }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.appointmentDate) {
      if (formData.type === "rest") {
        toast.error("Please select a date for the rest period");
      } else {
        toast.error("Please fill in all required fields for the appointment");
      }
      return;
    }

    if (formData.type === "appointment" && !formData.clientId) {
      toast.error("Please select a client");
      return;
    }

    if (formData.type === "appointment" && !formData.serviceId) {
      toast.error("Please select a service");
      return;
    }

    if (formData.type === "appointment" && !formData.appointmentTime) {
      toast.error("Please select a time");
      return;
    }

    if (formData.type === "other" && !formData.notes) {
      toast.error("Please specify what this entry is for");
      return;
    }

    const timeToUse = formData.appointmentTime || "00:00";
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${timeToUse}`);
    const selectedService = services?.find(s => s.id.toString() === formData.serviceId);
    // For rest periods and other, use 1440 minutes (24 hours); for appointments use service duration
    const durationMinutes = (formData.type === "rest" || formData.type === "other") ? 1440 : (selectedService?.durationMinutes || 60);

    // Use form price or service price
    let finalPrice = formData.price;
    if (!finalPrice) {
      const selectedService = services?.find(s => s.id.toString() === formData.serviceId);
      if (selectedService) {
        finalPrice = selectedService.price.toString();
      }
    }

    const appointmentData = {
      clientId: (formData.type === "rest" || formData.type === "other") ? undefined : (formData.clientId ? parseInt(formData.clientId) : undefined),
      staffId: formData.staffId ? parseInt(formData.staffId) : undefined,
      serviceId: (formData.type === "rest" || formData.type === "other") ? undefined : (formData.serviceId ? parseInt(formData.serviceId) : undefined),
      appointmentDate: appointmentDateTime,
      durationMinutes,
      type: formData.type as "appointment" | "rest" | "other",
      status: formData.status as "confirmed" | "pending" | "completed" | "cancelled",
      notes: formData.notes || undefined,
      price: finalPrice || undefined,
    };

    if (appointment) {
      updateMutation.mutate({
        id: appointment.id,
        ...appointmentData,
      });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-xl font-bold">
            {appointment ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            {appointment
              ? "Update the appointment details"
              : "Create a new appointment, rest period, or custom entry"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-3">
          {/* Type Selection */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 text-primary" />
              <Label htmlFor="type" className="font-semibold text-sm">Type *</Label>
            </div>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as "appointment" | "rest" | "other" })
              }
            >
              <SelectTrigger id="type" className="h-9 text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="rest">Rest</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointment-Specific Fields */}
          {formData.type === "appointment" && (
            <div className="space-y-2 p-3 bg-card rounded-lg border border-border/50">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="client" className="text-xs font-medium flex items-center gap-1.5"><User size={14} />Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
                  >
                    <SelectTrigger id="client" className="h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="service" className="text-xs font-medium flex items-center gap-1.5"><Briefcase size={14} />Service *</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={handleServiceChange}
                  >
                    <SelectTrigger id="service" className="h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} (₱{service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-xs font-medium flex items-center gap-1.5"><Calendar size={14} />Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appointmentDate: e.target.value })
                    }
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="time" className="text-xs font-medium flex items-center gap-1.5"><Clock size={14} />Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) =>
                      setFormData({ ...formData, appointmentTime: e.target.value })
                    }
                    className="h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs font-medium">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "confirmed" | "pending" | "completed" | "cancelled",
                      })
                    }
                  >
                    <SelectTrigger id="status" className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="price" className="text-xs font-medium">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rest Period Fields */}
          {formData.type === "rest" && (
            <div className="space-y-2 p-3 bg-white rounded-lg border border-border/50">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs font-medium flex items-center gap-1.5"><Calendar size={14} />Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  className="h-9 text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* Other/Notes Fields */}
          {formData.type === "other" && (
            <div className="space-y-2 p-3 bg-white rounded-lg border border-border/50">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs font-medium flex items-center gap-1.5"><Calendar size={14} />Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="other-notes" className="text-xs font-medium flex items-center gap-1.5"><Tag size={14} />What is this? *</Label>
                <Textarea
                  id="other-notes"
                  placeholder="e.g., Cleaning, Gym, Others..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="resize-none h-16 text-sm"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="space-y-2 p-3 bg-card rounded-lg border border-border/50">
            <div className="space-y-1">
              <Label htmlFor="staff" className="text-xs font-medium flex items-center gap-1.5"><User size={14} />Staff Member</Label>
              <Select
                value={formData.staffId || "unassigned"}
                onValueChange={(value) =>
                  setFormData({ ...formData, staffId: value === "unassigned" ? "" : value })
                }
              >
                <SelectTrigger id="staff" className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staff?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "appointment" && (
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="resize-none h-16 text-sm"
                  rows={2}
                />
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="pt-3 border-t border-border flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              createMutation.isPending || updateMutation.isPending
            }
            className="flex-1 h-9 text-sm font-semibold"
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : appointment
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
