import { useContext, useEffect } from "react"
import HaveSearchBarContext from "./HaveSearchBarContext"

function PageNotFound() {
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    useEffect(() => setHaveSearchBar(true), [])
    return (
        <>
            <h1>Error 404: Page Not Found</h1>
            <article className="full-article">
                <h2>Unfortunately, the page you have been directed to cannot be found</h2>
            </article>
        </>
    )
}

export default PageNotFound