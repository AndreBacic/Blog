const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

let articles = []

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