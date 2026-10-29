import { WifiOff, RotateCcw } from 'lucide-react'
import { SEO } from '../components/common/SEO'

export const Offline: React.FC = () => {
  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-20 px-4 text-center">
      <SEO title="Offline Mode" />
      <div className="max-w-md">
        <WifiOff className="w-16 h-16 text-levix-secondary/40 mx-auto mb-4 stroke-1" />
        <span className="text-xs font-bold uppercase tracking-widest text-black">
          Offline Mode
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-levix-charcoal mt-1">
          No Internet Connection
        </h1>
        <p className="text-xs text-levix-secondary mt-2 mb-8 leading-relaxed">
          You are currently offline. You can still browse previously cached products from your cache, or reconnect to proceed with live checkout.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-xs uppercase tracking-wider py-3.5 px-6 inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  )
}
