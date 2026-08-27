// import axios from "axios";
// import * as SecureStore from "expo-secure-store";

// const api = axios.create({
//   baseURL: "http://TU_IP_LOCAL:8000/api", // ej: 192.168.1.10
// });

// api.interceptors.request.use(async (config) => {
//   const token = await SecureStore.getItemAsync("auth_token");
//   if (token) config.headers.Authorization = Bearer ${token};
//   return config;
// });

// export default api;