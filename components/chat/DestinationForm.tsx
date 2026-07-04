"use client";

import { useState, FormEvent } from "react";
import Input from "@/components/ui/Input";
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
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        padding: "20px",
        backgroundColor: "#f7f8fa",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Input
        id="destination-input"
        label="Destination"
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="e.g. Paris"
        aria-label="Destination"
        required
      />
      <Input
        id="budget-input"
        label="Budget"
        type="text"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="e.g. $1500"
        aria-label="Budget"
        required
      />
      <Input
        id="days-input"
        label="Number of days"
        type="number"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        min={1}
        max={30}
        aria-label="Number of days"
        required
      />
      <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="start-date-input" style={{ fontSize: "14px", fontWeight: 500 }}>
            Start Date
          </label>
          <input
            id="start-date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start Date"
            required
            style={{
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#fff",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="end-date-input" style={{ fontSize: "14px", fontWeight: 500 }}>
            End Date
          </label>
          <input
            id="end-date-input"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="End Date"
            required
            style={{
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#fff",
            }}
          />
        </div>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <Button id="discover-btn" type="submit" loading={isLoading}>
          Discover
        </Button>
      </div>
    </form>
  );
}
