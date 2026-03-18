import { useState, useCallback, useRef } from 'react'
import UploadScreen from './components/upload/UploadScreen'
import AnalyzingScreen from './components/upload/AnalyzingScreen'
import ResultsScreen from './components/results/ResultsScreen'
import { readFile } from './utils/fileHelpers'
import { COMBINED_PROMPT, LANG_NAMES, PROGRESS_STEPS } from './constants/prompt'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function App() {
  const [screen, setScreen] = useState('upload')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const handleAnalyze = useCallback(async (files, textInput, language) => {
    setScreen('analyzing')
    setError('')

    let stepIdx = 0
    setProgress(PROGRESS_STEPS[0])
    const timer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, PROGRESS_STEPS.length - 1)
      setProgress(PROGRESS_STEPS[stepIdx])
    }, 3000)

    try {
      const contentBlocks = []

      if (files.length > 0) {
        const fileContents = await Promise.all(files.map(readFile))
        contentBlocks.push(...fileContents)
      }

      if (textInput.trim()) {
        contentBlocks.push({ type: 'text', text: `--- Business Problem Description ---\n${textInput.trim()}` })
      }

      let langInstruction
      if (language === 'auto') {
        langInstruction = '\n\nIMPORTANT: Detect the language of the input content and write ALL text fields in that same language. Do NOT translate to English unless the input is in English.'
      } else {
        langInstruction = `\n\nIMPORTANT: Write ALL text fields in ${LANG_NAMES[language]}. Every piece of text in the JSON must be in ${LANG_NAMES[language]}.`
      }

      contentBlocks.push({
        type: 'text',
        text: 'Analyze the above content. Generate the causal loop map AND the intervention strategy together in a single JSON response. Output ONLY valid JSON, nothing else.' + langInstruction
      })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-20250514',
          max_tokens: 8192,
          messages: [{
            role: 'user',
            content: [{ type: 'text', text: COMBINED_PROMPT }, ...contentBlocks]
          }]
        })
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`API error ${response.status}: ${errBody.slice(0, 200)}`)
      }

      const result = await response.json()
      if (result.stop_reason === 'max_tokens') {
        throw new Error('Response was truncated. Try with fewer or shorter files.')
      }

      const rawText = result.content?.find(c => c.type === 'text')?.text || ''
      const cleanJson = rawText
        .replace(/```json\s*|```\s*/g, '')
        .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '')
        .trim()

      let parsed
      try {
        parsed = JSON.parse(cleanJson)
      } catch {
        throw new Error('Failed to parse API response as JSON. Try again.')
      }

      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.connections) || parsed.nodes.length === 0) {
        throw new Error('Invalid response structure: missing or empty nodes/connections.')
      }

      setData(parsed)
      setScreen('results')
    } catch (err) {
      setError(err.message)
      setScreen('upload')
    } finally {
      clearInterval(timer)
    }
  }, [])

  const handleNewAnalysis = () => {
    setScreen('upload')
    setData(null)
    setError('')
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f4f0' }}>
      {screen === 'upload' && (
        <UploadScreen error={error} onAnalyze={handleAnalyze} />
      )}
      {screen === 'analyzing' && <AnalyzingScreen progress={progress} />}
      {screen === 'results' && data && (
        <ResultsScreen data={data} onNewAnalysis={handleNewAnalysis} />
      )}
    </div>
  )
}
