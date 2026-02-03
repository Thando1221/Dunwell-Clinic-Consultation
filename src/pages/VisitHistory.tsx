import { useState, useEffect } from "react";
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
  CalendarCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

/* =======================
   Interfaces
   ======================= */

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

/* =======================
   Component
   ======================= */

const VisitHistory = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState("");

  /* =======================
     Fetch Patients
     ======================= */

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("dunwell_token");
      if (!token) throw new Error("No token found. Please login.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  /* =======================
     Fetch Visits
     ======================= */

  const fetchVisits = async (patientId: string) => {
    try {
      const token = localStorage.getItem("dunwell_token");
      if (!token) throw new Error("No token found. Please login.");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/visitHistory/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  /* =======================
     Filters
     ======================= */

  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.surname}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  const selectedPatient = patients.find(
    (p) => p.id.toString() === selectedPatientId
  );

  /* =======================
     UI
     ======================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">Visit History</h1>
          <p className="text-muted-foreground mt-1">
            Search and select a patient to view visit history
          </p>
        </motion.div>

        {/* =======================
           Patient Search
           ======================= */}
        <div className="space-y-2 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search patient by name or surname..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="pl-12 h-12 bg-card border-border/50"
            />
          </div>

          {patientSearch && (
            <Card className="border-border/50 max-h-64 overflow-y-auto">
              <CardContent className="p-2 space-y-1">
                {filteredPatients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No patients found
                  </p>
                ) : (
                  filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id.toString());
                        setPatientSearch(`${p.name} ${p.surname}`);
                      }}
                      className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition"
                    >
                      <p className="font-medium">
                        {p.name} {p.surname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        DOB: {new Date(p.dob).toLocaleDateString()} •{" "}
                        {p.gender === "M" ? "Male" : "Female"}
                      </p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* =======================
           Selected Patient Card
           ======================= */}
        {selectedPatient && (
          <Card className="border-border/50 shadow-soft bg-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedPatient.name} {selectedPatient.surname}
                </h2>
                <p className="text-sm text-muted-foreground">
                  DOB: {new Date(selectedPatient.dob).toLocaleDateString()} •{" "}
                  {selectedPatient.gender === "M" ? "Male" : "Female"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =======================
           Visits
           ======================= */}
        {!selectedPatientId ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Search and select a patient to view visits
              </p>
            </CardContent>
          </Card>
        ) : visits.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                This patient has no recorded visits
              </p>
            </CardContent>
          </Card>
        ) : (
          visits.map((visit) => (
            <motion.div
              key={visit.visitId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setExpandedVisit(
                      expandedVisit === visit.visitId ? null : visit.visitId
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">
                        Visit #{visit.visitId}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(visit.endTime).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      {expandedVisit === visit.visitId ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {expandedVisit === visit.visitId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <CardContent className="space-y-3">
                        <VisitDetail label="Examination" value={visit.examination} />
                        <VisitDetail label="History" value={visit.history} />
                        <VisitDetail label="Diagnoses" value={visit.diagnoses} />
                        <VisitDetail label="Treatment" value={visit.treatment} />
                        <VisitDetail
                          label="Health Education"
                          value={visit.healthEducation}
                        />
                        <VisitDetail
                          label="Follow-up Plan"
                          value={visit.followUpPlan}
                        />
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

/* =======================
   Visit Detail Item
   ======================= */

const VisitDetail = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="bg-muted/50 rounded-lg p-4">
    <p className="text-sm font-medium text-primary mb-1">{label}</p>
    <p className="text-sm">{value}</p>
  </div>
);

export default VisitHistory;
