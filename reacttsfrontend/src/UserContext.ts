import { createContext } from "react"

const LS_KEY_user = 'user'
const LS_KEY_authToken = 'authToken'
const LS_KEY_lastJWTRefresh = "lastJWTRefresh"

const UserContext = createContext(JSON.parse(localStorage.getItem(LS_KEY_user) as string))
export default UserContext
export {
    LS_KEY_authToken,
    LS_KEY_lastJWTRefresh,
    LS_KEY_user,
}