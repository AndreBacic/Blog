import { useState } from "react"
import { CommentModel, formatUTCDateForDisplayAsLocal, UserModel } from "."

type Props = {
    comment: CommentModel,
    user: UserModel
}

enum Mode {
    View,
    Edit,
    Delete
}

export default function Comment({ comment, user }: Props) {
    let lastEdited = new Date(comment.lastEdited)
    const [mode, setMode] = useState(Mode.View)
    return (
        <div className="comment">
            <p>
                <div className="comment-title">Andre Bačić:</div>
                <p id={`comment${comment.id}-content`}>
                    {comment.contentText}
                </p>
            </p>
            <div style={{ display: "inline-block", width: "100%" }}>
                <p style={{ padding: "0.875rem 0px 0.25rem", display: "inline-block" }}>
                    {formatUTCDateForDisplayAsLocal(new Date(comment.datePosted), 'Posted')}
                    {lastEdited.getFullYear() != 1 ? formatUTCDateForDisplayAsLocal(lastEdited, ', LastEdited') : ""}
                </p>
                {user !== null && user.id === comment.author.id &&
                    <div className="comment-button-container">
                        <button className="comment-button delete-comment-button" onClick={() => setMode(Mode.Delete)}>Delete</button>
                        <div className="comment-button-popup" style={{ display: mode === Mode.Delete ? "initial" : "none" }}>
                            <p style={{ textAlign: "center", width: "100%" }}>Do you want to delete your comment?</p>

                            <button className="comment-button comment-form-button"
                                onClick={() => setMode(Mode.View)}>Cancel</button>
                            <button className="comment-button comment-form-button delete-comment-button"
                                onClick={() => DeleteCommentAsync(9, 15).then(() => { ReRenderCommentList(9).then() })}>
                                Delete</button>
                        </div>

                        <button className="comment-button" onClick={() => setMode(Mode.Edit)}>Edit</button>
                        <div className="comment-button-popup" style={{ display: mode === Mode.Edit ? "initial" : "none" }}>
                            <p style={{ textAlign: "center", width: "100%" }}>Do you want to submit your edits?</p>
                            <button className="comment-button comment-form-button"
                                onClick={() => setMode(Mode.Edit)}>Cancel</button>
                            <button className="comment-button comment-form-button"
                                onClick={() => { editComment(); setMode(Mode.View) }}>
                                Submit</button>
                        </div>
                    </div>
                }
            </div>
        </div >
    )
}