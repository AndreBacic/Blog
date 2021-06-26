class UserModel {
    constructor(firstName, lastName, emailAddress, id = null) {
        this.firstName = firstName
        this.lastName = lastName
        this.emailAddress = emailAddress
        this.id = id
    }

    get Name() {
        return `${this.firstName} ${this.lastName}`
    }
}

class CommentModel {
    constructor(datePosted, author, contentText, articleId, lastEdited = null, id = null) {
        this.datePosted = datePosted
        this.lastEdited = lastEdited
        this.author = author // should be UserModel
        this.contentText = contentText
        this.articleId = articleId
        this.id = id
    }
}

class ArticleModel {
    constructor(authorName, title, contentText, datePosted, lastEdited=null, comments=[], tags=[], id=null) {
        this.authorName = authorName
        this.title = title
        this.contentText = contentText
        this.datePosted = datePosted
        this.lastEdited = lastEdited
        this.comments = comments
        this.tags = tags
        this.id = id
    }
}