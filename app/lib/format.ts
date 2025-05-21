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
