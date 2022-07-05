import { useState } from "react"
import { CommentModel, DeleteCommentAsync, formatUTCDateForDisplayAsLocal, UpdateCommentAsync, UserModel } from "."

type Props = {
    comment: CommentModel,
    user: UserModel
}

enum Mode {
    View,
    Edit,
    Delete
}

export default function Comment({ comment: comment0, user }: Props) {
    const [comment, setComment] = useState(comment0)
    const lastEdited = new Date(comment.lastEdited)
    const [mode, setMode] = useState(Mode.View)
    function SubmitCommentEdit() {
        const textarea = document.getElementById(`comment${comment.id}-content`)?.firstElementChild as HTMLTextAreaElement
        const commentContent = textarea.value
        comment.contentText = commentContent
        UpdateCommentAsync(comment.id, comment).then(() => {
            comment.lastEdited = new Date().toString()
            setMode(Mode.View)
            setComment(comment)
        })
    }
    return (
        <>
            {comment.id > 0 &&
                <div className="comment">
                    <p>
                        <div className="comment-title">{comment.author.name}:</div>

                        <p id={`comment${comment.id}-content`}>
                            {mode === Mode.Edit ?
                                <textarea className="edit-comment-textarea" contentEditable="true"
                                    defaultValue={comment.contentText}></textarea>
                                : comment.contentText}
                        </p>
                    </p>
                    <div style={{ display: "inline-block", width: "100%" }}>
                        <p style={{ padding: "0.875rem 0px 0.25rem", display: "inline-block" }}>
                            {formatUTCDateForDisplayAsLocal(new Date(comment.datePosted), 'Posted')}
                            {lastEdited.getFullYear() != 1 ? formatUTCDateForDisplayAsLocal(lastEdited, ', Last Edited') : ""}
                        </p>
                        {user !== null && user.id === comment.author.id &&
                            <div className="comment-button-container" style={{ minHeight: mode === Mode.View ? "initial" : "4.25rem" }}>
                                <button className="comment-button delete-comment-button" onClick={() => setMode(Mode.Delete)}>Delete</button>
                                <div className="comment-button-popup" style={{ display: mode === Mode.Delete ? "grid" : "none" }}>
                                    <p style={{ textAlign: "center", width: "100%" }}>Do you want to delete your comment?</p>

                                    <button className="comment-button comment-form-button"
                                        onClick={() => setMode(Mode.View)}>Cancel</button>
                                    <button className="comment-button comment-form-button delete-comment-button"
                                        onClick={() => DeleteCommentAsync(comment.articleId, comment.id).then(() => {
                                            setMode(Mode.View)
                                            comment.id = -1 // this causes this component to not be rendered
                                            setComment(comment)
                                        })}>
                                        Delete</button>
                                </div>

                                <button className="comment-button" onClick={() => setMode(Mode.Edit)}>Edit</button>
                                <div className="comment-button-popup" style={{ display: mode === Mode.Edit ? "grid" : "none" }}>
                                    <p style={{ textAlign: "center", width: "100%" }}>Do you want to submit your edits?</p>
                                    <button className="comment-button comment-form-button"
                                        onClick={() => setMode(Mode.View)}>Cancel</button>
                                    <button className="comment-button comment-form-button"
                                        onClick={SubmitCommentEdit}>
                                        Submit</button>
                                </div>
                            </div>
                        }
                    </div>
                </div >
            }
        </>
    )
}