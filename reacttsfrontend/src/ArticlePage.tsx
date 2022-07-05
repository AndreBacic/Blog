import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArticleModel, CommentModel, CreateOrEditCommentModel, formatUTCDateForDisplayAsLocal, GetArticleByIdAsync, CreateCommentAsync } from "."
import UserContext, { LS_KEY_user } from "./UserContext"
import Comment from "./Comment"
import HaveSearchBarContext from "./HaveSearchBarContext"

function ArticlePage() {
    const id = Number(useParams().id)
    const [article, setArticle] = useState<ArticleModel | null>(null)
    const [user, setUser] = useContext(UserContext)
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)

    // default last edited to be min date
    let lastEdited = new Date("0001-01-01T00:00:00")
    // grab article from api
    useEffect(() => {
        setHaveSearchBar(true)
        GetArticleByIdAsync(id).then(a => {
            setArticle(a)
            lastEdited = new Date(a.lastEdited)
            document.title = `${a.title} - The Blog of Andre Bačić`
        })
    }, [])

    function postComment() {
        let comment_content_input = document.getElementById("commentInput") as HTMLInputElement
        if (comment_content_input.value.replace(/\s/g, '').length) {
            let user = JSON.parse(localStorage.getItem(LS_KEY_user) as string)
            let comment: CreateOrEditCommentModel = {
                author: user,
                contentText: comment_content_input.value,
                articleId: id
            }
            CreateCommentAsync(comment).then(() => {
                comment_content_input.value = ""
                GetArticleByIdAsync(id).then(a => {
                    setArticle(a)
                    lastEdited = new Date(a.lastEdited)
                })
            })
        }
    }
    return (
        <>
            <h1>{article?.title}</h1>
            <article className="full-article">
                <div dangerouslySetInnerHTML={{ __html: `${article?.contentText}` }}></div>
                <div className="article-info-div">
                    <p>Written by <cite>{article?.authorName}</cite></p>
                    <div className="tags-container">
                        <h4>Tags: </h4>
                        {article?.tags.map((tag: string, i: any) => <p className="tag" key={i}>{tag}</p>)}
                    </div>
                    <p style={{ float: "right", textAlign: "right" }}>&nbsp;&nbsp;
                        {lastEdited.getFullYear() != 1 ? formatUTCDateForDisplayAsLocal(lastEdited, ', Last Edited') : ""}
                    </p>
                    <p style={{ float: "right", textAlign: "right" }}>{formatUTCDateForDisplayAsLocal(new Date(article?.datePosted as string), 'Posted')}</p><br />

                </div>
            </article>
            {user !== null ?
                <form id="post-comment-form" onClick={postComment}>
                    <h4>Leave a comment</h4>
                    <textarea id="commentInput" contentEditable="true" placeholder="Your comment"></textarea>
                    <button className="blog-button" type="button">Submit</button>
                </form>
                :
                <form id="post-comment-form" style={{ textAlign: "center" }}>
                    <p>Please <Link to="/login">log in</Link> to post comments.</p>
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