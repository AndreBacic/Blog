import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArticleModel, formatUTCDateForDisplayAsLocal, GetArticleByIdAsync } from "."

function ArticlePage() {
    const { id } = useParams()
    const [article, setArticle] = useState<ArticleModel | null>(null)

    // default last edited to be min date
    let lastEdited = new Date("0001-01-01T00:00:00")
    // grab article from api
    useEffect(() => {
        console.log(id)
        GetArticleByIdAsync(Number(id)).then(a => {
            setArticle(a)
            lastEdited = new Date(a.lastEdited)
        })
    }, [])
    return (
        <>
            <h1>{article?.title}</h1>
            <article className="full-article">
                <div dangerouslySetInnerHTML={{ __html: `${article?.contentText}` }}></div>
                <div className="article-info-div">
                    <p>Written by <cite>{article?.authorName}</cite></p>
                    <p>

                    </p>
                    <div className="tags-container">
                        <h4>Tags: </h4>
                        {article?.tags.map((tag: string, i: any) => <p className="tag" key={i}>{tag}</p>)}
                    </div>
                    <p style={{ float: "right", textAlign: "right" }}>&nbsp;&nbsp;
                        {lastEdited.getFullYear() != 1 ? formatUTCDateForDisplayAsLocal(lastEdited, ', LastEdited') : ""}
                    </p>
                    <p style={{ float: "right", textAlign: "right" }}>{formatUTCDateForDisplayAsLocal(new Date(article?.datePosted as string), 'Posted')}</p><br />

                </div>
            </article>
            <form id="post-comment-form" style={{ textAlign: "center" }}>
                <p>Please <Link to="login">log in</Link> to post comments.</p>
            </form>
            <div id="comment-list" style={{ textAlign: "center" }}>
                <p>This article has no comments yet.</p>
            </div>
        </>
    )
}

export default ArticlePage