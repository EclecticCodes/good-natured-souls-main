"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import { useSession } from "next-auth/react";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface CustomerInfo {
  name: string;
  email: string;
}

const CheckoutForm = ({ customer }: { customer: CustomerInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setStatus("loading");
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    });
    if (error) {
      setErrorMsg(error.message || "Payment failed.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Customer Info Summary */}
      <div className="border border-secondaryInteraction p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-oswald text-sm font-bold tracking-widest uppercase text-gray-400">Ordering As</h3>
        </div>
        <p className="text-white text-sm">{customer.name}</p>
        <p className="text-gray-500 text-xs">{customer.email}</p>
      </div>

      {/* Order Summary */}
      <div className="border border-secondaryInteraction p-4">
        <h3 className="font-oswald text-lg font-bold mb-3 tracking-widest uppercase">Order Summary</h3>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-secondaryInteraction last:border-0">
            <span className="text-gray-400">
              {item.name}
              <span className="ml-2 text-xs text-accent uppercase">[{item.type}]</span>
              {item.quantity > 1 && <span className="ml-1 text-gray-600">x{item.quantity}</span>}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-oswald font-bold text-lg pt-3 mt-1">
          <span>Total</span>
          <span className="text-accent">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="border border-secondaryInteraction p-4">
        <h3 className="font-oswald text-lg font-bold mb-4 tracking-widest uppercase">Payment Details</h3>
        <PaymentElement />
      </div>

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={!stripe || status === "loading"}
        className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "PROCESSING..." : `PAY $${total.toFixed(2)}`}
      </button>

      <p className="text-center text-xs text-gray-600">
        Secured by Stripe · All major cards accepted
      </p>
    </form>
  );
};

const CheckoutPage = () => {
  const { items, total } = useCart();
  const { data: session } = useSession();
  const [clientSecret, setClientSecret] = useState("");
  const [step, setStep] = useState<"info" | "payment">("info");
  const [customer, setCustomer] = useState<CustomerInfo>({ name: "", email: "" });
  const [infoError, setInfoError] = useState("");

  // If signed in, skip info step and go straight to payment
  useEffect(() => {
    if (session?.user?.email && step === "info" && items.length > 0) {
      const name = session.user.name || session.user.email;
      const email = session.user.email;
      setCustomer({ name, email });
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ price: i.price, quantity: i.quantity, name: i.name })),
          customerName: name,
          customerEmail: email,
        }),
      })
        .then(res => res.json())
        .then(data => { if (data.clientSecret) { setClientSecret(data.clientSecret); setStep("payment"); } });
    }
  }, [session, items]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");
    if (!customer.name.trim()) return setInfoError("Please enter your name.");
    if (!customer.email.includes("@")) return setInfoError("Please enter a valid email.");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ price: i.price, quantity: i.quantity, name: i.name })),
        customerName: customer.name,
        customerEmail: customer.email,
      }),
    });
    const data = await res.json();
    if (data.clientSecret) {
      setClientSecret(data.clientSecret);
      setStep("payment");
    } else {
      setInfoError("Something went wrong. Please try again.");
    }
  };

  if (items.length === 0) {
    return (
      <PageWrapper>
        <Header><h1 className="font-oswald text-4xl font-bold">Checkout</h1></Header>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="font-oswald text-2xl text-gray-500 tracking-widest">YOUR CART IS EMPTY</p>
          <a href="/store" className="inline-block mt-6 bg-accent text-primary font-oswald font-bold px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors">
            BACK TO STORE
          </a>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header><h1 className="font-oswald text-4xl font-bold">Checkout</h1></Header>
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 ${step === "info" ? "text-accent" : "text-gray-600"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${step === "info" ? "border-accent text-accent" : "border-gray-600 text-gray-600"}`}>1</span>
            <span className="font-oswald text-xs tracking-widest uppercase">Your Info</span>
          </div>
          <div className="flex-1 h-px bg-secondaryInteraction" />
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-accent" : "text-gray-600"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${step === "payment" ? "border-accent text-accent" : "border-gray-600 text-gray-600"}`}>2</span>
            <span className="font-oswald text-xs tracking-widest uppercase">Payment</span>
          </div>
        </div>

        {/* Step 1 — Customer Info */}
        {step === "info" && (
          <form onSubmit={handleInfoSubmit} className="flex flex-col gap-6">
            <div className="border border-secondaryInteraction p-4">
              <h3 className="font-oswald text-lg font-bold mb-4 tracking-widest uppercase">Your Information</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-widest uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                  />
                  <p className="text-xs text-gray-600 mt-1">Your receipt and download links will be sent here.</p>
                </div>
              </div>
            </div>

            {/* Order Summary Preview */}
            <div className="border border-secondaryInteraction p-4">
              <h3 className="font-oswald text-lg font-bold mb-3 tracking-widest uppercase">Order Summary</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-secondaryInteraction last:border-0">
                  <span className="text-gray-400">
                    {item.name}
                    <span className="ml-2 text-xs text-accent uppercase">[{item.type}]</span>
                    {item.quantity > 1 && <span className="ml-1 text-gray-600">x{item.quantity}</span>}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-oswald font-bold text-lg pt-3 mt-1">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            {infoError && <p className="text-red-500 text-sm">{infoError}</p>}

            <button
              type="submit"
              className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-4 tracking-widest hover:bg-accentInteraction transition-colors"
            >
              CONTINUE TO PAYMENT
            </button>
          </form>
        )}

        {/* Step 2 — Payment */}
        {step === "payment" && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#F0B51E",
                  colorBackground: "#161616",
                  colorText: "#ffffff",
                  colorDanger: "#ff4444",
                  fontFamily: "Inter, sans-serif",
                },
              },
            }}
          >
            <CheckoutForm customer={customer} />
          </Elements>
        )}
      </div>
    </PageWrapper>
  );
};

export default CheckoutPage;
