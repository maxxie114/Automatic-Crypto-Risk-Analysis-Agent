/**
 * Backend API Client
 * Handles communication with the crypto risk analysis backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export interface RiskAnalysisRequest {
  cryptoSymbol?: string
  tokenAddress?: string
  collectionId?: string
  requestName?: string
}

export interface TokenData {
  address: string
  symbol: string
  name: string
  price?: number
  marketCap?: number
  liquidity?: number
  [key: string]: unknown
}

export interface AnalysisDetails {
  rugPullRisk?: number
  liquidityRisk?: number
  contractRisk?: number
  holderRisk?: number
  volatilityRisk?: number
  flags?: Array<{ type: string; description: string }>
  [key: string]: unknown
}

export interface RiskAnalysisResponse {
  success: boolean
  data?: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    riskScore: number
    riskFactors: string[]
    recommendations: string[]
    tokenData?: TokenData
    analysisDetails?: AnalysisDetails
  }
  error?: string
  message?: string
}

export interface SearchRequest {
  query: string
  searchType?: 'all' | 'collection' | 'request'
}

export interface Collection {
  id: string
  name: string
  [key: string]: unknown
}

export interface SearchResponse {
  success: boolean
  query?: string
  collections?: Collection[]
  data?: Array<{
    address: string
    symbol: string
    name: string
    chainId: string
    priceUsd: number
    priceChange24h?: number
    volume24h?: number
    liquidity?: number
    marketCap?: number
    fdv?: number
    pairAddress: string
    dexId: string
    url: string
    createdAt?: string
    lastUpdated?: string
    pairCreatedAt?: number | null
    priceChange?: {
      m5?: number
      h1?: number
      h6?: number
      h24?: number
    }
    txns24h?: {
      buys?: number
      sells?: number
    }
    volatilityRisk?: number
    [key: string]: unknown
  }>
  count?: number
  timestamp?: string
  sanity?: {
    coinListId?: string
    coinsCreated?: number
  }
  error?: string
}

/**
 * Sleep utility function for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Analyze crypto risk using the backend API with retry logic
 */
export async function analyzeCryptoRisk(
  params: RiskAnalysisRequest
): Promise<RiskAnalysisResponse> {
  const maxRetries = 3
  const retryDelay = 5000 // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/risk-analyzer/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // If it's a 500 error and we have retries left, retry after delay
        if (response.status === 500 && attempt < maxRetries) {
          console.log(`Risk analysis attempt ${attempt} failed with 500, retrying in ${retryDelay/1000} seconds...`)
          await sleep(retryDelay)
          continue
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // If we have retries left and it's not the last attempt, retry
      if (attempt < maxRetries) {
        console.log(`Risk analysis attempt ${attempt} failed, retrying in ${retryDelay/1000} seconds...`)
        await sleep(retryDelay)
        continue
      }
      
      // Last attempt failed, return error
      console.error('Risk analysis API error after all retries:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
  
  // Should never reach here, but TypeScript needs this
  return {
    success: false,
    error: 'Unknown error occurred',
  }
}

/**
 * Get token risk data by token ID with retry logic
 */
export async function getTokenRiskData(tokenId: string): Promise<RiskAnalysisResponse> {
  const maxRetries = 3
  const retryDelay = 5000 // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/risk-analyzer/${tokenId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // If it's a 500 error and we have retries left, retry after delay
        if (response.status === 500 && attempt < maxRetries) {
          console.log(`Get token risk data attempt ${attempt} failed with 500, retrying in ${retryDelay/1000} seconds...`)
          await sleep(retryDelay)
          continue
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // If we have retries left and it's not the last attempt, retry
      if (attempt < maxRetries) {
        console.log(`Get token risk data attempt ${attempt} failed, retrying in ${retryDelay/1000} seconds...`)
        await sleep(retryDelay)
        continue
      }
      
      // Last attempt failed, return error
      console.error('Get token risk data API error after all retries:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
  
  // Should never reach here, but TypeScript needs this
  return {
    success: false,
    error: 'Unknown error occurred',
  }
}

/**
 * Search collections in Postman with retry logic
 */
export async function searchCollections(params: SearchRequest): Promise<SearchResponse> {
  const maxRetries = 3
  const retryDelay = 5000 // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // If it's a 500 error and we have retries left, retry after delay
        if (response.status === 500 && attempt < maxRetries) {
          console.log(`Search API attempt ${attempt} failed with 500, retrying in ${retryDelay/1000} seconds...`)
          await sleep(retryDelay)
          continue
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // If we have retries left and it's not the last attempt, retry
      if (attempt < maxRetries) {
        console.log(`Search API attempt ${attempt} failed, retrying in ${retryDelay/1000} seconds...`)
        await sleep(retryDelay)
        continue
      }
      
      // Last attempt failed, return error
      console.error('Search API error after all retries:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
  
  // Should never reach here, but TypeScript needs this
  return {
    success: false,
    error: 'Unknown error occurred',
  }
}

/**
 * Get specific collection by ID
 */
export async function getCollection(collectionId: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/search/${collectionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Get collection API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<{
  healthy: boolean
  mcpConnected?: boolean
  error?: string
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    })

    if (!response.ok) {
      return { healthy: false, error: `HTTP error! status: ${response.status}` }
    }

    const data = await response.json()
    return {
      healthy: data.status === 'ok',
      mcpConnected: data.mcp === 'connected',
    }
  } catch (error) {
    console.error('Health check error:', error)
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
