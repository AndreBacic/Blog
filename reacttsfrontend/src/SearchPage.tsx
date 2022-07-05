import { useParams } from "react-router-dom"
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArticleModel, formatUTCDateForDisplayAsLocal, GetAllArticlesAsync, incrementMaxNumArticlesDisplayed, initialMaxNumArticlesDisplayed } from '.'
import SkeletonArticle from "./SkeletonArticle"

function SearchPage() {
    const searchQuery = useParams().search as string
    const [search, setSearch] = useState(searchQuery)
    const [selectedTag, setSelectedTag] = useState("(Any)")
    const [tags, setTags] = useState([selectedTag])
    const [articles, setArticles] = useState<ArticleModel[]>([])
    const [maxNumArticlesDisplayed, setMaxNumArticlesDisplayed] = useState(initialMaxNumArticlesDisplayed)

    // grab articles from api
    useEffect(() => {
        GetAllArticlesAsync().then(articles => {
            setArticles(articles)

            let tags: string[] = []
            articles.forEach((article) => {
                article.tags.forEach((t) => {
                    if (!tags.includes(t)) {
                        tags.push(t)
                    }
                })
            })
            tags.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            })
            setTags(tags)

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
            <div id="search-fields">
                <div>
                    <label htmlFor="search-bar">Search:</label>
                    <input id="search-bar" type="text" style={{ marginBottom: "10px" }} className="account-text-input" contentEditable="true"
                        onChange={(e) => setSearch(e.target.value)} defaultValue={search} />
                </div>
                <div>
                    <label htmlFor="tag-selector">Filter by tag:</label>
                    <select id="tag-selector" onChange={(e) => setSelectedTag(e.target.value)}>
                        <option>(Any)</option>
                        {tags.map((t, i) => {
                            return <option className="tag" key={i}>{t}</option>
                        })}
                    </select>
                </div>
            </div>
            <h1>Latest Articles</h1>
            <div id="articleList" className="flex-container-column">
                {articles.length === 0 ?
                    Array(4).fill(0).map((_, i: number) => <SkeletonArticle key={i} />)
                    :
                    // TODO: Fix search results output
                    articles.map((article, i) => {
                        let lastEdited = new Date(article.lastEdited)
                        return ((article.title.toLowerCase().includes(search.toLowerCase()) ||
                            article.contentText.toLowerCase().includes(search.toLowerCase())) &&
                            (selectedTag === "(Any)" || article.tags.includes(selectedTag)))
                            &&
                            (<Link to={`/article/${article.id}`} className="flex-item" key={i}>
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
                    }).slice(0, maxNumArticlesDisplayed)
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

export default SearchPage