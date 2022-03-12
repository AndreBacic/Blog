describe("Navigate the Blog app while logged out", () => {

    beforeEach(() => {
        cy.viewport(1200, 800)
        cy.visit('https://localhost:44325')
        cy.get('header').should('contain.text', "The Blog of Andre Bačić")
        cy.get('body').should('contain.html', 'nav')
        cy.get('nav').children('a').should('contain.text', 'Login') // logged out
    })

    it("Looks at an article", () => {
        cy.get('article').first().click()

        cy.get('main').should('contain.html', 'article')
        cy.get('form').should('not.contain.html', 'input') // logged out, so comment form shouldn't have an input
    })

    it("Searches for articles", () => {
        cy.get('nav').should('contain.html', 'input')
        cy.get('nav input').type('JavaScript').type('{enter}')
        
        cy.location().should((location) => {
            expect(location.href).to.contain('search.html')
        })

        cy.get('select').select(1)
    })

    // TODO: validate signup form rejects bad info
    it("Gives bad login creds and get rejected", () => {
        cy.get('nav a[href="login.html"]').click()

        cy.get('main input[type="email"]').type("not.real@fakeness.testilly.e2etest")
        cy.get('main input[type="password"]').type("heyyyyyyy")

        // const alertStub = cy.stub()
        cy.on('window:alert', (e) => {
            console.log(e)
            expect(e).to.contain('Incorrect') // TODO: change test to not be so hard-coded?
        })

        cy.get('main input[type="submit"]').click()
    })

    it("Visits about page", () => {
        cy.get('nav a[href="about.html"]').click()

        cy.get('main').should('contain.html', 'h1')
        cy.get('main').should('contain.html', 'article')
    })
    // TODO: validate createArticle.html rejects non-logged in user
})
