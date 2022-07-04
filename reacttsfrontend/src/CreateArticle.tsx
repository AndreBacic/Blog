import { useContext, useEffect } from "react"
import { CreateArticleAsync, CreateOrEditArticleModel } from "."
import HaveSearchBarContext from "./HaveSearchBarContext"

function CreateArticle() {
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    useEffect(() => {
        setHaveSearchBar(true)
        document.title = "Create Article - The Blog of Andre Bačić"
    }, [])
    return (
        <form action="javascript:void(0)" onSubmit={() => GetArticleDataAndSubmitAsync().then()} className="account-form">
            <h1>Create New Article</h1>
            <div>
                <label htmlFor="titleInput">Title: </label><br />
                <input id="titleInput" type="text" className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="tagsInput">Tags: </label><br />
                <input id="tagsInput" type="text" className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="nameInput">Author Name: </label><br />
                <input id="nameInput" type="text" className="account-text-input" contentEditable="true" />
            </div>
            <div>
                <label htmlFor="contentInput">Content: </label><br />
                <textarea id="contentInput" style={{ height: "600px", width: "100%" }} className="account-text-input" placeholder="Add article content" contentEditable="true"></textarea>
            </div>
            <input type="submit" className="blog-button" value="Submit" />
        </form>
    )
}

async function GetArticleDataAndSubmitAsync() {
    // TODO: Change from document.getElementById to React.useRef()?
    const nameInput = document.getElementById("nameInput") as HTMLInputElement
    const titleInput = document.getElementById("titleInput") as HTMLInputElement
    const tagsInput = document.getElementById("tagsInput") as HTMLInputElement
    const contentInput = document.getElementById("contentInput") as HTMLTextAreaElement

    let tags = tagsInput.value.split(',')

    const article: CreateOrEditArticleModel = {
        title: titleInput.value,
        tags: tags,
        authorName: nameInput.value,
        contentText: contentInput.value
    }
    titleInput.value = ""
    tagsInput.value = ""
    contentInput.value = ""

    const resp = await CreateArticleAsync(article)

    if (resp.status < 400) {
        window.alert("Successfully created!")
    } else {
        titleInput.value = article.title
        tagsInput.value = article.tags.toString()
        contentInput.value = article.contentText

        window.alert("There was a problem creating the article.")
    }
}

export default CreateArticle