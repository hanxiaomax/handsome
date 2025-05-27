# World Clock - Design Specification

## Overview

A comprehensive world clock tool designed for global teams and remote workers. Helps users track multiple time zones simultaneously, schedule meetings across different regions, and visualize day/night cycles for better collaboration planning.

## Core Features

### Time Zone Management
- **Quick Add**: Search and add cities/regions by name
- **Popular Zones**: Pre-configured list of major business centers
- **Custom Labels**: Rename time zones with custom labels (e.g., "Team Lead - Tokyo")
- **Drag & Drop**: Reorder time zones by priority
- **Favorites**: Star frequently used time zones for quick access

### Time Display
- **Multiple Formats**: 12-hour, 24-hour, and relative time display
- **Live Updates**: Real-time clock updates every second
- **Date Information**: Show date with day of week
- **UTC Offset**: Display current UTC offset with DST indication
- **Time Difference**: Show relative time difference from local time

### Day/Night Visualization
- **Visual Indicators**: Color-coded backgrounds for day/night
- **Gradient Transitions**: Smooth color transitions for dawn/dusk
- **Sun Position**: Optional sun/moon icons based on time
- **Business Hours**: Highlight typical business hours (9 AM - 6 PM)
- **Weekend Indication**: Different styling for weekends

### Meeting Scheduler
- **Time Converter**: Convert meeting time across all added zones
- **Best Time Finder**: Suggest optimal meeting times for all participants
- **Business Hours Overlay**: Show which zones are in business hours
- **Calendar Integration**: Generate calendar events with multiple time zones
- **Share Links**: Generate shareable links for meeting times

### Additional Features
- **Current Location**: Auto-detect and add user's current time zone
- **Search History**: Remember recently searched locations
- **Export/Import**: Save and share time zone configurations
- **Notifications**: Set reminders for specific times in different zones
- **Compact Mode**: Minimal view for sidebar or widget use

## UI Layout Design

### Main View
```
┌─────────────────────────────────────────────────────────────┐
│ World Clock                                    [⚙️] [📤]    │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search cities, countries, or time zones...]       [+]   │
├─────────────────────────────────────────────────────────────┤
│ ⭐ Your Local Time                                          │
│ 🌅 New York, NY                    2:30 PM  Wed, Jan 15    │
│    EST (UTC-5) • 3 hours behind                            │
├─────────────────────────────────────────────────────────────┤
│ 🌞 London, UK                      7:30 PM  Wed, Jan 15    │
│    GMT (UTC+0) • 2 hours ahead                             │
├─────────────────────────────────────────────────────────────┤
│ 🌙 Tokyo, Japan                    4:30 AM  Thu, Jan 16    │
│    JST (UTC+9) • 11 hours ahead                            │
├─────────────────────────────────────────────────────────────┤
│ 🌃 Sydney, Australia               6:30 AM  Thu, Jan 16    │
│    AEDT (UTC+11) • 13 hours ahead                          │
└─────────────────────────────────────────────────────────────┘
```

### Meeting Scheduler View
```
┌─────────────────────────────────────────────────────────────┐
│ Meeting Scheduler                              [🔙 Back]    │
├─────────────────────────────────────────────────────────────┤
│ Select Meeting Time: [📅 Jan 15] [🕐 2:00 PM] [EST ▼]     │
├─────────────────────────────────────────────────────────────┤
│ Participant Time Zones:                                     │
│                                                             │
│ 🌅 New York, NY        2:00 PM  ✅ Business Hours          │
│ 🌞 London, UK          7:00 PM  ⚠️  After Hours            │
│ 🌙 Tokyo, Japan        4:00 AM  ❌ Night Time              │
│ 🌃 Sydney, Australia   6:00 AM  ⚠️  Early Morning          │
│                                                             │
│ [🎯 Find Best Time] [📋 Copy Times] [📅 Create Event]      │
└─────────────────────────────────────────────────────────────┘
```

### Compact Widget Mode
```
┌─────────────────────────────┐
│ 🌅 NYC  2:30 PM  Wed       │
│ 🌞 LON  7:30 PM  Wed       │
│ 🌙 TYO  4:30 AM  Thu       │
│ 🌃 SYD  6:30 AM  Thu       │
└─────────────────────────────┘
```

## Technical Implementation

### Core Data Structures

