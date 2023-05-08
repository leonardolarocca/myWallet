import { type DeleteCommandOutput } from '@aws-sdk/lib-dynamodb'

interface IBaseRepository<T> {
  getOne: (key: Record<string, any>) => Promise<T>
  save: (data: any) => Promise<T>
  delete: (id: Record<string, any>) => Promise<DeleteCommandOutput>
}

export default IBaseRepository
