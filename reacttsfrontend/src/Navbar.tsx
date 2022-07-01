import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { LogoutAsync } from './index';
import UserContext from './UserContext';

type Props = { hasSearch: boolean }
function Navbar({ hasSearch }: Props) {
    const [user, setUser] = useContext(UserContext)
    const navigate = useNavigate()

    function LogOutButtonOnClick() {
        LogoutAsync().then(() => {
            setUser(null)
            navigate('/')
        })
    }
    return (
        <>
            <input type="checkbox" id="navbar-toggle" className="navbar-toggle" />
            <label htmlFor="navbar-toggle" className="navbar-toggle-label">
                <span>
                    <span id="line1"></span>
                    <span id="line2"></span>
                    <span id="line3"></span>
                </span>
            </label>
            <nav className="navbar">
                <Link to="">Home</Link>
                <Link to="about">About</Link>
                {user ?
                    <>
                        <Link className="right" to="editAccount" id="edit-account-link">Edit Account</Link>
                        <a className="right" href={undefined} id="login-link" onClick={LogOutButtonOnClick}>Logout</a>
                    </>
                    :
                    <>
                        <a className="right" href="#footer" onClick={signUpAnimation} id="sign-up-link">Sign Up</a>
                        <Link className="right" to="login" id="login-link">Login</Link>
                    </>
                }
                {hasSearch &&
                    <div style={{ float: "right" }}>
                        <label htmlFor="search-bar">Search:</label>
                        <input id="search-bar" type="text" className="navbar-input" contentEditable="true" />
                    </div>
                }
            </nav>
        </>
    )
}

function signUpAnimation() {
    if (document.body.scrollHeight <= document.body.clientHeight + 200 || window.innerWidth > 768) {
        let footer = document.getElementById("footer") as HTMLElement

        footer.classList.add("sign-up-animated")

        let scrollingElement = (document.scrollingElement || document.body)
        let keepScrollDown = setInterval(() => { scrollingElement.scrollTop = scrollingElement.scrollHeight }, 20)
        setTimeout(() => {
            footer.classList.remove("sign-up-animated")
            clearInterval(keepScrollDown)
        }, 1200)
    }
}

export default Navbar