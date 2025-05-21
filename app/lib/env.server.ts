import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 获取 Hostyun 的 cookie
export const HOSTYUN_COOKIE = process.env.HOSTYUN_COOKIE || ''

// 检查必要的环境变量是否已设置
export function checkRequiredEnvVars() {
  const requiredVars = ['HOSTYUN_COOKIE']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn(
      `警告: 以下环境变量未设置: ${missingVars.join(', ')}。\n` +
        `请在项目根目录创建 .env 文件并设置这些变量。\n` +
        `参考 .env.example 获取示例配置。`
    )

    return false
  }

  return true
}

// 其他环境变量可以在这里添加
