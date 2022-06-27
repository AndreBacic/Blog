import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import Header from './Header';
import Navbar from './Navbar';
import Main from './Main';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import SearchPage from './SearchPage';
import Login from './Login';
import CreateArticle from './CreateArticle';
import EditAccount from './EditAccount';
import EditArticle from './EditArticle';
import ArticlePage from './ArticlePage';
import PageNotFound from './PageNotFound';

import reportWebVitals from './reportWebVitals';
import UserContext, { LS_KEY_authToken, LS_KEY_lastJWTRefresh, LS_KEY_user } from './UserContext';

// Constants because we need them before we do anything
const accountURI = "api/AccountApi"
const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

const millisToJwtExpiration = 15 * 60 * 1000 // 15 min
const millisDelayToRefreshToken = millisToJwtExpiration - 30000 // minus 30 seconds

const initialMaxNumArticlesDisplayed = 8;
const incrementMaxNumArticlesDisplayed = 6;

const passwordRegEx = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/g
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g

export {
  accountURI,
  articleURI,
  commentURI,
  initialMaxNumArticlesDisplayed,
  incrementMaxNumArticlesDisplayed,
  emailRegex,
  passwordRegEx
}

// Beginning of root boilerplate code
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

let user: UserModel | null = JSON.parse(localStorage.getItem(LS_KEY_user) as string)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserContext.Provider value={user}>
        <Header />
        <Navbar hasSearch={true} />
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="search/:query" element={<SearchPage />} />
            <Route path="login" element={<Login />} />
            <Route path="editAccount" element={<EditAccount />} />
            <Route path="createArticle" element={<CreateArticle />} />
            <Route path="editArticle" element={<EditArticle />} />
            <Route path="article/:id" element={<ArticlePage />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
        <Footer />
      </UserContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



// Separation of concerns is a relative thing, so here's a bajillion functions that are used in multiple places.

export function isValidEmail(email: string) {
  email = email.toLowerCase()
  let regexed = email.match(emailRegex)
  if (!regexed) { return false }
  if (regexed.length > 1) { return false }
  if (regexed[0] !== email) { return false }

  return true
}

// AccountApi methods   ////////////////////////////////////////////////////////////
export function getAuthToken() {
  let authToken = null;
  try {
    authToken = JSON.parse(localStorage.getItem(LS_KEY_authToken) as string)
  } catch {
    return null
  }
  return authToken
}

export function isUserLoggedIn() {
  return getAuthToken() !== null
}

export function RefreshTokenCallbackLoop() {
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

export async function GetLoggedInUserAsync(): Promise<UserModel> {
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

export async function CreateAccountAsync(user: CreateAccountViewModel) {
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

export async function LoginAsync(email: string, password: string) {
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
export async function LogoutAsync() {
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
export function LogOutUser() {
  localStorage.removeItem(LS_KEY_authToken)
  localStorage.removeItem(LS_KEY_user)
  user = null
}

// ArticleApi methods   ////////////////////////////////////////////////////////////
export async function GetAllArticlesAsync(): Promise<ArticleModel[]> {
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

export async function GetArticleByIdAsync(id: number): Promise<ArticleModel> {
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

export async function CreateArticleAsync(article: CreateOrEditArticleModel) {
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

export async function UpdateArticleAsync(id: number, article: CreateOrEditArticleModel) {
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

export async function DeleteArticleAsync(id: number) {
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
export async function GetAllCommentsInArticle(articleId: number): Promise<CommentModel[]> {
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

export async function GetCommentByArticleAndId(articleId: number, commentId: number): Promise<CommentModel> {
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
export async function CreateCommentAsync(comment: CreateOrEditCommentModel) {
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

export async function UpdateCommentAsync(id: number, comment: CreateOrEditCommentModel) {
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

export async function DeleteCommentAsync(id: number, commentId: number) {
  await fetch(`${commentURI}/${id}/${commentId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + getAuthToken()
      }
    })
}

export function GetUrlSearch() {
  let url = window.location.search
  return url.split('?')[1]
}
export function formatUTCDateForDisplayAsLocal(date: Date, statement: string) {
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
