import axios from 'axios'
import type { Region, Product } from './types'
import { HOSTYUN_COOKIE, checkRequiredEnvVars } from './env.server'

// 检查必要的环境变量
checkRequiredEnvVars()

const headers = {
  accept: 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
  priority: 'u=1, i',
  'sec-ch-ua':
    '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'x-requested-with': 'XMLHttpRequest',
  cookie: HOSTYUN_COOKIE,
  Referer: 'https://my.hostyun.com/idcsystem.aspx?c=order&ptype=6',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// API Base URL
const API_BASE_URL = 'https://my.hostyun.com/idcsystem.aspx'

// 获取区域列表
export async function fetchRegions(): Promise<Region[]> {
  try {
    // 验证cookie是否设置
    if (!HOSTYUN_COOKIE) {
      console.error(
        '错误: HOSTYUN_COOKIE 环境变量未设置，可能会导致API请求失败'
      )
    }

    const response = await axios.get(API_BASE_URL, {
      params: {
        c: 'ajax',
        dt: 'pglist',
        rt: 'json',
        p1: '6',
      },
      headers,
    })

    // 验证响应是否为数组
    if (!Array.isArray(response.data)) {
      console.error('API返回了非数组响应，可能需要更新cookie')
      return []
    }

    return response.data as Region[]
  } catch (error) {
    console.error('获取区域列表失败:', error)
    return []
  }
}

// 根据区域获取产品列表
export async function fetchProductsByRegion(
  regionId: string
): Promise<Product[]> {
  try {
    // 验证cookie是否设置
    if (!HOSTYUN_COOKIE) {
      console.error(
        '错误: HOSTYUN_COOKIE 环境变量未设置，可能会导致API请求失败'
      )
    }

    if (!regionId) {
      console.error('错误: 区域ID未提供')
      return []
    }

    const response = await axios.get(API_BASE_URL, {
      params: {
        c: 'ajax',
        dt: 'product',
        id: '-1',
        p1: regionId,
        p2: 'all',
        rt: 'json',
      },
      headers,
    })

    // 验证响应是否为数组
    if (!Array.isArray(response.data)) {
      console.error('API返回了非数组响应，可能需要更新cookie')
      return []
    }

    return response.data as Product[]
  } catch (error) {
    console.error(`获取区域 ${regionId} 的产品列表失败:`, error)
    return []
  }
}

// 格式化产品价格
export function formatProductPrice(priceString: string): string[] {
  return priceString.split(',').map(price => `¥${price}`)
}

// 格式化产品周期
export function formatProductCycle(cycleString: string): string[] {
  const cycleMap: Record<string, string> = {
    '1': '1个月',
    '3': '3个月',
    '6': '6个月',
    '12': '1年',
  }

  return cycleString.split(',').map(cycle => cycleMap[cycle] || `${cycle}个月`)
}
