import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArticleModel, CommentModel, formatUTCDateForDisplayAsLocal, GetArticleByIdAsync, CreateCommentAsync } from "."
import UserContext from "./UserContext"
import Comment from "./Comment"

function ArticlePage() {
    const { id } = useParams()
    const [article, setArticle] = useState<ArticleModel | null>(null)
    const [user, setUser] = useContext(UserContext)

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
            {user !== null ?
                <form id="post-comment-form" onSubmit={CreateComment}>
                    <h4>Leave a comment</h4>
                    <textarea id="commentInput" contentEditable="true" placeholder="Your comment"></textarea>
                    <button className="blog-button" type="button">Submit</button>
                </form>
                :
                <form id="post-comment-form" style={{ textAlign: "center" }}>
                    <p>Please <Link to="login">log in</Link> to post comments.</p>
                </form>
            }
            {article?.comments?.length == 0 ?
                <div id="comment-list" style={{ textAlign: "center" }}>
                    <p>This article has no comments yet.</p>
                </div>
                :
                <div id="comment-list">
                    <h3 style={{ margin: "15px 5px 5px 0px" }}>Comments:</h3>
                    {article?.comments?.map((comment: CommentModel, i: number) => {
                        return <Comment comment={comment} user={user} key={i} />
                    })}
                </div>
            }
        </>
    )
}

export default ArticlePage