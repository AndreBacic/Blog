import { createContext } from "react"
import { UserModel } from "."

const LS_KEY_user = 'user'
const LS_KEY_authToken = 'authToken'
const LS_KEY_lastJWTRefresh = "lastJWTRefresh"

const UserContext = createContext([
    JSON.parse(localStorage.getItem(LS_KEY_user) as string),
    (user: UserModel) => {
        localStorage.setItem(LS_KEY_user, JSON.stringify(user))
    }])
export default UserContext
export {
    LS_KEY_authToken,
    LS_KEY_lastJWTRefresh,
    LS_KEY_user,
}