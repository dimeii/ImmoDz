"use client";

import { useState } from "react";

interface Props {
  price: number;
  transactionType: "RENT" | "SALE";
}

function format(n: number): string {
  return Math.round(n).toLocaleString("fr-DZ");
}

export default function CreditSimulator({ price, transactionType }: Props) {
  const [down, setDown] = useState(() => Math.round(price * 0.2));
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(6.5);

  if (transactionType !== "SALE") return null;

  const capital = Math.max(0, price - down);
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const monthly =
    months === 0
      ? 0
      : monthlyRate === 0
        ? capital / months
        : (capital * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const totalCost = monthly * months;
  const creditCost = Math.max(0, totalCost - capital);
  const downPct = price > 0 ? Math.round((down / price) * 100) : 0;

  return (
    <section className="mb-12 bg-surface-container-low p-8 rounded-xl">
      <h3 className="text-2xl font-headline font-bold text-primary mb-2">
        Simulateur de crédit
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Estimation indicative. Les conditions réelles dépendent de votre banque.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="credit-down"
            className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold"
          >
            Apport ({downPct}%)
          </label>
          <input
            id="credit-down"
            type="number"
            min={0}
            max={price}
            step={10000}
            value={down}
            onChange={(e) => setDown(Math.max(0, Math.min(price, Number(e.target.value) || 0)))}
            className="bg-white border border-outline-variant/30 rounded-lg px-3 py-2 text-lg font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-on-surface-variant">DA</span>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="credit-years"
            className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold"
          >
            Durée
          </label>
          <input
            id="credit-years"
            type="number"
            min={1}
            max={40}
            step={1}
            value={years}
            onChange={(e) => setYears(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
            className="bg-white border border-outline-variant/30 rounded-lg px-3 py-2 text-lg font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-on-surface-variant">ans</span>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="credit-rate"
            className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold"
          >
            Taux
          </label>
          <input
            id="credit-rate"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
            className="bg-white border border-outline-variant/30 rounded-lg px-3 py-2 text-lg font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-on-surface-variant">% annuel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1 bg-primary text-on-primary p-6 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
            Mensualité
          </span>
          <span className="text-3xl font-headline font-extrabold">
            {format(monthly)} DA
          </span>
          <span className="text-xs opacity-80">par mois</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Coût du crédit
          </span>
          <span className="text-2xl font-headline font-bold text-primary">
            {format(creditCost)} DA
          </span>
          <span className="text-xs text-on-surface-variant font-medium">
            intérêts cumulés
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Capital emprunté
          </span>
          <span className="text-2xl font-headline font-bold text-primary">
            {format(capital)} DA
          </span>
          <span className="text-xs text-on-surface-variant font-medium">
            soit {years * 12} mensualités
          </span>
        </div>
      </div>
    </section>
  );
}
