import { useEffect, useState } from 'react'
import { ArticleModel, formatUTCDateForDisplayAsLocal, GetAllArticlesAsync, incrementMaxNumArticlesDisplayed, initialMaxNumArticlesDisplayed } from '.'

function Home() {
    const [articles, setArticles] = useState<ArticleModel[]>([])
    const [articlesToBeRendered, setArticlesToBeRendered] = useState<ArticleModel[]>([])
    const [maxNumArticlesDisplayed, setMaxNumArticlesDisplayed] = useState(initialMaxNumArticlesDisplayed)

    // grab articles from api
    useEffect(() => {
        GetAllArticlesAsync().then(articles => {
            setArticles(articles)
            setArticlesToBeRendered(articles.splice(0, initialMaxNumArticlesDisplayed))
        }).catch(err => {
            console.log(err)
        })
    }, [])

    function GetMoreArticlesToBeRendered(allArticles: ArticleModel[]) {
        if (maxNumArticlesDisplayed >= allArticles.length) {
            return allArticles
        } else {
            setMaxNumArticlesDisplayed(m => m + incrementMaxNumArticlesDisplayed)
            return allArticles.slice(0, maxNumArticlesDisplayed)
        }
    }
    return (
        <>
            <h1>Latest Articles</h1>
            <div id="articleList" className="flex-container-column">
                {articles.length === 0 ?

                    Array(6).fill(0).map((_, i: any) => {
                        return (
                            <div className="flex-item css-skeleton-article" key={i}>
                                <article className="article-flex-item">
                                    <h2>XXXXX XXXXXXX</h2>
                                    <p style={{ display: "inline-block" }}>Written by <cite>XXXXX XXXXX</cite><br /></p>
                                    <p>Posted XXXX XX, XXXX</p>
                                    <div className="tags-container">
                                        <h4>Tags: </h4>
                                        <p className="tag">XXXXXXXXX</p>
                                    </div>
                                </article>
                            </div>
                        )
                    })
                    :
                    articlesToBeRendered.map((article, i) => {
                        let lastEdited = new Date(article.lastEdited)
                        return (
                            <div className="flex-item" key={i}>
                                <article className="article-flex-item">
                                    <h2>{article.title}</h2>
                                    <p style={{ display: "inline-block" }}>Written by <cite>{article.authorName}</cite><br /></p>
                                    <p>{formatUTCDateForDisplayAsLocal(new Date(article.datePosted), 'Posted')}
                                        {lastEdited.getFullYear() != 1 ? formatUTCDateForDisplayAsLocal(lastEdited, ', LastEdited') : ""}
                                    </p>
                                    <div className="tags-container">
                                        <h4>Tags: </h4>
                                        {article.tags.map((tag: string, i: any) => <p className="tag" key={i}>{tag}</p>)}
                                    </div>
                                </article>
                            </div>
                        )
                    })
                }
            </div>
            <button id="load-more-articles-button" className="button-article-list"
                onClick={() => setArticlesToBeRendered(GetMoreArticlesToBeRendered(articles))} type="button">
                {maxNumArticlesDisplayed >= articles.length ? "That is All" : "Load More"}
            </button>
        </>
    )
}

export default Home