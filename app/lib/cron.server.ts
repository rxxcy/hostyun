import cron from 'node-cron'
import {
  refreshAllData,
  refreshRegions,
  getRegions,
  refreshProducts,
} from './cache.server'

// 控制任务是否已经启动
let isInitialized = false

// 初始化并启动定时任务
export function initCronJobs() {
  if (isInitialized) {
    return
  }

  // 启动时立即刷新一次所有数据
  void refreshAllData()

  // 每10分钟刷新区域数据
  cron.schedule('*/10 * * * *', async () => {
    console.log('[Cron] 刷新区域数据...', new Date().toLocaleString())
    await refreshRegions()
  })

  // 每5分钟刷新所有区域的产品数据
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] 刷新所有产品数据...', new Date().toLocaleString())
    const regions = await getRegions()

    for (const region of regions) {
      try {
        await refreshProducts(region.pgid)
        console.log(`[Cron] 已刷新区域 ${region.pgname} 的产品数据`)
      } catch (error) {
        console.error(`[Cron] 刷新区域 ${region.pgname} 的产品数据失败:`, error)
      }

      // 避免API请求过于频繁，每次请求间隔500ms
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  })

  console.log('[Cron] 定时任务已初始化')
  isInitialized = true
}

// 服务器启动时自动初始化定时任务
if (typeof process !== 'undefined') {
  initCronJobs()
}
