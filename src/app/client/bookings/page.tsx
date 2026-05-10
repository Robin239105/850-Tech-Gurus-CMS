'use client'

import { useState } from 'react'
import {
  Plus,
  Eye,
  X,
  Check,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

const mockBookings = [
  { id: '1', date: '2026-05-15', time: '10:00', customer: 'John Smith', email: 'john@email.com', phone: '+1 (555) 123-4567', service: 'Consultation', status: 'confirmed', notes: 'First time client' },
  { id: '2', date: '2026-05-15', time: '14:00', customer: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1 (555) 234-5678', service: 'Product Demo', status: 'pending', notes: '' },
  { id: '3', date: '2026-05-16', time: '09:00', customer: 'Mike Chen', email: 'mike@email.com', phone: '+1 (555) 345-6789', service: 'Consultation', status: 'confirmed', notes: 'Follow-up meeting' },
  { id: '4', date: '2026-05-16', time: '11:30', customer: 'Emily Brown', email: 'emily@email.com', phone: '+1 (555) 456-7890', service: 'Training Session', status: 'completed', notes: 'Completed successfully' },
  { id: '5', date: '2026-05-17', time: '15:00', customer: 'David Lee', email: 'david@email.com', phone: '+1 (555) 567-8901', service: 'Product Demo', status: 'cancelled', notes: 'Client rescheduled' },
  { id: '6', date: '2026-05-18', time: '10:30', customer: 'Lisa Wang', email: 'lisa@email.com', phone: '+1 (555) 678-9012', service: 'Consultation', status: 'confirmed', notes: '' },
]

const statusColors = {
  confirmed: 'bg-status-success/10 text-status-success',
  pending: 'bg-status-warning/10 text-status-warning',
  cancelled: 'bg-status-danger/10 text-status-danger',
  completed: 'bg-status-info/10 text-status-info',
}

const services = ['Consultation', 'Product Demo', 'Training Session', 'Support Call', 'On-site Visit']

export default function BookingsPage() {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month')
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-15'))
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return mockBookings.filter(b => b.date === dateStr)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-page-bg rounded-lg">
          {(['month', 'week', 'day', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md capitalize transition-all',
                viewMode === mode 
                  ? 'bg-white text-text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium w-48 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Booking Settings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <FileText className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardHeader>
        {showSettings && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium">Service name</label>
                <Input placeholder="Consultation" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Duration per slot</label>
                <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>1 hour</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Max bookings per slot</label>
                <Input type="number" defaultValue={1} className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Advance booking limit</label>
                <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                  <option>3 months</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Available days</label>
              <div className="flex gap-2 mt-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <label key={day} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded text-brand-indigo" />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium">Available from</label>
                <Input type="time" defaultValue="09:00" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Available until</label>
                <Input type="time" defaultValue="17:00" className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-card-border">
              {days.map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-text-secondary border-r border-card-border last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-24 p-2 border-r border-b border-card-border" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const bookings = getBookingsForDay(day)
                const isToday = currentDate.getDate() === day
                return (
                  <div 
                    key={day} 
                    className={cn(
                      'min-h-24 p-2 border-r border-b border-card-border',
                      isToday && 'bg-brand-indigo/5'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isToday ? 'bg-brand-indigo text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : 'text-text-secondary'
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {bookings.slice(0, 2).map(booking => (
                        <div 
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={cn(
                            'text-xs p-1 rounded cursor-pointer truncate',
                            booking.status === 'confirmed' && 'bg-status-success/10 text-status-success' ||
                            booking.status === 'pending' && 'bg-status-warning/10 text-status-warning' ||
                            booking.status === 'cancelled' && 'bg-status-danger/10 text-status-danger' ||
                            booking.status === 'completed' && 'bg-status-info/10 text-status-info'
                          )}
                        >
                          {booking.time} - {booking.customer}
                        </div>
                      ))}
                      {bookings.length > 2 && (
                        <div className="text-xs text-text-muted">+{bookings.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-card-border">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Date</th>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Time</th>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Customer</th>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Service</th>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Notes</th>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockBookings.map(booking => (
                  <tr key={booking.id} className="border-b border-card-border hover:bg-gray-50">
                    <td className="p-3 text-sm">{formatDate(booking.date)}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted" />
                        {booking.time}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-medium">{booking.customer}</p>
                        <p className="text-xs text-text-muted">{booking.email}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{booking.service}</td>
                    <td className="p-3">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[booking.status as keyof typeof statusColors])}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-text-muted max-w-xs truncate">{booking.notes || '—'}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Eye className="w-4 h-4 text-text-muted" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {mockBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <CalendarIcon className="w-16 h-16 text-text-muted mb-4" />
          <p className="text-text-muted mb-2">No bookings yet</p>
          <p className="text-sm text-text-muted mb-4">Bookings will appear here once customers schedule appointments</p>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] animate-fade-in">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted">Date & Time</p>
                  <p className="text-sm font-medium mt-1">
                    {formatDate(selectedBooking.date)} at {selectedBooking.time}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted">Service</p>
                  <p className="text-sm font-medium mt-1">{selectedBooking.service}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-text-muted mb-2">Customer Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedBooking.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedBooking.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedBooking.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea 
                  defaultValue={selectedBooking.notes}
                  placeholder="Add notes about this booking..."
                  className="mt-1.5 h-20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm"
                  defaultValue={selectedBooking.status}
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send reminder
                </Button>
                <Button variant="danger" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel booking
                </Button>
              </div>
              <Button className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Mark as complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}