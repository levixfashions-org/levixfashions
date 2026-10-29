import { Truck, RotateCcw } from 'lucide-react'
import { SEO } from '../../components/common/SEO'

export const ShippingReturns: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16">
      <SEO title="Shipping & Returns Policy" />
      <div className="container-levix max-w-3xl">
        <h1 className="text-3xl font-black uppercase tracking-tight text-levix-charcoal mb-2">
          Shipping & Returns Policy
        </h1>
        <p className="text-xs text-levix-secondary mb-8">Official Client Guidelines</p>

        <div className="space-y-8 text-xs text-levix-charcoal/80 leading-relaxed">
          <section className="space-y-3 p-6 bg-levix-gray border border-levix-border">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                Domestic Express Shipping
              </h2>
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Dispatch Time:</strong> All in-stock items are dispatched from our Bengaluru fulfillment center within 24 business hours.</li>
              <li><strong>Transit Time:</strong> 2–4 business days across metropolitan cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata). 4–6 business days for rest of India.</li>
              <li><strong>Complimentary Shipping:</strong> Domestic orders above ₹1,999 qualify for free express shipping.</li>
              <li><strong>Standard Rate:</strong> A flat ₹149 shipping charge applies to orders under the free shipping threshold.</li>
            </ul>
          </section>

          <section className="space-y-3 p-6 bg-levix-gray border border-levix-border">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                7-Day Returns & Exchanges
              </h2>
            </div>
            <p>
              We want you to be completely satisfied with your fit. We offer a 7-day hassle-free return and exchange window from the date of package delivery.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Garments must be unworn, unwashed, and in pristine condition with all original tags attached.</li>
              <li>Footwear must be tried indoors on a clean surface with no sole scuffs.</li>
              <li>Reverse courier pickup is scheduled automatically at your address.</li>
              <li>Refunds are processed back to the original payment source within 48 hours of inspection. For Cash on Delivery orders, refunds are disbursed via UPI or direct bank transfer.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
