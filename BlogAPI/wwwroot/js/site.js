const accountURI = "api/AccountApi"
const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"


// AccountApi methods   ////////////////////////////////////////////////////////////
function getAuthToken() {
    let authToken = null;
    try {
        authToken = JSON.parse(localStorage.getItem('authToken'))
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
    if (jwt.value === "Invalid password" || jwt.value === "Invalid email address") {
        return
    }
    // Only log in user if the password was valid
    localStorage.setItem('authToken', JSON.stringify(jwt))
    let user = await GetLoggedInUserAsync()
    localStorage.setItem('user', JSON.stringify(user))
}
async function LogoutAsync() {
    //let somePromise = await fetch(`${accountURI}/logout`,
    //    {
    //        method: 'POST',
    //        headers: {
    //            'Authorization': 'Bearer '+getAuthToken()
    //        }
    //    })
    //let success = await somePromise.text()
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
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
    let success = await createPromise.json()
    return success
}

async function EditAccountAsync(user) {
    let createPromise = await fetch(`${accountURI}/editAccount`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(user)
        })
    let success = await createPromise.json()
    if (success === true) {
        let user = await GetLoggedInUserAsync()
        localStorage.setItem('user', JSON.stringify(user))
    }
    return success
}

async function EditPasswordAsync(oldPassword, newPassword) {
    let createPromise = await fetch(`${accountURI}/editPassword`,
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
    let success = await createPromise.json()
    return success
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
    return articles;
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
    //let success = await createPromise.json()
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
    //let success = await updatePromise.json()
}

async function DeleteArticleAsync(id) {
    let deletePromise = await fetch(`${articleURI}/${id}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        })
    //let success = await deletePromise.json()
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
    let infoPromise = await fetch(`${commentURI}/${articleId}?id=${commentId}`,
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

async function DeleteCommentAsync(id) {
    let deletePromise = await fetch(`${commentURI}/${id}`,
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

async function RenderTempletesAsync(haveSearch = true) {
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

        logout_link = navClone.querySelector("#login-link")
        logout_link.innerText = "Logout"
        logout_link.href = "javascript:void(LogoutAsync().then(window.location = 'index.html'))"
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
    article.className = "flex-item"
    
    const header = document.createElement("h2")
    header.textContent = articleJSON.title
    article.appendChild(header)

    //const content = document.createElement("p")
    //content.textContent = articleJSON.contentText
    //article.appendChild(content)

    const authorNameLabel = document.createElement("p")
    authorNameLabel.style = "display: inline-block;"
    authorNameLabel.textContent = 'Written by '

    const citedAuthorName = document.createElement("cite")
    citedAuthorName.textContent = articleJSON.authorName

    authorNameLabel.appendChild(citedAuthorName)
    authorNameLabel.innerHTML += "<br />"

    const datesP = document.createElement("p")
    datePosted = new Date(articleJSON.datePosted)
    datesP.textContent = `${formatDateForArticle(datePosted, 'Posted')}`

    if (articleJSON.lastEdited != '') {
        lastEdited = new Date(articleJSON.lastEdited)
        if (lastEdited.getUTCFullYear() != 1) {
            datesP.textContent += `, ${formatDateForArticle(lastEdited, 'Last Edited')}`
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




async function RenderArticlePageMainAsync() {
    let id = parseInt(GetUrlSearch())
    let json = await GetArticleByIdAsync(id)
    let article = RenderFullArticle(json)
    document.getElementById("main").prepend(article)
    document.title = `${json.title} - Blog` // todo: give this site a better name than 'Blog'

    RenderPostCommentForm()
    RenderCommentList(json)
}

function RenderFullArticle(articleJSON) {
    const article = document.createElement("article")
    article.className = "full-article"

    const header = document.createElement("h1")
    header.textContent = articleJSON.title
    article.appendChild(header)

    const content = document.createElement("p")
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
    datePostedParagraph.textContent = formatDateForArticle(datePosted, 'Date Posted:')
    datePostedParagraph.style = "float: right;"

    // append elements
    infoDiv.appendChild(authorNameLabel)

    if (articleJSON.lastEdited != '') {
        lastEdited = new Date(articleJSON.lastEdited)
        if (lastEdited.getUTCFullYear() != 1) {
            const lastEditedParagraph = document.createElement("p")
            lastEditedParagraph.textContent = formatDateForArticle(lastEdited, 'LastEdited:')
            lastEditedParagraph.style = "float: right;"
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

function formatDateForArticle(date, statement) {
    return `${statement} ${date.toLocaleDateString('default', { month: 'long' })} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
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

        // TODO: have edit comment option for the comment's owner

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
        commentsTitle.style.margin = "15px 5px 5px 10px"
        commentList.appendChild(commentsTitle)

        articleJSON.comments.forEach((value, index) => {
            const newComment = document.createElement("div")
            newComment.className = "comment"

            const contentP = document.createElement("p")
            contentP.textContent = `${value.author.name}: ${value.contentText}`

            const datesP = document.createElement("p")
            datePosted = new Date(value.datePosted)
            datesP.textContent = `${formatDateForArticle(datePosted, 'Posted')}`

            if (value.lastEdited != '') {
                lastEdited = new Date(value.lastEdited)
                if (lastEdited.getUTCFullYear() != 1) {
                    datesP.textContent += `, ${formatDateForArticle(lastEdited, 'Last Edited')}`
                }
            }
            newComment.appendChild(contentP)
            newComment.appendChild(datesP)

            commentList.appendChild(newComment)
        })
    } else {
        const notice = document.createElement("p")
        notice.textContent = "This article has no comments yet."

        commentList.appendChild(notice)
        commentList.style.textAlign = "center"
    }
}

function postComment() {
    let comment_content_input = document.getElementById("commentInput")
    if (comment_content_input.value.replace(/\s/g, '').length) {
        let user = JSON.parse(localStorage.getItem('user'))
        let articleId = parseInt(GetUrlSearch())
        comment = {
            author: user,
            contentText: comment_content_input.value,
            articleId: articleId
        }
        CreateCommentAsync(comment).then(() => {
            comment_content_input.value = ""
            window.location.reload()
        })
    }
}