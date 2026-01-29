import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  Heart,
  Pill,
  GraduationCap,
  CalendarCheck,
  Save,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface Appointment {
  AppointID: number;
  PatientID: number;
  PatientName: string;
  PatientSurname: string;
  StartTime: string;
  Status: string;
  patientName: string;
  id: number;
  [key: string]: any;
}

interface VisitData {
  Examination: string;
  History: string;
  Diagnoses: string;
  Treatment: string;
  Health_Education: string;
  FollowUp_Plan: string;
}

const AttendBooking = () => {
  const [todayBookings, setTodayBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    examination: "",
    history: "",
    diagnoses: "",
    treatment: "",
    healthEducation: "",
    followUpPlan: "",
  });

  // Fetch today's bookings
  const fetchTodayBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/attendBooking/today`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTodayBookings(
        data.map((b: any) => ({
          ...b,
          patientName: `${b.PatientName} ${b.PatientSurname}`,
          id: b.AppointID,
        }))
      );
    } catch {
      toast.error("Failed to fetch today's bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayBookings();
  }, []);

  // Fetch visit info when booking selected
  useEffect(() => {
    if (!selectedBooking) return;

    const fetchVisit = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/attendBooking/${selectedBooking.id}/visit`
        );
        if (!res.ok) throw new Error("Failed to fetch visit");
        const visit: VisitData | null = await res.json();
        if (visit) {
          setFormData({
            examination: visit.Examination || "",
            history: visit.History || "",
            diagnoses: visit.Diagnoses || "",
            treatment: visit.Treatment || "",
            healthEducation: visit.Health_Education || "",
            followUpPlan: visit.FollowUp_Plan || "",
          });
        } else {
          setFormData({
            examination: "",
            history: "",
            diagnoses: "",
            treatment: "",
            healthEducation: "",
            followUpPlan: "",
          });
        }
      } catch {
        toast.error("Failed to fetch visit data");
      }
    };

    fetchVisit();
  }, [selectedBooking]);

  const handleSelectBooking = (booking: Appointment) => setSelectedBooking(booking);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return toast.error("Please select a booking first");

    // Convert follow-up datetime-local to ISO string for backend
    const followUpPlanISO = formData.followUpPlan
      ? new Date(formData.followUpPlan + ":00").toISOString()
      : null;

    const payload = {
      appointID: selectedBooking.id,
      examination: formData.examination,
      history: formData.history,
      diagnoses: formData.diagnoses,
      treatment: formData.treatment,
      healthEducation: formData.healthEducation,
      followUpPlan: followUpPlanISO,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/attendBooking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to record visit");

      if (formData.followUpPlan) {
        toast.success(
          `Visit recorded for ${selectedBooking.patientName}. Follow-up scheduled for ${new Date(
            followUpPlanISO!
          ).toLocaleString()}.`
        );
      } else {
        toast.success(`Visit recorded for ${selectedBooking.patientName}`);
      }

      // Remove attended booking from list
      setTodayBookings(todayBookings.filter((b) => b.id !== selectedBooking.id));

      // Reset form
      setSelectedBooking(null);
      setFormData({
        examination: "",
        history: "",
        diagnoses: "",
        treatment: "",
        healthEducation: "",
        followUpPlan: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to record visit");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">Attend Booking</h1>
          <p className="text-muted-foreground mt-1">Record patient visit information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : todayBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bookings to attend</p>
                ) : (
                  todayBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => handleSelectBooking(booking)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        selectedBooking?.id === booking.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            selectedBooking?.id === booking.id ? "bg-primary-foreground/20" : "bg-background"
                          }`}
                        >
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{booking.patientName}</p>
                          <div className="flex items-center gap-2 text-sm opacity-80">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(booking.StartTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                selectedBooking?.id === booking.id
                                  ? "bg-primary-foreground/20"
                                  : booking.Status === "InPatient"
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {booking.Status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Visit Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  {selectedBooking
                    ? `Recording Visit for ${selectedBooking.patientName}`
                    : "Select a Booking"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedBooking ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select a booking from the list to record visit information
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField
                      icon={<Stethoscope className="h-4 w-4" />}
                      label="Examination"
                      value={formData.examination}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, examination: value }))
                      }
                      placeholder="Blood pressure, temperature, heart rate..."
                    />

                    <FormField
                      icon={<FileText className="h-4 w-4" />}
                      label="History"
                      value={formData.history}
                      onChange={(value) => setFormData((prev) => ({ ...prev, history: value }))}
                      placeholder="Patient medical history and complaints..."
                    />

                    <FormField
                      icon={<Heart className="h-4 w-4" />}
                      label="Diagnoses"
                      value={formData.diagnoses}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, diagnoses: value }))
                      }
                      placeholder="Clinical diagnosis..."
                    />

                    <FormField
                      icon={<Pill className="h-4 w-4" />}
                      label="Treatment"
                      value={formData.treatment}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, treatment: value }))
                      }
                      placeholder="Prescribed treatment and medications..."
                    />

                    <FormField
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Health Education"
                      value={formData.healthEducation}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, healthEducation: value }))
                      }
                      placeholder="Patient education and advice..."
                    />

                    {/* Follow-up Plan datetime picker */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-foreground">
                        <span className="text-primary">
                          <CalendarCheck className="h-4 w-4" />
                        </span>
                        Follow-up Plan
                      </Label>
                      <input
                        type="datetime-local"
                        value={formData.followUpPlan}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, followUpPlan: e.target.value }))
                        }
                        className="w-full p-2 bg-muted/50 border border-border/50 rounded focus:border-primary"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 gradient-teal text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Record Visit Information
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const FormField = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-foreground">
      <span className="text-primary">{icon}</span>
      {label}
    </Label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[80px] bg-muted/50 border-border/50 focus:border-primary resize-none"
    />
  </div>
);

export default AttendBooking;
