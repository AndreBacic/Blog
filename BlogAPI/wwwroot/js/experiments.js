function GetAllArticles() {
    fetch(articleURI, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(function (json) {
            articles = json
            DisplayArticles(json)
        })
        .catch(error => console.error('Unable to get articles.', error));
}

async function GetAllArticlesAsync() {
    let infoPromise = await fetch(articleURI, { method: 'GET' })
    articles = await infoPromise.json()
    DisplayArticles(articles)
    document.body.append("<h3>Footer?</h3>")
}

function DisplayArticles(json) {
    //articles = JSON.parse(json)
    let html = "<h2>My Articles:</h2>"
    articles.forEach(article => {
        html += "<p>" + article.Title + "," + article.AuthorName + " | " + article + "</p>"
    })
    document.getElementById("articleList").innerHTML = html;
}

function DisplayRawArticles(json) {
    articles = json
    let html = "<h2>My Articles:</h2>"
    for (article in articles) {
        html += "<p>" + article + "</p>"
    }
    document.getElementById("articleList").innerHTML = html;
}