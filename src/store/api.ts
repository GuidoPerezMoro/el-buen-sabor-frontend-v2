import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import axios from 'axios'

const axiosBaseQuery =
  ({baseUrl}: {baseUrl: string}) =>
  async ({url, method, data, params}: any) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
      })
      return {data: result.data}
    } catch (axiosError: any) {
      return {error: axiosError.response?.data || axiosError.message}
    }
  }

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  }),
  endpoints: () => ({}), // Extend this later with entity-specific services
})
