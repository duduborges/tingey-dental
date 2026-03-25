/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  LuPhone,
  LuMapPin,
  LuClock,
  LuStar,
  LuMenu,
  LuX,
  LuChevronRight,
  LuShieldCheck,
  LuSparkles,
  LuHeart,
  LuSmile,
  LuUsers,
  LuAward,
  LuCalendar,
  LuMail,
  LuQuote,
  LuCircleCheck,
  LuStethoscope,
  LuBadgeCheck,
} from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa";
import BookingForm from "@/components/BookingForm";
import InsuranceSection from "@/components/InsuranceSection";

/* ================================================================
   CLINIC DATA (hardcoded from JSON)
   ================================================================ */
const clinic = {
  name: "Tingey Dental",
  address: "568 Falls Ave, Twin Falls, ID 83301",
  phone: "(208) 734-4111",
  email: "tingeydental@hotmail.com",
  specialty: "General & Family Dentistry, Cosmetic Dentistry, Restorative Dentistry",
  dentist: "Dr. Brian J. Tingey, DDS",
  rating: 4.9,
  reviews_count: 37,
  google_maps_url:
    "https://www.google.com/maps/place/Tingey+Brian+J+DDS/@42.5775162,-114.4685359,15z",
  facebook_url: "https://www.facebook.com/tingeydental/",
  hours: {
    Monday: "8:00 AM - 5:00 PM",
    Tuesday: "8:00 AM - 5:00 PM",
    Wednesday: "8:00 AM - 5:00 PM",
    Thursday: "8:00 AM - 5:00 PM",
    Friday: "By appointment only",
    Saturday: "Closed",
    Sunday: "Closed",
  } as Record<string, string>,
  reviews: [
    {
      text: "Friendly staff, clean, and fast service. They have all up to date technology for scanning your teeth. Dr. Tingey is always super friendly and overall a great place to bring your family.",
      reviewer: "Alexis B.",
    },
    {
      text: "Dr. Brian Tingey was the most amazing dentist I've ever had the pleasure of being treated by. Extremely caring and compassionate.",
      reviewer: "Christy T.",
    },
    {
      text: "Dental visits to Brian Tingey's office is always great. Very special staff that care about you a lot.",
      reviewer: "Becky D.",
    },
  ],
  services_categories: [
    {
      title: "Cosmetic Dentistry",
      desc: "Porcelain veneers, teeth whitening, dental bonding and more to give you the smile you deserve.",
      image: "/images/services-cosmetic.webp",
      icon: "sparkles",
      items: ["Porcelain Veneers", "Teeth Whitening", "Dental Bonding"],
    },
    {
      title: "Preventive & General",
      desc: "Comprehensive exams, cleanings, night guards and children's dentistry for your whole family.",
      image: "/images/services-preventive.webp",
      icon: "shield",
      items: ["Dental Cleanings", "Dental Exams", "Children's Dentistry", "Night Guards", "Snore Guards"],
    },
    {
      title: "Restorative Dentistry",
      desc: "Crowns, bridges, implant crowns, dentures and root canal therapy to restore your oral health.",
      image: "/images/services-restorative.webp",
      icon: "heart",
      items: ["Dental Crowns", "Dental Bridges", "Dentures", "Dental Implant Crowns", "Root Canal Therapy"],
    },
  ],
};

/* ================================================================
   ICON MAP
   ================================================================ */
const serviceIcons: Record<string, React.ReactNode> = {
  sparkles: <LuSparkles className="w-6 h-6" />,
  shield: <LuShieldCheck className="w-6 h-6" />,
  heart: <LuHeart className="w-6 h-6" />,
};

/* ================================================================
   STAR RATING COMPONENT
   ================================================================ */
