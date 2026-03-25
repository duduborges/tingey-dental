"use client";

import { useState, useEffect } from "react";
import { LuShieldCheck, LuLoader } from "react-icons/lu";

interface InsurancePlan {
  id: string;
  name: string;
  active: boolean;
}

/* ---- Fallback list from clinic data ---- */
const fallbackPlans = [
  "Assurant", "Anthem", "Blue Cross", "Cigna-Great West", "Delta Dental PPO",
  "Delta Dental Premier", "Delta Dental Medicare Advantage", "Deseret Mutual",
  "MetLife", "Mutual of Omaha", "Oregon Dental Service",
  "Regence Blue Shield", "Washington Dental", "Humana",
];

export default function InsuranceSection() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetch("/api/insurance")
      .then((r) => r.json())
      .then((d) => {
        if (d.plans && d.plans.length > 0) {
          setPlans(d.plans);
        } else {
          setUseFallback(true);
        }
      })
      .catch(() => setUseFallback(true))
      .finally(() => setLoading(false));
  }, []);

  const displayPlans = useFallback
    ? fallbackPlans
    : plans.map((p) => p.name);

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LuLoader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayPlans.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <LuShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-gray-700 font-medium">{name}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-gray-500 text-sm mt-6">
        Don&apos;t see your plan? Call us at{" "}
        <a href="tel:+12087344111" className="text-primary font-semibold hover:underline">
          (208) 734-4111
        </a>{" "}
        -- we&apos;ll verify your coverage.
      </p>
    </div>
  );
}
