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
    citedAuthorName.textContent = articleJSON.contentText
    authorNameLabel.appendChild(citedAuthorName)
    article.appendChild(authorNameLabel)

    return article
}