function Stars({ rating, size = "w-5 h-5" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <LuStar
          key={i}
          className={`${size} ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Insurance", href: "#insurance" },
    { label: "Book Now", href: "#booking" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ================================================================
          NAVBAR
          ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/images/logo.webp"
                alt="Tingey Dental logo"
                className="h-10 lg:h-12 w-auto"
              />
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-all duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Phone CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={`tel:${clinic.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 text-sm font-semibold shadow-lg shadow-primary/20"
              >
                <LuPhone className="w-4 h-4" />
                {clinic.phone}
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300"
            >
              {mobileMenuOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-lg transition-all duration-300 font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`tel:${clinic.phone.replace(/\D/g, "")}`}
                className="flex items-center justify-center gap-2 mt-3 px-4 py-3 bg-primary text-white rounded-lg font-semibold"
              >
                <LuPhone className="w-4 h-4" />
                {clinic.phone}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero.webp"
            alt="Tingey Dental office exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/90 via-[#1a1a2e]/70 to-[#1a1a2e]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
              <Stars rating={clinic.rating} size="w-4 h-4" />
              <span className="text-white/90 text-sm font-medium">
                {clinic.rating} rating - {clinic.reviews_count} reviews
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 font-[family-name:var(--font-heading)]">
              Your Family&apos;s Smile
              <span className="block text-accent-light">Starts Here</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-4 leading-relaxed">
              {clinic.specialty}
            </p>

            <p className="text-white/70 mb-8 flex items-center gap-2">
              <LuMapPin className="w-4 h-4 text-accent-light flex-shrink-0" />
              {clinic.address}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 text-lg font-semibold shadow-xl shadow-primary/30"
              >
                <LuCalendar className="w-5 h-5" />
                Book Your Appointment
              </a>
              <a
                href={`tel:${clinic.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold"
              >
                <LuPhone className="w-5 h-5" />
                Call Now
              </a>
            </div>

            {/* Trust badges row */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: <LuUsers className="w-5 h-5" />, label: "Family Friendly" },
                { icon: <LuAward className="w-5 h-5" />, label: "25+ Years Experience" },
                { icon: <LuStethoscope className="w-5 h-5" />, label: "Modern Technology" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-white/70">
                  <div className="text-accent-light">{badge.icon}</div>
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SERVICES
          ================================================================ */}
      <section id="services" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our Services</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Comprehensive Dental Care
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">
              From routine checkups to complete smile makeovers, we provide the care your family needs under one roof.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {clinic.services_categories.map((cat) => (
              <div
                key={cat.title}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                      {serviceIcons[cat.icon]}
                    </div>
                    <h3 className="text-white font-bold text-lg">{cat.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{cat.desc}</p>
                  <ul className="space-y-2">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <LuCircleCheck className="w-4 h-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency dentistry callout */}
          <div className="mt-12 bg-primary-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <LuPhone className="w-7 h-7" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                Dental Emergency?
              </h3>
              <p className="text-gray-600 mt-1">
                We offer emergency dental services. Don&apos;t wait in pain -- call us right away.
              </p>
            </div>
            <a
              href={`tel:${clinic.phone.replace(/\D/g, "")}`}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              {clinic.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          ABOUT / MEET DR. TINGEY
          ================================================================ */}
      <section id="about" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/consultation.webp"
                  alt="Dr. Brian Tingey with patient"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-4 sm:right-8 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
                  <LuAward className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">25+ Years</p>
                  <p className="text-gray-500 text-xs">of Excellence</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Meet Your Dentist</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
                {clinic.dentist}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Born and raised in Carey, Idaho, Dr. Brian Tingey has deep roots in the community he serves.
                  After earning his Doctor of Dental Surgery degree from the University of the Pacific School
                  of Dentistry in San Francisco, he returned to Idaho to build a practice centered on trust,
                  compassion, and clinical excellence.
                </p>
                <p>
                  With over 25 years of experience, Dr. Tingey stays at the forefront of dental technology,
                  offering the latest in digital scanning, cosmetic procedures, and restorative treatments.
                  His warm, patient-first approach has made Tingey Dental a trusted name for families throughout
                  the Magic Valley.
                </p>
                <p>
                  Whether it&apos;s your child&apos;s first dental visit or a complex restoration, Dr. Tingey
                  and his team provide personalized care in a comfortable, welcoming environment.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { value: "25+", label: "Years Experience" },
                  { value: "4.9", label: "Google Rating" },
                  { value: "1000+", label: "Happy Families" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-white rounded-xl border border-gray-100">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
          ================================================================ */}
      <section id="reviews" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Patient Reviews</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              What Our Patients Say
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Stars rating={clinic.rating} size="w-6 h-6" />
              <span className="text-gray-600 font-medium">
                {clinic.rating} out of 5 - {clinic.reviews_count} Google reviews
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {clinic.reviews.map((review, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative"
              >
                <LuQuote className="w-10 h-10 text-primary/10 absolute top-6 right-6" />
                <Stars rating={5} size="w-4 h-4" />
                <p className="text-gray-600 mt-4 leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.reviewer.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.reviewer}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <LuBadgeCheck className="w-3 h-3 text-primary" />
                      Verified Google Review
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          INSURANCE
          ================================================================ */}
      <section id="insurance" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Insurance</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Accepted Insurance Plans
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              We work with most major dental insurance providers to help maximize your benefits.
            </p>
          </div>

          <InsuranceSection />
        </div>
      </section>

      {/* ================================================================
          BOOKING FORM
          ================================================================ */}
      <section id="booking" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Book Online</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Schedule Your Visit
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Choose a date and time that works for you. We&apos;ll confirm your appointment within one business day.
            </p>
          </div>

          <BookingForm clinicPhone={clinic.phone} />
        </div>
      </section>

      {/* ================================================================
          HOURS & LOCATION
          ================================================================ */}
      <section id="contact" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Visit Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Hours & Location
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Hours & Info */}
            <div className="space-y-8">
              {/* Hours table */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 font-[family-name:var(--font-heading)]">
                  <LuClock className="w-5 h-5 text-primary" />
                  Office Hours
                </h3>
                <div className="space-y-3">
                  {Object.entries(clinic.hours).map(([day, time]) => {
                    const isClosed = time === "Closed";
                    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
                    const isToday = todayName === day;
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
                          isToday ? "bg-primary-50 border border-primary/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isToday ? "text-primary" : "text-gray-700"}`}>
                          {day}
                          {isToday && (
                            <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                              Today
                            </span>
                          )}
                        </span>
                        <span className={isClosed ? "text-gray-400" : "text-gray-600"}>
                          {time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 font-[family-name:var(--font-heading)]">
                  <LuMapPin className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <a
                    href={clinic.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-600 hover:text-primary transition-all duration-300 group"
                  >
                    <LuMapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                    <span className="group-hover:underline">{clinic.address}</span>
                  </a>
                  <a
                    href={`tel:${clinic.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-all duration-300"
                  >
                    <LuPhone className="w-5 h-5 text-primary flex-shrink-0" />
                    {clinic.phone}
                  </a>
                  <a
                    href={`mailto:${clinic.email}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-all duration-300"
                  >
                    <LuMail className="w-5 h-5 text-primary flex-shrink-0" />
                    {clinic.email}
                  </a>
                </div>

                <a
                  href={clinic.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold shadow-lg shadow-primary/20"
                >
                  <LuMapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2945.123!2d-114.4685359!3d42.5775162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54acaa5e0e3d1555%3A0x123456789!2sTingey+Brian+J+DDS!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tingey Dental location on Google Maps"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA FINAL
          ================================================================ */}
      <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
            <LuSmile className="w-4 h-4 text-accent-light" />
            <span className="text-white/90 text-sm font-medium">New patients welcome</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-heading)]">
            Ready for a Healthier Smile?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Join the hundreds of families in Twin Falls who trust Dr. Tingey with their dental care.
            Schedule your visit today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg font-semibold shadow-xl"
            >
              <LuCalendar className="w-5 h-5" />
              Book Online Now
            </a>
            <a
              href={`tel:${clinic.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold"
            >
              <LuPhone className="w-5 h-5" />
              {clinic.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="bg-[#1a1a2e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <img
                src="/images/logo.webp"
                alt="Tingey Dental logo"
                className="h-10 w-auto brightness-0 invert mb-4"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Providing trusted dental care for families in Twin Falls and the Magic Valley since 1998.
                General, cosmetic, and restorative dentistry.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a
                  href={clinic.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-primary transition-all duration-300"
                >
                  <FaFacebookF className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 text-sm"
                  >
                    <LuChevronRight className="w-3 h-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-3">
                <a
                  href={clinic.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-all duration-300 text-sm"
                >
                  <LuMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-light" />
                  {clinic.address}
                </a>
                <a
                  href={`tel:${clinic.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 text-sm"
                >
                  <LuPhone className="w-4 h-4 flex-shrink-0 text-primary-light" />
                  {clinic.phone}
                </a>
                <a
                  href={`mailto:${clinic.email}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 text-sm"
                >
                  <LuMail className="w-4 h-4 flex-shrink-0 text-primary-light" />
                  {clinic.email}
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Tingey Dental. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              568 Falls Ave, Twin Falls, ID 83301
            </p>
          </div>
        </div>
      </footer>

      {/* ================================================================
          FLOATING PHONE BUTTON
          ================================================================ */}
      <a
        href={`tel:${clinic.phone.replace(/\D/g, "")}`}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:bg-primary-dark hover:scale-110 transition-all duration-300 lg:hidden"
        aria-label="Call Tingey Dental"
      >
        <LuPhone className="w-6 h-6" />
      </a>
    </div>
  );
}
