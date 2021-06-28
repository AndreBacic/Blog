
const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

// ArticleApi methods   ////////////////////////////////////////////////////////////
async function GetAllArticlesAsync() {
    let infoPromise = await fetch(articleURI, { method: 'GET' })
    let articles = await infoPromise.json()
    return articles;
}

async function GetArticleByIdAsync(id) {
    let infoPromise = await fetch(`${articleURI}/${id}`, { method: 'GET' })
    let article = await infoPromise.json()
    return article;
}

async function CreateArticleAsync(article) {
    let createPromise = await fetch(articleURI,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        })
    let success = await createPromise.json()
}

async function UpdateArticleAsync(id, article) {
    let updatePromise = await fetch(`${articleURI}/${id}`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        })
    let success = await updatePromise.json()
}

async function DeleteArticleAsync(id) {
    let deletePromise = await fetch(`${articleURI}/${id}`,
        {
            method: 'DELETE'
        })
    let success = await deletePromise.json()
}

// CommentApi methods   ////////////////////////////////////////////////////////////////
async function GetAllCommentsInArticle(articleId) {
    let infoPromise = await fetch(`${commentURI}/${articleId}`, { method: 'GET' })
    let comments = await infoPromise.json()
    return comments;
}

async function GetCommentByArticleAndId(articleId, commentId) {
    let infoPromise = await fetch(`${commentURI}/${articleId}?id=${commentId}`, { method: 'GET' })
    let comment = await infoPromise.json()
    return comment;
}
async function CreateCommentAsync(comment) {
    let createPromise = await fetch(commentURI,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        })
    let success = await createPromise.json()
}

async function UpdateCommentAsync(id, comment) {
    let updatePromise = await fetch(`${commentURI}/${id}`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        })
    let success = await updatePromise.json()
}

async function DeleteCommentAsync(id) {
    let deletePromise = await fetch(`${commentURI}/${id}`,
        {
            method: 'DELETE'
        })
    let success = await deletePromise.json()
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/// Data Model Classes  //////////////////////////////////////////////////////////////////////////////

class UserModel {
    constructor(firstName, lastName, emailAddress, id = null) {
        this.firstName = firstName
        this.lastName = lastName
        this.emailAddress = emailAddress
        this.id = id
    }

    get Name() {
        return `${this.firstName} ${this.lastName}`
    }
}

class CommentModel {
    constructor(datePosted, author, contentText, articleId, lastEdited = null, id = null) {
        this.datePosted = datePosted
        this.lastEdited = lastEdited
        this.author = author // should be UserModel
        this.contentText = contentText
        this.articleId = articleId
        this.id = id
    }
}

class ArticleModel {
    constructor(authorName, title, contentText, datePosted, lastEdited = null, comments = [], tags = [], id = null) {
        this.authorName = authorName
        this.title = title
        this.contentText = contentText
        this.datePosted = datePosted
        this.lastEdited = lastEdited
        this.comments = comments
        this.tags = tags
        this.id = id
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/// DOM Rendering Methods  ///////////////////////////////////////////////////////////////////////////

async function RenderArticles() {
    articles = await GetAllArticlesAsync()
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
    const article = document.createElement("article")
    article.className = "flex-item"

    const header = document.createElement("h4")
    header.textContent = articleJSON.title
    article.appendChild(header)

    const content = document.createElement("p")
    content.textContent = articleJSON.contentText
    article.appendChild(content)

    const authorNameLabel = document.createElement("p")
    const citedAuthorName = document.createElement("cite")
    citedAuthorName.textContent = articleJSON.authorName
    authorNameLabel.appendChild(citedAuthorName)
    article.appendChild(authorNameLabel)

    return article
}

async function RenderTempletesAsync(isLoggedIn = false, haveSearch = true) {
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