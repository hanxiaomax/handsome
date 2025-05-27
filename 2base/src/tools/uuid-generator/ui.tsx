import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Copy, RotateCcw, Plus, Check } from 'lucide-react'
import { ToolLayout } from '@/components/layout/tool-layout'
import { UUIDGenerator, type UUIDGeneratorState, type UUIDFormat } from './lib'
import { toolInfo } from './toolInfo'

const initialState: UUIDGeneratorState = {
  config: {
    version: 4,
    quantity: 1,
    format: 'standard'
  },
  generatedUUIDs: [],
  isGenerating: false
}

function UUIDGeneratorTool() {
  const [state, setState] = useState<UUIDGeneratorState>(initialState)
  const [copiedUUID, setCopiedUUID] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const generator = useRef(new UUIDGenerator())
  
  const handleGenerate = useCallback(() => {
    setState(s => ({ ...s, isGenerating: true }))
    
    try {
      const results = generator.current.generateBatch(state.config)
      setState(s => ({
        ...s,
        generatedUUIDs: results,
        isGenerating: false
      }))
    } catch (error) {
      setState(s => ({ ...s, isGenerating: false }))
      console.error('UUID generation failed:', error)
    }
  }, [state.config])
  
  const handleCopyAll = useCallback(() => {
    const allUUIDs = state.generatedUUIDs.map(u => u.uuid).join('\n')
    navigator.clipboard.writeText(allUUIDs)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }, [state.generatedUUIDs])
  
  const handleCopyUUID = useCallback((uuid: string) => {
    navigator.clipboard.writeText(uuid)
    setCopiedUUID(uuid)
    setTimeout(() => setCopiedUUID(null), 2000)
  }, [])
  
  const handleClear = useCallback(() => {
    setState(s => ({ ...s, generatedUUIDs: [] }))
    setCopiedUUID(null)
    setCopiedAll(false)
  }, [])
  
  const handleVersionChange = useCallback((value: string) => {
    setState(s => ({
      ...s,
      config: { ...s.config, version: parseInt(value) as 1 | 4 | 7 }
    }))
  }, [])
  
  const handleFormatChange = useCallback((value: string) => {
    setState(s => ({
      ...s,
      config: { ...s.config, format: value as UUIDFormat }
    }))
  }, [])
  
  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
    setState(s => ({
      ...s,
      config: { ...s.config, quantity }
    }))
  }, [])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        handleGenerate()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && state.generatedUUIDs.length > 0) {
        e.preventDefault()
        handleCopyAll()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleGenerate()
      } else if (e.key === 'Escape' && state.generatedUUIDs.length > 0) {
        e.preventDefault()
        handleClear()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGenerate, handleCopyAll, handleClear, state.generatedUUIDs.length])
  
  const getVersionLabel = (version: number) => {
    switch (version) {
      case 1: return 'v1 Time'
      case 7: return 'v7 Unix'
      default: return 'v4 Random'
    }
  }
  
  const getFormatLabel = (format: UUIDFormat) => {
    switch (format) {
      case 'uppercase': return 'Uppercase'
      case 'no-hyphens': return 'No Hyphens'
      case 'braces': return 'Braces'
      default: return 'Standard'
    }
  }

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
    >
      <div className="p-6">
        <Card className="w-full">
          <CardContent className="p-6 space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={state.config.version.toString()} onValueChange={handleVersionChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">v4 Random</SelectItem>
                  <SelectItem value="1">v1 Time</SelectItem>
                  <SelectItem value="7">v7 Unix</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={state.config.format} onValueChange={handleFormatChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="no-hyphens">No Hyphens</SelectItem>
                  <SelectItem value="braces">Braces</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Qty:</span>
                <Input 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={state.config.quantity}
                  onChange={handleQuantityChange}
                  className="w-20"
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={state.isGenerating}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {state.config.quantity === 1 ? 'Generate UUID' : 'Generate UUIDs'}
              </Button>
            </div>
            
            {/* Output */}
            {state.generatedUUIDs.length > 0 && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30 min-h-[120px] max-h-[400px] overflow-y-auto">
                  <div className="space-y-1">
                    {state.generatedUUIDs.map((item) => (
                      <div 
                        key={item.id}
                        className="font-mono text-sm py-2 px-3 cursor-pointer hover:bg-accent rounded-md transition-colors group flex items-center justify-between"
                        onClick={() => handleCopyUUID(item.uuid)}
                        title="Click to copy"
                      >
                        <span className="select-all">{item.uuid}</span>
                        {copiedUUID === item.uuid ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCopyAll}
                    className="flex items-center gap-2"
                  >
                    {copiedAll ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy All
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleGenerate}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Generate More
                  </Button>
                </div>
                
                {/* Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Generated {state.generatedUUIDs.length} UUID{state.generatedUUIDs.length > 1 ? 's' : ''} using {getVersionLabel(state.config.version)} in {getFormatLabel(state.config.format)} format</div>
                  <div className="flex flex-wrap gap-4">
                    <span>Spacebar: Generate</span>
                    <span>Ctrl+C: Copy All</span>
                    <span>Ctrl+Enter: Generate More</span>
                    <span>Escape: Clear</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {state.generatedUUIDs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg font-medium mb-2">Ready to Generate UUIDs</div>
                <div className="text-sm">
                  Click "Generate UUID" or press Spacebar to create {state.config.quantity === 1 ? 'a' : state.config.quantity} {getVersionLabel(state.config.version)} UUID{state.config.quantity > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}

export default UUIDGeneratorTool 