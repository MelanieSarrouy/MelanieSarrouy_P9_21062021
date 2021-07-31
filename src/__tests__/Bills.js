import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import firebase from "../__mocks__/firebase.js"
import firestore from "../app/Firestore.js"
import Router from "../app/Router.js"


Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
// Test affichage page Bills
describe("Given I am connected as an employee", () => {
  describe("When Bills page is called", () => {
    test("Then, Bills Page should be displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
    })
  })
  // Test affichage page d'erreur
  describe("When Bills page is loading, there is an error", () => {
    test("Then, Error page should be displayed", () => {
      document.body.innerHTML = BillsUI({ error: true })
      expect(screen.getAllByText("Erreur")).toBeTruthy()
    })
  })
  // Test affichage page de chargement
  describe("When Bills page is loading", () => {
    test("Then, Loading page should be displayed", () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText("Loading...")).toBeTruthy()
    })
  })
  // Test surbrillance icone Bills
  describe("When I am on Bills Page", () => {
    test("Then bills icon in vertical layout should be highlighted", () => {
      firestore.bills = () => ({ 
        get: jest
          .fn()
          .mockResolvedValueOnce(bi => bi(bills)) 
      })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['Bills'] } })
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      const iconWindow = screen.getByTestId('icon-window')
      expect(iconWindow).toBeTruthy()
      expect(iconWindow.classList).toContain('active-icon')
      const iconMail = screen.getByTestId('icon-mail')
      expect(iconMail).toBeTruthy()
      expect(iconMail.classList).not.toContain('active-icon')
    })
    // Test affichage page Bills
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = Array.from(document.querySelectorAll("tbody>tr>td:nth-child(3)")).map(a => a.innerHTML)
      const datesSorted = [...dates].sort(tri)
      expect(dates).toEqual(datesSorted)
    })
  })
  // Test function handleClickNewBill
  describe('When I am on Bills page and I click on New Bill button', () => {
    test('Then, function handleClickNewBill have to be called', () => {
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
    // Test affichage du formulaire
    test('Then, form should be displayed', () => {
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const handleClickNewBill = (e) => bill.handleClickNewBill(e) 
      const button = screen.getByTestId('btn-new-bill')
      button.addEventListener('click', handleClickNewBill)
      userEvent.click(button)
      const title = screen.getAllByText("Envoyer une note de frais")
      expect(title).toBeTruthy()
    })
  })
  // Test function handleClickIconEye
  describe('When I am on Bills page and I click on Icon Eye button', () => {
    test('Then, function handleClickIconEye have to be called', () => {
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      const handleClickIconEye = jest.fn(() => {bill.handleClickIconEye(iconEye)}) 
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      expect(handleClickIconEye).toBeCalled()
    })
  })
  // Test ouverture de la modale
  describe('When I am on Bills page and I click on Icon Eye button', () => {
    test('Then, A modal should open', () => {
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      iconEye.addEventListener('click', () => bill.handleClickIconEye(iconEye))
      userEvent.click(iconEye)
      expect($.fn.modal).toHaveBeenCalled()

      const modale = document.querySelector("#modaleFile")
      const displayModale = modale.getAttribute('style')
      expect(modale).toBeTruthy()
      expect(displayModale).not.toBe("display: none;")
    })
    // Test concordances des attributs 
    test('Then, image source attribute is the same as icon data-bill-url attribute', () => {
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      iconEye.addEventListener('click', () => bill.handleClickIconEye(iconEye))
      userEvent.click(iconEye)

      const billUrl = iconEye.getAttribute("data-bill-url") 
      const img = document.querySelector(".modal-body img")
      const imgSrc = img.getAttribute("src")
      expect(billUrl).toEqual(imgSrc)
    })
    // Test message dans la modale si attibut null
    test('Then, data-bill-url attribute is null modal should open with a message', () => {
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      iconEye.setAttribute("data-bill-url", "null") 
      iconEye.addEventListener('click', () => bill.handleClickIconEye(iconEye))
      userEvent.click(iconEye)
      expect(screen.getAllByText("Aucun justificatif fourni")).toBeTruthy()
    })
  })
  // Test absance d'icone eye si absence de bills
  describe("When I am on Bills Page and there is no bills", () => {
    test("Then there isn't any Icon Eye button", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      const iconEye = screen.queryByTestId("icon-eye")
      expect(iconEye).toBeNull()
    })
  })
})
// fonction de tri des dates
function tri(a,b) {
  let dateA = new Date(a)
  let dateB = new Date(b)
  return ((dateA < dateB) ? -1 : (dateA == dateB) ? 0 : 1)
}

// test d'intégration GET Bills // ________________________
describe("Given I am a user connected as an Employee", () => {
  describe("When I navigate on Bills page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})