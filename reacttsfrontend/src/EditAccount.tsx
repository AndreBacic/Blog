import { useContext } from 'react'
import { accountURI, getAuthToken, GetLoggedInUserAsync, UserModel } from '.'
import UserContext, { LS_KEY_authToken, LS_KEY_lastJWTRefresh, LS_KEY_user } from './UserContext'


type Props = {}
export default function EditAccount({ }: Props) {
    let user = useContext(UserContext)

    async function EditAccountAsync(u: UserModel) {
        let editPromise = await fetch(`${accountURI}/editAccount`,
            {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getAuthToken()
                },
                body: JSON.stringify(u)
            })
        let success = editPromise.status < 400

        if (success === true) {
            let jwt = await editPromise.json()
            localStorage.setItem(LS_KEY_authToken, JSON.stringify(jwt))
            let now = new Date().toString()
            localStorage.setItem(LS_KEY_lastJWTRefresh, now) // TODO: could this have a collision with refreshTokenCallbackLoop? fix that?

            user = await GetLoggedInUserAsync()
            localStorage.setItem(LS_KEY_user, JSON.stringify(user))
        }
        return success
    }

    async function EditPasswordAsync(oldPassword: string, newPassword: string) {
        let editPromise = await fetch(`${accountURI}/editPassword`,
            {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getAuthToken()
                },
                body: JSON.stringify({
                    "OldPassword": oldPassword,
                    "NewPassword": newPassword
                })
            })
        return editPromise.status < 400
    }
    return (
        <div>EditAccount</div>
    )
}
