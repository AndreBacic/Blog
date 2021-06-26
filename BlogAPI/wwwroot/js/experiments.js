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

function DisplayArticles(json) {
    //articles = JSON.parse(json)
    let html = "<h2>My Articles:</h2>"
    articles.forEach(article => {
        html += "<p>" + article.Title + "," + article.AuthorName + " | " + article + "</p>"
    })
    document.getElementById("articleList").innerHTML = html;
}