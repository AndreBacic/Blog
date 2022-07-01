export default function SkeletonArticle() {
    return (
        <div className="flex-item css-skeleton-article">
            <article className="article-flex-item">
                <h2>XXXXX XXXXXXX</h2>
                <p style={{ display: "inline-block" }}>Written by <cite>XXXXX XXXXX</cite><br /></p>
                <p>Posted XXXX XX, XXXX</p>
                <div className="tags-container">
                    <h4>Tags: </h4>
                    <p className="tag">XXXXXXXXX</p>
                </div>
            </article>
        </div>
    )
}