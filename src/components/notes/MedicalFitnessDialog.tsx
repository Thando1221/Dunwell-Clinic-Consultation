import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity, Download, Printer, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateMedicalFitnessPDF } from '@/lib/pdfGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



interface MedicalFitnessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  loadingPatients: boolean;
}

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

export const MedicalFitnessDialog = ({
  open,
  onOpenChange,
  patients,
  loadingPatients,
}: MedicalFitnessDialogProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);


 
  const [formData, setFormData] = useState({
    // Personal Details
    patientFullName: '', 
    idNumber: '',
    address: '',
    contactNumber: '',
    gender: '',
    nationality: '',
    // Lifestyle
    exercise: 'No',
    gymMember: 'No',
    alcohol: 'No',
    alcoholQuantity: '',
    smoking: 'No',
    cigarettesPerDay: '',
    drugs: 'No',
    drugsDetail: '',
    // Health History
    familyHistory: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    surgicalHistory: '',
    accidentHistory: '',
    // Vitals (Page 2)
    weight: '',
    height: '',
    bmi: '',
    bloodPressure: '',
    hgt: '',
    temperature: '',
    cholesterol: '',
    ecg: '',
    spo2: '',
    // Examination
    head: '',
    chest: '',
    abdomen: '',
    earNoseThroat: '',
    cardiovascular: '',
    musculoskeletal: '',
    // Assessment
    physicallyFit: true,
  });


const handleGeneratePDF = async () => {
  if (!formData.patientFullName) {
    toast.error('Please enter the patient full name');
    return;
  }

  const [name, ...surnameParts] = formData.patientFullName.split(' ');
  const surname = surnameParts.join(' ') || '';

  // Include DOB and email here
  const patient = {
    name,
    surname,
    dob: formData.dob || '',
    email: formData.email || '',
  };

  const pdf = await generateMedicalFitnessPDF(
    patient,
    {
      name: user?.name || '',
      surname: user?.surname || '',
      sancNumber: user?.sanc_hpcsa || 'N/A',
    },
    formData
  );

  pdf.save(`MedicalFitnessReport_${patient.name}_${patient.surname}.pdf`);
  toast.success('Medical Fitness Report PDF generated successfully');
};

