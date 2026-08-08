import type { Appointment } from "@/lib/types";

interface TimeSlotIndicatorProps {
  appointments: Appointment[];
  date: Date;
}

/**
 * Component that displays occupied time slots with visual indicators
 * Shows which times are booked for a specific date
 */
export function TimeSlotIndicator({ appointments, date }: TimeSlotIndicatorProps) {
  // Filter appointments for the specific date
  const dateStr = date.toISOString().split("T")[0];
  const dayAppointments = appointments.filter((apt) => {
    const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
    return aptDateStr === dateStr;
  });

  if (dayAppointments.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {dayAppointments.map((apt, idx) => {
        // Format appointment date and time
        const aptDate = new Date(apt.appointmentDate);
        const timeStr = aptDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const endDate = new Date(aptDate.getTime() + apt.durationMinutes * 60000);
        const endTimeStr = endDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return (
          <div
            key={idx}
            className="flex items-center gap-2 text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded"
          >
            {/* Slash line indicator */}
            <div className="relative w-4 h-4 flex items-center justify-center">
              <svg
                className="w-full h-full"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="0" y1="20" x2="20" y2="0" />
              </svg>
            </div>
            <span className="font-medium">{timeStr}</span>
            <span className="text-gray-400">-</span>
            <span className="font-medium">{endTimeStr}</span>
            <span className="text-gray-500 ml-auto">{apt.notes || "Occupied"}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Utility function to get color for time slot based on appointment type
 */
export function getTimeSlotColor(type: string): string {
  const colorMap: Record<string, string> = {
    appointment: "#3A5F5F", // Juniper Green
    rest: "#9CAF88", // Muted Sage
    gym: "#4A90E2", // Blue
    church: "#8E44AD", // Purple
    meeting: "#16A085", // Teal
    personal: "#F39C12", // Amber
    other: "#3F51B5", // Indigo
  };

  return colorMap[type.toLowerCase()] || colorMap.other;
}

/**
 * Utility function to check if a time slot is occupied
 */
export function isTimeSlotOccupied(
  appointments: Appointment[],
  date: Date,
  time: string
): boolean {
  const dateStr = date.toISOString().split("T")[0];

  return appointments.some((apt) => {
    const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
    if (aptDateStr !== dateStr) return false;

    // Parse time string (HH:MM format)
    const [inputHour, inputMin] = time.split(":").map(Number);
    const inputMinutes = inputHour * 60 + inputMin;

    // Get appointment start and end times
    const aptDate = new Date(apt.appointmentDate);
    const aptStartMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();
    const aptEndMinutes = aptStartMinutes + apt.durationMinutes;

    // Check if input time falls within appointment time
    return inputMinutes >= aptStartMinutes && inputMinutes < aptEndMinutes;
  });
}
