import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { format } from "date-fns";

interface AddAppointmentModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSave: (appointment: {
    title: string;
    time: string;
    type: string;
    notes: string;
    date: Date;
  }) => void;
}

const APPOINTMENT_TYPES = [
  { value: "gym", label: "Gym" },
  { value: "church", label: "Church" },
  { value: "meeting", label: "Meeting" },
  { value: "personal", label: "Personal" },
  { value: "appointment", label: "Appointment" },
  { value: "rest", label: "Rest" },
];

export function AddAppointmentModal({
  isOpen,
  selectedDate,
  onClose,
  onSave,
}: AddAppointmentModalProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("appointment");
  const [notes, setNotes] = useState("");

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setTime("");
      setType("appointment");
      setNotes("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!title.trim() || !time || !selectedDate) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      title,
      time,
      type,
      notes,
      date: selectedDate,
    });

    // Reset form
    setTitle("");
    setTime("");
    setType("appointment");
    setNotes("");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 animate-in scale-in duration-200 origin-center">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Appointment</h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <Input
              type="text"
              placeholder="Enter appointment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time *</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type *</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
            <Textarea
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
