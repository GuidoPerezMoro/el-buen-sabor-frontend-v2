import api from './baseService'
import {Localidad} from './types'

const BASE = '/localidades'

export async function fetchAllLocalidades(): Promise<Localidad[]> {
  const {data} = await api.get<Localidad[]>(BASE)
  return data
}
