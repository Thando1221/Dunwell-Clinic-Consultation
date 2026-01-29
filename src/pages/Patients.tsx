import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User, Phone, Mail, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

interface Patient {
  id: number;
  name: string;
  surname: string;
  phone: string;
  email: string;
  dob: string;
  gender: "M" | "F";
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ FIXED: correct token key
  const token = localStorage.getItem("dunwell_token");
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPatients = async () => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatients(res.data);
    } catch (error: any) {
      console.error("Failed to fetch patients:", error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
        localStorage.removeItem("dunwell_token");
        localStorage.removeItem("dunwell_user");
        navigate("/login");
      } else {
        toast.error("Failed to fetch patients");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.surname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm) ||
    patient.phone.includes(searchTerm)
  );

  const handlePatientClick = (patient: Patient) => {
    navigate(`/visit-history?patientId=${patient.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Search and manage patient records
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-card border-border/50"
          />
        </motion.div>

        {/* Patient List */}
        <div className="grid gap-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading patients...
            </p>
          ) : filteredPatients.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No patients found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card
                  className="border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
                  onClick={() => handlePatientClick(patient)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {patient.name} {patient.surname}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {patient.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(patient.dob).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{patient.email}</span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            patient.gender === "M"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-pink-500/10 text-pink-600"
                          }`}
                        >
                          {patient.gender === "M" ? "Male" : "Female"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
