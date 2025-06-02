import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { MapPin, Clock } from 'lucide-react'
import { ToolWrapper } from '@/components/common/tool-wrapper'
import { CompactTimeZoneCard } from './components/compact-timezone-card'
import { TimeZoneSearch } from './components/timezone-search'
import { TimelineVisualization } from './components/timeline-visualization'
import { TimePicker } from './components/time-picker'
import { WorldClockEngine, type WorldClockState, type TimeDisplay, type TimeZone, POPULAR_TIMEZONES } from './lib'
import { toolInfo } from './toolInfo'

const initialState: WorldClockState = {
  timeZones: [],
  currentTime: new Date(),
  selectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  baseTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  displayFormat: '12h',
  showSeconds: false,
  showRelativeTime: true,
  compactMode: false,
  workingHours: { start: 9, end: 18 },
  meetingMode: false,
  customTime: null,
  meetingScheduler: {
    isOpen: false,
    selectedDate: new Date(),
    selectedTime: '14:00',
    selectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export default function WorldClock() {
  const [state, setState] = useState<WorldClockState>(initialState)
  const [timeDisplays, setTimeDisplays] = useState<TimeDisplay[]>([])
  const [searchResults, setSearchResults] = useState(POPULAR_TIMEZONES)
  const [isSearching, setIsSearching] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const engine = useRef(new WorldClockEngine())



  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Initialize with existing timezones, add local timezone if none exist
  useEffect(() => {
    const existingTimeZones = engine.current.getTimeZones()
    
    // If no timezones exist, add local timezone
    if (existingTimeZones.length === 0) {
      const localTz = engine.current.addLocalTimeZone()
      if (localTz) {
        setState(s => ({ ...s, timeZones: [localTz] }))
      } else {
        setState(s => ({ ...s, timeZones: [] }))
      }
    } else {
      setState(s => ({ ...s, timeZones: existingTimeZones }))
    }
  }, [])

  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date()
      setState(s => ({ ...s, currentTime: now }))
      
      // Use custom time if in meeting mode, otherwise use current time
      const displayTime = state.meetingMode && state.customTime ? state.customTime : now
      
      const displays = state.timeZones.map(tz => 
        engine.current.generateTimeDisplay(tz, displayTime, state.displayFormat, state.showSeconds, state.workingHours)
      )
      setTimeDisplays(displays)
    }

    updateTimes() // Initial update
    const interval = setInterval(updateTimes, 1000)
    
    return () => clearInterval(interval)
  }, [state.timeZones, state.displayFormat, state.showSeconds, state.meetingMode, state.customTime])

  // Time zone management
  const handleAddTimeZone = useCallback((timezone: Omit<TimeZone, 'id' | 'order' | 'isFavorite'>) => {
    // Check if timezone already exists
    const exists = state.timeZones.some(tz => tz.timezone === timezone.timezone)
    if (exists) return

    const newTimeZone = engine.current.addTimeZone({ ...timezone, isFavorite: false })
    setState(s => ({
      ...s,
      timeZones: [...s.timeZones, newTimeZone]
    }))
  }, [state.timeZones])

  const handleRemoveTimeZone = useCallback((id: string) => {
    engine.current.removeTimeZone(id)
    setState(s => ({
      ...s,
      timeZones: s.timeZones.filter(tz => tz.id !== id)
    }))
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    const timezone = state.timeZones.find(tz => tz.id === id)
    if (timezone) {
      engine.current.updateTimeZone(id, { isFavorite: !timezone.isFavorite })
      setState(s => ({
        ...s,
        timeZones: s.timeZones.map(tz => 
          tz.id === id ? { ...tz, isFavorite: !tz.isFavorite } : tz
        )
      }))
    }
  }, [state.timeZones])

  const handleUpdateLabel = useCallback((id: string, label: string) => {
    engine.current.updateTimeZone(id, { customLabel: label })
    setState(s => ({
      ...s,
      timeZones: s.timeZones.map(tz => 
        tz.id === id ? { ...tz, customLabel: label } : tz
      )
    }))
  }, [])

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      const results = engine.current.searchTimeZones(query)
      setSearchResults(results)
      setIsSearching(false)
    }, 200)
  }, [])

  // Settings handlers
  const handleFormatChange = useCallback((format: '12h' | '24h') => {
    setState(s => ({ ...s, displayFormat: format }))
  }, [])



  const handleWorkingHoursChange = useCallback((workingHours: { start: number; end: number }) => {
    setState(s => ({ ...s, workingHours }))
  }, [])

  const handleMeetingModeChange = useCallback((meetingMode: boolean) => {
    setState(s => ({ ...s, meetingMode, customTime: meetingMode ? s.customTime : null }))
  }, [])

  const handleCustomTimeChange = useCallback((customTime: Date) => {
    setState(s => ({ ...s, customTime }))
  }, [])

  const handleResetTime = useCallback(() => {
    setState(s => ({ ...s, customTime: null }))
  }, [])





  return (
    <ToolWrapper toolInfo={toolInfo} state={{ worldClockState: state }}>
    
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Main interface - NO Card wrapper */}
        <div className="space-y-6">
          {/* Header controls */}
          <div className="space-y-4">
            {/* Search and Meeting Mode */}
            <div className="flex items-center justify-between">
              <TimeZoneSearch
                onAddTimeZone={handleAddTimeZone}
                searchResults={searchResults}
                onSearch={handleSearch}
                isSearching={isSearching}
              />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Meeting Mode</Label>
                  <Switch
                    checked={state.meetingMode}
                    onCheckedChange={handleMeetingModeChange}
                  />
                </div>
                

              </div>
            </div>

            {/* Meeting Mode Controls */}
            {state.meetingMode && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Time Picker */}
                    <div>
                      <TimePicker
                        currentTime={state.currentTime}
                        customTime={state.customTime}
                        onTimeChange={handleCustomTimeChange}
                        onReset={handleResetTime}
                      />
                    </div>
                    
                    {/* Display Settings */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Display</Label>
                        <div className="space-y-2">
                          <Select value={state.displayFormat} onValueChange={handleFormatChange}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12h">12-hour</SelectItem>
                              <SelectItem value="24h">24-hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Working Hours */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Working Hours</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Select 
                            value={state.workingHours.start.toString()} 
                            onValueChange={(value) => 
                              handleWorkingHoursChange({ ...state.workingHours, start: parseInt(value) })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i.toString().padStart(2, '0')}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={state.workingHours.end.toString()} 
                            onValueChange={(value) => 
                              handleWorkingHoursChange({ ...state.workingHours, end: parseInt(value) })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i.toString().padStart(2, '0')}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline visualization - only in meeting mode */}
          {state.meetingMode && timeDisplays.length > 0 && (
            <TimelineVisualization
              timeDisplays={timeDisplays}
              workingHours={state.workingHours}
              currentHour={(state.customTime || state.currentTime).getHours()}
            />
          )}

          {/* Time zones grid */}
          {timeDisplays.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {timeDisplays.map((timeDisplay) => (
                <CompactTimeZoneCard
                  key={timeDisplay.timezone.id}
                  timeDisplay={timeDisplay}
                  onRemove={handleRemoveTimeZone}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateLabel={handleUpdateLabel}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-base font-medium mb-2">No Time Zones Added</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Search and add time zones to track multiple locations
                </p>
                <Button
                  onClick={() => {
                    const localTz = engine.current.addLocalTimeZone()
                    if (localTz) {
                      const updatedTimeZones = engine.current.getTimeZones()
                      setState(s => ({ ...s, timeZones: updatedTimeZones }))
                    }
                  }}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Add Your Local Time
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick help - CAN use Card */}
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-6 flex-wrap">
                <span>● Business hours</span>
                <span>◯ Night time</span>
                <span>◐ After hours</span>
                <span>▢ Weekend</span>
                <span>★ Click to favorite</span>
                <span>✏ Click name to edit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolWrapper>
  )
} 