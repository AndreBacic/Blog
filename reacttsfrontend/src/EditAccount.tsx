import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountURI, getAuthToken, GetLoggedInUserAsync, isValidEmail, passwordRegEx, UserModel } from '.'
import HaveSearchBarContext from './HaveSearchBarContext'
import UserContext, { LS_KEY_authToken, LS_KEY_lastJWTRefresh, LS_KEY_user } from './UserContext'


type Props = {}
export default function EditAccount({ }: Props) {
    const [user, setUser] = useContext(UserContext) as [UserModel | null, (u: UserModel | null) => void]
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    const navigate = useNavigate()

    useEffect(() => {
        setHaveSearchBar(false)
        document.title = "Edit Account - The Blog of Andre Bačić"
    }, [])

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

            console.log("EditAccountAsync: successfully edited account")
            const user = await GetLoggedInUserAsync()
            setUser(user)
            console.log("EditAccountAsync: successfully got user")
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

    async function GetEditDataAndSubmitAsync() {
        // TODO: Switch to using useRef for all of these inputs?
        let first_name_input = document.getElementById("firstNameInput") as HTMLInputElement
        let last_name_input = document.getElementById("lastNameInput") as HTMLInputElement
        let email_address_input = document.getElementById("emailInput") as HTMLInputElement
        let doesReceiveNotificationsBox = document.getElementById("doesReceiveNotificationsBox") as HTMLInputElement

        if (first_name_input.value &&
            last_name_input.value &&
            isValidEmail(email_address_input.value)) {

            let u: UserModel = {
                firstName: first_name_input.value,
                lastName: last_name_input.value,
                emailAddress: email_address_input.value,
                doesReceiveNotifications: doesReceiveNotificationsBox.checked,
                id: user?.id as number,
                name: user?.name as string
            }

            EditAccountAsync(u).then((resp) => {
                if (resp) {
                    alert("Information successfully edited!")
                } else {
                    alert("Invalid name or email input. Someone else may be signed up with that email.")
                }
            })

        } else {
            alert("Invalid name or email input.")
        }

        let oldPasswordInput = document.getElementById("oldPasswordInput") as HTMLInputElement
        let newPasswordInput = document.getElementById("newPasswordInput") as HTMLInputElement
        let confirmPasswordInput = document.getElementById("confirmPasswordInput") as HTMLInputElement

        if (oldPasswordInput.value == '' &&
            newPasswordInput.value == '' &&
            confirmPasswordInput.value == '') {
            // This is fine, don't do anything
        } else if (oldPasswordInput.value == '' ||
            newPasswordInput.value == '' ||
            confirmPasswordInput.value == '') {
            alert("To change your password you must fill in all three fields")
        } else if (newPasswordInput.value !== confirmPasswordInput.value) {
            alert("To change your password you must enter the same new password " +
                "in both the 'New Password' and the 'Confirm New Password' fields.")
        } else if (newPasswordInput.value.match(passwordRegEx) == null) {
            alert("Your new password must have at least 6 characters, " +
                "1 number, 1 uppercase letter, and 1 lowercase letter")
        }
        else {
            oldPasswordInput.value = ""
            newPasswordInput.value = ""
            confirmPasswordInput.value = ""
            let success = await EditPasswordAsync(oldPasswordInput.value, newPasswordInput.value)
            if (success) {
                alert("Password successfully changed!")
            } else {
                alert("There was a problem/error in trying to change your password.")
            }
        }
    }
    return (
        <form className="account-form edit-account-form">
            <h1>Edit Account</h1>
            <div>
                <label htmlFor="firstNameInput">First Name: </label>
                <br />
                <input id="firstNameInput" type="text" defaultValue={user?.firstName} className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="lastNameInput">Last Name: </label>
                <br />
                <input id="lastNameInput" type="text" defaultValue={user?.lastName} className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="emailInput">Email: </label>
                <br />
                <input id="emailInput" type="email" defaultValue={user?.emailAddress} className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <input id="doesReceiveNotificationsBox" type="checkbox" className="" value="doesReceive" defaultChecked={user !== null ? user.doesReceiveNotifications : true} contentEditable="false" />
                <label htmlFor="doesReceiveNotificationsBox">Receive Notifications About New Content</label>
            </div>
            <br />
            <div>
                <label htmlFor="oldPasswordInput">Old Password: </label>
                <br />
                <input id="oldPasswordInput" type="password" className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="newPasswordInput">New Password: </label>
                <br />
                <input id="newPasswordInput" type="password" className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="confirmPasswordInput">Confirm New Password: </label>
                <br />
                <input id="confirmPasswordInput" type="password" className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <button type="button" className="blog-button" onClick={() => GetEditDataAndSubmitAsync().then()} style={{ width: "160px", margin: "0 4px 4px 0" }}>Save Changes</button>
                <input type="button" className="blog-button" value="Cancel" onClick={() => navigate("/")} />
            </div>
        </form>
    )
}
