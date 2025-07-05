import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${accessToken}`,
  },
  //   withCredentials: true, // no vamos a usamos cookies para auth nunca
})

export default api
