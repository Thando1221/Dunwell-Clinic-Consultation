import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  Search, 
  User, 
  Calendar, 
  ChevronDown,
  ChevronUp,
  Stethoscope,
  FileText,
  Heart,
  Pill,
  GraduationCap,
  CalendarCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface Visit {
  visitId: number;
  appointId: number;
  examination: string;
  history: string;
  diagnoses: string;
  treatment: string;
  healthEducation: string;
  followUpPlan: string;
  endTime: string;
  patientName: string;
}

interface Patient {
  id: number;
  name: string;
  surname: string;
  dob: string;
  gender: string;
}

const VisitHistory = () => {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get("patientId");

  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || "");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patients with JWT token
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("dunwell_token"); // must be stored after login
      if (!token) throw new Error("No token found. Please login.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch patients");

      const data = await res.json();
      setPatients(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch visits for selected patient
  const fetchVisits = async (patientId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/visitHistory/${patientId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch visits");

      const data = await res.json();
      setVisits(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to fetch visits");
    }
  };

  useEffect(() => {
    if (selectedPatientId) fetchVisits(selectedPatientId);
    else setVisits([]);
  }, [selectedPatientId]);

  const filteredVisits = visits.filter(
    (v) =>
      v.diagnoses.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.treatment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = patients.find((p) => p.id.toString() === selectedPatientId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">Visit History</h1>
          <p className="text-muted-foreground mt-1">View patient visit records and medical history</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="h-12 bg-card border-border/50">
              <SelectValue placeholder="Select a patient..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name} {p.surname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPatientId && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-card border-border/50"
              />
            </div>
          )}
        </motion.div>

        {selectedPatient && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50 shadow-soft bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPatient.name} {selectedPatient.surname}</h2>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                      <span>DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</span>
                      <span>{selectedPatient.gender === "M" ? "Male" : "Female"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-4">
          {!selectedPatientId ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
                <p className="text-muted-foreground">Choose a patient from the dropdown to view their visit history</p>
              </CardContent>
            </Card>
          ) : filteredVisits.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Visits Found</h3>
                <p className="text-muted-foreground">This patient has no recorded visits yet</p>
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <motion.div key={visit.visitId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border/50 shadow-soft overflow-hidden">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedVisit(expandedVisit === visit.visitId ? null : visit.visitId)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-medium">Visit #{visit.visitId}</CardTitle>
                          <p className="text-sm text-muted-foreground">{new Date(visit.endTime).toLocaleDateString()} at {new Date(visit.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        {expandedVisit === visit.visitId ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {expandedVisit === visit.visitId && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <CardContent className="pt-0 pb-6">
                          <div className="grid gap-4 mt-4">
                            <VisitDetailItem icon={<Stethoscope className="h-4 w-4" />} label="Examination" value={visit.examination} />
                            <VisitDetailItem icon={<FileText className="h-4 w-4" />} label="History" value={visit.history} />
                            <VisitDetailItem icon={<Heart className="h-4 w-4" />} label="Diagnoses" value={visit.diagnoses} />
                            <VisitDetailItem icon={<Pill className="h-4 w-4" />} label="Treatment" value={visit.treatment} />
                            <VisitDetailItem icon={<GraduationCap className="h-4 w-4" />} label="Health Education" value={visit.healthEducation} />
                            <VisitDetailItem icon={<CalendarCheck className="h-4 w-4" />} label="Follow-up Plan" value={visit.followUpPlan} />
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const VisitDetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-muted/50 rounded-lg p-4">
    <div className="flex items-center gap-2 text-primary mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

export default VisitHistory;
