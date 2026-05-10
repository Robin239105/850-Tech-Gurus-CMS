export interface Client {
  id: string
  name: string
  email: string
  phone: string
  website: string
  company: string
  category: string
  plan: 'Starter' | 'Pro' | 'Business' | 'Enterprise'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  storage: number
  storageLimit: number
  pages: number
  createdAt: string
  lastActive: string
  avatar?: string
  notes?: string
}

export interface Activity {
  id: string
  type: 'login' | 'page_created' | 'page_updated' | 'media_uploaded' | 'form_submitted' | 'order_created' | 'client_added' | 'settings_changed' | 'ticket_created'
  description: string
  client?: string
  user: string
  timestamp: string
}

export interface Ticket {
  id: string
  subject: string
  description: string
  client: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  assignedTo?: string
}

export interface SystemService {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: number
  responseTime: number
  sparkline: number[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  timestamp: string
  read: boolean
}

export interface Plan {
  name: string
  price: number
  features: string[]
  recommended?: boolean
}