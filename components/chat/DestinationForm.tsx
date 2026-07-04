"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";

export interface DestinationFormValues {
  destination: string;
  budget: string;
  days: string;
  startDate: string;
  endDate: string;
}

interface DestinationFormProps {
  onSubmit: (values: DestinationFormValues) => void;
  isLoading: boolean;
}

const today = new Date().toISOString().split("T")[0];

export default function DestinationForm({ onSubmit, isLoading }: DestinationFormProps) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("4");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!destination || !budget || !days || !startDate || !endDate) return;
    onSubmit({ destination, budget, days, startDate, endDate });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Destination discovery form"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: "8px",
        padding: "10px 16px",
        backgroundColor: "#f7f8fa",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1 1 140px" }}>
        <label htmlFor="destination-input" style={{ fontSize: "12px", fontWeight: 500 }}>Destination</label>
        <input
          id="destination-input"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Paris"
          aria-label="Destination"
          required
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1 1 100px" }}>
        <label htmlFor="budget-input" style={{ fontSize: "12px", fontWeight: 500 }}>Budget</label>
        <input
          id="budget-input"
          type="text"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g. $1500"
          aria-label="Budget"
          required
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "0 1 80px" }}>
        <label htmlFor="days-input" style={{ fontSize: "12px", fontWeight: 500 }}>Days</label>
        <input
          id="days-input"
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min={1}
          max={30}
          aria-label="Number of days"
          required
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "0 1 130px" }}>
        <label htmlFor="start-date-input" style={{ fontSize: "12px", fontWeight: 500 }}>Start Date</label>
        <input
          id="start-date-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          aria-label="Start Date"
          required
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "0 1 130px" }}>
        <label htmlFor="end-date-input" style={{ fontSize: "12px", fontWeight: 500 }}>End Date</label>
        <input
          id="end-date-input"
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
          aria-label="End Date"
          required
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" }}
        />
      </div>
      <div style={{ flex: "0 0 auto" }}>
        <Button id="discover-btn" type="submit" loading={isLoading} aria-label="Discover destination">
          Discover
        </Button>
      </div>
    </form>
  );
}
