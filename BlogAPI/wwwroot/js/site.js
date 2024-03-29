﻿const accountURI = "api/AccountApi"
const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

const LS_KEY_user = 'user'
const LS_KEY_authToken = 'authToken'
const LS_KEY_lastJWTRefresh = "lastJWTRefresh"

const millisToJwtExpiration = 15*60*1000 // 15 min
const millisDelayToRefreshToken = millisToJwtExpiration - 30000 // minus 30 seconds

const initialMaxNumArticlesDisplayed = 8;
const incrementMaxNumArticlesDisplayed = 6;
let MaxNumArticlesDisplayed = initialMaxNumArticlesDisplayed

const passwordRegEx = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/g
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g

function isValidEmail(email) {
    email = email.toLowerCase()
    let regexed = email.match(emailRegex)
    if (!regexed) {return false}
    if (regexed.length > 1) {return false}
    if (regexed[0] !== email) {return false}
    
    return true
}

// AccountApi methods   ////////////////////////////////////////////////////////////
function getAuthToken() {
    let authToken = null;
    try {
        authToken = JSON.parse(localStorage.getItem(LS_KEY_authToken))
    } catch {
        return null
    }
    return authToken
}

function isUserLoggedIn() {
    return getAuthToken() !== null
}

async function LoginAsync(email, password) {
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
    let user = await GetLoggedInUserAsync()
    localStorage.setItem(LS_KEY_user, JSON.stringify(user))

    let now = new Date().toString()
    localStorage.setItem(LS_KEY_lastJWTRefresh, now)
}
async function LogoutAsync() {
    let somePromise = await fetch(`${accountURI}/logout`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer '+getAuthToken()
            }
        })
    LogOutUser()
    ReRenderTemplates()

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
    let somePromise = fetch(`${accountURI}/refreshToken`,
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
                ReRenderTemplates()
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

async function CreateAccountAsync(user) {
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

async function EditAccountAsync(user) {
    let editPromise = await fetch(`${accountURI}/editAccount`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(user)
        })
    let success = editPromise.status < 400

    if (success === true) {
        let jwt = await editPromise.json()
        localStorage.setItem(LS_KEY_authToken, JSON.stringify(jwt))
        let now = new Date().toString()
        localStorage.setItem(LS_KEY_lastJWTRefresh, now) // TODO: could this have a collision with refreshTokenCallbackLoop? fix that?

        let user = await GetLoggedInUserAsync()
        localStorage.setItem(LS_KEY_user, JSON.stringify(user))
    }
    return success
}

async function EditPasswordAsync(oldPassword, newPassword) {
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
    return articles.sort((a, b) => {
        d1 = new Date(a.datePosted)
        d2 = new Date(b.datePosted)
        return d2 - d1
    });
}

async function GetArticleByIdAsync(id) {
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

async function CreateArticleAsync(article) {
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

async function UpdateArticleAsync(id, article) {
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

async function DeleteArticleAsync(id) {
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
async function GetAllCommentsInArticle(articleId) {
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

async function GetCommentByArticleAndId(articleId, commentId) {
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
async function CreateCommentAsync(comment) {
    let createPromise = await fetch(commentURI,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(comment)
        })
    //let success = await createPromise.json()
}

async function UpdateCommentAsync(id, comment) {
    let updatePromise = await fetch(`${commentURI}/${id}`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(comment)
        })
    //let success = await updatePromise.json()
}

async function DeleteCommentAsync(id, commentId) {
    let deletePromise = await fetch(`${commentURI}/${id}/${commentId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    //let success = await deletePromise.json()
}

function GetUrlSearch() {
    let url = window.location.search
    return url.split('?')[1]
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/// DOM Rendering Methods  ///////////////////////////////////////////////////////////////////////////

async function RenderTemplatesAsync(haveSearch = true) {
    let isLoggedIn = isUserLoggedIn()

    let promisething = await fetch("templates.html")
    let data = await promisething.text()
    parser = new DOMParser()
    let templates = parser.parseFromString(data, 'text/html')

    let navbar = null;
    if (haveSearch) {
        navbar = templates.querySelector('#navbar-with-search')
    } else {
        navbar = templates.querySelector('#navbar-no-search')
    }
    let navClone = navbar.content.cloneNode(true)
    
    if (isLoggedIn) {
        edit_account_link = navClone.querySelector("#sign-up-link")
        edit_account_link.innerText = "Edit Account"
        edit_account_link.href = "editAccount.html"
        edit_account_link.id = "edit-account-link"

        logout_link = navClone.querySelector("#login-link")
        logout_link.innerText = "Logout"
        logout_link.href = "javascript:void(0)"
        logout_link.onclick = LogOutButtonOnClick
    }
    document.body.prepend(navClone)

    let header = templates.querySelector('#header')
    let headerClone = header.content.cloneNode(true)
    document.body.prepend(headerClone)

    let footer = null;
    if (isLoggedIn) {
        footer = templates.querySelector('#footer-user-logged-in')        
    } else {
        footer = templates.querySelector('#footer-not-logged-in')
    }
    let footerClone = footer.content.cloneNode(true)
    document.body.append(footerClone)

    RunTemplateScripts(haveSearch, isLoggedIn)
}
function RunTemplateScripts(haveSearch, isLoggedIn) {
    if (haveSearch) {
        const search_bar = document.getElementById("search-bar")
        search_bar.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                window.location = `search.html?${search_bar.value}`
            }
        })
    }
    if (isLoggedIn) {
        user = JSON.parse(localStorage.getItem(LS_KEY_user))
        document.getElementById("footer-header").textContent = `You are logged in as: ${user.name}`
    }
    // update year in footer
    document.getElementById("year-display").textContent = (new Date()).getFullYear()
}

function ReRenderTemplates() {
    let scrollY = window.scrollY
    document.querySelector(".header").remove()
    document.querySelector("#navbar-toggle").remove()
    document.querySelector("label[for='navbar-toggle']").remove()
    document.querySelector(".navbar").remove()
    document.querySelector("#footer").remove()

    RenderTemplatesAsync(haveSearch).then(() => { // haveSearch exists already on every page
        window.requestAnimationFrame(() => {
            window.scroll(0, scrollY)
        })
    })
}

function LogOutButtonOnClick() {
    LogoutAsync().then(() => {
        LogOutUser()
        window.location = 'index.html'
    })
}

// For the signup form in the footer
async function GetRegisterDataAndLoginAsync() {
    let first_name_input = document.getElementById("First_Name")
    let last_name_input = document.getElementById("Last_Name")
    let email_address_input = document.getElementById("Email_address")
    let password_input = document.getElementById("Password")

    if (ValidateRegisterData(first_name_input.value,
        last_name_input.value,
        email_address_input.value,
        password_input.value) === false) {
        return
    }

    let user = {
        FirstName: first_name_input.value,
        LastName: last_name_input.value,
        EmailAddress: email_address_input.value,
        Password: password_input.value,
        DoesReceiveNotifications: true
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
        window.alert("Successfully signed up!")
        ReRenderTemplates(haveSearch)
    } else {
        window.alert("There was a problem registering you. Someone else may have signed up with that email.")
    }
}
// Also for the signup form in the footer
function ValidateRegisterData(first_name, last_name, email_address, password) {
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



async function RenderArticles(articles) {
    let articleList = document.getElementById("articleList")
    while (articleList.firstChild) {
        articleList.removeChild(articleList.firstChild)
    }

    for (let a of articles) {
        const newArticle = RenderPreviewOfArticle(a)
        articleList.appendChild(newArticle)
    }
}

function RenderPreviewOfArticle(articleJSON) {
    const link = document.createElement("a")
    link.href = `article.html?${articleJSON.id}`
    link.className = "flex-item"

    const article = document.createElement("article")
    article.className = "article-flex-item"
    
    const header = document.createElement("h2")
    header.textContent = articleJSON.title
    article.appendChild(header)

    const authorNameLabel = document.createElement("p")
    authorNameLabel.style = "display: inline-block;"
    authorNameLabel.textContent = 'Written by '

    const citedAuthorName = document.createElement("cite")
    citedAuthorName.textContent = articleJSON.authorName

    authorNameLabel.appendChild(citedAuthorName)
    authorNameLabel.innerHTML += "<br />"

    const datesP = document.createElement("p")
    datePosted = new Date(articleJSON.datePosted)
    datesP.textContent = formatUTCDateForDisplayAsLocal(datePosted, 'Posted')

    if (articleJSON.lastEdited != '') {
        lastEdited = new Date(articleJSON.lastEdited)
        if (lastEdited.getUTCFullYear() != 1) {
            datesP.textContent += formatUTCDateForDisplayAsLocal(lastEdited, ', Last Edited')
        }
    }
    authorNameLabel.appendChild(datesP)

    article.appendChild(authorNameLabel)


    if (articleJSON.tags.length > 0) {
        const tagsDiv = document.createElement("div")
        tagsDiv.className = "tags-container"

        const tagsHeader = document.createElement("h4")
        tagsHeader.textContent = "Tags: "
        tagsDiv.appendChild(tagsHeader)

        articleJSON.tags.forEach((tag) => {
            let newTag = document.createElement("p")
            newTag.className = "tag"
            newTag.textContent = tag
            tagsDiv.appendChild(newTag)
        })

        article.appendChild(tagsDiv)
    }

    link.appendChild(article)

    return link
}

function GetMoreArticlesToBeRendered(allArticles) {
    if (MaxNumArticlesDisplayed >= allArticles.length) {
        document.getElementById("load-more-articles-button").textContent = "That is All"
        return allArticles
    } else {
        MaxNumArticlesDisplayed += incrementMaxNumArticlesDisplayed
        articlesToRender = allArticles.slice(0, MaxNumArticlesDisplayed)

        if (MaxNumArticlesDisplayed >= allArticles.length) {
            document.getElementById("load-more-articles-button").textContent = "That is All"
        }
        return articlesToRender        
    }
}


async function RenderArticlePageMainAsync() {
    const articleNotFoundHTML = `<h1>Article Not Found</h1>
            <article class="full-article">
                <h2>Unfortunately, the article this page is linked to cannot be found</h2>
            </article>
            `
    let id = -1
    try {
        id = parseInt(GetUrlSearch())
    } catch (e) {/*nothing*/ }

    if ((id > 0) === false) {
        document.getElementById("main").innerHTML = articleNotFoundHTML            
        return
    }

    let json = await GetArticleByIdAsync(id)

    if (json.status >= 400) {
        document.getElementById("main").innerHTML = articleNotFoundHTML
        return
    }

    let article = RenderFullArticle(json)
    document.getElementById("main").prepend(article)
    document.title = `${json.title} - The Blog of Andre Bačić`

    const header = document.createElement("h1")
    header.textContent = json.title
    document.getElementById("main").prepend(header)

    RenderPostCommentForm()
    RenderCommentList(json)
}

function RenderFullArticle(articleJSON) {
    const article = document.createElement("article")
    article.className = "full-article"

    const content = document.createElement("div")
    // innerHTML because we want the html code in the article to be rendered.
    content.innerHTML = articleJSON.contentText
    article.appendChild(content)

    const infoDiv = document.createElement("div")
    infoDiv.className = "article-info-div"

    const authorNameLabel = document.createElement("p")
    authorNameLabel.textContent = 'Written by '

    const citedAuthorName = document.createElement("cite")
    citedAuthorName.textContent = articleJSON.authorName
    authorNameLabel.appendChild(citedAuthorName)

    const datePostedParagraph = document.createElement("p")
    datePosted = new Date(articleJSON.datePosted)
    datePostedParagraph.textContent = formatUTCDateForDisplayAsLocal(datePosted, 'Date Posted:')
    datePostedParagraph.style = "float: right; text-align: right;"

    // append elements
    infoDiv.appendChild(authorNameLabel)

    if (articleJSON.lastEdited != '') {
        lastEdited = new Date(articleJSON.lastEdited)
        if (lastEdited.getUTCFullYear() != 1) {
            const lastEditedParagraph = document.createElement("p")
            lastEditedParagraph.innerHTML = formatUTCDateForDisplayAsLocal(lastEdited, '&nbsp;&nbsp;Last Edited:')
            lastEditedParagraph.style = "float: right; text-align: right;"
            infoDiv.appendChild(lastEditedParagraph)
        }
    }
    infoDiv.appendChild(datePostedParagraph)

    if (articleJSON.tags.length > 0) {
        infoDiv.innerHTML += "<br />"
        const tagsDiv = document.createElement("div")
        tagsDiv.className = "tags-container"

        const tagsHeader = document.createElement("h4")
        tagsHeader.textContent = "Tags: "
        tagsDiv.appendChild(tagsHeader)

        articleJSON.tags.forEach((tag) => {
            let newTag = document.createElement("p")
            newTag.className = "tag"
            newTag.textContent = tag
            tagsDiv.appendChild(newTag)
        })

        infoDiv.appendChild(tagsDiv)
    }

    article.appendChild(infoDiv)

    return article
}

function formatUTCDateForDisplayAsLocal(date, statement) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getSeconds(), date.getMilliseconds()))
    return `${statement} ${date.toLocaleDateString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
}

function RenderPostCommentForm() {
    let form = document.getElementById("post-comment-form")

    if (isUserLoggedIn()) {
        const formHeader = document.createElement("h4")
        formHeader.textContent = `Leave a comment`
        form.appendChild(formHeader)

        const commentInput = document.createElement("textarea")
        commentInput.id = "commentInput"
        commentInput.contentEditable = true
        commentInput.placeholder = "Your comment"
        form.appendChild(commentInput)

        const postCommentButton = document.createElement("button")
        postCommentButton.onclick = postComment
        postCommentButton.className = "blog-button"
        postCommentButton.textContent = "Submit"
        postCommentButton.type = "button"
        form.appendChild(postCommentButton)

    } else {
        const paragraph = document.createElement("p")
        paragraph.innerHTML = "Please <a href='login.html'>log in</a> to post comments."
        form.appendChild(paragraph)
        form.style.textAlign = "center"
    }
}

function RenderCommentList(articleJSON) {
    let commentList = document.getElementById("comment-list")
    if (articleJSON.comments.length > 0) {
        const commentsTitle = document.createElement("h3")
        commentsTitle.textContent = `Comments:`
        commentsTitle.style.margin = "15px 5px 5px 0px"
        commentList.appendChild(commentsTitle)

        articleJSON.comments.forEach((value) => {
            const newComment = document.createElement("div")
            newComment.className = "comment"

            const contentP = document.createElement("p")
            contentP.innerHTML = `<div class="comment-title">${value.author.name}:</div><p id="comment${value.id}-content">${value.contentText}</p>`

            const datesAndFormsContainer = document.createElement("div")
            datesAndFormsContainer.style = "display: inline-block; width: 100%;"

            const datesP = document.createElement("p")
            datePosted = new Date(value.datePosted)
            datesP.textContent = formatUTCDateForDisplayAsLocal(datePosted, 'Posted')
            datesP.style = "padding: 0.875rem 0px 0.25rem; display: inline-block;"

            if (value.lastEdited != '') {
                lastEdited = new Date(value.lastEdited)
                if (lastEdited.getUTCFullYear() != 1) {
                    datesP.textContent += formatUTCDateForDisplayAsLocal(lastEdited, ', Last Edited')
                }
            }
            datesAndFormsContainer.appendChild(datesP)

            if (isUserLoggedIn()) {
                let user = JSON.parse(localStorage.getItem(LS_KEY_user))

                if (value.author.id === user.id) {
                    datesAndFormsContainer.appendChild(createCommentEditDeleteButtons(value, articleJSON))
                }
            }

            newComment.appendChild(contentP)
            newComment.appendChild(datesAndFormsContainer)

            commentList.appendChild(newComment)
        })
    } else {
        const notice = document.createElement("p")
        notice.textContent = "This article has no comments yet."

        commentList.appendChild(notice)
        commentList.style.textAlign = "center"
    }
}

function createCommentEditDeleteButtons(comment, article) {
    const buttonContainer = document.createElement("div")
    buttonContainer.className = "comment-button-container"

    // float is right for the buttons so they're rendered the opposite order than written here
    buttonContainer.innerHTML = `
        <button class="comment-button delete-comment-button" onclick="toggleDeletePopup(true, ${comment.id})">Delete</button>
        <div id="delete-popup${comment.id}" class="comment-button-popup">
            <p style="text-align: center; width: 100%;">Do you want to delete your comment?</p>

            <button class="comment-button comment-form-button" onclick="toggleDeletePopup(false, ${comment.id})">Cancel</button>
            <button class="comment-button comment-form-button delete-comment-button" 
                    onclick="DeleteCommentAsync(${article.id}, ${comment.id}).then(() => { ReRenderCommentList(${article.id}).then() })">Delete</button>
        </div>

        <button id="edit-button" class="comment-button">Edit</button>
        <div id="edit-popup${comment.id}" class="comment-button-popup">
            <p style="text-align: center; width: 100%;">Do you want to submit your edits?</p>

            <button id="cancel-edit${comment.id}" class="comment-button comment-form-button">Cancel</button>
            <button id="submit-edit${comment.id}" class="comment-button comment-form-button">Submit</button>
        </div>
        `
    buttonContainer.querySelector(`#edit-button`).onclick = () => {
        toggleEditPopup(true, comment.id, comment.contentText)
    }
    buttonContainer.querySelector(`#cancel-edit${comment.id}`).onclick = () => {
        toggleEditPopup(false, comment.id, comment.contentText)
    }
    buttonContainer.querySelector(`#submit-edit${comment.id}`).onclick = () => {
        SubmitCommentEdit(comment, article.id)
    }
    buttonContainer.id = `button-container${comment.id}`

    return buttonContainer
}

function toggleEditPopup(doesPopup, commentId, commentText) {
    const editPopup = document.getElementById(`edit-popup${commentId}`)
    const buttonContainer = document.getElementById(`button-container${commentId}`)
    const commentContent = document.getElementById(`comment${commentId}-content`)
    
    if (doesPopup) {
        editPopup.style.display = "grid";
        buttonContainer.style.minHeight = "4.25rem";

        const editCommentInput = document.createElement("textarea")
        editCommentInput.textContent = commentText
        editCommentInput.className = "edit-comment-textarea"
        editCommentInput.contentEditable = true
        commentContent.innerHTML = ""
        commentContent.appendChild(editCommentInput)

    } else {
        editPopup.style.display = "none";
        buttonContainer.style.minHeight = "initial";

        commentContent.innerHTML = commentText
    }
}
function toggleDeletePopup(doesPopup, commentId) {
    const buttonContainer = document.getElementById(`button-container${commentId}`)
    const deletePopup = document.getElementById(`delete-popup${commentId}`)

    if (doesPopup) {
        deletePopup.style.display = "grid";
        buttonContainer.style.minHeight = "4.25rem";
    } else {
        deletePopup.style.display = "none";
        buttonContainer.style.minHeight = "initial";
    }
}
function SubmitCommentEdit(comment, articleId) {
    const commentContent = document.getElementById(`comment${comment.id}-content`).firstElementChild.value
    comment.contentText = commentContent
    UpdateCommentAsync(comment.id, comment).then(() => { ReRenderCommentList(articleId).then() })
}

function postComment() {
    let comment_content_input = document.getElementById("commentInput")
    if (comment_content_input.value.replace(/\s/g, '').length) {
        let user = JSON.parse(localStorage.getItem(LS_KEY_user))
        let articleId = parseInt(GetUrlSearch())
        comment = {
            author: user,
            contentText: comment_content_input.value,
            articleId: articleId
        }
        CreateCommentAsync(comment).then(() => {
            comment_content_input.value = ""
            ReRenderCommentList(articleId).then()
        })
        document.getElementById("comment-list").style.textAlign = ""
    }
}

async function ReRenderCommentList(articleId) {
    let scrollY = window.scrollY

    cl = document.getElementById("comment-list")
    for (let i = 0; i < cl.children.length; i++) { cl.children[i].remove(); --i; }
    let json = await GetArticleByIdAsync(articleId)    
    RenderCommentList(json)

    window.requestAnimationFrame(() => {
        window.scroll(0, scrollY)
    })
}





function signUpAnimation() {
    if (document.body.scrollHeight <= document.body.clientHeight + 200 || window.innerWidth > 768) {
        let footer = document.getElementById("footer")
        footer.classList.add("sign-up-animated")

        let scrollingElement = (document.scrollingElement || document.body)
        let keepScrollDown = setInterval(() => { scrollingElement.scrollTop = scrollingElement.scrollHeight}, 20)
        setTimeout(() => {
            footer.classList.remove("sign-up-animated")
            clearInterval(keepScrollDown)
        }, 1200)
    }
}

// just for fun :)
// uncomment window event listener in navbar template to restore
function windowOnResizeChangeColor() {
    document.documentElement.style.setProperty('--blog-theme-color-hue',
        document.documentElement.clientWidth)
}

// Run this each time the file is loaded:
if (isUserLoggedIn()) {
    let lastTimeJWTRefreshed = Date.parse(localStorage.getItem(LS_KEY_lastJWTRefresh))
    let now = Date.parse( new Date())
    setTimeout(RefreshTokenCallbackLoop, millisDelayToRefreshToken + lastTimeJWTRefreshed - now)
}