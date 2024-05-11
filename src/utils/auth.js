import Cookies from 'js-cookie'
import { isEmpty } from "@/utils/common"

// const TokenKey = 'Admin-Token'

// export function getToken(tokenKey) {
//   return Cookies.get(tokenKey)
// }

// export function setToken(tokenKey,token) {
//   return Cookies.set(tokenKey, token)
// }

// export function removeToken(tokenKey) {
//   return Cookies.remove(tokenKey)
// }

export function getToken(tokenKey) {
  let token = localStorage.getItem(tokenKey)
  return isEmpty(token) ? "" : token
}

export function setToken(tokenKey, token) {
  return localStorage.setItem(tokenKey, token)
}

export function removeToken(tokenKey) {
  return localStorage.removeItem(tokenKey)
}
