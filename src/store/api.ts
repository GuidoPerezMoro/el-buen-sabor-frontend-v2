import axios from 'axios'
import {createApi} from '@reduxjs/toolkit/query/react'
import type {BaseQueryFn} from '@reduxjs/toolkit/query'
import type {AxiosRequestConfig, AxiosError} from 'axios'

const axiosBaseQuery =
  ({
    baseUrl,
  }: {
    baseUrl: string
  }): BaseQueryFn<
    {url: string; method?: AxiosRequestConfig['method']; data?: unknown; params?: unknown},
    unknown,
    {status?: number; data: unknown}
  > =>
  async ({url, method = 'get', data, params}) => {
    try {
      const result = await axios({url: baseUrl + url, method, data, params})
      return {data: result.data}
    } catch (error) {
      const err = error as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      }
    }
  }

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  }),
  endpoints: () => ({}), // Extend this later with entity-specific services
})
