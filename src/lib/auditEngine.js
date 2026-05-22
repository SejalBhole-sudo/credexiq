import { OFFICIAL_PRICING } from "@/data/pricingData"

// The main function — takes the form input, returns audit results
export function runAudit(formData) {
  const { tools, teamSize, useCase } = formData
  const results = []

  for (const [toolId, toolData] of Object.entries(tools)) {
    const { plan, seats, monthlySpend } = toolData
    const currentSpend = parseFloat(monthlySpend) || 0
    const toolPricing = OFFICIAL_PRICING[toolId]
    
    if (!toolPricing || !toolPricing[plan]) continue

    const officialCostPerSeat = toolPricing[plan].pricePerSeat
    const officialTotalCost = officialCostPerSeat * seats

    const recommendations = []

    // RULE 1: Are they overpaying vs official pricing?
    if (currentSpend > officialTotalCost * 1.1 && officialTotalCost > 0) {
      recommendations.push({
        type: 'overpaying_retail',
        message: `You're paying $${currentSpend}/mo but the official rate for ${seats} seat(s) on ${plan} is $${officialTotalCost}/mo.`,
        saving: currentSpend - officialTotalCost
      })
    }

    // RULE 2: Team plan for too few users
    if (toolId === 'claude' && plan === 'Team' && seats < 5) {
      recommendations.push({
        type: 'wrong_plan',
        message: `Claude Team requires a minimum of 5 seats. With ${seats} user(s), Pro at $20/seat saves you money.`,
        saving: currentSpend - 20 * seats
      })
    }

    if (toolId === 'chatgpt' && plan === 'Team' && seats === 1) {
      recommendations.push({
        type: 'wrong_plan',
        message: `ChatGPT Team is $30/mo for solo users. Plus at $20/mo is identical for a single user.`,
        saving: 10
      })
    }

    // RULE 3: Cheaper same-vendor plan available
    if (toolId === 'cursor' && plan === 'Business' && seats <= 2) {
      recommendations.push({
        type: 'downgrade',
        message: `Cursor Business at $40/seat is overkill for ${seats} user(s). Pro at $20/seat covers all core features for small teams.`,
        saving: (40 - 20) * seats
      })
    }

    if (
  toolId === 'claude' &&
  (plan === 'Max5' || plan === 'Max20') &&
  useCase !== 'coding'
) {
  const actualPrice = plan === 'Max20' ? 200 : 100

  recommendations.push({
    type: 'downgrade',
    message: `Claude ${plan} is designed for extremely heavy usage. For ${useCase}, Claude Pro at $20/mo is likely sufficient.`,
    saving: (actualPrice - 20) * seats
  })
}

    // RULE 4: Cross-tool redundancy
    const toolIds = Object.keys(tools)
    if (toolId === 'chatgpt' && toolIds.includes('claude') && useCase === 'coding') {
      recommendations.push({
        type: 'redundant',
        message: `For coding use cases, Claude outperforms ChatGPT on most benchmarks. Running both is likely redundant — consolidating saves $${currentSpend}/mo.`,
        saving: currentSpend
      })
    }

    if (toolId === 'github_copilot' && toolIds.includes('cursor') && useCase === 'coding') {
      recommendations.push({
        type: 'redundant',
        message: `Cursor includes AI coding assistance built-in. GitHub Copilot alongside Cursor is redundant for most coding workflows.`,
        saving: currentSpend
      })
    }

    // RULE 5: Credits opportunity (Credex hook)
    if (currentSpend >= 100) {
      recommendations.push({
        type: 'credits_opportunity',
        message: `Spending $${currentSpend}/mo on ${toolId.replace('_', ' ')}? CredexIQ offers discounted credits from companies that overforecasted — potential 20–40% savings.`,
        saving: currentSpend * 0.25 // conservative 25% estimate
      })
    }

    if (toolId === 'gemini' && plan === 'AIUltra') {
      recommendations.push({
        type: 'overspend',
        message: 'Gemini AI Ultra is designed for extremely heavy AI workflows and may be excessive for most users.',
        saving: currentSpend - 23
      })
    }

    if (toolId === 'v0' && Object.keys(tools).includes('cursor') && useCase === 'frontend') {
      recommendations.push({
        type: 'redundant',
        message: 'v0 and Cursor overlap for frontend prototyping and UI generation workflows.',
        saving: currentSpend
      })
    }

    if (toolId === 'gemini' && Object.keys(tools).includes('chatgpt')) {
      recommendations.push({
        type: 'redundant',
        message: 'Gemini and ChatGPT overlap heavily for general-purpose AI workflows.',
        saving: currentSpend * 0.5
      })
    }

    if (toolId === 'openai_api' && Object.keys(tools).includes('chatgpt')) {
      recommendations.push({
        type: 'optimization',
        message: 'OpenAI API usage plus ChatGPT subscriptions may create overlapping spend depending on workflow.',
        saving: currentSpend * 0.2
      })
    }

    if (toolId === 'anthropic_api' && Object.keys(tools).includes('claude')) {
      recommendations.push({
        type: 'optimization',
        message: 'Anthropic API and Claude Max subscriptions may overlap for heavy Claude workflows.',
        saving: currentSpend * 0.2
      })
    }

    // Calculate total saving for this tool
    // Deduplicate: take the highest non-credits saving + credits if applicable
    const realSavings = recommendations
      .filter(r => r.type !== 'credits_opportunity')
      .map(r => r.saving)

    const maxRealSaving = realSavings.length > 0 ? Math.max(...realSavings) : 0
    const creditsSaving = recommendations.find(r => r.type === 'credits_opportunity')

    // Only count credits saving if no better direct saving
    const totalSaving = maxRealSaving > 0 ? maxRealSaving : creditsSaving ? creditsSaving.saving : 0

    results.push({
      toolId,
      toolName: getToolName(toolId),
      currentSpend,
      plan,
      seats,
      recommendations,
      totalSaving: Math.max(0, totalSaving),
      status: recommendations.length === 0 ? 'optimal' : 'can_optimize'
    })
  }

  const totalMonthlySaving = results.reduce((sum, r) => sum + r.totalSaving, 0)
  const totalCurrentSpend = results.reduce((sum, r) => sum + r.currentSpend, 0)

  return {
    results,
    totalMonthlySaving: Math.round(totalMonthlySaving * 100) / 100,
    totalAnnualSaving: Math.round(totalMonthlySaving * 12 * 100) / 100,
    totalCurrentSpend: Math.round(totalCurrentSpend * 100) / 100,
    isOptimal: totalMonthlySaving < 10
  }
}

function getToolName(toolId) {
  const names = {
    cursor: 'Cursor',
    github_copilot: 'GitHub Copilot',
    claude: 'Claude',
    chatgpt: 'ChatGPT',
    anthropic_api: 'Anthropic API',
    openai_api: 'OpenAI API',
    gemini: 'Gemini',
    windsurf: 'Windsurf',
    v0: 'v0'
  }
  return names[toolId] || toolId
}