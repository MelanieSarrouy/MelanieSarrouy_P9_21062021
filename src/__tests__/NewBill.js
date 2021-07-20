import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import Firestore from "../app/Firestore.js"


Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, form should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
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
      // fireEvent.change(file, {
      //   target: {
      //     files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })],
      //   }, 
      // })
      fireEvent.change(file, {
        target: {
          files: [new File(["text.txt"], "text.txt", { type: "text/txt" })],
        },
      })
      expect(handleChangeFile).toBeCalled()
    })
  })
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
      // expect(file.files.length).toEqual(0)
      expect(theLast.style.display).toEqual('block')
    })
  })
  describe("When I am on NewBill  Page and I add a file with good extension", () => {
    test("Then, error message should be not displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = Firestore
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })          

      const html = NewBillUI()
      document.body.innerHTML = html

      const file = screen.getByTestId("file")
      // firestore.storage
      // .ref(`${file.name}`)
      // .put(file)

      const theLast = document.getElementById('fileError')
      const handleChangeFile = (newBill.handleChangeFile) 
      file.addEventListener('change', handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File([""], "image.png", { type: "image/png" })],
        },
      })
      expect(file.files.length).toEqual(1)
      expect(theLast.style.display).toBe('none')
    })
  })
})