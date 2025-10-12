'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarIcon, Filter } from 'lucide-react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

const PRESET_RANGES = [
  {
    label: "Aujourd'hui",
    value: 'today',
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: "Cette Semaine",
    value: 'thisWeek',
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: "Ce Mois-ci",
    value: 'thisMonth',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: "7 derniers jours",
    value: 'last7Days',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "30 derniers jours",
    value: 'last30Days',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "Semaine dernière",
    value: 'lastWeek',
    getRange: () => {
      const lastWeek = subWeeks(new Date(), 1)
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 })
      }
    }
  },
  {
    label: "Mois dernier",
    value: 'lastMonth',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      }
    }
  }
]

export default function DateRangeFilter({ onDateRangeChange, className }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState('today')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()

  // Initialiser avec "Aujourd'hui"
  useEffect(() => {
    const todayRange = PRESET_RANGES[0].getRange()
    onDateRangeChange(todayRange)
  }, [onDateRangeChange])

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue)
    setIsCustomMode(false)
    
    const preset = PRESET_RANGES.find(p => p.value === presetValue)
    if (preset) {
      const range = preset.getRange()
      onDateRangeChange(range)
    }
  }

  const handleCustomDateChange = () => {
    if (fromDate && toDate) {
      const range = {
        from: startOfDay(fromDate),
        to: endOfDay(toDate)
      }
      setCustomRange(range)
      onDateRangeChange(range)
      setIsCustomMode(true)
      setSelectedPreset('')
    }
  }

  const getCurrentRangeLabel = () => {
    if (isCustomMode && customRange) {
      return `${format(customRange.from, 'dd/MM/yyyy', { locale: fr })} - ${format(customRange.to, 'dd/MM/yyyy', { locale: fr })}`
    }
    
    const preset = PRESET_RANGES.find(p => p.value === selectedPreset)
    return preset?.label || "Sélectionner une période"
  }

  const getCurrentRange = () => {
    if (isCustomMode && customRange) {
      return customRange
    }
    
    const preset = PRESET_RANGES.find(p => p.value === selectedPreset)
    return preset?.getRange()
  }

  const range = getCurrentRange()

  return (
    <Card className={cn("border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50", className)}>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Boutons de période prédéfinie */}
          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.slice(0, 3).map((preset) => (
              <Button
                key={preset.value}
                variant={selectedPreset === preset.value && !isCustomMode ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange(preset.value)}
                className={cn(
                  "text-xs font-medium transition-all",
                  selectedPreset === preset.value && !isCustomMode
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white hover:bg-blue-50 text-gray-700 border-gray-200"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Sélecteur de dates personnalisé - Version simplifiée */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">De:</span>
            <input
              type="date"
              value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
              max={toDate ? format(toDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <span className="text-sm text-gray-600 font-medium">à:</span>
            <input
              type="date"
              value={toDate ? format(toDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
              min={fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              onClick={handleCustomDateChange}
              disabled={!fromDate || !toDate}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtrer
            </Button>
          </div>
        </div>

        {/* Affichage de la période sélectionnée */}
        {range && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Période sélectionnée: {getCurrentRangeLabel()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} jour(s)
              </div>
            </div>
          </div>
        )}

        {/* Raccourcis supplémentaires */}
        <div className="mt-3 flex flex-wrap gap-1">
          {PRESET_RANGES.slice(3).map((preset) => (
            <Button
              key={preset.value}
              variant="ghost"
              size="sm"
              onClick={() => handlePresetChange(preset.value)}
              className={cn(
                "text-xs h-7 px-2",
                selectedPreset === preset.value && !isCustomMode
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
