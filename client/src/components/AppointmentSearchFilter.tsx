import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { Appointment } from "@/lib/types";

interface AppointmentSearchFilterProps {
  appointments: Appointment[];
  onFilter: (filtered: Appointment[]) => void;
}

export function AppointmentSearchFilter({ appointments, onFilter }: AppointmentSearchFilterProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    let filtered = appointments;

    // Filter by date range
    if (newStartDate) {
      const start = new Date(newStartDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate >= start;
      });
    }

    if (newEndDate) {
      const end = new Date(newEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate <= end;
      });
    }

    onFilter(filtered);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    handleDateChange(newStartDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    handleDateChange(startDate, newEndDate);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onFilter(appointments);
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Search by Date
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(startDate || endDate) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Active filters:</span>
              {startDate && <span className="ml-2">From {startDate}</span>}
              {endDate && <span className="ml-2">To {endDate}</span>}
            </p>
            <button
              onClick={handleClear}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
