import { useState } from 'react'
import { json } from '@remix-run/node'
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit, useNavigation } from '@remix-run/react'
import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'

import {
  getRegions,
  getProductsByRegion,
  getLastUpdateTime,
  refreshAllData,
} from '../lib/cache.server'
import { formatProductPrice, formatProductCycle } from '../lib/format'
import type { Product, Region } from '../lib/types'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hostyun VPS库存监控' },
    { name: 'description', content: '实时监控Hostyun的VPS库存和价格信息' },
  ]
}

// 添加手动刷新功能的action函数
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'refresh') {
    // 刷新所有数据
    await refreshAllData()
    return json({ success: true, message: '数据已刷新' })
  }

  return json({ success: false, message: '未知操作' })
}

export async function loader() {
  // 获取所有区域
  const regions = await getRegions()

  // 为每个区域获取产品信息
  const regionProducts: Record<string, Product[]> = {}
  for (const region of regions) {
    const products = await getProductsByRegion(region.pgid)
    regionProducts[region.pgid] = products
  }

  // 获取最后更新时间
  const lastUpdateTime = getLastUpdateTime()

  return json({
    regions,
    regionProducts,
    lastUpdateTime,
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  const regions = Array.isArray(data.regions) ? data.regions : []
  const regionProducts = data.regionProducts || {}
  const lastUpdateTime = data.lastUpdateTime || Date.now()

  const submit = useSubmit()
  const navigation = useNavigation()
  const isRefreshing =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'refresh'

  const [selectedRegion, setSelectedRegion] = useState<string>(
    regions.length > 0 ? regions[0].pgid : ''
  )

  // 格式化描述内容
  const formatDescription = (desc: string): string => {
    return desc
      .replace(/&lt;br\/&gt;/g, ' ')
      .replace(/&lt;\/p &gt;/g, ' ')
      .replace(/&lt;p &gt;/g, ' ')
      .replace(/&lt;br \/&gt;/g, ' ')
      .replace(/&lt;\/a &gt;/g, ' ')
      .replace(/<.*?>/g, ' ')
  }

  // 手动刷新数据
  const handleRefresh = () => {
    submit({ intent: 'refresh' }, { method: 'post' })
  }

  // 选择的区域产品
  const selectedProducts = selectedRegion
    ? regionProducts[selectedRegion] || []
    : []

  // 找到选中的区域对象
  const currentRegion = regions.find((r: Region) => r.pgid === selectedRegion)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hostyun VPS库存监控</h1>
            <p className="text-muted-foreground">
              最后更新时间:{' '}
              {format(new Date(lastUpdateTime), 'yyyy-MM-dd HH:mm:ss')}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? '刷新中...' : '刷新数据'}
          </Button>
        </header>

        <div className="w-full">
          <div className="mb-4">
            <h2 className="text-xl font-medium mb-2">选择区域</h2>
            <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto p-2 border rounded-md">
              {regions.map((region: Region) => (
                <Button
                  key={region.pgid}
                  variant={
                    selectedRegion === region.pgid ? 'default' : 'outline'
                  }
                  onClick={() => setSelectedRegion(region.pgid)}
                  size="sm"
                >
                  {region.pgname}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {currentRegion && (
          <Card>
            <CardHeader>
              <CardTitle>{currentRegion.pgname}</CardTitle>
              <CardDescription>
                {formatDescription(currentRegion.pgdes)}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {selectedProducts.length > 0 ? (
          <Table>
            <TableCaption>共 {selectedProducts.length} 个产品配置</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>产品名称</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>配置描述</TableHead>
                <TableHead>价格</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProducts.map((product: Product) => {
                const prices = formatProductPrice(product.pprice.cprice)
                const cycles = formatProductCycle(product.pprice.cycle)
                const stockStatus =
                  parseInt(product.pstock) > 10
                    ? '充足'
                    : parseInt(product.pstock) > 0
                    ? '紧张'
                    : '售罄'
                const stockVariant =
                  parseInt(product.pstock) > 10
                    ? 'default'
                    : parseInt(product.pstock) > 0
                    ? 'secondary'
                    : 'destructive'

                return (
                  <TableRow key={product.pid}>
                    <TableCell className="font-medium">
                      {product.pname}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockVariant}>
                        {stockStatus} ({product.pstock})
                      </Badge>
                    </TableCell>
                    <TableCell>{product.pdes}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {prices.map((price, idx) => (
                          <div key={idx} className="text-sm">
                            {price} / {cycles[idx]}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                该区域暂无产品或数据加载中...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
