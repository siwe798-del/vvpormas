import axios, { AxiosInstance } from 'axios'
import configService from './config.service'

class ApiService {
  private api: AxiosInstance | null = null
  private baseUrl: string = ''

  async initialize(): Promise<void> {
    const config = await configService.getConfig()
    this.baseUrl = config.ipServer || ''
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async post(endpoint: string, data: any): Promise<any> {
    if (!this.api) {
      await this.initialize()
    }
    return this.api!.post(endpoint, data)
  }

  async get(endpoint: string): Promise<any> {
    if (!this.api) {
      await this.initialize()
    }
    return this.api!.get(endpoint)
  }

  getBaseUrl(): string {
    return this.baseUrl
  }
}

export default new ApiService()




