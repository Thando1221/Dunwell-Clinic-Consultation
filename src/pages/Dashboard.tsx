import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

interface Appointment {
  AppointID: number;
  PatientID: number;
  PatientName: string;
  StartTime: string;
  EndTime: string;
  Status: string;
  ServiceName: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  delay 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  color: 'primary' | 'success' | 'warning' | 'destructive';
  delay: number;
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-border/50 shadow-soft hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-3xl font-display font-bold mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [inPatientCount, setInPatientCount] = useState(0);
  const [outPatientCount, setOutPatientCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("dunwell_token");
        if (!token) return; // No token, skip

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Backend now sends correct keys
        setTodayAppointments(res.data.todayAppointments || []);
        setInPatientCount(res.data.inPatient || 0);
        setOutPatientCount(res.data.outPatient || 0);
        setPendingCount(res.data.pending || 0);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setTodayAppointments([]);
        setInPatientCount(0);
        setOutPatientCount(0);
        setPendingCount(0);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-display font-bold">
            {greeting}, {user?.fullName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at the clinic today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Appointments"
            value={todayAppointments.length}
            icon={Calendar}
            color="primary"
            delay={0.1}
          />
          <StatCard
            title="In-Patient"
            value={inPatientCount}
            icon={UserCheck}
            color="success"
            delay={0.2}
          />
          <StatCard
            title="Out-Patient"
            value={outPatientCount}
            icon={UserX}
            color="warning"
            delay={0.3}
          />
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            color="destructive"
            delay={0.4}
          />
        </div>

        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card className="border-border/50 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Activity className="h-5 w-5 text-primary" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No appointments scheduled for today
                  </p>
                ) : (
                  todayAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.AppointID}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.PatientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.ServiceName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(appointment.StartTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.Status === "InPatient"
                              ? "bg-success/10 text-success"
                              : appointment.Status === "OutPatient"
                              ? "bg-warning/10 text-warning"
                              : appointment.Status === "Completed"
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {appointment.Status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="border-border/50 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-display font-bold">
                    {todayAppointments.length > 0
                      ? Math.round(
                          (todayAppointments.filter(a => a.Status === "Completed").length /
                            todayAppointments.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Time</p>
                  <p className="text-2xl font-display font-bold">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
