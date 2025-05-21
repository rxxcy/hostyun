// 区域数据结构
export interface Region {
  pgid: string
  pgname: string
  pgdes: string
  pgpublic: string
}

// 产品配置数据结构
export interface ProductConfig {
  cpushares: string
  ipc: string
  area: string
  iotune: string
  blkweight: string
  netdownbandwidth: string
  snapshot: string
  plantraffic: string
  netupbandwidth: string
  full_backup: string
  allowos: string
  serviceName: string
  cpuquota: string
  cpu: string
  hdd: string
  iops: string
  mem: string
}

// 产品价格数据结构
export interface ProductPrice {
  cprice: string
  onetime: string
  pmothod: string
  cycle: string
}

// 产品升级选项数据结构
export interface ProductUpgrade {
  port_max: string
  cpu_price: string
  cpu_max: string
  cpu_step: string
  ram_step: string
  port_step: string
  disk_price: string
  bw_step: string
  ram_price: string
  ip_max: string
  snapshot_price: string
  port_price: string
  disk_max: string
  bw_max: string
  full_backup_max: string
  ip: string
  disk_step: string
  bw_price: string
  ram_max: string
  full_backup_price: string
  snapshot_max: string
}

// 产品服务配置数据结构
export interface ProductServiceConfig {
  nastock: string
  buylimit: string
  pricedes?: string
  servicestatus: string
  trial_hours: string
  comsume_notice?: string
  referralrate: string
  time_cycle: string
}

// 产品数据结构
export interface Product {
  pid: string
  pgid: string
  pname: string
  pstock: string
  pdes: string
  phidden: string
  pprice: ProductPrice
  pconfig: ProductConfig
  pupgrade: ProductUpgrade
  psconfig: ProductServiceConfig
}

// 带缓存时间的数据结构
export interface CachedData<T> {
  data: T
  timestamp: number
}

// 完整的缓存数据
export interface HostyunCache {
  regions: CachedData<Region[]>
  products: Record<string, CachedData<Product[]>>
}
