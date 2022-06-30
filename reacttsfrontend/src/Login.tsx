import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginAsync } from '.'
import UserContext from './UserContext'
type Props = {}
export default function Login({ }: Props) {
    const [user, setUser] = useContext(UserContext)
    const navigate = useNavigate();
    function GetLoginDataAndLogin() {
        let emailInput = document.getElementById('emailInput') as HTMLInputElement
        let passwordInput = document.getElementById('passwordInput') as HTMLInputElement
        LoginAsync(emailInput.value, passwordInput.value).then(() => {
            emailInput.value = "";
            passwordInput.value = "";
            if (user !== null) {
                navigate("/")
            } else {
                window.alert("Incorrect email or password")
            }
        })
    }
    return (
        <form action="javascript:void(0)" onSubmit={() => GetLoginDataAndLogin()} className="account-form login-form">
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
