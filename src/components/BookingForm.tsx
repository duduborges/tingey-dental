/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LuCalendar,
  LuClock,
  LuUser,
  LuMail,
  LuPhone,
  LuChevronLeft,
  LuChevronRight,
  LuCheck,
  LuLoader,
  LuNotepadText,
  LuStethoscope,
} from "react-icons/lu";

interface Service {
  id: string;
  name: string;
}

interface BookingFormProps {
  clinicPhone: string;
}

export default function BookingForm({ clinicPhone }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ---- Calendar state ---- */
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  /* ---- Form state ---- */
  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    service_id: "",
    notes: "",
  });

  /* ---- Fetch services on mount ---- */
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(d.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  /* ---- Fetch slots when date changes ---- */
  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSelectedTime("");
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  /* ---- Calendar helpers ---- */
  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isWeekend = (day: number) => {
    const d = new Date(currentYear, currentMonth, day).getDay();
    return d === 0 || d === 6;
  };

  const formatDateStr = (day: number) => {
    const m = (currentMonth + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const isSelected = (day: number) => selectedDate === formatDateStr(day);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* ---- Submit ---- */
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Success screen ---- */
  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <LuCheck className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
          Appointment Requested!
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-2">
          Thank you, {form.patient_name}. We&apos;ve received your request for{" "}
          <span className="font-semibold">{selectedDate}</span> at{" "}
          <span className="font-semibold">{selectedTime}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          You&apos;ll receive a confirmation email shortly. If you have questions,
          call us at{" "}
          <a href={`tel:${clinicPhone.replace(/\D/g, "")}`} className="text-primary font-semibold">
            {clinicPhone}
          </a>
          .
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setSelectedDate("");
            setSelectedTime("");
            setForm({ patient_name: "", patient_email: "", patient_phone: "", service_id: "", notes: "" });
          }}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  return (
    <div className="max-w-4xl mx-auto">
      {/* ---- Step indicators ---- */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step === s
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : step > s
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s ? <LuCheck className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 sm:w-24 h-1 mx-1 rounded transition-all duration-300 ${
                  step > s ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          {step === 1 ? "Step 1 of 3 - Choose Date & Time" : step === 2 ? "Step 2 of 3 - Select Service" : "Step 3 of 3 - Your Information"}
        </p>
      </div>

      {/* ---- Step 1: Calendar & Time ---- */}
      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
                <LuChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <LuCalendar className="w-4 h-4 text-primary" />
                {monthNames[currentMonth]} {currentYear}
              </h4>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
                <LuChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isPast(day) || isWeekend(day);
                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => setSelectedDate(formatDateStr(day))}
                    className={`p-2 text-sm rounded-lg transition-all duration-300 ${
                      isSelected(day)
                        ? "bg-primary text-white font-bold shadow-md shadow-primary/30"
                        : isToday(day)
                        ? "bg-primary-50 text-primary font-semibold ring-1 ring-primary/30"
                        : disabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-primary-50 hover:text-primary"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LuClock className="w-4 h-4 text-primary" />
              Available Times
            </h4>

            {!selectedDate ? (
              <div className="text-center py-12">
                <LuCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Select a date to see available times</p>
              </div>
            ) : loadingSlots ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <LuClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No available times for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 px-3 text-sm rounded-lg border transition-all duration-300 ${
                      selectedTime === slot
                        ? "bg-primary text-white border-primary font-semibold shadow-md shadow-primary/30"
                        : "border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Step 2: Service ---- */}
      {step === 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg mx-auto">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LuStethoscope className="w-4 h-4 text-primary" />
            Select a Service (Optional)
          </h4>

          {loadingServices ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setForm({ ...form, service_id: "" })}
                className={`w-full text-left py-3 px-4 rounded-lg border transition-all duration-300 ${
                  form.service_id === ""
                    ? "bg-primary-50 border-primary text-primary font-semibold"
                    : "border-gray-200 text-gray-700 hover:border-primary hover:bg-primary-50"
                }`}
              >
                General Visit / Not Sure
              </button>
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setForm({ ...form, service_id: svc.id })}
                  className={`w-full text-left py-3 px-4 rounded-lg border transition-all duration-300 ${
                    form.service_id === svc.id
                      ? "bg-primary-50 border-primary text-primary font-semibold"
                      : "border-gray-200 text-gray-700 hover:border-primary hover:bg-primary-50"
                  }`}
                >
                  {svc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Step 3: Patient Info ---- */}
      {step === 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg mx-auto">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LuUser className="w-4 h-4 text-primary" />
            Your Information
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.patient_email}
                  onChange={(e) => setForm({ ...form, patient_email: e.target.value })}
                  placeholder="john@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <div className="relative">
                <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.patient_phone}
                  onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                  placeholder="(208) 555-0123"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <div className="relative">
                <LuNotepadText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special concerns or requests..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-primary-50 rounded-lg p-4 mt-2">
              <p className="text-sm font-medium text-primary mb-2">Appointment Summary</p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Date:</span> {selectedDate}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Time:</span> {selectedTime}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* ---- Navigation buttons ---- */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
          >
            <LuChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={(step === 1 && (!selectedDate || !selectedTime))}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            Continue
            <LuChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.patient_name || !form.patient_email || !form.patient_phone}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <>
                <LuLoader className="w-4 h-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <LuCheck className="w-4 h-4" />
                Confirm Appointment
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
