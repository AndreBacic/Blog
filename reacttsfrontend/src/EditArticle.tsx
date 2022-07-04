import { useContext, useEffect, useRef } from "react"
import { ArticleModel, CreateOrEditArticleModel, GetArticleByIdAsync, UpdateArticleAsync } from "."
import HaveSearchBarContext from "./HaveSearchBarContext"

export default function EditArticle() {
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    useEffect(() => {
        setHaveSearchBar(false)
        document.title = "Edit Article - The Blog of Andre Bačić"
    }, [])


    let Article: ArticleModel = {
        id: 0,
        title: "",
        datePosted: "",
        lastEdited: "",
        comments: [],
        tags: [],
        authorName: "",
        contentText: ""
    }
    const idInput = useRef<HTMLInputElement>(null)
    const nameInput = useRef<HTMLInputElement>(null)
    const titleInput = useRef<HTMLInputElement>(null)
    const tagsInput = useRef<HTMLInputElement>(null)
    const contentInput = useRef<HTMLTextAreaElement>(null)

    async function GetArticleDataAndSubmitAsync() {
        let id = Number(idInput.current!.value)
        if (Article.id !== id) {
            await LoadButtonOnClick()
            return
        }
        let tags = tagsInput.current!.value.split(',')

        const article: CreateOrEditArticleModel = {
            title: titleInput.current!.value,
            tags: tags,
            authorName: nameInput.current!.value,
            contentText: contentInput.current!.value
        }
        const resp = await UpdateArticleAsync(id, article)
        console.log(resp)
        if (resp.status < 400) {
            idInput.current!.value = '0'
            titleInput.current!.value = ""
            tagsInput.current!.value = ""
            contentInput.current!.value = ""

            window.alert("Successfully edited!")
        } else {
            window.alert("There was a problem editing the article.")
        }
    }

    async function LoadButtonOnClick() {
        let id = Number(idInput.current!.value)
        let resp = await GetArticleByIdAsync(id) as any
        if (resp.status == 404) {
            window.alert(`There is no article with an id of ${id}`)
            return
        }
        Article = resp
        let tags = ""
        Article.tags.forEach((t, i) => {
            if (i > 0) {
                tags += ","
            }
            tags += t
        })

        nameInput.current!.value = Article.authorName
        titleInput.current!.value = Article.title
        tagsInput.current!.value = tags
        contentInput.current!.value = Article.contentText
    }
    return (
        <form
            action="javascript:void(0)"
            onSubmit={() => GetArticleDataAndSubmitAsync().then()}
            className="account-form">
            <h1>Edit Article</h1>
            <div>
                <label htmlFor="titleInput">Id (integer): </label>
                <br />
                <input
                    id="idInput"
                    ref={idInput}
                    style={{ width: "50%", marginRight: "5px" }}
                    type="number"
                    defaultValue={0}
                    className="account-text-input"
                    contentEditable="true"
                />
                <div style={{ display: "inline-block" }}
                    className="blog-button"
                    onClick={() => LoadButtonOnClick().then()} >
                    Load data
                </div>
            </div>
            <div>
                <label htmlFor="titleInput">Title: </label>
                <br />
                <input
                    id="titleInput"
                    ref={titleInput}
                    type="text"
                    className="account-text-input"
                    contentEditable="true"
                />
            </div>
            <div>
                <label htmlFor="tagsInput">Tags: </label>
                <br />
                <input
                    id="tagsInput"
                    ref={tagsInput}
                    type="text"
                    className="account-text-input"
                    contentEditable="true"
                />
            </div>
            <div>
                <label htmlFor="nameInput">Author Name: </label>
                <br />
                <input
                    id="nameInput"
                    ref={nameInput}
                    type="text"
                    className="account-text-input"
                    contentEditable="true"
                />
            </div>
            <div>
                <label htmlFor="contentInput">Content: </label>
                <br />
                <textarea
                    id="contentInput"
                    ref={contentInput}
                    style={{ height: "600px", width: "100%" }}
                    className="account-text-input"
                    placeholder="Add article content"
                    contentEditable="true"
                    defaultValue={""}
                />
            </div>
            <input type="submit" className="blog-button" defaultValue="Submit" />
        </form>
    )
}
