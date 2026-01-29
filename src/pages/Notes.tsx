import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Stethoscope, 
  Pill, 
  FileHeart,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SickNoteDialog } from '@/components/notes/SickNoteDialog';
import { PrescriptionDialog } from '@/components/notes/PrescriptionDialog';
import { ReferralDialog } from '@/components/notes/ReferralDialog';
import { MedicalFitnessDialog } from '@/components/notes/MedicalFitnessDialog';
import { toast } from 'sonner';

interface NoteType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface Patient {
  id: string;
  name: string;
  surname: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
}

const noteTypes: NoteType[] = [
  {
    id: 'sick',
    title: 'Sick Note',
    description: 'Issue sick leave certificates for patients',
    icon: FileText,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'prescription',
    title: 'Prescription',
    description: 'Write medication prescriptions',
    icon: Pill,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'referral',
    title: 'Referral Letter',
    description: 'Refer patients to specialists',
    icon: FileHeart,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'fitness',
    title: 'Medical Fitness',
    description: 'Issue medical fitness reports',
    icon: Activity,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
];

const Notes = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Fetch patients from backend
  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const token = localStorage.getItem('dunwell_token'); // JWT token from login
      const res = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data: Patient[] = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">Medical Notes</h1>
          <p className="text-muted-foreground mt-1">
            Issue and manage medical documents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {noteTypes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card
                className="border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary/50"
                onClick={() => setOpenDialog(note.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${note.color}`}>
                        <note.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{note.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {note.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Notes Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent notes issued</p>
                <p className="text-sm mt-1">Click on a note type above to get started</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialogs with patients prop */}
      <SickNoteDialog 
        open={openDialog === 'sick'} 
        onOpenChange={(open) => setOpenDialog(open ? 'sick' : null)} 
        patients={patients}
        loadingPatients={loadingPatients}
      />
      <PrescriptionDialog 
        open={openDialog === 'prescription'} 
        onOpenChange={(open) => setOpenDialog(open ? 'prescription' : null)} 
        patients={patients}
        loadingPatients={loadingPatients}
      />
      <ReferralDialog 
        open={openDialog === 'referral'} 
        onOpenChange={(open) => setOpenDialog(open ? 'referral' : null)} 
        patients={patients}
        loadingPatients={loadingPatients}
      />
      <MedicalFitnessDialog 
        open={openDialog === 'fitness'} 
        onOpenChange={(open) => setOpenDialog(open ? 'fitness' : null)} 
        patients={patients}
        loadingPatients={loadingPatients}
      />
    </DashboardLayout>
  );
};

export default Notes;
