'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Briefcase,
  Users 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock Data
const mockEvents = [
  {
    id: '1',
    title: 'Frontend Engineer Interview',
    date: '2026-03-20',
    time: '10:00 AM',
    type: 'video',
    company: 'Google',
    location: 'Zoom',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Technical Screening',
    date: '2026-03-22',
    time: '2:30 PM',
    type: 'phone',
    company: 'Microsoft',
    location: 'Phone Call',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Onsite Interview',
    date: '2026-03-25',
    time: '9:00 AM',
    type: 'onsite',
    company: 'Meta',
    location: 'San Francisco, CA',
    status: 'scheduled'
  }
]

const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  return Array.from(
    { length: new Date(year, month + 1, 0).getDate() }, 
    (_, i) => i + 1
  )
}

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay()
  const days = getDaysInMonth(new Date(year, month, 1))
  const calendarDays = []
  
  // Empty cells for previous month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ day: null, isCurrentMonth: false })
  }
  
  // Current month days
  days.forEach((day) => {
    calendarDays.push({ day, isCurrentMonth: true })
  })
  
  // Fill remaining cells with next month
  while (calendarDays.length < 42) {
    calendarDays.push({ day: null, isCurrentMonth: false })
  }
  
  return calendarDays
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState(mockEvents)
  const [selectedDate, setSelectedDate] = useState(null)
  
  const monthDays = getMonthDays(
    currentDate.getFullYear(), 
    currentDate.getMonth()
  )
  
  const today = new Date()
  const isToday = (day) => {
    if (!day) return false
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date)
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    setSelectedDate(null)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const formatDateString = (day) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'video': return '#3B82F6'
      case 'onsite': return '#10B981'
      case 'phone': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 pt-12">
          <div className="inline-flex items-center gap-6 mb-8 px-12 py-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl">
            <Calendar className="w-12 h-12 text-blue-500" />
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                Interviews
              </h1>
              <p className="text-gray-600 text-xl mt-3 font-semibold">
                {events.length} upcoming • {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Calendar */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl p-8">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => changeMonth('prev')}
                className="hover:bg-gray-100 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <h2 className="text-3xl font-black text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => changeMonth('next')}
                className="hover:bg-gray-100 hover:text-gray-900"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 mb-6 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-sm font-semibold text-gray-600 uppercase tracking-wide py-4">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((item, index) => {
                const dateString = item.day ? formatDateString(item.day) : ''
                const dayEvents = dateString ? getEventsForDate(dateString) : []
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => item.day && setSelectedDate(formatDateString(item.day))}
                    className={`
                      relative h-28 p-3 rounded-2xl border-2 transition-all duration-200 group hover:shadow-lg hover:scale-105 hover:z-10
                      ${item.isCurrentMonth 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-gray-200 hover:border-blue-200 hover:shadow-blue-100'
                        : 'bg-gray-50/50 border-gray-100 text-gray-400'
                      }
                      ${isToday(item.day) 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105 border-blue-300 ring-4 ring-blue-100/50' 
                        : ''
                      }
                      ${selectedDate === dateString
                        ? 'ring-4 ring-blue-200 shadow-2xl scale-110 bg-blue-100 border-blue-300' 
                        : ''
                      }
                    `}
                  >
                    <span className="font-bold text-lg">{item.day || ''}</span>
                    
                    {/* Event dots */}
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={event.id}
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-lg"
                        style={{ 
                          backgroundColor: getEventColor(event.type),
                          zIndex: 10 - i
                        }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="absolute -bottom-2 -right-4 text-xs text-gray-500 font-bold">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events Header */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl p-8 sticky top-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                Upcoming Interviews
              </h3>
              
              {selectedDate ? (
                <div>
                  <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                    <p className="text-4xl font-black text-gray-900 mb-2">
                      {selectedDate.split('-')[2]}<sup>th</sup>
                    </p>
                    <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
                      {monthNames[parseInt(selectedDate.split('-')[1]) - 1]}
                    </p>
                  </div>
                  
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="group border-l-4 border-blue-500 pl-6 py-6 hover:bg-blue-50/50 rounded-2xl transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              event.type === 'video' ? 'bg-blue-100 text-blue-700' :
                              event.type === 'onsite' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {event.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold text-gray-900">{event.company}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            {event.time}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No interviews scheduled</p>
                      <p className="text-sm mt-1">
                        for {selectedDate.split('-')[2]} {monthNames[parseInt(selectedDate.split('-')[1]) - 1]}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Users className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  <p className="text-xl font-semibold text-gray-600 mb-2">Click any date</p>
                  <p className="text-sm">to view scheduled interviews</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50/50 border border-emerald-200/50 rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/add-job">
                  <Button className="w-full h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl">
                    + Schedule New Interview
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-16 border-2 border-gray-200 hover:bg-gray-50 hover:shadow-md">
                  Export Calendar (.ics)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
