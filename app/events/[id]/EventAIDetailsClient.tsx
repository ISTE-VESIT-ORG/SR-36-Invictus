"use client";
import React, { useEffect, useState } from "react";
import { Info, Lightbulb } from "lucide-react";

export default function EventAIDetailsClient({ event, eventType }: { event: any; eventType: string }) {
  const [aiDetails, setAIDetails] = useState<{
    about: string;
    whyItMatters: string;
    observationTips: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/ai-event-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("AI API error");
        return res.json();
      })
      .then((data) => {
        setAIDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load AI details");
        setLoading(false);
      });
  }, [event]);

  if (loading) return <div className="text-space-gray-300">Loading event details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!aiDetails) return null;

  return (
    <>
      {/* About This Event */}
      <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-galaxy-cyan" />
          <h2 className="text-2xl font-bold text-star-white font-display">About This Event</h2>
        </div>
        <p className="text-space-gray-300 leading-relaxed">{aiDetails.about}</p>
      </div>

      {/* Why It Matters */}
      <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h2 className="text-2xl font-bold text-star-white font-display">Why It Matters</h2>
        </div>
        <p className="text-space-gray-300 leading-relaxed">{aiDetails.whyItMatters}</p>
      </div>

      {/* Observation Tips */}
      <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-meteor-orange" />
          <h2 className="text-2xl font-bold text-star-white font-display">
            {eventType === "launch"
              ? "Launch Information"
              : eventType === "asteroid"
              ? "Asteroid Information"
              : "Observation Tips"}
          </h2>
        </div>
        <ul className="space-y-3">
          {aiDetails.observationTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-cosmic-purple text-xl">•</span>
              <span className="text-space-gray-300">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
