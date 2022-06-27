import { createContext } from "react"
import { LS_KEY_user } from '.'
const UserContext = createContext(JSON.parse(localStorage.getItem(LS_KEY_user) as string))
export default UserContext