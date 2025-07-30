import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${accessToken}`,
  },
  //   withCredentials: true, // no vamos a usamos cookies para auth nunca
})

// strip out JSON header when sending FormData
api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    // let the browser set multipart/form-data; boundary=…
    delete config.headers!['Content-Type']
  }
  return config
})

export default api
