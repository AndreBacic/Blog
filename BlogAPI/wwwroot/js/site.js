const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

// ArticleApi methods
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

// CommentApi methods
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