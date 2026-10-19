import React from 'react'
import { SEO } from '../../components/common/SEO'

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16">
      <SEO title="Privacy Policy" />
      <div className="container-levix max-w-3xl">
        <h1 className="text-3xl font-black uppercase tracking-tight text-levix-charcoal mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-levix-secondary mb-8">Effective Date: October 2026</p>

        <div className="space-y-6 text-xs text-levix-charcoal/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              1. Information We Collect
            </h2>
            <p>
              When you visit LEVIX or complete a purchase, we collect the necessary personal information provided by you, including your name, email address, contact telephone number, and physical shipping address.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              2. Payment & Cardholder Data Security
            </h2>
            <p>
              LEVIX never stores credit card, debit card, or banking authentication credentials on our servers. All digital payments are processed through Razorpay’s PCI-DSS Level 1 compliant gateway with 256-bit SSL encryption.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              3. Fulfillment & Courier Partners
            </h2>
            <p>
              Your contact details and shipping address are securely transmitted to verified logistics couriers (such as BlueDart, Delhivery) solely for the fulfillment and delivery of your orders.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              4. Client Rights & Data Retention
            </h2>
            <p>
              You may request access to, correction of, or deletion of your profile data at any time by contacting our support team at care@levix.in.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
