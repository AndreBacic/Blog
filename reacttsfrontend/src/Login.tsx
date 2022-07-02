import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetLoggedInUserAsync, isUserLoggedIn, LoginAsync } from '.'
import HaveSearchBarContext from './HaveSearchBarContext'
import UserContext from './UserContext'
type Props = {}
export default function Login({ }: Props) {
    const [user, setUser] = useContext(UserContext)
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    const navigate = useNavigate();

    useEffect(() => {
        setHaveSearchBar(false)
        document.title = "Login - The Blog of Andre Bačić"
    }, [])

    function GetLoginDataAndLogin() {
        let emailInput = document.getElementById('emailInput') as HTMLInputElement
        let passwordInput = document.getElementById('passwordInput') as HTMLInputElement
        LoginAsync(emailInput.value, passwordInput.value).then(() => {
            emailInput.value = "";
            passwordInput.value = "";
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
                <input id="emailInput" type="email" className="account-text-input" contentEditable="true" required={true} />
            </div>
            <div>
                <label htmlFor="passwordInput">Password: </label><br />
                <input id="passwordInput" type="password" className="account-text-input" contentEditable="true" required={true} />
            </div>
            <input type="submit" className="blog-button" value="Log in" />
        </form>
    )
}
