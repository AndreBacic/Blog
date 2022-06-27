import React from 'react'

type Props = { hasSearch: boolean }

function Navbar({ hasSearch }: Props) {
    return (
        <>
            <input type="checkbox" id="navbar-toggle" className="navbar-toggle" />
            <label htmlFor="navbar-toggle" className="navbar-toggle-label">
                <span>
                    <span id="line1"></span>
                    <span id="line2"></span>
                    <span id="line3"></span>
                </span>
            </label>
            <nav className="navbar">
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a className="right" href="#footer" onClick={signUpAnimation} id="sign-up-link">Sign Up</a>
                <a className="right" href="login.html" id="login-link">Login</a>
                if (hasSearch) {
                    <div style={{ float: "right" }}>
                        <label htmlFor="search-bar">Search:</label>
                        <input id="search-bar" type="text" className="navbar-input" contentEditable="true" />
                    </div>
                }
                <script>
                    //window.addEventListener("resize", windowOnResizeChangeColor)
                </script>
            </nav>
        </>
    )
}

function signUpAnimation() {
    if (document.body.scrollHeight <= document.body.clientHeight + 200 || window.innerWidth > 768) {
        let footer = document.getElementById("footer") as HTMLElement

        footer.classList.add("sign-up-animated")

        let scrollingElement = (document.scrollingElement || document.body)
        let keepScrollDown = setInterval(() => { scrollingElement.scrollTop = scrollingElement.scrollHeight }, 20)
        setTimeout(() => {
            footer.classList.remove("sign-up-animated")
            clearInterval(keepScrollDown)
        }, 1200)
    }
}

export default Navbar