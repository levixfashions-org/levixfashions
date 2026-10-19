import React from 'react'
import { SEO } from '../../components/common/SEO'

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16">
      <SEO title="Terms and Conditions" />
      <div className="container-levix max-w-3xl">
        <h1 className="text-3xl font-black uppercase tracking-tight text-levix-charcoal mb-2">
          Terms and Conditions
        </h1>
        <p className="text-xs text-levix-secondary mb-8">Effective Date: October 2026</p>

        <div className="space-y-6 text-xs text-levix-charcoal/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              1. Commercial Relationship
            </h2>
            <p>
              By accessing the LEVIX web application or placing an order, you agree to be bound by these Terms of Service. LEVIX reserves the right to update these terms at our discretion.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              2. Product Accuracy & Pricing
            </h2>
            <p>
              We endeavor to display textile colors and garment draping as accurately as possible. Prices are quoted in Indian Rupees (INR) and are inclusive of statutory taxes unless stated otherwise.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              3. Order Acceptance & Inventory
            </h2>
            <p>
              Receipt of an order confirmation does not signify our final acceptance of your order. In the unlikely event that an item is out of stock after order creation, you will be notified promptly and issued a full refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              4. Governing Law
            </h2>
            <p>
              These terms are governed in accordance with the laws of India, under the jurisdiction of the courts in Bengaluru, Karnataka.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