const handlePrint = async () => {
  if (!formData.patientFullName) {
    toast.error('Please enter the patient full name');
    return;
  }

  const [name, ...surnameParts] = formData.patientFullName.split(' ');
  const surname = surnameParts.join(' ') || '';

  const patient = {
    name,
    surname,
    dob: formData.dob || '',
    email: formData.email || '',
  };

  const pdf = await generateMedicalFitnessPDF(
    patient,
    {
      name: user?.name || '',
      surname: user?.surname || '',
      sancNumber: user?.sanc_hpcsa || 'N/A',
    },
    formData
  );

  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};


  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height) / 100; // cm to m
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  const resetForm = () => {
    setCurrentPage(1);
    
    setFormData({
      patientFullName: '',
      idNumber: '',
      address: '',
      contactNumber: '',
      gender: '',
      nationality: '',
      exercise: 'No',
      gymMember: 'No',
      alcohol: 'No',
      alcoholQuantity: '',
      smoking: 'No',
      cigarettesPerDay: '',
      drugs: 'No',
      drugsDetail: '',
      familyHistory: '',
      allergies: '',
      medications: '',
      medicalHistory: '',
      surgicalHistory: '',
      accidentHistory: '',
      weight: '',
      height: '',
      bmi: '',
      bloodPressure: '',
      hgt: '',
      temperature: '',
      cholesterol: '',
      ecg: '',
      spo2: '',
      head: '',
      chest: '',
      abdomen: '',
      earNoseThroat: '',
      cardiovascular: '',
      musculoskeletal: '',
      physicallyFit: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-5 w-5 text-primary" />
            Medical Fitness Report - Page {currentPage} of 2
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {currentPage === 1 && (
            <>
             {/* Enter Patient Full Name */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Enter Patient Full Name</Label>
    <Input
      value={formData.patientFullName}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, patientFullName: e.target.value }))
      }
      placeholder="Enter full name"
      className="bg-background"
    />
  </div>
  <div className="space-y-2">
    <Label>Examining Nurse</Label>
    <Input
      value={`${user?.name} ${user?.surname}`}
      disabled
      className="bg-muted/50"
    />
  </div>
</div>


         {/* Personal Details Section */}
<div className="p-4 bg-muted/30 rounded-lg border">
  <h3 className="font-semibold text-primary mb-4">Patient Personal Details</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>Date of Birth</Label>
      <Input
        type="date"
        value={formData.dob || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
        className="bg-background"
      />
    </div>
    <div className="space-y-2">
      <Label>Email</Label>
      <Input
        type="email"
        value={formData.email || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Enter email"
        className="bg-background"
      />
    </div>
    <div className="space-y-2">
      <Label>ID Number</Label>
      <Input
        value={formData.idNumber}
        onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
        placeholder="Enter ID number"
        className="bg-background"
      />
    </div>
    <div className="space-y-2">
      <Label>Contact Number</Label>
      <Input
        value={formData.contactNumber}
        onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
        placeholder="Enter contact number"
        className="bg-background"
      />
    </div>
    <div className="space-y-2 md:col-span-2">
      <Label>Address</Label>
      <Input
        value={formData.address}
        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        placeholder="Enter full address"
        className="bg-background"
      />
    </div>
    <div className="space-y-2">
      <Label>Gender</Label>
      <RadioGroup
        value={formData.gender}
        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Male" id="male" />
          <Label htmlFor="male">Male</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Female" id="female" />
          <Label htmlFor="female">Female</Label>
        </div>
      </RadioGroup>
    </div>
    <div className="space-y-2">
      <Label>Nationality</Label>
      <Select value={formData.nationality} onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Black">Black</SelectItem>
          <SelectItem value="White">White</SelectItem>
          <SelectItem value="Coloured">Coloured</SelectItem>
          <SelectItem value="Indian">Indian</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>


              {/* Lifestyle & Habits Section */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">Lifestyle & Habits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Do you exercise?</Label>
                    <RadioGroup
                      value={formData.exercise}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, exercise: value }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="exerciseYes" />
                        <Label htmlFor="exerciseYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="exerciseNo" />
                        <Label htmlFor="exerciseNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Gym Member?</Label>
                    <RadioGroup
                      value={formData.gymMember}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gymMember: value }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="gymYes" />
                        <Label htmlFor="gymYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="gymNo" />
                        <Label htmlFor="gymNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Alcohol Use?</Label>
                    <RadioGroup
                      value={formData.alcohol}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, alcohol: value }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="alcoholYes" />
                        <Label htmlFor="alcoholYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="alcoholNo" />
                        <Label htmlFor="alcoholNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {formData.alcohol === 'Yes' && (
                    <div className="space-y-2">
                      <Label>Quantity per day</Label>
                      <Input
                        value={formData.alcoholQuantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, alcoholQuantity: e.target.value }))}
                        placeholder="e.g., 2 glasses"
                        className="bg-background"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Smoker?</Label>
                    <RadioGroup
                      value={formData.smoking}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, smoking: value }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="smokeYes" />
                        <Label htmlFor="smokeYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="smokeNo" />
                        <Label htmlFor="smokeNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {formData.smoking === 'Yes' && (
                    <div className="space-y-2">
                      <Label>Cigarettes per day</Label>
                      <Input
                        value={formData.cigarettesPerDay}
                        onChange={(e) => setFormData(prev => ({ ...prev, cigarettesPerDay: e.target.value }))}
                        placeholder="e.g., 10"
                        className="bg-background"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Recreational Drugs?</Label>
                    <RadioGroup
                      value={formData.drugs}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, drugs: value }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="drugsYes" />
                        <Label htmlFor="drugsYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="drugsNo" />
                        <Label htmlFor="drugsNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {formData.drugs === 'Yes' && (
                    <div className="space-y-2">
                      <Label>Please elaborate</Label>
                      <Input
                        value={formData.drugsDetail}
                        onChange={(e) => setFormData(prev => ({ ...prev, drugsDetail: e.target.value }))}
                        placeholder="Details..."
                        className="bg-background"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Health History Section */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">Health History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Family History</Label>
                    <Textarea
                      value={formData.familyHistory}
                      onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
                      placeholder="Any significant family medical history..."
                      className="bg-background min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <Textarea
                      value={formData.allergies}
                      onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="List any allergies..."
                      className="bg-background min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Current Medications</Label>
                    <Textarea
                      value={formData.medications}
                      onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                      placeholder="List current medications..."
                      className="bg-background min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              {/* History Section */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">History</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Medical History</Label>
                    <Textarea
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      placeholder="Past medical conditions..."
                      className="bg-background min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Surgical History</Label>
                    <Textarea
                      value={formData.surgicalHistory}
                      onChange={(e) => setFormData(prev => ({ ...prev, surgicalHistory: e.target.value }))}
                      placeholder="Past surgeries..."
                      className="bg-background min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accident History</Label>
                    <Textarea
                      value={formData.accidentHistory}
                      onChange={(e) => setFormData(prev => ({ ...prev, accidentHistory: e.target.value }))}
                      placeholder="Past accidents/injuries..."
                      className="bg-background min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setCurrentPage(2)} className="gradient-navy text-white">
                  Next: Vitals & Examination
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {currentPage === 2 && (
            <>
              {/* Measurements and Vitals */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">Measurements and Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      onBlur={calculateBMI}
                      placeholder="e.g., 70"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      onBlur={calculateBMI}
                      placeholder="e.g., 175"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BMI</Label>
                    <Input
                      value={formData.bmi}
                      onChange={(e) => setFormData(prev => ({ ...prev, bmi: e.target.value }))}
                      placeholder="Auto-calculated"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Pressure (BP)</Label>
                    <Input
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      placeholder="e.g., 120/80"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HGT (Glucose)</Label>
                    <Input
                      value={formData.hgt}
                      onChange={(e) => setFormData(prev => ({ ...prev, hgt: e.target.value }))}
                      placeholder="e.g., 5.5"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature (°C)</Label>
                    <Input
                      value={formData.temperature}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="e.g., 36.5"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cholesterol</Label>
                    <Input
                      value={formData.cholesterol}
                      onChange={(e) => setFormData(prev => ({ ...prev, cholesterol: e.target.value }))}
                      placeholder="e.g., Normal"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ECG</Label>
                    <Input
                      value={formData.ecg}
                      onChange={(e) => setFormData(prev => ({ ...prev, ecg: e.target.value }))}
                      placeholder="e.g., Normal sinus rhythm"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SPO2 (%)</Label>
                    <Input
                      value={formData.spo2}
                      onChange={(e) => setFormData(prev => ({ ...prev, spo2: e.target.value }))}
                      placeholder="e.g., 98"
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Examination */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">Examination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Head</Label>
                    <Input
                      value={formData.head}
                      onChange={(e) => setFormData(prev => ({ ...prev, head: e.target.value }))}
                      placeholder="Findings..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chest</Label>
                    <Input
                      value={formData.chest}
                      onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value }))}
                      placeholder="Findings..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Abdomen</Label>
                    <Input
                      value={formData.abdomen}
                      onChange={(e) => setFormData(prev => ({ ...prev, abdomen: e.target.value }))}
                      placeholder="Findings..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ear, Nose, Throat</Label>
                    <Input
                      value={formData.earNoseThroat}
                      onChange={(e) => setFormData(prev => ({ ...prev, earNoseThroat: e.target.value }))}
                      placeholder="Findings..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cardiovascular</Label>
                    <Input
                      value={formData.cardiovascular}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardiovascular: e.target.value }))}
                      placeholder="Findings..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Musculoskeletal</Label>
                    <Input
                      value={formData.musculoskeletal}
                      onChange={(e) => setFormData(prev => ({ ...prev, musculoskeletal: e.target.value }))}
                      placeholder="Findings..."
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">Assessment</h3>
                <RadioGroup
                  value={formData.physicallyFit ? 'fit' : 'unfit'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, physicallyFit: value === 'fit' }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-success/50 bg-success/10">
                    <RadioGroupItem value="fit" id="physFit" />
                    <Label htmlFor="physFit" className="cursor-pointer text-success font-semibold">Physically Fit</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-destructive/50 bg-destructive/10">
                    <RadioGroupItem value="unfit" id="physUnfit" />
                    <Label htmlFor="physUnfit" className="cursor-pointer text-destructive font-semibold">Not Physically Fit</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Nurse Info */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-primary mb-4">Nurse / Doctor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Clinician Name</Label>
                    <Input value={`${user?.name} ${user?.surname}`} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>HPCSA / SANC No</Label>
                    <Input value={user?.sanc_hpcsa || 'N/A'} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input value={new Date().toISOString().split('T')[0]} disabled className="bg-muted/50" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentPage(1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleGeneratePDF} className="flex-1 gradient-navy text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button type="button" variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};