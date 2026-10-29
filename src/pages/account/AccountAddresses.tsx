import React, { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { SavedAddress } from '../../types/user'

export const AccountAddresses: React.FC = () => {
  const { userProfile, saveAddress, deleteAddress, setDefaultAddress } = useAuth()
  const addresses = userProfile?.addresses || []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>(undefined)

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [apartment, setApartment] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('India')
  const [isDefault, setIsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setEditingId(undefined)
    setFullName(userProfile?.displayName || '')
    setEmail(userProfile?.email || '')
    setPhone(userProfile?.phone || '')
    setStreet('')
    setApartment('')
    setCity('')
    setState('')
    setPostalCode('')
    setCountry('India')
    setIsDefault(addresses.length === 0)
    setError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingId(addr.id)
    setFullName(addr.fullName)
    setEmail(addr.email)
    setPhone(addr.phone)
    setStreet(addr.street)
    setApartment(addr.apartment || '')
    setCity(addr.city)
    setState(addr.state)
    setPostalCode(addr.postalCode)
    setCountry(addr.country)
    setIsDefault(addr.isDefault)
    setError(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      setError('Please fill in all required address fields.')
      return
    }

    await saveAddress(
      {
        fullName,
        email: email || userProfile?.email || '',
        phone,
        street,
        apartment,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
      editingId
    )
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-levix-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-levix-charcoal">
            Saved Delivery Addresses
          </h2>
          <p className="text-xs text-levix-secondary mt-0.5">
            Manage destinations for one-click checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary py-2 px-3.5 text-xs uppercase tracking-wider flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-levix-border p-6">
          <MapPin className="w-10 h-10 text-levix-secondary/40 mx-auto mb-2 stroke-1" />
          <p className="text-xs font-semibold text-levix-charcoal">No addresses saved yet</p>
          <p className="text-[11px] text-levix-secondary mt-0.5 mb-4">
            Add your primary shipping destination for faster checkout.
          </p>
          <button onClick={handleOpenAdd} className="btn-secondary py-2 px-4 text-xs uppercase">
            Add Shipping Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 border flex flex-col justify-between transition-colors ${
                addr.isDefault
                  ? 'border-black bg-black/5'
                  : 'border-levix-border bg-white hover:border-levix-charcoal'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                    {addr.fullName}
                  </h4>
                  {addr.isDefault ? (
                    <span className="text-[10px] font-bold text-black bg-black/5 px-2 py-0.5 border border-neutral-300">
                      Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[10px] text-levix-secondary hover:text-black underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="text-xs text-levix-secondary leading-relaxed">
                  <p>{addr.street}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  <p className="mt-1 text-levix-charcoal font-medium">Contact: {addr.phone}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-levix-border/70 flex items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(addr)}
                  className="text-levix-secondary hover:text-levix-charcoal inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteAddress(addr.id)}
                  className="text-levix-secondary hover:text-red-600 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full p-6 border border-levix-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-levix-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-levix-secondary hover:text-levix-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="form-input py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="form-input py-2"
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input py-2"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="form-input py-2"
                />
              </div>

              <div>
                <label className="form-label">Apartment / Suite</label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="form-input py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="form-input py-2"
                  />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="form-input py-2"
                  />
                </div>
                <div>
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="form-input py-2"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-black accent-black"
                />
                <span className="text-xs text-levix-charcoal font-medium">
                  Set as primary default address
                </span>
              </label>

              <div className="pt-4 border-t border-levix-border flex gap-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 text-xs uppercase tracking-wider"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2.5 px-4 text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