```typescript
interface TimeZone {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;          // IANA timezone identifier
  customLabel?: string;
  isFavorite: boolean;
  order: number;
  isLocal?: boolean;
}

interface TimeDisplay {
  timezone: TimeZone;
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  utcOffset: string;
  isDST: boolean;
  dayPeriod: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  isBusinessHours: boolean;
  isWeekend: boolean;
  relativeTime: string;      // "3 hours ahead"
}

interface MeetingTime {
  baseTime: Date;
  baseTimezone: string;
  participants: TimeDisplay[];
  score: number;             // 0-100, higher is better for all participants
  businessHoursCount: number;
  afterHoursCount: number;
  nightTimeCount: number;
}

interface WorldClockState {
  timeZones: TimeZone[];
  currentTime: Date;
  selectedTimezone: string;
  displayFormat: '12h' | '24h';
  showSeconds: boolean;
  showRelativeTime: boolean;
  compactMode: boolean;
  meetingScheduler: {
    isOpen: boolean;
    selectedDate: Date;
    selectedTime: string;
    selectedTimezone: string;
  };
}
```

### Time Zone Engine

```typescript
class WorldClockEngine {
  private timeZones: Map<string, TimeZone> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  
  // Time zone management
  addTimeZone(timezone: TimeZone): void {
    this.timeZones.set(timezone.id, timezone);
    this.saveToStorage();
  }
  
  removeTimeZone(id: string): void {
    this.timeZones.delete(id);
    this.saveToStorage();
  }
  
  reorderTimeZones(fromIndex: number, toIndex: number): void {
    // Implement drag & drop reordering
  }
  
  // Time calculations
  getCurrentTimeInZone(timezone: string): Date {
    return new Date().toLocaleString("en-US", { timeZone: timezone });
  }
  
  formatTime(date: Date, timezone: string, format: '12h' | '24h'): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: format === '12h'
    };
    return date.toLocaleString('en-US', options);
  }
  
  getRelativeTime(targetTimezone: string, baseTimezone: string): string {
    const now = new Date();
    const targetTime = new Date(now.toLocaleString("en-US", { timeZone: targetTimezone }));
    const baseTime = new Date(now.toLocaleString("en-US", { timeZone: baseTimezone }));
    
    const diffHours = (targetTime.getTime() - baseTime.getTime()) / (1000 * 60 * 60);
    
    if (diffHours === 0) return "Same time";
    if (diffHours > 0) return `${Math.abs(diffHours)} hours ahead`;
    return `${Math.abs(diffHours)} hours behind`;
  }
  
  // Day/Night calculation
  getDayPeriod(date: Date, timezone: string): 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date(date.toLocaleString("en-US", { timeZone: timezone })).getHours();
    
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  }
  
  isBusinessHours(date: Date, timezone: string): boolean {
    const localDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    const hour = localDate.getHours();
    const day = localDate.getDay();
    
    // Weekend check
    if (day === 0 || day === 6) return false;
    
    // Business hours: 9 AM - 6 PM
    return hour >= 9 && hour < 18;
  }
  
  // Meeting scheduler
  findBestMeetingTimes(
    date: Date, 
    timezones: string[], 
    duration: number = 60
  ): MeetingTime[] {
    const suggestions: MeetingTime[] = [];
    
    // Check every hour from 6 AM to 10 PM in each timezone
    for (let hour = 6; hour <= 22; hour++) {
      for (const tz of timezones) {
        const meetingTime = new Date(date);
        meetingTime.setHours(hour, 0, 0, 0);
        
        const participants = timezones.map(timezone => ({
          timezone: { timezone } as TimeZone,
          currentTime: new Date(meetingTime.toLocaleString("en-US", { timeZone: timezone })),
          // ... other TimeDisplay properties
        }));
        
        const score = this.calculateMeetingScore(participants);
        
        suggestions.push({
          baseTime: meetingTime,
          baseTimezone: tz,
          participants,
          score,
          businessHoursCount: participants.filter(p => this.isBusinessHours(p.currentTime, p.timezone.timezone)).length,
          afterHoursCount: 0, // Calculate based on business hours
          nightTimeCount: 0   // Calculate based on day period
        });
      }
    }
    
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  }
  
  private calculateMeetingScore(participants: TimeDisplay[]): number {
    let score = 0;
    
    participants.forEach(participant => {
      if (participant.isBusinessHours) score += 30;
      else if (participant.dayPeriod === 'morning' || participant.dayPeriod === 'afternoon') score += 20;
      else if (participant.dayPeriod === 'evening') score += 10;
      else if (participant.dayPeriod === 'dawn') score += 5;
      // Night time gets 0 points
      
      if (!participant.isWeekend) score += 10;
    });
    
    return Math.min(100, score / participants.length);
  }
  
  // Storage
  private saveToStorage(): void {
    localStorage.setItem('world-clock-timezones', JSON.stringify(Array.from(this.timeZones.values())));
  }
  
  loadFromStorage(): void {
    const stored = localStorage.getItem('world-clock-timezones');
    if (stored) {
      const timezones: TimeZone[] = JSON.parse(stored);
      timezones.forEach(tz => this.timeZones.set(tz.id, tz));
    }
  }
}
```

