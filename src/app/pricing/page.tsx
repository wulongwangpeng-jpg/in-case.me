"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const PLANS = [
  {
    name: "Annual",
    price: "$23",
    period: "/ year",
    desc: "Full access, billed yearly. Cancel anytime.",
    features: [
      "Unlimited asset inventories",
      "Unlimited heart letters",
      "Up to 3 trusted messengers",
      "SMS & email notifications",
      "Zero-knowledge encryption",
      "Data export & deletion",
      "Email support",
    ],
    cta: "Subscribe",
    href: "/settings",
  },
  {
    name: "Lifetime",
    price: "$198",
    period: " one-time",
    desc: "Pay once. Access for the lifetime of the service.",
    popular: true,
    features: [
      "Everything in Annual",
      "No recurring charges, ever",
      "Lifetime access guarantee",
      "Priority feature requests",
      "Lifetime supporter badge",
    ],
    cta: "Get Lifetime",
    href: "/settings",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2">Simple, Transparent Pricing</h1>
        <p className="text-sm text-muted-foreground">
          One plan, two payment options. No hidden fees. No surprises.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              plan.popular
                ? "border-warm-300 bg-warm-50/40 shadow-md ring-1 ring-warm-200"
                : "border-border/60 bg-white"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-warm-500 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full">
                Best Value
              </span>
            )}
            <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
            <div className="mb-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-all ${
                plan.popular
                  ? "bg-warm-500 text-white hover:bg-warm-600"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        All prices in USD. VAT may apply depending on your location.
        <br />
        Questions? <a href="mailto:support@in-case.me" className="text-warm-600 hover:underline">support@in-case.me</a>
      </p>
    </div>
  );
}
