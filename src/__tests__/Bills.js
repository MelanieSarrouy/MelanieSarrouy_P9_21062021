import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import userEvent from '@testing-library/user-event'
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase.js"

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When Bills page is called", () => {
    test("Then, Bills Page should be displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    })
  })
  describe("When Bills page is loading, there is an error", () => {
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
      const dates = Array.from(document.querySelectorAll("tbody>tr>td:nth-child(3)")).map(a => a.innerHTML)
      const datesSorted = [...dates].sort(tri)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I am on Bills page and I click on New Bill button', () => {
    test('Then, function handleClickNewBill have to be called', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
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
    test('Then, form should be displayed', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
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

  describe('When I am on Bills page and I click on Icon Eye button', () => {
    test('Then, function handleClickIconEye have to be called', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(iconEye)) 
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      expect(handleClickIconEye).toBeCalled()
    })

    test('Then, A modal should open', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
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
    test('Then, image source attribute is the same as icon data-bill-url attribute', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
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
    test('Then, data-bill-url attribute is null modal should open with a message', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
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
  describe("When I am on Bills Page and there is no bills", () => {
    test("Then there isn't any Icon Eye button", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      const iconEye = screen.queryByTestId("icon-eye")
      expect(iconEye).toBeNull()
    })
  })
})

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
    test("fetches messages from an API and fails with 500 message error", async () => {
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
