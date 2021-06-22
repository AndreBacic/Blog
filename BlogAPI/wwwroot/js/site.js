const articleURI = "api/ArticleApi"
const commentURI = "api/CommentApi"

let articles = {}

function GetAllArticles() {
    fetch(articleURI, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(json => DisplayArticles(json))    
            .catch(error => console.error('Unable to get articles.', error));
    articles = json
}

async function GetAllArticlesAsync() {
    articles = await fetch(articleURI, { method: 'GET' })
    DisplayArticles(articles)
    document.body.append("<h3>Footer?</h3>")
}

function DisplayArticles(json) {
    articles = JSON.parse(json)
    let html = "<h2>My Articles:</h2>"
    articles.forEach(article => {
        html += "<p>" + article.Title + "," + article.AuthorName + " | "  + article + "</p>"
    })
    document.getElementById("articleList").innerHTML = html;
}

function DisplayRawArticles(json) {
    articles = json
    let html = "<h2>My Articles:</h2>"
    for (article in articles) {
        html += "<p>"+article+"</p>"
    }
    document.getElementById("articleList").innerHTML = html;
}