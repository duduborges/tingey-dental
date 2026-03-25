/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LuCalendar,
  LuClock,
  LuUser,
  LuMail,
  LuPhone,
  LuCheck,
  LuX,
  LuLoader,
  LuSettings,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuShieldCheck,
  LuLock,
  LuBell,
  LuCircleAlert,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";

/* ================================================================
   TYPES
   ================================================================ */
interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  services?: { name: string } | null;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ScheduleConfig {
  startHour: number;
  endHour: number;
  slotDuration: number;
  workingDays: number[];
  fridayByAppointment: boolean;
}

/* ================================================================
   HELPER: AVATAR COLORS
   ================================================================ */
const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
  "bg-amber-500", "bg-cyan-500", "bg-red-500", "bg-indigo-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/* ================================================================
   ADMIN PAGE
   ================================================================ */
export default function AdminPage() {
  /* ---- Auth state ---- */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");

  /* ---- Dashboard state ---- */
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ---- Settings state ---- */
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"account" | "schedule" | "insurance">("account");
  const [settingsLoading, setSettingsLoading] = useState(false);

  /* Account settings */
  const [settingsNotifEmail, setSettingsNotifEmail] = useState("");
  const [settingsNewPassword, setSettingsNewPassword] = useState("");

  /* Schedule settings */
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    startHour: 8, endHour: 17, slotDuration: 30,
    workingDays: [1, 2, 3, 4], fridayByAppointment: true,
  });

  /* Insurance settings */
  const [insurancePlans, setInsurancePlans] = useState<{ id: string; name: string; active: boolean }[]>([]);

  /* ---- Toast system ---- */
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  /* ---- Check session on mount ---- */
  useEffect(() => {
    const session = sessionStorage.getItem("tingey_admin");
    if (session) {
      try {
        const data = JSON.parse(session);
        setIsLoggedIn(true);
        setAdminEmail(data.email || "");
        setNotificationEmail(data.notification_email || "");
        setSettingsNotifEmail(data.notification_email || "");
      } catch {
        sessionStorage.removeItem("tingey_admin");
      }
    }
  }, []);

  /* ---- Login ---- */
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return;
      }
      sessionStorage.setItem("tingey_admin", JSON.stringify(data.admin));
      setIsLoggedIn(true);
      setAdminEmail(data.admin.email);
      setNotificationEmail(data.admin.notification_email || "");
      setSettingsNotifEmail(data.admin.notification_email || "");
    } catch {
      setLoginError("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  /* ---- Logout ---- */
  const handleLogout = () => {
    sessionStorage.removeItem("tingey_admin");
    setIsLoggedIn(false);
    setLoginEmail("");
    setLoginPassword("");
    setAppointments([]);
  };

  /* ---- Date helpers ---- */
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const getDateRange = useCallback(() => {
    const d = new Date(currentDate);
    if (viewMode === "day") {
      return { from: formatDate(d), to: formatDate(d) };
    } else if (viewMode === "week") {
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: formatDate(start), to: formatDate(end) };
    } else {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { from: formatDate(start), to: formatDate(end) };
    }
  }, [currentDate, viewMode]);

  /* ---- Fetch appointments ---- */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { from, to } = getDateRange();
    try {
      const params = new URLSearchParams({ dateFrom: from, dateTo: to });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/appointments?${params}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      addToast("Failed to fetch appointments", "error");
    } finally {
      setLoading(false);
    }
  }, [getDateRange, statusFilter, addToast]);

  useEffect(() => {
    if (isLoggedIn) fetchAppointments();
  }, [isLoggedIn, fetchAppointments]);

  /* ---- Navigate dates ---- */
  const navigateDate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "day") d.setDate(d.getDate() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  /* ---- Update appointment status ---- */
  const updateStatus = async (id: string, status: string, apt: Appointment) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();

      /* Send notification email */
      const emailSubject = status === "confirmed"
        ? "Appointment Confirmed - Tingey Dental"
        : "Appointment Cancelled - Tingey Dental";
      const emailBody = status === "confirmed"
        ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#0033FF;padding:20px;border-radius:8px 8px 0 0;">
              <h1 style="color:white;margin:0;font-size:24px;">Tingey Dental</h1>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
              <h2 style="color:#1a1a2e;margin-top:0;">Your Appointment is Confirmed</h2>
              <p>Dear ${apt.patient_name},</p>
              <p>Your appointment has been confirmed:</p>
              <div style="background:#EEF2FF;padding:16px;border-radius:8px;margin:16px 0;">
                <p style="margin:4px 0;"><strong>Date:</strong> ${apt.appointment_date}</p>
                <p style="margin:4px 0;"><strong>Time:</strong> ${apt.appointment_time}</p>
              </div>
              <p>We look forward to seeing you! If you need to reschedule, call <a href="tel:+12087344111" style="color:#0033FF;">(208) 734-4111</a>.</p>
              <p style="color:#6b7280;font-size:14px;margin-top:24px;">568 Falls Ave, Twin Falls, ID 83301</p>
            </div>
          </div>`
        : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#0033FF;padding:20px;border-radius:8px 8px 0 0;">
              <h1 style="color:white;margin:0;font-size:24px;">Tingey Dental</h1>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
              <h2 style="color:#1a1a2e;margin-top:0;">Appointment Cancelled</h2>
              <p>Dear ${apt.patient_name},</p>
              <p>Your appointment on <strong>${apt.appointment_date}</strong> at <strong>${apt.appointment_time}</strong> has been cancelled.</p>
              <p>To reschedule, please call us at <a href="tel:+12087344111" style="color:#0033FF;">(208) 734-4111</a> or book online.</p>
              <p style="color:#6b7280;font-size:14px;margin-top:24px;">568 Falls Ave, Twin Falls, ID 83301</p>
            </div>
          </div>`;

      try {
        await fetch("/api/admin/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: apt.patient_email,
            subject: emailSubject,
            html: emailBody,
          }),
        });
      } catch {
        /* email failure is non-blocking */
      }

      addToast(
        status === "confirmed" ? "Appointment confirmed & patient notified" : "Appointment cancelled & patient notified",
        "success"
      );
      fetchAppointments();
    } catch {
      addToast("Failed to update appointment", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Save settings ---- */
  const saveAccountSettings = async () => {
    setSettingsLoading(true);
    try {
      const body: Record<string, string> = {};
      if (settingsNotifEmail !== notificationEmail) body.notification_email = settingsNotifEmail;
      if (settingsNewPassword) body.new_password = settingsNewPassword;

      if (Object.keys(body).length === 0) {
        addToast("No changes to save", "error");
        setSettingsLoading(false);
        return;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (body.notification_email) {
        setNotificationEmail(body.notification_email);
        const session = JSON.parse(sessionStorage.getItem("tingey_admin") || "{}");
        session.notification_email = body.notification_email;
        sessionStorage.setItem("tingey_admin", JSON.stringify(session));
      }

      setSettingsNewPassword("");
      addToast("Settings saved successfully", "success");
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveScheduleSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error();
      addToast("Schedule updated successfully", "success");
    } catch {
      addToast("Failed to update schedule", "error");
    } finally {
      setSettingsLoading(false);
    }
  };

  /* ---- Load schedule & insurance on settings open ---- */
  useEffect(() => {
    if (showSettings && settingsTab === "schedule") {
      fetch("/api/admin/schedule")
        .then((r) => r.json())
        .then((d) => { if (d.schedule) setSchedule(d.schedule); })
        .catch(() => {});
    }
    if (showSettings && settingsTab === "insurance") {
      fetch("/api/insurance")
        .then((r) => r.json())
        .then((d) => setInsurancePlans(d.plans || []))
        .catch(() => {});
    }
  }, [showSettings, settingsTab]);

  /* ---- KPI counts ---- */
  const allAppointments = appointments;
  const counts = {
    total: allAppointments.length,
    pending: allAppointments.filter((a) => a.status === "pending").length,
    confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
    cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
  };

  const filteredAppointments = statusFilter === "all"
    ? allAppointments
    : allAppointments.filter((a) => a.status === statusFilter);

  /* ---- Date display ---- */
  const dateDisplay = () => {
    const d = currentDate;
    if (viewMode === "day") {
      return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } else if (viewMode === "week") {
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    }
  };

  /* ================================================================
     LOGIN SCREEN
     ================================================================ */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/images/logo.webp" alt="Tingey Dental" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your appointments</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="admin@clinic.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <LuCircleAlert className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loginLoading || !loginEmail || !loginPassword}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================
     DASHBOARD
     ================================================================ */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---- Toast notifications ---- */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-[slideIn_0.3s_ease-out] ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? <LuCheck className="w-4 h-4" /> : <LuCircleAlert className="w-4 h-4" />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* ---- Header ---- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/images/logo.webp" alt="Tingey Dental" className="h-8" />
              <span className="text-sm text-gray-500 hidden sm:block">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">{adminEmail}</span>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-300"
              >
                <LuSettings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                <LuLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ---- Notification email banner ---- */}
        {!notificationEmail && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <LuBell className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-medium">Set up email notifications</p>
              <p className="text-amber-600 text-xs">Add a notification email in Settings to receive alerts for new appointments.</p>
            </div>
            <button
              onClick={() => { setShowSettings(true); setSettingsTab("account"); }}
              className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all duration-300"
            >
              Setup
            </button>
          </div>
        )}

        {/* ---- KPI Cards ---- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: counts.total, color: "bg-blue-50 text-blue-700", icon: <LuCalendar className="w-5 h-5" /> },
            { label: "Pending", value: counts.pending, color: "bg-amber-50 text-amber-700", icon: <LuClock className="w-5 h-5" /> },
            { label: "Confirmed", value: counts.confirmed, color: "bg-green-50 text-green-700", icon: <LuCheck className="w-5 h-5" /> },
            { label: "Cancelled", value: counts.cancelled, color: "bg-red-50 text-red-700", icon: <LuX className="w-5 h-5" /> },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
                {kpi.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* ---- Controls Line 1: View toggle + date navigation ---- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewMode === mode ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
              <LuChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">{dateDisplay()}</span>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
              <LuChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-medium text-primary bg-primary-50 rounded-lg hover:bg-primary/10 transition-all duration-300"
            >
              Today
            </button>
          </div>
        </div>

        {/* ---- Controls Line 2: Status filters ---- */}
        <div className="flex items-center gap-2 mb-6 pb-6 border-t border-gray-200 pt-4">
          {[
            { key: "all", label: "All", count: counts.total },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "confirmed", label: "Confirmed", count: counts.confirmed },
            { key: "cancelled", label: "Cancelled", count: counts.cancelled },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                statusFilter === f.key
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === f.key ? "bg-white/20" : "bg-gray-100"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* ---- Appointments list ---- */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <LuCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No appointments found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 ${getAvatarColor(apt.patient_name)} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {apt.patient_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{apt.patient_name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        apt.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : apt.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <LuCalendar className="w-3.5 h-3.5" />
                        {apt.appointment_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <LuClock className="w-3.5 h-3.5" />
                        {apt.appointment_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <LuPhone className="w-3.5 h-3.5" />
                        {apt.patient_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <LuMail className="w-3.5 h-3.5" />
                        {apt.patient_email}
                      </span>
                    </div>
                    {apt.services?.name && (
                      <p className="text-xs text-primary mt-1 font-medium">{apt.services.name}</p>
                    )}
                    {apt.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">Note: {apt.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {apt.status === "pending" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateStatus(apt.id, "confirmed", apt)}
                        disabled={actionLoading === apt.id}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading === apt.id ? (
                          <LuLoader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LuCheck className="w-3.5 h-3.5" />
                        )}
                        Confirm & Notify
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, "cancelled", apt)}
                        disabled={actionLoading === apt.id}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <LuX className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================================================================
          SETTINGS MODAL
          ================================================================ */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] flex items-center gap-2">
                <LuSettings className="w-5 h-5 text-primary" />
                Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
                <LuX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {([
                { key: "account", label: "Account", icon: <LuUser className="w-4 h-4" /> },
                { key: "schedule", label: "Schedule", icon: <LuClock className="w-4 h-4" /> },
                { key: "insurance", label: "Insurance", icon: <LuShieldCheck className="w-4 h-4" /> },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                    settingsTab === tab.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* Account tab */}
              {settingsTab === "account" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
                    <div className="relative">
                      <LuBell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={settingsNotifEmail}
                        onChange={(e) => setSettingsNotifEmail(e.target.value)}
                        placeholder="notifications@clinic.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Receive alerts when new appointments are booked.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                    <div className="relative">
                      <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={settingsNewPassword}
                        onChange={(e) => setSettingsNewPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveAccountSettings}
                    disabled={settingsLoading}
                    className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {settingsLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    Save Account Settings
                  </button>
                </div>
              )}

              {/* Schedule tab */}
              {settingsTab === "schedule" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Hour</label>
                      <select
                        value={schedule.startHour}
                        onChange={(e) => setSchedule({ ...schedule, startHour: parseInt(e.target.value) })}
                        className="w-full py-3 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 6).map((h) => (
                          <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Hour</label>
                      <select
                        value={schedule.endHour}
                        onChange={(e) => setSchedule({ ...schedule, endHour: parseInt(e.target.value) })}
                        className="w-full py-3 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 12).map((h) => (
                          <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                    <select
                      value={schedule.slotDuration}
                      onChange={(e) => setSchedule({ ...schedule, slotDuration: parseInt(e.target.value) })}
                      className="w-full py-3 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                        <button
                          key={day}
                          onClick={() => {
                            const days = schedule.workingDays.includes(i)
                              ? schedule.workingDays.filter((d) => d !== i)
                              : [...schedule.workingDays, i];
                            setSchedule({ ...schedule, workingDays: days });
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            schedule.workingDays.includes(i)
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveScheduleSettings}
                    disabled={settingsLoading}
                    className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {settingsLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    Save Schedule
                  </button>
                </div>
              )}

              {/* Insurance tab */}
              {settingsTab === "insurance" && (
                <div className="space-y-3">
                  {insurancePlans.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No insurance plans configured yet.</p>
                  ) : (
                    insurancePlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-700 font-medium">{plan.name}</span>
                        <button
                          onClick={async () => {
                            await fetch("/api/insurance", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: plan.id, active: !plan.active }),
                            });
                            setInsurancePlans((prev) =>
                              prev.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p))
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            plan.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {plan.active ? "Active" : "Inactive"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
