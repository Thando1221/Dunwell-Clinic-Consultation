import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface Appointment {
  AppointID: number;
  PatientID: number;
  PatientName: string;
  PatientSurname: string;
  StartTime: string;
  Status: string;
  ServiceName?: string;
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
  const [submitting, setSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [loadingVisit, setLoadingVisit] = useState(false);
  const [formData, setFormData] = useState({
    examination: "",
    history: "",
    diagnoses: "",
    treatment: "",
    healthEducation: "",
    followUpPlan: "",
  });

  const fetchTodayBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/attendBooking/today`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTodayBookings(
        data.map((b: any) => ({
          ...b,
          patientName: `${b.PatientName || ""} ${b.PatientSurname || ""}`.trim() || "Unknown Patient",
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

  useEffect(() => {
    if (!selectedBooking) return;

    const fetchVisit = async () => {
      setLoadingVisit(true);
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
            followUpPlan: visit.FollowUp_Plan ? new Date(visit.FollowUp_Plan).toISOString().slice(0, 16) : "",
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
        setFormData({
          examination: "",
          history: "",
          diagnoses: "",
          treatment: "",
          healthEducation: "",
          followUpPlan: "",
        });
      } finally {
        setLoadingVisit(false);
      }
    };

    fetchVisit();
  }, [selectedBooking]);

  const handleSelectBooking = (booking: Appointment) => setSelectedBooking(booking);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return toast.error("Please select a booking first");

    if (!formData.examination && !formData.history && !formData.diagnoses && !formData.treatment) {
      return toast.error("Please fill in at least one field before saving");
    }

    setSubmitting(true);

    const followUpPlanISO = formData.followUpPlan
      ? new Date(formData.followUpPlan).toISOString()
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
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Visit recorded successfully!</span>
            <span className="text-sm opacity-80">
              Follow-up scheduled for {new Date(followUpPlanISO!).toLocaleDateString()} at{" "}
              {new Date(followUpPlanISO!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      } else {
        toast.success(`Visit recorded for ${selectedBooking.patientName}`);
      }

      setTodayBookings(todayBookings.filter((b) => b.id !== selectedBooking.id));

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
      toast.error("Failed to record visit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getMinFollowUpDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Attend Booking
            </h1>
            <p className="text-muted-foreground mt-1">Record patient visit information and schedule follow-ups</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchTodayBookings}
            disabled={loading}
            className="gap-2 self-start"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            <Card className="border-border/50 shadow-lg h-full overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Bookings
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {todayBookings.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                  <div className="p-4 space-y-2">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                        <p>Loading bookings...</p>
                      </div>
                    ) : todayBookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-16 w-16 mb-4 text-success/50" />
                        <p className="font-medium">All caught up!</p>
                        <p className="text-sm">No pending bookings for today</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {todayBookings.map((booking, index) => (
                          <motion.button
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSelectBooking(booking)}
                            className={`w-full p-4 rounded-xl text-left transition-all duration-300 group ${
                              selectedBooking?.id === booking.id
                                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                                : "bg-muted/30 hover:bg-muted/60 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                  selectedBooking?.id === booking.id 
                                    ? "bg-primary-foreground/20" 
                                    : "bg-primary/10 group-hover:bg-primary/20"
                                }`}
                              >
                                <User className={`h-6 w-6 ${selectedBooking?.id === booking.id ? "" : "text-primary"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate text-base">{booking.patientName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`flex items-center gap-1 text-sm ${selectedBooking?.id === booking.id ? "opacity-80" : "text-muted-foreground"}`}>
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                      {new Date(booking.StartTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {booking.ServiceName && (
                                    <>
                                      <span className="text-muted-foreground/50">|</span>
                                      <span className={`text-xs truncate ${selectedBooking?.id === booking.id ? "opacity-80" : "text-muted-foreground"}`}>
                                        {booking.ServiceName}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${
                                selectedBooking?.id === booking.id ? "rotate-90" : "opacity-50 group-hover:opacity-100"
                              }`} />
                            </div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <Card className="border-border/50 shadow-lg h-full">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  {selectedBooking
                    ? `Visit Record - ${selectedBooking.patientName}`
                    : "Select a Patient"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {!selectedBooking ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                        <Calendar className="h-20 w-20 text-muted-foreground/50 relative" />
                      </div>
                      <p className="text-muted-foreground mt-6 text-center max-w-sm">
                        Select a patient from the list to record their visit information
                      </p>
                    </motion.div>
                  ) : loadingVisit ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16"
                    >
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading visit data...</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          icon={<Stethoscope className="h-4 w-4" />}
                          label="Examination"
                          value={formData.examination}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, examination: value }))
                          }
                          placeholder="BP, temperature, heart rate, weight..."
                        />

                        <FormField
                          icon={<FileText className="h-4 w-4" />}
                          label="History"
                          value={formData.history}
                          onChange={(value) => setFormData((prev) => ({ ...prev, history: value }))}
                          placeholder="Medical history and chief complaints..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          icon={<Heart className="h-4 w-4" />}
                          label="Diagnoses"
                          value={formData.diagnoses}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, diagnoses: value }))
                          }
                          placeholder="Clinical diagnosis and findings..."
                        />

                        <FormField
                          icon={<Pill className="h-4 w-4" />}
                          label="Treatment"
                          value={formData.treatment}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, treatment: value }))
                          }
                          placeholder="Medications and procedures..."
                        />
                      </div>

                      <FormField
                        icon={<GraduationCap className="h-4 w-4" />}
                        label="Health Education"
                        value={formData.healthEducation}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, healthEducation: value }))
                        }
                        placeholder="Lifestyle advice, diet recommendations, exercise..."
                      />

                      <Separator className="my-6" />

                      <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                        <Label className="flex items-center gap-2 text-foreground font-semibold mb-3">
                          <CalendarCheck className="h-5 w-5 text-primary" />
                          Schedule Follow-up Appointment
                        </Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          If this patient needs a follow-up visit, select the date and time below.
                          A new appointment will be automatically created.
                        </p>
                        <input
                          type="datetime-local"
                          value={formData.followUpPlan}
                          min={getMinFollowUpDate()}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, followUpPlan: e.target.value }))
                          }
                          className="w-full max-w-xs p-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        {formData.followUpPlan && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 text-sm text-success flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Follow-up will be scheduled for{" "}
                            {new Date(formData.followUpPlan).toLocaleDateString()} at{" "}
                            {new Date(formData.followUpPlan).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </motion.p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(null);
                            setFormData({
                              examination: "",
                              history: "",
                              diagnoses: "",
                              treatment: "",
                              healthEducation: "",
                              followUpPlan: "",
                            });
                          }}
                          className="flex-1 h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="flex-[2] h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              Record Visit Information
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
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
    <Label className="flex items-center gap-2 text-foreground font-medium">
      <span className="text-primary">{icon}</span>
      {label}
    </Label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[100px] bg-muted/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
    />
  </div>
);

export default AttendBooking;
