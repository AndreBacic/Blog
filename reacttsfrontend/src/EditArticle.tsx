import { useContext, useEffect } from "react"
import HaveSearchBarContext from "./HaveSearchBarContext"

export default function EditArticle() {
    const [haveSearchBar, setHaveSearchBar] = useContext(HaveSearchBarContext)
    useEffect(() => {
        setHaveSearchBar(false)
        document.title = "Login - The Blog of Andre Bačić"
    }, [])
    return (
        <div>EditArticle</div>
    )
}
