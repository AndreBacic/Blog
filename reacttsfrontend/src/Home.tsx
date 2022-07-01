import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArticleModel, formatUTCDateForDisplayAsLocal, GetAllArticlesAsync, incrementMaxNumArticlesDisplayed, initialMaxNumArticlesDisplayed } from '.'
import SkeletonArticle from './SkeletonArticle'

function Home() {
    const [articles, setArticles] = useState<ArticleModel[]>([])
    const [maxNumArticlesDisplayed, setMaxNumArticlesDisplayed] = useState(initialMaxNumArticlesDisplayed)

    // grab articles from api
    useEffect(() => {
        GetAllArticlesAsync().then(articles => {
            setArticles(articles)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    function GetMoreArticlesToBeRendered() {
        if (maxNumArticlesDisplayed >= articles.length) return
        setMaxNumArticlesDisplayed(m => m + incrementMaxNumArticlesDisplayed)
    }
    return (
        <>
            <h1>Latest Articles</h1>
            <div id="articleList" className="flex-container-column">
                {articles.length === 0 ?
                    Array(6).fill(0).map((_, i: number) => <SkeletonArticle key={i} />)
                    :
                    articles.slice(0, maxNumArticlesDisplayed).map((article, i) => {
                        let lastEdited = new Date(article.lastEdited)
                        return (
                            <Link to={`article/${article.id}`} className="flex-item" key={i}>
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
                            </Link>
                        )
                    })
                }
            </div>
            {(articles.length > initialMaxNumArticlesDisplayed) &&
                <button id="load-more-articles-button" className="button-article-list"
                    onClick={GetMoreArticlesToBeRendered} type="button">
                    {maxNumArticlesDisplayed >= articles.length ? "That is All" : "Load More"}
                </button>
            }
        </>
    )
}

export default Home