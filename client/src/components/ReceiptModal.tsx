import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Download, Printer } from "lucide-react";
import { useRef } from "react";
// @ts-ignore - html2pdf.js doesn't have proper TypeScript types
import html2pdf from "html2pdf.js";

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: {
    id: number;
    clientName: string;
    serviceName: string;
    price: string;
    duration: number;
    appointmentDate: Date;
    staffName?: string;
  };
}

export function ReceiptModal({ open, onOpenChange, appointment }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!appointment) return null;

  const generateReceiptNumber = () => {
    const date = new Date(appointment.appointmentDate);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    return `RCP-${dateStr}-${appointment.id.toString().padStart(4, "0")}`;
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = receiptRef.current;
      const receiptNumber = generateReceiptNumber();
      const filename = `receipt-${receiptNumber}.pdf`;
      
      const opt: any = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      const pdf = html2pdf();
      pdf.set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(receiptRef.current.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = appointmentDate.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>Receipt #{generateReceiptNumber()}</DialogDescription>
        </DialogHeader>

        <div
          ref={receiptRef}
          className="bg-white text-black p-8 rounded-lg border border-gray-300"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Receipt Header */}
          <div className="text-center mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold">DANICARE NAIL STUDIO</h1>
            <p className="text-sm text-gray-600">Professional Nail Care Services</p>
            <p className="text-xs text-gray-500 mt-2">Receipt #{generateReceiptNumber()}</p>
          </div>

          {/* Receipt Details */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="font-semibold text-gray-700">Date</p>
                <p className="text-gray-900">{formattedDate}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Time</p>
                <p className="text-gray-900">{formattedTime}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Client Name</p>
                <p className="text-gray-900">{appointment.clientName}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Staff</p>
                <p className="text-gray-900">{appointment.staffName || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8 border-t border-b py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-semibold text-gray-700 pb-2">Service</th>
                  <th className="text-center font-semibold text-gray-700 pb-2">Duration</th>
                  <th className="text-right font-semibold text-gray-700 pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 text-gray-900">{appointment.serviceName}</td>
                  <td className="text-center text-gray-900">{appointment.duration} min</td>
                  <td className="text-right text-gray-900">{formatCurrency(appointment.price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mb-8 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between items-center text-lg font-bold border-t-2 pt-4">
                <span>TOTAL</span>
                <span>{formatCurrency(appointment.price)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 border-t pt-4">
            <p>Thank you for your visit!</p>
            <p>Please visit us again soon.</p>
            <p className="mt-2">Danicaré Nail Studio</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
