import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import type { Appointment } from "@/lib/types";
import { AppointmentDetailPanel } from "./AppointmentDetailPanel";
import { AddAppointmentModal } from "./AddAppointmentModal";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (appointmentId: number) => void;
  onViewReceipt?: (appointment: Appointment) => void;
  onMarkConfirmed?: (appointmentId: number, isConfirmed: number) => void;
}

export function AppointmentCalendar({ 
  appointments, 
  onDateSelect, 
  selectedDate,
  onEditAppointment,
  onDeleteAppointment,
  onViewReceipt,
  onMarkConfirmed
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dateForModal, setDateForModal] = useState<Date | null>(null);
  const today = new Date();

  const handleDateClick = (day: Date) => {
    onDateSelect(day);
    setDateForModal(day);
    setIsAddModalOpen(true);
  };

  const handleAddAppointment = (appointmentData: {
    title: string;
    time: string;
    type: string;
    notes: string;
    date: Date;
  }) => {
    // This would typically call an API to save the appointment
    // For now, we'll just close the modal
    console.log("New appointment:", appointmentData);
    setIsAddModalOpen(false);
    setDateForModal(null);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.appointmentDate), day));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getOtherItemColor = (notes: string | null) => {
    const softColors = [
      "bg-[#4A90E2]",
      "bg-[#8E44AD]",
      "bg-[#16A085]",
      "bg-[#F39C12]",
      "bg-[#3F51B5]",
      "bg-[#2ECC71]",
    ];
    
    if (!notes) return softColors[0];
    
    let hash = 0;
    for (let i = 0; i < notes.length; i++) {
      hash = ((hash << 5) - hash) + notes.charCodeAt(i);
      hash = hash & hash;
    }
    
    const colorIndex = Math.abs(hash) % softColors.length;
    return softColors[colorIndex];
  };

  const getTypeColor = (type: string, status: string, notes?: string | null) => {
    if (type === "rest") {
      return "bg-[#9CAF88]";
    }
    if (type === "other") {
      return getOtherItemColor(notes || null);
    }
    if (type === "appointment") {
      return "bg-[#3A5F5F]";
    }
    return getStatusColor(status);
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOfWeek = monthStart.getDay();

  // Create array with empty slots for days before month starts
  const calendarDays = Array(firstDayOfWeek)
    .fill(null)
    .concat(daysInMonth);

  return (
    <div className="flex gap-4 h-full">
      <Card className="flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((label) => (
            <div key={label} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square p-1 rounded-lg border-2 transition-all flex flex-col
                  ${!isCurrentMonth ? "opacity-30 cursor-default" : "cursor-pointer hover:bg-accent"}
                  ${isToday ? "border-primary bg-primary/5" : "border-border"}
                  ${isSelected ? "border-primary bg-primary/10" : ""}
                `}
              >
                <div className="h-full flex flex-col">
                  <span className={`text-xs font-semibold ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </span>
                  <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-y-auto">
                    {dayAppointments.map((apt) => (
                      <button
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${getTypeColor(apt.type, apt.status, apt.notes)} hover:opacity-80 transition-opacity cursor-pointer text-left ${apt.isConfirmed ? "line-through" : ""}`}
                      >
                        {apt.type === "rest" ? "Rest" : apt.type === "other" ? (apt.notes || "Other") : format(new Date(apt.appointmentDate), "p")}
                      </button>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected day appointments */}
        {selectedDate && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold mb-3">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getAppointmentsForDay(selectedDate).length > 0 ? (
                getAppointmentsForDay(selectedDate).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2 border border-border rounded-lg text-sm hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {apt.type === "rest" ? "Rest Period" : apt.type === "other" ? (apt.notes || "Other") : `Appointment #${apt.id}`}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(apt.type, apt.status, apt.notes)} text-white`}>
                        {apt.type === "rest" ? "Rest" : apt.type === "other" ? "Other" : apt.status}
                      </span>
                    </div>
                    {apt.type !== "other" && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {format(new Date(apt.appointmentDate), "p")}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No appointments scheduled</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    {selectedAppointment && (
      <AppointmentDetailPanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onEdit={(apt) => {
          onEditAppointment?.(apt);
          setSelectedAppointment(null);
        }}
        onDelete={(id) => {
          onDeleteAppointment?.(id);
          setSelectedAppointment(null);
        }}
        onViewReceipt={(apt) => {
          onViewReceipt?.(apt);
          setSelectedAppointment(null);
        }}
        onMarkConfirmed={(id, isConfirmed) => {
          onMarkConfirmed?.(id, isConfirmed);
          setSelectedAppointment(null);
        }}
      />
    )}
    <AddAppointmentModal
      isOpen={isAddModalOpen}
      selectedDate={dateForModal}
      onClose={() => {
        setIsAddModalOpen(false);
        setDateForModal(null);
      }}
      onSave={handleAddAppointment}
    />
    </div>
  );
}
