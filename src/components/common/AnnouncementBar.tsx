import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { ArrowRight } from 'lucide-react'

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore()
  const { announcementBar } = settings

  if (!announcementBar?.enabled || !announcementBar?.text) {
    return null
  }

  return (
    <div className="bg-levix-charcoal text-white text-[11px] sm:text-xs font-medium tracking-widest py-2 px-4 transition-colors">
      <div className="container-levix flex items-center justify-center text-center">
        {announcementBar.link ? (
          <Link
            to={announcementBar.link}
            className="group inline-flex items-center gap-1.5 hover:text-levix-orange transition-colors"
          >
            <span>{announcementBar.text}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-levix-orange" />
          </Link>
        ) : (
          <span>{announcementBar.text}</span>
        )}
      </div>
    </div>
  )
}
