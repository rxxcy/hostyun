import type { Region, Product, CachedData, HostyunCache } from './types'
import { fetchRegions, fetchProductsByRegion } from './api.server'

// 缓存过期时间（毫秒）- 默认5分钟
const CACHE_EXPIRY = 5 * 60 * 1000

// 内存缓存
const cache: HostyunCache = {
  regions: { data: [], timestamp: 0 },
  products: {},
}

// 判断缓存是否有效
function isCacheValid<T extends { length: number }>(
  cachedData: CachedData<T>
): boolean {
  return (
    cachedData.data.length > 0 &&
    Date.now() - cachedData.timestamp < CACHE_EXPIRY
  )
}

// 获取所有区域，优先使用缓存
export async function getRegions(): Promise<Region[]> {
  if (!isCacheValid(cache.regions)) {
    const regions = await fetchRegions()
    cache.regions = {
      data: regions,
      timestamp: Date.now(),
    }
  }
  return cache.regions.data
}

// 根据区域ID获取产品列表，优先使用缓存
export async function getProductsByRegion(
  regionId: string
): Promise<Product[]> {
  if (!cache.products[regionId] || !isCacheValid(cache.products[regionId])) {
    const products = await fetchProductsByRegion(regionId)
    cache.products[regionId] = {
      data: products,
      timestamp: Date.now(),
    }
  }
  return cache.products[regionId].data
}

// 刷新所有区域数据
export async function refreshRegions(): Promise<void> {
  const regions = await fetchRegions()
  cache.regions = {
    data: regions,
    timestamp: Date.now(),
  }
}

// 刷新指定区域的产品数据
export async function refreshProducts(regionId: string): Promise<void> {
  const products = await fetchProductsByRegion(regionId)
  cache.products[regionId] = {
    data: products,
    timestamp: Date.now(),
  }
}

// 刷新所有数据
export async function refreshAllData(): Promise<void> {
  await refreshRegions()

  // 刷新所有已缓存区域的产品数据
  const regions = cache.regions.data
  for (const region of regions) {
    await refreshProducts(region.pgid)
  }
}

// 获取数据最后更新时间
export function getLastUpdateTime(): number {
  return cache.regions.timestamp || Date.now()
}

// 获取当前缓存状态
export function getCacheStatus(): {
  regionsCount: number
  productsCount: number
  lastUpdated: number
} {
  return {
    regionsCount: cache.regions.data.length,
    productsCount: Object.keys(cache.products).length,
    lastUpdated: getLastUpdateTime(),
  }
}
