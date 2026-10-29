import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, PackageOpen } from 'lucide-react'
import { SEO } from '../components/common/SEO'

export const NotFound: React.FC = () => {
  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-20 px-4 text-center">
      <SEO title="Page Not Found (404)" />
      <div className="max-w-md">
        <PackageOpen className="w-16 h-16 text-levix-secondary/40 mx-auto mb-4 stroke-1" />
        <span className="text-xs font-bold uppercase tracking-widest text-black">
          Error 404
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-levix-charcoal mt-1">
          Page Not Found
        </h1>
        <p className="text-xs text-levix-secondary mt-2 mb-8 leading-relaxed">
          The requested silhouette or collection does not exist or has been relocated in our catalogue.
        </p>
        <Link
          to="/"
          className="btn-primary text-xs uppercase tracking-wider py-3.5 px-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  )
}
