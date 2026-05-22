'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runAudit } from '../../lib/auditEngine'

export default function ResultsPage() {
  const router = useRouter()

  const [auditData, setAuditData] = useState(null)
  const [storedFormData, setStoredFormData] = useState(null)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [reportId, setReportId] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    setMounted(true)

    const input = localStorage.getItem('audit_input')

    if (!input) {
      router.push('/')
      return
    }

    const formData = JSON.parse(input)
    setStoredFormData(formData)
    const result = runAudit(formData)
    setAuditData(result)

    createShareableReport(result, formData, null)

    fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
  reportData: result,
  formData,
}),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.summary) {
          setSummary(d.summary)
        } else {
          setSummary(generateFallbackSummary(result))
        }
        setSummaryLoading(false)
      })
      .catch(() => {
        setSummary(generateFallbackSummary(result))
        setSummaryLoading(false)
      })
  }, [])

  const createShareableReport = async (result, formData, email) => {
    try {
      console.log("SENDING FORM DATA:", formData);
      console.log("SENDING EMAIL:", email);
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData: result,
          formData,
          email: email || null,
        }),
      })

      const data = await response.json()

      if (data.id) {
        setReportId(data.id)
      } else {
        console.error('Failed to create report:', data.error)
      }
    } catch (error) {
      console.error('Error creating shareable report:', error)
    }
  }

  const copyShareLink = async () => {
    if (!reportId) {
      setNotification({ show: true, message: 'Report is still loading...', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      return
    }

    const url = `${window.location.origin}/report/${reportId}`

    try {
      await navigator.clipboard.writeText(url)
      setNotification({ show: true, message: '✅ Share link copied to clipboard!', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    } catch (error) {
      console.error('Failed to copy:', error)
      setNotification({ show: true, message: '❌ Failed to copy link', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  if (!mounted || !auditData)
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300">Generating your audit...</p>
        </div>
      </div>
    )

  const { results, totalMonthlySaving, totalAnnualSaving, totalCurrentSpend, isOptimal } = auditData

  const highSavings = totalMonthlySaving > 500
  const lowSavings = totalMonthlySaving < 100

  return (
    <main className="relative overflow-hidden min-h-screen bg-[#0B1120] text-white">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[800px] h-[900px] bg-sky-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-16">
        
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent"
            style={{
              WebkitTextStroke: "1px rgba(10, 10, 81, 0.35)",
            }}>
            CredexIQ
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="group relative px-6 py-2.5 rounded-xl overflow-hidden font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition-all" />
            <div className="absolute inset-0 border border-white/20 rounded-xl group-hover:border-white/40 transition-colors" />
            <span className="relative text-sm text-gray-200 group-hover:text-white flex items-center gap-2">↻ New Audit</span>
          </button>
        </div>

        {/* Main Savings Block */}
        <div className={`rounded-3xl p-10 mb-10 backdrop-blur-xl border transition-all duration-500 ${
          isOptimal
            ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border-blue-400/20'
            : highSavings
            ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/10 border-green-400/20'
            : 'bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border-blue-400/20'
        }`}>
          {isOptimal ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">You're Optimized</h1>
              <p className="text-gray-300 text-lg">Your AI tool stack is well-configured. No major changes needed.</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-300 text-sm uppercase tracking-widest mb-2">Potential Monthly Savings</p>
              <h1 className="text-5xl sm:text-6xl font-black mb-3 bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                ${totalMonthlySaving.toFixed(0)}
              </h1>
              <p className="text-gray-300 text-lg">
                That's <span className="font-bold text-white">${totalAnnualSaving.toFixed(0)}/year</span> on a <span className="font-bold text-white">${totalCurrentSpend.toFixed(0)}/month</span> stack
              </p>
            </div>
          )}
        </div>

        {/* Share Link Section */}
        {mounted && reportId && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Share this audit</p>
              <p className="text-sm text-gray-400">Public link with sensitive data removed</p>
            </div>
            <button
              onClick={copyShareLink}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all"
            >
              Copy Link
            </button>
          </div>
        )}

        {mounted && !reportId && (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <p className="text-gray-400 text-sm">Creating shareable link...</p>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">📌 Audit Summary</h3>
          {summaryLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-full"></div>
              <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700/50 rounded w-4/6"></div>
            </div>
          ) : (
            <p className="text-gray-300 leading-relaxed">{summary}</p>
          )}
        </div>

        {/* Detailed Results */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">📊 AI Tool Analysis</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.toolId} className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{result.toolName}</h4>
                    <p className="text-sm text-gray-400">{result.plan}</p>
                  </div>
                  {result.totalSaving > 0 && (
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-400">
                        ${result.totalSaving.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-400">savings/month</p>
                    </div>
                  )}
                </div>

                {result.recommendations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">✓ This tool is well-optimized</p>
                ) : (
                  <ul className="space-y-2 mt-4 pt-4 border-t border-white/10">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-400 flex-shrink-0 mt-1">→</span>
                        <span>{rec.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email CTA */}
        <div className="bg-gradient-to-br from-blue-600/30 to-indigo-600/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-2">
            {lowSavings ? '🔔 Stay Updated' : '📧 Get Your Full Report'}
          </h3>
          <p className="text-gray-300 mb-6">
            {lowSavings
              ? "You're in great shape. Get notified when new optimizations apply to your stack."
              : "We'll email you a detailed breakdown and notify you when better pricing becomes available."}
          </p>
          <button
            onClick={() => setShowEmailModal(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all"
          >
            {lowSavings ? 'Notify Me of Savings →' : 'Email Me This Report →'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs">
          <p>CredexIQ © 2026</p>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
  <EmailModal
    auditData={auditData}
    reportId={reportId}
    onClose={() => setShowEmailModal(false)}
    onEmailSubmitted={(email) => {
      setUserEmail(email)
      // Recreate report with email now that we have it
      createShareableReport(auditData, storedFormData, email)
    }}
  />
)}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] max-w-sm ${
          notification.type === 'success'
            ? 'bg-green-600/20 border-green-500/30 text-green-300'
            : 'bg-red-600/20 border-red-500/30 text-red-300'
        }`}>
          {notification.message}
        </div>
      )}
    </main>
  )
}

function generateFallbackSummary(result) {
  const savings = result.totalMonthlySaving;
  const spend = result.totalCurrentSpend;
  const annual = result.totalAnnualSaving;

  if (result.isOptimal) {
    return `Your AI stack appears well optimized for your current workflow. Based on the tools and pricing analyzed, there are no major inefficiencies or overlapping subscriptions detected at this time. You're currently spending approximately $${spend.toFixed(
      0
    )}/month across your AI tooling setup, which aligns reasonably well with your usage profile. CredexIQ recommends periodically reviewing usage patterns and pricing changes to maintain long-term efficiency as AI tooling evolves.`;
  }

  if (savings > 500) {
    return `Your audit uncovered significant optimization opportunities across your AI tooling stack. You're currently spending approximately $${spend.toFixed(
      0
    )}/month, with potential savings of around $${savings.toFixed(
      0
    )}/month — equivalent to nearly $${annual.toFixed(
      0
    )}/year in reduced software costs. Several recommendations focus on eliminating overlapping functionality, reducing over-provisioned plans, and aligning subscriptions more closely with actual usage requirements. Implementing these optimizations could substantially improve overall cost efficiency without impacting productivity.`;
  }

  return `Your AI spend audit identified several moderate optimization opportunities within your current stack. You're currently spending approximately $${spend.toFixed(
    0
  )}/month, with estimated savings of around $${savings.toFixed(
    0
  )}/month available through plan adjustments and better subscription alignment. While your current setup remains functional, certain tools appear slightly over-provisioned for the stated use case. Applying the recommended optimizations could improve long-term cost efficiency while maintaining the same overall workflow quality and productivity.`;
}

function EmailModal({
  auditData,
  reportId,
  onClose,
  onEmailSubmitted,
}) {
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    role: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate inputs
    if (!formData.email || !formData.company || !formData.role) {
      setMessage('❌ Please fill in all fields.')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      // Call the correct API endpoint
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  email: formData.email,
  company: formData.company,
  role: formData.role,
  monthlySaving: auditData.totalMonthlySaving,
  annualSaving: auditData.totalAnnualSaving,
  reportId,
}),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('✅ Report sent! Check your email.')
        setMessageType('success')
        // Notify parent that email was submitted
        onEmailSubmitted(formData.email)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setMessage(`❌ ${data.error || 'Something went wrong. Try again.'}`)
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Failed to send. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1120] border border-white/20 rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-2">Get Your Report</h3>
        <p className="text-gray-400 text-sm mb-6">Enter your details to receive optimization insights.</p>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success' 
              ? 'bg-green-600/20 border border-green-500/30 text-green-300'
              : 'bg-red-600/20 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Company</label>
            <input
              type="text"
              name="company"
              placeholder="Your Company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Role</label>
            <input
              type="text"
              name="role"
              placeholder="Your Role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}