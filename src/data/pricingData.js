export const OFFICIAL_PRICING = {
  cursor: {
    Hobby: { pricePerSeat: 0, description: 'Free' },
    Pro: { pricePerSeat: 20, description: '$20/user/mo' },
    ProPlus: { pricePerSeat: 60, description: '$60/user/mo' },
    Ultra: { pricePerSeat: 200, description: '$200/user/mo' },
    Teams: { pricePerSeat: 40, description: '$40/user/mo' },
    Enterprise: { pricePerSeat: 100, description: 'Custom enterprise pricing' }
  },
  github_copilot: {
    Individual: { pricePerSeat: 10, description: '$10/user/mo' },
    Business: { pricePerSeat: 19, description: '$19/user/mo' },
    Enterprise: { pricePerSeat: 39, description: '$39/user/mo' }
  },
  claude: {
    Free: { pricePerSeat: 0, description: 'Free' },
    Pro: { pricePerSeat: 22, description: '$20/user/mo' },
    Max5: { pricePerSeat: 100, description: '$100/user/mo' },
    Max20: { pricePerSeat: 200, description: '$200/user/mo' },
    Team: { pricePerSeat: 25, description: '$25/user/mo, min 5 seats' },
    Enterprise: { pricePerSeat: 60, description: 'Custom enterprise pricing' },
    'API Direct': { pricePerSeat: 0, description: 'Pay-as-you-go' }
  },
  chatgpt: {
    Free: { pricePerSeat: 0, description: 'Free' },
    Go: { pricePerSeat: 5, description: '₹399/mo India plan (~$5)' },
    Plus: { pricePerSeat: 20, description: '$20/user/mo' },
    Pro: { pricePerSeat: 120, description: '$120/user/mo' },
    Business: { pricePerSeat: 25, description: '$25/user/mo, min 2 seats' },
    Enterprise: { pricePerSeat: 60, description: 'Custom enterprise pricing' },
    'API Direct': { pricePerSeat: 0, description: 'Pay-as-you-go' }
  },
  gemini: {
    Free: { pricePerSeat: 0, description: 'Free' },
    AIPlus: { pricePerSeat: 5, description: '₹399/mo (~$5)' },
    AIPro: { pricePerSeat: 28, description: '₹1950/mo (~$23)' },
    AIUltra: { pricePerSeat: 290, description: '₹24500/mo (~$290)' },
    Business: { pricePerSeat: 20, description: '$20/user/mo' },
    Enterprise: { pricePerSeat: 30, description: '$30/user/mo' },
    API: { pricePerSeat: 0, description: 'Pay-as-you-go' }
  },
  windsurf: {
    Free: { pricePerSeat: 0, description: 'Free' },
    Pro: { pricePerSeat: 15, description: '$15/user/mo' },
    Teams: { pricePerSeat: 35, description: '$35/user/mo' }
  },
  anthropic_api: {
    'Pay-as-you-go': { pricePerSeat: 0, description: 'Pay-as-you-go' }
  },
  openai_api: {
    'Pay-as-you-go': { pricePerSeat: 0, description: 'Pay-as-you-go' }
  },
  v0: {
    Free: { pricePerSeat: 0, description: 'Free' },
    Premium: { pricePerSeat: 20, description: '$20/user/mo' },
    Team: { pricePerSeat: 50, description: 'Custom team pricing' },
    Enterprise: { pricePerSeat: 100, description: 'Enterprise pricing' }
  }
}