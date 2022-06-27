import { useContext } from 'react'
import { accountURI, getAuthToken, GetLoggedInUserAsync, LS_KEY_authToken, LS_KEY_lastJWTRefresh, LS_KEY_user } from '.'
import UserContext from './UserContext'

let user = useContext(UserContext)

export default async function LoginAsync(email: string, password: string) {
    let uri = `${accountURI}/login`
    let somePromise = await fetch(uri,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "EmailAddress": email,
                "Password": password
            })
        })
    let jwt = await somePromise.json()
    if (somePromise.status >= 400 || jwt.value === "Invalid password" || jwt.value === "Invalid email address") {
        return
    }
    // Only log in user if the password was valid
    localStorage.setItem(LS_KEY_authToken, JSON.stringify(jwt))
    user = await GetLoggedInUserAsync()
    localStorage.setItem(LS_KEY_user, JSON.stringify(user))

    let now = new Date().toString()
    localStorage.setItem(LS_KEY_lastJWTRefresh, now)
}
export async function LogoutAsync() {
    let somePromise = await fetch(`${accountURI}/logout`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    LogOutUser()

    if (somePromise.status < 400) {
        return true
    } else {
        return false
    }
}
export function LogOutUser() {
    localStorage.removeItem(LS_KEY_authToken)
    localStorage.removeItem(LS_KEY_user)
    user = null
}