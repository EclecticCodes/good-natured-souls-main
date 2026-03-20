"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total, clearCart } = useCart();
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
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (items.length === 0) return;
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ price: i.price, quantity: i.quantity, name: i.name })),
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [items]);

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
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#F0B51E", colorBackground: "#161616", colorText: "#ffffff", colorDanger: "#ff4444", fontFamily: "Inter, sans-serif" } } }}>
            <CheckoutForm />
          </Elements>
        ) : (
          <div className="text-center py-16">
            <p className="font-oswald text-gray-500 tracking-widest">LOADING...</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CheckoutPage;
