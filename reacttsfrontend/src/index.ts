import { useContext, useState } from 'react';
import UserContext from './UserContext';
let user: UserModel | null = useContext(UserContext)

const accountURI = "api/AccountApi"
const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

const LS_KEY_user = 'user'
const LS_KEY_authToken = 'authToken'
const LS_KEY_lastJWTRefresh = "lastJWTRefresh"

const millisToJwtExpiration = 15 * 60 * 1000 // 15 min
const millisDelayToRefreshToken = millisToJwtExpiration - 30000 // minus 30 seconds

const initialMaxNumArticlesDisplayed = 8;
const incrementMaxNumArticlesDisplayed = 6;
const [maxNumArticlesDisplayed, setMaxNumArticlesDisplayed] = useState(initialMaxNumArticlesDisplayed) // TODO: Discern if this is actually a bad idea

const passwordRegEx = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/g
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g

function isValidEmail(email: string) {
    email = email.toLowerCase()
    let regexed = email.match(emailRegex)
    if (!regexed) { return false }
    if (regexed.length > 1) { return false }
    if (regexed[0] !== email) { return false }

    return true
}

// AccountApi methods   ////////////////////////////////////////////////////////////
function getAuthToken() {
    let authToken = null;
    try {
        authToken = JSON.parse(localStorage.getItem(LS_KEY_authToken) as string)
    } catch {
        return null
    }
    return authToken
}

function isUserLoggedIn() {
    return getAuthToken() !== null
}

async function LoginAsync(email: string, password: string) {
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
async function LogoutAsync() {
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
function LogOutUser() {
    localStorage.removeItem(LS_KEY_authToken)
    localStorage.removeItem(LS_KEY_user)
}

function RefreshTokenCallbackLoop() {
    fetch(`${accountURI}/refreshToken`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            }
        }).then(response => {
            if (response.status < 400) {
                return response.json()
            } else {
                LogOutUser()
                throw response.status
            }
        })
        .then(jwt => {
            localStorage.setItem(LS_KEY_authToken, JSON.stringify(jwt))
            let now = new Date().toString()
            localStorage.setItem(LS_KEY_lastJWTRefresh, now)
            setTimeout(RefreshTokenCallbackLoop, millisDelayToRefreshToken)
        })
        .catch(err => console.error(err))
}

async function GetLoggedInUserAsync() {
    let createPromise = await fetch(`${accountURI}/getLoggedInUser`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    let user = await createPromise.json()
    return user
}

async function CreateAccountAsync(user: CreateAccountViewModel) {
    let createPromise = await fetch(`${accountURI}/createAccount`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(user)
        })
    if (createPromise.status < 400) {
        return true
    } else {
        return false
    }
}

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

// ArticleApi methods   ////////////////////////////////////////////////////////////
async function GetAllArticlesAsync() {
    let infoPromise = await fetch(articleURI,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    let articles = await infoPromise.json()
    return articles.sort((a: any, b: any) => { // TODO: replace 'any' with actual article model
        let d1 = Number(new Date(a.datePosted))
        let d2 = Number(new Date(b.datePosted))
        return d2 - d1
    });
}

async function GetArticleByIdAsync(id: number) {
    let infoPromise = await fetch(`${articleURI}/${id}`,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    let article = await infoPromise.json()
    return article;
}

async function CreateArticleAsync(article: CreateOrEditArticleModel) {
    let createPromise = await fetch(articleURI,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(article)
        })
    return createPromise
}

async function UpdateArticleAsync(id: number, article: CreateOrEditArticleModel) {
    let updatePromise = await fetch(`${articleURI}/${id}`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(article)
        })
    return updatePromise
}

async function DeleteArticleAsync(id: number) {
    let deletePromise = await fetch(`${articleURI}/${id}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    return deletePromise
}

// CommentApi methods   ////////////////////////////////////////////////////////////////
async function GetAllCommentsInArticle(articleId: number) {
    let infoPromise = await fetch(`${commentURI}/${articleId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    let comments = await infoPromise.json()
    return comments;
}

async function GetCommentByArticleAndId(articleId: number, commentId: number) {
    let infoPromise = await fetch(`${commentURI}/${articleId}/${commentId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    let comment = await infoPromise.json()
    return comment;
}
async function CreateCommentAsync(comment: CommentModel) {
    await fetch(commentURI,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(comment)
        })
}

async function UpdateCommentAsync(id: number, comment: CommentModel) {
    await fetch(`${commentURI}/${id}`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(comment)
        })
}

async function DeleteCommentAsync(id: number, commentId: number) {
    await fetch(`${commentURI}/${id}/${commentId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
}

function GetUrlSearch() {
    let url = window.location.search
    return url.split('?')[1]
}


// Types ////////////////////////////////////////////////////////////////////////////
export interface UserModel {
    id: number;
    firstName: string;
    lastName: string;
    emailAddress: string;
    doesReceiveNotifications: boolean;
    name: string;
}
export interface CreateAccountViewModel {
    firstName: string;
    lastName: string;
    emailAddress: string;
    password: string;
    doesReceiveNotifications: boolean;
}
export interface CreateOrEditArticleModel {
    title: string;
    tags: string[];
    authorName: string;
    contentText: string;
}
export interface CommentAuthorViewModel {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
}
export interface CommentModel {
    author: CommentAuthorViewModel;
    contentText: string;
    articleId: number;
}

export {
    LS_KEY_authToken,
    LS_KEY_lastJWTRefresh,
    LS_KEY_user,
    initialMaxNumArticlesDisplayed,
    incrementMaxNumArticlesDisplayed,
    maxNumArticlesDisplayed,
    setMaxNumArticlesDisplayed,
    emailRegex,
    passwordRegEx,
    isUserLoggedIn,
    isValidEmail,
    GetLoggedInUserAsync,
    LoginAsync,
    LogoutAsync,
    RefreshTokenCallbackLoop,
    CreateAccountAsync,
    EditAccountAsync,
    EditPasswordAsync,
    GetAllArticlesAsync,
    GetArticleByIdAsync,
    CreateArticleAsync,
    UpdateArticleAsync,
    DeleteArticleAsync,
    GetAllCommentsInArticle,
    GetCommentByArticleAndId,
    CreateCommentAsync,
    UpdateCommentAsync,
    DeleteCommentAsync,
    GetUrlSearch,
}