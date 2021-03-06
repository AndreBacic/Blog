import { useContext } from 'react'
import { CreateAccountAsync, CreateAccountViewModel, isValidEmail, passwordRegEx, UserModel } from '.'
import { LoginAsync } from '.'
import UserContext, { LS_KEY_user } from './UserContext'


function Footer() {
    const [user, setUser] = useContext(UserContext)
    return (
        <footer id="footer" className={user ? "footer-logged-in footer" : "footer"}>
            {user ?
                <h1 id="footer-header">You are logged in as {user.name}</h1>
                :
                <>
                    <aside className="footer-signup-prompt">Please subscribe:</aside>
                    <form className="footer-signup-form" id="register-form" action={undefined}>
                        <input type="text" className="footer-signup-input" id="First_Name" placeholder="First Name" contentEditable="true" required />
                        <input type="text" className="footer-signup-input" id="Last_Name" placeholder="Last Name" contentEditable="true" required />
                        <input type="email" className="footer-signup-input" id="Email_address" placeholder="Email address" contentEditable="true" required />
                        <input type="password" className="footer-signup-input" id="Password" placeholder="A New Password" contentEditable="true" required />
                        <div style={{ display: "inline-block" }}>
                            <button type="button" className="blog-button" onClick={() => GetRegisterDataAndLoginAsync(setUser)} style={{ float: "right" }}>Sign Up</button>
                        </div>
                    </form>
                </>
            }
            <aside className="footer-copyright">
                <div>© <p id="year-display" style={{ display: "inline-block" }}>2022</p> by Andre Bačić</div>
            </aside>

        </footer>

    )
}
async function GetRegisterDataAndLoginAsync(setUser: (user: UserModel) => void) {
    let first_name_input = document.getElementById("First_Name") as HTMLInputElement
    let last_name_input = document.getElementById("Last_Name") as HTMLInputElement
    let email_address_input = document.getElementById("Email_address") as HTMLInputElement
    let password_input = document.getElementById("Password") as HTMLInputElement

    if (ValidateRegisterData(first_name_input.value,
        last_name_input.value,
        email_address_input.value,
        password_input.value) === false) {
        return
    }

    let user: CreateAccountViewModel = {
        firstName: first_name_input.value,
        lastName: last_name_input.value,
        emailAddress: email_address_input.value,
        password: password_input.value,
        doesReceiveNotifications: true
    }
    let success = await CreateAccountAsync(user)
    let email_address = email_address_input.value
    let password = password_input.value
    first_name_input.value = "";
    last_name_input.value = "";
    email_address_input.value = "";
    password_input.value = "";

    if (success === true) {
        await LoginAsync(email_address, password)
        setUser(JSON.parse(localStorage.getItem(LS_KEY_user) as string) as UserModel)
        window.alert("Successfully signed up!")
    } else {
        window.alert("There was a problem registering you. Someone else may have signed up with that email.")
    }
}
function ValidateRegisterData(first_name: string, last_name: string, email_address: string, password: string) {
    if (first_name == '') {
        alert("You must enter your first name")
        return false
    } else if (last_name == '') {
        alert("You must enter your last name")
        return false
    } else if (isValidEmail(email_address) === false) {
        alert("You must enter a valid email address")
        return false
    } else if (password.match(passwordRegEx) == null) {
        alert("You must enter a password with at least 6 characters," +
            "1 number, 1 uppercase letter, and 1 lowercase letter")
        return false
    }

    return true
}

export default Footer