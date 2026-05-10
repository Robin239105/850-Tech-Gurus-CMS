'use client'

import { useState, useEffect } from 'react'
import { Eye, X, Check, Clock, User, Mail, Phone, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Booking = {
  id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  service: string | null
  booking_date: string | null
  booking_time: string | null
  status: string
  notes: string | null
  created_at: string
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-status-success/10 text-status-success',
  pending: 'bg-status-warning/10 text-status-warning',
  cancelled: 'bg-status-danger/10 text-status-danger',
  completed: 'bg-blue-100 text-blue-600',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [notesUpdate, setNotesUpdate] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = () => {
    fetch('/api/client/bookings')
      .then(r => r.ok ? r.json() : [])
      .then(setBookings)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return bookings.filter(b => b.booking_date?.startsWith(dateStr))
  }

  const openDetail = (b: Booking) => {
    setSelectedBooking(b)
    setStatusUpdate(b.status)
    setNotesUpdate(b.notes ?? '')
  }

  const handleUpdate = async () => {
    if (!selectedBooking) return
    setUpdating(true)
    await fetch('/api/client/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedBooking.id, status: statusUpdate, notes: notesUpdate }),
    })
    setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: statusUpdate, notes: notesUpdate } : b))
    setSelectedBooking(null)
    setUpdating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-text-secondary mt-1">Manage appointments and reservations</p>
        </div>
        <div className="flex gap-1 p-1 bg-page-bg rounded-lg">
          {(['month', 'list'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={cn('px-4 py-2 text-sm font-medium rounded-md capitalize transition-all',
                viewMode === m ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary')}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'month' && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1,1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1,1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="border border-card-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 border-b border-card-border">
              {dayNames.map(d => <div key={d} className="p-3 text-center text-sm font-medium text-text-secondary border-r border-card-border last:border-r-0">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="min-h-24 border-r border-b border-card-border" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayBookings = getBookingsForDay(day)
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
                return (
                  <div key={day} className={cn('min-h-24 p-2 border-r border-b border-card-border', isToday && 'bg-brand-indigo/5')}>
                    <span className={cn('text-sm font-medium', isToday ? 'bg-brand-indigo text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : 'text-text-secondary')}>{day}</span>
                    <div className="mt-1 space-y-1">
                      {dayBookings.slice(0, 2).map(b => (
                        <div key={b.id} onClick={() => openDetail(b)} className={cn('text-xs p-1 rounded cursor-pointer truncate', statusColors[b.status] ?? 'bg-gray-100 text-gray-600')}>
                          {b.booking_time} - {b.customer_name ?? 'Customer'}
                        </div>
                      ))}
                      {dayBookings.length > 2 && <div className="text-xs text-text-muted">+{dayBookings.length - 2} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {viewMode === 'list' && (
        <div className="border border-card-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-card-border">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Date & Time</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Customer</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Service</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-text-muted">Loading…</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-text-muted">
                  No bookings yet. They will appear here once customers schedule appointments.
                </td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="border-b border-card-border hover:bg-gray-50">
                  <td className="p-3 text-sm">{b.booking_date ? formatDate(b.booking_date) : '—'} {b.booking_time && <span className="text-text-muted">@ {b.booking_time}</span>}</td>
                  <td className="p-3"><p className="text-sm font-medium">{b.customer_name ?? '—'}</p><p className="text-xs text-text-muted">{b.customer_email ?? ''}</p></td>
                  <td className="p-3 text-sm">{b.service ?? '—'}</td>
                  <td className="p-3"><span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[b.status] ?? 'bg-gray-100 text-gray-600')}>{b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span></td>
                  <td className="p-3"><button onClick={() => openDetail(b)} className="p-1.5 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-text-muted" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && bookings.length === 0 && viewMode === 'month' && (
        <div className="flex flex-col items-center justify-center py-12">
          <CalendarIcon className="w-12 h-12 text-text-muted mb-3" />
          <p className="text-text-muted">No bookings yet. They will appear here once customers schedule appointments.</p>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px]">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted">Date & Time</p>
                  <p className="text-sm font-medium mt-1">{selectedBooking.booking_date ? formatDate(selectedBooking.booking_date) : '—'} {selectedBooking.booking_time && `at ${selectedBooking.booking_time}`}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted">Service</p>
                  <p className="text-sm font-medium mt-1">{selectedBooking.service ?? '—'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs text-text-muted mb-2">Customer</p>
                {selectedBooking.customer_name && <div className="flex items-center gap-2"><User className="w-4 h-4 text-text-muted" /><span className="text-sm">{selectedBooking.customer_name}</span></div>}
                {selectedBooking.customer_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-text-muted" /><span className="text-sm">{selectedBooking.customer_email}</span></div>}
                {selectedBooking.customer_phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" /><span className="text-sm">{selectedBooking.customer_phone}</span></div>}
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={notesUpdate} onChange={e => setNotesUpdate(e.target.value)} placeholder="Add notes…" className="mt-1.5 h-20" />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>Close</Button>
                <Button className="flex-1" onClick={handleUpdate} disabled={updating}>
                  <Check className="w-4 h-4 mr-2" />{updating ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
