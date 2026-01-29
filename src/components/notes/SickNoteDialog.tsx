import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Download, Printer, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateSickNotePDF } from '@/lib/pdfGenerator';
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

interface SickNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[]; // pass patients as prop
  loadingPatients: boolean;
}

export const SickNoteDialog = ({ open, onOpenChange, patients, loadingPatients }: SickNoteDialogProps) => {
  const { user } = useAuth();
  const [selectedPatientOption, setSelectedPatientOption] = useState<SingleValue<OptionType>>(null);
  const [noteDate, setNoteDate] = useState<Date>(new Date());
  const [bookedOffFrom, setBookedOffFrom] = useState<Date>(new Date());
  const [bookedOffTo, setBookedOffTo] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    accompaniedBy: '',
    consultedFor: '',
    fromTime: '09:00',
    toTime: '09:30',
    returningTo: '',
  });

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

    const pdf = await generateSickNotePDF(
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
      {
        ...formData,
        bookedOffFrom: format(bookedOffFrom, 'yyyy-MM-dd'),
        bookedOffTo: format(bookedOffTo, 'yyyy-MM-dd'),
      }
    );

    pdf.save(`SickNote_${patient.name}_${patient.surname}.pdf`);
    toast.success('Sick note PDF generated successfully');
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

    const pdf = await generateSickNotePDF(
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
      {
        ...formData,
        bookedOffFrom: format(bookedOffFrom, 'yyyy-MM-dd'),
        bookedOffTo: format(bookedOffTo, 'yyyy-MM-dd'),
      }
    );

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const resetForm = () => {
    setSelectedPatientOption(null);
    setNoteDate(new Date());
    setBookedOffFrom(new Date());
    setBookedOffTo(new Date());
    setFormData({
      accompaniedBy: '',
      consultedFor: '',
      fromTime: '09:00',
      toTime: '09:30',
      returningTo: '',
    });
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
            <FileText className="h-5 w-5 text-primary" />
            Issue Sick Note
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
              <Label>Seen By (Nurse)</Label>
              <Input value={`${user?.name} ${user?.surname}`} disabled className="bg-muted/50" />
            </div>
          </div>

          {/* SANC Number and Note Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SANC / HPCSA No</Label>
              <Input value={user?.sanc_hpcsa || 'N/A'} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Note Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/50",
                      !noteDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {noteDate ? format(noteDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={noteDate}
                    onSelect={(date) => date && setNoteDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Accompanied By */}
          <div className="space-y-2">
            <Label>Accompanied By</Label>
            <Input
              value={formData.accompaniedBy}
              onChange={(e) => setFormData(prev => ({ ...prev, accompaniedBy: e.target.value }))}
              placeholder="Parent/Guardian name..."
              className="bg-muted/50"
            />
          </div>

          {/* Consulted For */}
          <div className="space-y-2">
            <Label>Consulted For</Label>
            <Input
              value={formData.consultedFor}
              onChange={(e) => setFormData(prev => ({ ...prev, consultedFor: e.target.value }))}
              placeholder="Reason for consultation..."
              className="bg-muted/50"
            />
          </div>

          {/* Consultation Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Time</Label>
              <Input
                type="time"
                value={formData.fromTime}
                onChange={(e) => setFormData(prev => ({ ...prev, fromTime: e.target.value }))}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>To Time</Label>
              <Input
                type="time"
                value={formData.toTime}
                onChange={(e) => setFormData(prev => ({ ...prev, toTime: e.target.value }))}
                className="bg-muted/50"
              />
            </div>
          </div>

          {/* Returning to Work/School */}
          <div className="space-y-2">
            <Label>Returning to Work/School</Label>
            <Input
              value={formData.returningTo}
              onChange={(e) => setFormData(prev => ({ ...prev, returningTo: e.target.value }))}
              placeholder="e.g., Work, School, University..."
              className="bg-muted/50"
            />
          </div>

          {/* Booked Off Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Booked Off From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/50",
                      !bookedOffFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookedOffFrom ? format(bookedOffFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookedOffFrom}
                    onSelect={(date) => date && setBookedOffFrom(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Booked Off To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/50",
                      !bookedOffTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookedOffTo ? format(bookedOffTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookedOffTo}
                    onSelect={(date) => date && setBookedOffTo(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
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