## Component Architecture

### Main World Clock Component
```typescript
// tools/world-clock/ui.tsx
export default function WorldClock() {
  const [state, setState] = useState<WorldClockState>(initialState);
  const [timeDisplays, setTimeDisplays] = useState<TimeDisplay[]>([]);
  const engine = useRef(new WorldClockEngine());
  
  // Update times every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateAllTimes();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.timeZones]);
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>World Clock</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleSettings}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportConfig}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TimeZoneSearch onAddTimeZone={handleAddTimeZone} />
        <TimeZoneList 
          timeDisplays={timeDisplays}
          onRemove={handleRemoveTimeZone}
          onReorder={handleReorderTimeZones}
          onToggleFavorite={handleToggleFavorite}
        />
        <MeetingScheduler 
          isOpen={state.meetingScheduler.isOpen}
          timeZones={state.timeZones}
          onClose={() => setState(s => ({ ...s, meetingScheduler: { ...s.meetingScheduler, isOpen: false } }))}
        />
      </CardContent>
    </Card>
  );
}
```

### Custom Components
- **TimeZoneSearch**: Search and add new time zones
- **TimeZoneList**: Display all added time zones with live updates
- **TimeZoneCard**: Individual time zone display with day/night styling
- **MeetingScheduler**: Meeting time planning interface
- **TimeConverter**: Convert specific times across zones
- **SettingsPanel**: Display format and behavior settings

## Day/Night Visual Design

### Color Scheme
```css
/* Day periods with gradient backgrounds */
.time-card.dawn {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
}

.time-card.morning {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.time-card.afternoon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.time-card.evening {
  background: linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%);
}

.time-card.night {
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
}

/* Business hours indicator */
.business-hours {
  border-left: 4px solid #10b981;
}

.after-hours {
  border-left: 4px solid #f59e0b;
}

.night-time {
  border-left: 4px solid #ef4444;
}
```

### Icons and Indicators
- **🌅 Dawn**: 5 AM - 7 AM
- **🌞 Morning**: 7 AM - 12 PM  
- **☀️ Afternoon**: 12 PM - 5 PM
- **🌆 Evening**: 5 PM - 8 PM
- **🌙 Night**: 8 PM - 5 AM
- **💼 Business Hours**: Green indicator
- **⚠️ After Hours**: Yellow indicator
- **❌ Night Time**: Red indicator

## Responsive Design

### Desktop Layout (≥1024px)
- Grid layout with 2-3 time zones per row
- Full meeting scheduler interface
- Detailed time information display

### Tablet Layout (768px-1023px)
- Single column layout
- Collapsible meeting scheduler
- Touch-friendly controls

### Mobile Layout (<768px)
- Compact card design
- Swipe gestures for reordering
- Bottom sheet for meeting scheduler
- Simplified time display

## Accessibility Features

### Screen Reader Support
- Proper ARIA labels for all time displays
- Live regions for time updates
- Descriptive text for day/night periods

### Keyboard Navigation
- Tab navigation through all time zones
- Enter to expand/collapse details
- Arrow keys for reordering
- Escape to close modals

### Visual Accessibility
- High contrast mode support
- Scalable fonts and icons
- Color-blind friendly indicators
- Focus indicators

## Performance Considerations

### Optimization Strategies
- Efficient time calculation caching
- Debounced search input
- Virtual scrolling for large lists
- Lazy loading of time zone data

### Memory Management
- Cleanup of intervals on unmount
- Efficient re-rendering with React.memo
- Minimal state updates for time changes

## Testing Requirements

### Unit Tests
- Time zone conversion accuracy
- Day/night period calculation
- Meeting time scoring algorithm
- Storage persistence

### Integration Tests
- Search functionality
- Drag and drop reordering
- Meeting scheduler workflow
- Export/import features

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Focus management
- Color contrast validation

---

**Implementation Priority**: Essential tool for global teams and remote work coordination. Provides immediate value for scheduling and time zone awareness. 