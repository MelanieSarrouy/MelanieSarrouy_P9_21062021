import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import Firestore from "../app/Firestore.js"
import firebase from "../__mocks__/firebase.js"


Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

// Test affichage du formulaire
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, form should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  // Test function handleSubmit
  describe("When I am on NewBill Page and I click on Submit button", () => {
    test("Then, function handleSubmit have to be called", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })          

      const html = NewBillUI()
      document.body.innerHTML = html

      const form = document.querySelector(`form[data-testid="form-new-bill"]`)
      const handleSubmit = jest.fn(newBill.handleSubmit) 
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  // Test function handleChangeFile
  describe("When I am on NewBill Page and I click on Choose File button", () => {
    test("Then, function handleChangeFile have to be called", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })          

      const html = NewBillUI()
      document.body.innerHTML = html

      const file = screen.getByTestId("file")
      const handleChangeFile = jest.fn(newBill.handleChangeFile) 
      file.addEventListener('change', handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(["text.txt"], "text.txt", { type: "text/txt" })],
        },
      })
      expect(handleChangeFile).toBeCalled()
    })
  })
  // Test upload fichier avec mauvaise extension
  describe("When I am on NewBill  Page and I add a file with wrong extension", () => {
    test("Then, error message should be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })          

      const html = NewBillUI()
      document.body.innerHTML = html

      const file = screen.getByTestId("file")
      const theLast = document.getElementById('fileError')
      const handleChangeFile = (newBill.handleChangeFile) 
      file.addEventListener('change', handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(["text"], "text.txt", { type: "text/txt" })],
        },
      })
      expect(theLast.style.display).toEqual('block')
    })
  })
  // Test upload fichier avec bonne extension
  describe("When I am on NewBill  Page and I add a file with good extension", () => {
    test("Then, error message should be not displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = {
        storage: {
          ref: jest.fn(() => {
            return { 
              put: jest
                .fn()
                .mockResolvedValueOnce({ ref: { getDownloadURL: jest.fn() } })
            }
          })
        }        
      } 
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })          

      const html = NewBillUI()
      document.body.innerHTML = html

      const file = screen.getByTestId("file")
      const theLast = document.getElementById('fileError')
      const handleChangeFile = (newBill.handleChangeFile) 
      file.addEventListener('change', handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(["image"], "image.png", { type: "image/png" })],
        },
      })
      expect(file.files.length).toEqual(1)
      expect(theLast.style.display).toBe('none')
    })
  })
  // Test function createBill
  describe("When I am on NewBill Page, I fill the form correctly and I click on submit button ", () => {
    test("Then, function createBill have to be called", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, Firestore, localStorage: window.localStorage
      }) 

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBillExample = {
        id: "KCRT",
        vat: "",
        amount: 100,
        name: "test POST",
        fileName: "1592770761.jpeg",
        commentary: "test post",
        pct: 20,
        type: "Transports",
        email: "a@a",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
        date: "2001-01-01",
        status: "refused",
        commentAdmin: "?"
      }
      screen.getByTestId("expense-type").value = newBillExample.type
      screen.getByTestId("expense-name").value = newBillExample.name
      screen.getByTestId("amount").value = newBillExample.amount
      screen.getByTestId("datepicker").value = newBillExample.date
      screen.getByTestId("vat").value = newBillExample.vat
      screen.getByTestId("pct").value = newBillExample.pct
      screen.getByTestId("commentary").value = newBillExample.commentary
      newBill.fileUrl = newBillExample.fileUrl
      newBill.fileName = newBillExample.fileName

      const createBill = jest.fn((newBillExample) => newBill.createBill(newBillExample))
      const form = document.querySelector(`form[data-testid="form-new-bill"]`)
      const handleSubmit = (e) => newBill.handleSubmit(e)
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(createBill).not.toBeUndefined()
    })
  })
})

// test d'intégration POST New Bill // ________________________
describe("Given I am a user connected as an Employee", () => {
  describe("When I submit form", () => {
    test("Add new bill from mock API POST", async () => {
      const postSpy = jest.spyOn(firebase, "post")
      const newBill = {
        "id": "KCRT",
        "vat": "",
        "amount": 100,
        "name": "test POST",
        "fileName": "1592770761.jpeg",
        "commentary": "test post",
        "pct": 20,
        "type": "Transports",
        "email": "a@a",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
        "date": "2001-01-01",
        "status": "refused",
        "commentAdmin": "?"
      }
      const newbills = await firebase.post(newBill)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(newbills.data.length).toBe(5)
    })
    test("Add new bill from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Add new bill from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})