import { useContext } from 'react'
import { accountURI, GetLoggedInUserAsync, LS_KEY_authToken, LS_KEY_lastJWTRefresh, LS_KEY_user } from '.'
import UserContext from './UserContext'

let user = useContext(UserContext)

type Props = {}
export default function Login({ }: Props) {
    return (
        <div>Login</div>
    )
}
