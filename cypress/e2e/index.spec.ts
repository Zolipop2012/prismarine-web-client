/// <reference types="cypress" />
import type { AppOptions } from '../../src/optionsStorage'

const cleanVisit = (url?) => {
  cy.clearLocalStorage()
  visit(url)
}

const visit = (url = '/') => {
  window.localStorage.cypress = 'true'
  cy.visit(url)
}

// todo use ssl

const compareRenderedFlatWorld = () => {
  // wait for render
  // cy.wait(6000)
  // cy.get('body').toMatchImageSnapshot({
  //     name: 'superflat-world',
  // })
}

const testWorldLoad = () => {
  cy.document().then({ timeout: 20_000 }, doc => {
    return new Cypress.Promise(resolve => {
      doc.addEventListener('cypress-world-ready', resolve)
    })
  }).then(() => {
    compareRenderedFlatWorld()
  })
}

const setOptions = (options: Partial<AppOptions>) => {
  cy.window().then(win => {
    Object.assign(win['options'], options)
  })
}

it('Loads & renders singleplayer', () => {
  visit('/?singleplayer=1')
  setOptions({
    localServerOptions: {
      generation: {
        name: 'superflat',
        // eslint-disable-next-line unicorn/numeric-separators-style
        options: { seed: 250869072 }
      },
    },
    renderDistance: 2
  })
  testWorldLoad()
})

it('Joins to server', () => {
  visit('/?ip=localhost&version=1.16.1')
  window.localStorage.version = ''
  // todo replace with data-test
  // cy.get('[data-test-id="servers-screen-button"]').click()
  // cy.get('[data-test-id="server-ip"]').clear().focus().type('localhost')
  // cy.get('[data-test-id="version"]').clear().focus().type('1.16.1') // todo needs to fix autoversion
  cy.get('[data-test-id="connect-qs"]').click()
  testWorldLoad()
})

it('Loads & renders zip world', () => {
  cleanVisit()
  cy.get('[data-test-id="select-file-folder"]').click({ shiftKey: true })
  cy.get('input[type="file"]').selectFile('cypress/superflat.zip', { force: true })
  testWorldLoad()
})

it.skip('Performance test', () => {
  // select that world
  // from -2 85 24
  // await bot.loadPlugin(pathfinder.pathfinder)
  // bot.pathfinder.goto(new pathfinder.goals.GoalXZ(28, -28))
})
