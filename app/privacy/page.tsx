"use client";
import React from "react";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

export default function PrivacyPage() {
  const sections = [
    { title: "Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our mailing list, or contact us. This includes your name, email address, phone number, payment information, and any other information you choose to provide." },
    { title: "How We Use Your Information", content: "We use the information we collect to process transactions, send you order confirmations and receipts, send promotional communications with your consent, respond to your comments and questions, and improve our services." },
    { title: "Information Sharing", content: "We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, subject to confidentiality agreements." },
    { title: "Payment Security", content: "All payment processing is handled securely through Stripe. We do not store your full credit card information on our servers. Stripe is PCI-DSS compliant and uses industry-standard encryption." },
    { title: "Cookies", content: "We use cookies and similar tracking technologies to track activity on our website. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent." },
    { title: "Data Retention", content: "We retain your personal information for as long as necessary to provide you with our services and as required by law. You may request deletion of your account and associated data at any time." },
    { title: "Your Rights", content: "You have the right to access, update, or delete your personal information at any time. You may also opt out of marketing communications by clicking the unsubscribe link in any email we send." },
    { title: "Contact Us", content: "If you have questions about this Privacy Policy, please contact us at goodnaturedsouls@gmail.com or through our contact page." },
  ];

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <h1 className="font-oswald text-5xl font-bold text-center">Privacy Policy</h1>
        </Header>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-gray-500 text-sm mb-8">Last updated: March 19, 2026</p>
          {sections.map((section, i) => (
            <div key={i} className="mb-8 border-b border-secondaryInteraction pb-8 last:border-0">
              <h2 className="font-oswald text-xl font-bold mb-3 text-accent">{section.title}</h2>
              <p className="text-gray-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
