import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pill, Download, Printer, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generatePrescriptionPDF } from '@/lib/pdfGenerator';
import { cn } from '@/lib/utils';
import Select, { SingleValue } from 'react-select';

interface Patient {
  id: string;
  name: string;
  surname: string;
  dob?: string;
  email?: string;
}

interface OptionType {
  value: string;
  label: string;
}

interface PrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  loadingPatients: boolean;
}

export const PrescriptionDialog = ({
  open,
  onOpenChange,
  patients,
  loadingPatients,
}: PrescriptionDialogProps) => {
  const { user } = useAuth();
  const [selectedPatientOption, setSelectedPatientOption] = useState<SingleValue<OptionType>>(null);
  const [prescriptionDate, setPrescriptionDate] = useState<Date>(new Date());
  const [prescriptionText, setPrescriptionText] = useState('');

  // Map patients to react-select options
  const patientOptions: OptionType[] = patients.map((p) => ({
    value: p.id,
    label: `${p.name} ${p.surname}`,
  }));

  const getPatientById = (id: string) => patients.find((p) => p.id === id);

  const handleGeneratePDF = async () => {
    if (!selectedPatientOption) {
      toast.error('Please select a patient');
      return;
    }

    const patient = getPatientById(selectedPatientOption.value);
    if (!patient) {
      toast.error('Patient data not found');
      return;
    }

    const pdf = await generatePrescriptionPDF(
      {
        name: patient.name,
        surname: patient.surname,
        dob: patient.dob,
        email: patient.email,
      },
      {
        name: user?.name || '',
        surname: user?.surname || '',
        sancNumber: user?.sanc_hpcsa || 'N/A',
      },
      prescriptionText
    );

    pdf.save(`Prescription_${patient.name}_${patient.surname}.pdf`);
    toast.success('Prescription PDF generated successfully');
  };

  const handlePrint = async () => {
    if (!selectedPatientOption) {
      toast.error('Please select a patient');
      return;
    }

    const patient = getPatientById(selectedPatientOption.value);
    if (!patient) {
      toast.error('Patient data not found');
      return;
    }

    const pdf = await generatePrescriptionPDF(
      {
        name: patient.name,
        surname: patient.surname,
        dob: patient.dob,
        email: patient.email,
      },
      {
        name: user?.name || '',
        surname: user?.surname || '',
        sancNumber: user?.sanc_hpcsa || 'N/A',
      },
      prescriptionText
    );

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const resetForm = () => {
    setSelectedPatientOption(null);
    setPrescriptionDate(new Date());
    setPrescriptionText('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Pill className="h-5 w-5 text-primary" />
            Issue Prescription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select
                isLoading={loadingPatients}
                options={patientOptions}
                value={selectedPatientOption}
                onChange={(option) => setSelectedPatientOption(option)}
                placeholder="Search or select patient..."
                isClearable
              />
            </div>

            <div className="space-y-2">
              <Label>Prescribing Nurse</Label>
              <Input value={`${user?.name} ${user?.surname}`} disabled className="bg-muted/50" />
            </div>
          </div>

          {/* SANC Number and Prescription Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>HPCSA / SANC No</Label>
              <Input value={user?.sanc_hpcsa || 'N/A'} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Prescription Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal bg-muted/50")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {prescriptionDate ? format(prescriptionDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={prescriptionDate}
                    onSelect={(date) => date && setPrescriptionDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clinical Prescription */}
          <div className="space-y-2">
            <Label className="font-semibold">Clinical Prescription</Label>
            <Textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="Enter prescription details here..."
              className="min-h-[200px] bg-muted/50 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleGeneratePDF} className="flex-1 gradient-navy text-white">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
