function About() {
    return (
        <article className="full-article">
            <h2>Why this exists</h2>
            <p>
                I built this website to learn how to make a full-stack web app
                with a C# + SQL Server Web API back-end being accessed by a vanilla
                HTML, CSS, and JavaScript front-end. I also used this process to
                learn unit testing with C#'s XUnit and end-to-end testing with Cypress.
            </p>
            <h2>How I made it</h2>
            <p style={{ marginBottom: "1px" }}>
                I started by researching what impressive-looking blogs look like and
                how users are directed through each site. Taking that inspiration, I
                made a plan for how application data would flow from the front-end to
                the database and back, and sketched out my basic plans for the user
                interface. From there I started by writing the C# Web API in its most
                basic form, getting it to successfully make calls to the SQL database,
                and then began to fill out the front-end.
            </p>
            <p style={{ marginTop: "1px" }}>
                The front-end work revealed problems in the back-end, and after hours
                of debugging both, I had a finished application! The final challenge
                was deploying this to Azure, setting up an affordable cloud database
                instance and managing security concerns.
            </p>
            <h2>About Me</h2>
            <p>
                My name is Andre Bačić, and I am a full-stack web developer eager to
                help and learn! If you're interested in hiring me,
                <a href="https://andrebacic.github.io/">my portfolio</a>
                has my contact information and demos some of my other development skills.</p>
        </article>
    )
}

export default About