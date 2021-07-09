import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import userEvent from '@testing-library/user-event'
import { ROUTES } from "../constants/routes"


describe("Given I am connected as an employee", () => {
  describe("When Bills page is loading but there is an error", () => {
    test("Then, Error page should be displayed", () => {
      document.body.innerHTML = BillsUI({ error: true })
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    })
  })

  describe("When Bills page is loading", () => {
    test("Then, Loading page should be displayed", () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    })
  })
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      // const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const dates = Array.from(document.querySelectorAll('.dates')).map(a => a.innerHTML)
      const datesSorted = [...dates].sort(tri)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I am on Bills page and I click on New Bill', () => {
    test('Then, function handleClickNewBill have to be called', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e)) 
      const button = screen.getByTestId('btn-new-bill')
      button.addEventListener('click', handleClickNewBill)
      userEvent.click(button)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
  })
  describe('When I am on Bills page and I click on icon eye', () => {
    test('Then, function handleClickIconEye have to be called', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const button = document.querySelector(`div[data-testid="icon-eye"]`)
      const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(e, button))
      button.addEventListener('click', handleClickIconEye)
      userEvent.click(button)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    test('Then, A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })
      const button = document.querySelector(`div[data-testid="icon-eye"]`)
      const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(e, button))
      button.addEventListener('click', handleClickIconEye)
      userEvent.click(button)
      // expect(handleClickIconEye).toHaveBeenCalled()
      const modale = document.querySelector('#modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})
function tri(a,b) {
  let dateA = new Date(a)
  let dateB = new Date(b)
  return ((dateA < dateB) ? -1 : (dateA == dateB) ? 0 : 1)
}
