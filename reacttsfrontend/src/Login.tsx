import { useContext } from 'react'
import { accountURI, GetLoggedInUserAsync } from '.'
import UserContext, { LS_KEY_authToken, LS_KEY_lastJWTRefresh, LS_KEY_user } from './UserContext'

type Props = {}
export default function Login({ }: Props) {
    let user = useContext(UserContext)
    return (
        <div>Login</div>
    )
}
