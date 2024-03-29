import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArticleModel, formatUTCDateForDisplayAsLocal, GetAllArticlesAsync, incrementMaxNumArticlesDisplayed, initialMaxNumArticlesDisplayed } from '.'
import SkeletonArticle from "./SkeletonArticle"

function SearchPage() {
    const searchQuery = useParams().search as string
    const searchBar = useRef<HTMLInputElement>(null)
    const [search, setSearch] = useState(searchQuery)
    const [selectedTag, setSelectedTag] = useState("(Any)")
    const [tags, setTags] = useState([selectedTag])
    const [articles, setArticles] = useState<ArticleModel[]>([])
    const [maxNumArticlesDisplayed, setMaxNumArticlesDisplayed] = useState(initialMaxNumArticlesDisplayed)

    const navSearchBar = document.getElementById("search-bar")
    if (navSearchBar) {
        navSearchBar.addEventListener("keyup", (e) => {
            if (e.keyCode === 13 && searchBar.current) {
                searchBar.current.value = (navSearchBar as HTMLInputElement).value
                setSearch((navSearchBar as HTMLInputElement).value)
            }
        })
    }

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

    useEffect(() => {
        setMaxNumArticlesDisplayed(initialMaxNumArticlesDisplayed)
    }, [search, selectedTag])

    function GetMoreArticlesToBeRendered() {
        if (maxNumArticlesDisplayed >= articles.length) return
        setMaxNumArticlesDisplayed(m => m + incrementMaxNumArticlesDisplayed)
    }

    let filteredArticles = articles.map((article, i) => {
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
                        {lastEdited.getFullYear() !== 1 ? formatUTCDateForDisplayAsLocal(lastEdited, ', LastEdited') : ""}
                    </p>
                    <div className="tags-container">
                        <h4>Tags: </h4>
                        {article.tags.map((tag: string, i: any) => <p className="tag" key={i}>{tag}</p>)}
                    </div>
                </article>
            </Link>
            )
    }).filter(x => !!x)
    
    return (
        <>
            <div id="search-fields">
                <div>
                    <label htmlFor="article-search-bar">Search:</label>
                    <input id="article-search-bar" type="text" style={{ marginBottom: "10px" }} className="account-text-input" contentEditable="true"
                        onChange={(e) => setSearch(e.target.value)} defaultValue={search} ref={searchBar} />
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
                {!filteredArticles ?
                    Array(4).fill(0).map((_, i: number) => <SkeletonArticle key={i} />)
                    :
                    filteredArticles.slice(0, maxNumArticlesDisplayed)
                }
            </div>
            {(filteredArticles && filteredArticles.length > initialMaxNumArticlesDisplayed) &&
                <button id="load-more-articles-button" className="button-article-list"
                    onClick={GetMoreArticlesToBeRendered} type="button">
                    {maxNumArticlesDisplayed >= filteredArticles.length ? "That is All" : "Load More"}
                </button>
            }
        </>
    )
}

export default SearchPage