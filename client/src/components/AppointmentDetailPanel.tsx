import { X, Edit, Trash2, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from "@/lib/types";
import { format } from "date-fns";

interface AppointmentDetailPanelProps {
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: number) => void;
  onViewReceipt: (appointment: Appointment) => void;
  onMarkConfirmed?: (appointmentId: number, isConfirmed: number) => void;
}

export function AppointmentDetailPanel({
  appointment,
  onClose,
  onEdit,
  onDelete,
  onViewReceipt,
  onMarkConfirmed,
}: AppointmentDetailPanelProps) {
  if (!appointment) return null;

  const isAppointment = appointment.type === "appointment";
  const isRest = appointment.type === "rest";
  const isOther = appointment.type === "other";

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <CardTitle className="text-lg">
          {isRest ? "Rest Period" : isOther ? "Other" : "Appointment Details"}
        </CardTitle>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date & Time */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Date & Time</p>
          <p className="text-sm text-gray-600">
            {format(new Date(appointment.appointmentDate), "EEEE, MMMM d, yyyy")}
          </p>
          <p className="text-sm text-gray-600">
            {format(new Date(appointment.appointmentDate), "h:mm a")} -{" "}
            {format(
              new Date(
                new Date(appointment.appointmentDate).getTime() +
                  appointment.durationMinutes * 60000
              ),
              "h:mm a"
            )}
          </p>
        </div>

        {/* Type Badge */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Type</p>
          <div className="inline-block">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                isRest
                  ? "bg-[#9CAF88]"
                  : isOther
                    ? "bg-[#4A90E2]"
                    : "bg-[#3A5F5F]"
              }`}
            >
              {isRest ? "Rest" : isOther ? "Other" : "Appointment"}
            </span>
          </div>
        </div>

        {/* Status (only for appointments) */}
        {isAppointment && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
            <div className="inline-block">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                  appointment.status === "confirmed"
                    ? "bg-green-500"
                    : appointment.status === "pending"
                      ? "bg-yellow-500"
                      : appointment.status === "completed"
                        ? "bg-blue-500"
                        : "bg-red-500"
                }`}
              >
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Client Info (only for appointments) */}
        {isAppointment && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Client</p>
            <p className="text-sm text-gray-600">Client #{appointment.clientId}</p>
          </div>
        )}

        {/* Service Info (only for appointments) */}
        {isAppointment && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Service</p>
            <p className="text-sm text-gray-600">Service #{appointment.serviceId}</p>
          </div>
        )}

        {/* Duration */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Duration</p>
          <p className="text-sm text-gray-600">{appointment.durationMinutes} minutes</p>
        </div>

        {/* Notes (for Other items) */}
        {isOther && appointment.notes && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        )}

        {/* Price (only for appointments) */}
        {isAppointment && appointment.price && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Price</p>
            <p className="text-sm text-gray-600">
              ${typeof appointment.price === 'string' ? parseFloat(appointment.price).toFixed(2) : (appointment.price as number).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <Button
          onClick={() => onEdit(appointment)}
          variant="outline"
          className="w-full justify-start"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => onDelete(appointment.id)}
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        {isAppointment && (
          <Button
            onClick={() => onViewReceipt(appointment)}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Receipt
          </Button>
        )}
        <Button
          onClick={() => onMarkConfirmed?.(appointment.id, appointment.isConfirmed ? 0 : 1)}
          variant="outline"
          className={`w-full justify-start ${
            appointment.isConfirmed
              ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Check className="w-4 h-4 mr-2" />
          {appointment.isConfirmed ? "Undo" : "Mark as Confirmed"}
        </Button>
      </div>
    </div>
  );
}
