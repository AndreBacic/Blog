import { LogOutUser } from './loginAsync';

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

async function GetLoggedInUserAsync(): Promise<UserModel> {
    let createPromise = await fetch(`${accountURI}/getLoggedInUser`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    return await createPromise.json()
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


// ArticleApi methods   ////////////////////////////////////////////////////////////
async function GetAllArticlesAsync(): Promise<ArticleModel[]> {
    let infoPromise = await fetch(articleURI,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    let articles = await infoPromise.json()
    return articles.sort((a: ArticleModel, b: ArticleModel) => { // TODO: replace 'any' with actual article model
        let d1 = Number(new Date(a.datePosted))
        let d2 = Number(new Date(b.datePosted))
        return d2 - d1
    });
}

async function GetArticleByIdAsync(id: number): Promise<ArticleModel> {
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
async function GetAllCommentsInArticle(articleId: number): Promise<CommentModel[]> {
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

async function GetCommentByArticleAndId(articleId: number, commentId: number): Promise<CommentModel> {
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
async function CreateCommentAsync(comment: CreateOrEditCommentModel) {
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

async function UpdateCommentAsync(id: number, comment: CreateOrEditCommentModel) {
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
function formatUTCDateForDisplayAsLocal(date: Date, statement: string) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getSeconds(), date.getMilliseconds()))
    return `${statement} ${date.toLocaleDateString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
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
export interface ArticleModel {
    id: number;
    title: string;
    datePosted: Date;
    lastEdited: Date;
    comments: CommentModel[];
    tags: string[];
    authorName: string;
    contentText: string;
}
export interface CommentModel {
    id: number;
    datePosted: string;
    lastEdited: string;
    author: CommentAuthorViewModel;
    contentText: string;
    articleId: number;
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
export interface CreateOrEditCommentModel {
    author: CommentAuthorViewModel;
    contentText: string;
    articleId: number;
}

export {
    accountURI,
    articleURI,
    commentURI,
    LS_KEY_authToken,
    LS_KEY_lastJWTRefresh,
    LS_KEY_user,
    initialMaxNumArticlesDisplayed,
    incrementMaxNumArticlesDisplayed,
    emailRegex,
    passwordRegEx,
    isUserLoggedIn,
    isValidEmail,
    getAuthToken,
    GetLoggedInUserAsync,
    RefreshTokenCallbackLoop,
    CreateAccountAsync,
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
    formatUTCDateForDisplayAsLocal,
}