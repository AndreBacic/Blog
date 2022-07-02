import { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetLoggedInUserAsync, isUserLoggedIn, LoginAsync } from '.'
import HaveSearchBarContext from './HaveSearchBarContext'
import UserContext from './UserContext'
type Props = {}
export default function Login({ }: Props) {
    const [user, setUser] = useContext(UserContext)
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    const navigate = useNavigate();

    const emailInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setHaveSearchBar(false)
        document.title = "Login - The Blog of Andre Bačić"
    }, [])

    function GetLoginDataAndLogin() {
        const e = emailInput.current as HTMLInputElement
        const p = passwordInput.current as HTMLInputElement
        LoginAsync(e.value as string, p.value as string).then(() => {
            // TODO: Make sure this clears the inputs as intended
            e.value = "";
            p.value = "";
            GetLoggedInUserAsync().then(u => {
                setUser(u)
                if (isUserLoggedIn()) {
                    navigate("/")
                } else {
                    window.alert("Incorrect email or password")
                }
            })
        })
    }
    return (
        <form onSubmit={() => GetLoginDataAndLogin()} className="account-form login-form">
            <h1>Log in</h1>
            <div>
                <label htmlFor="emailInput">Email: </label><br />
                <input ref={emailInput} id="emailInput" type="email" className="account-text-input" contentEditable="true" required={true} />
            </div>
            <div>
                <label htmlFor="passwordInput">Password: </label><br />
                <input ref={passwordInput} id="passwordInput" type="password" className="account-text-input" contentEditable="true" required={true} />
            </div>
            <input type="submit" className="blog-button" value="Log in" />
        </form>
    )
}
