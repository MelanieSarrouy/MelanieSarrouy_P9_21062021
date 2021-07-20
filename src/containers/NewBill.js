import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"


export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = (e) => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const fileName = file.name
    const fileType = file.type
    const theLast = this.document.getElementById('fileError')
    const extensions = /(jpg|jpeg|png)$/i

    if (extensions.exec(fileType)) { 
      theLast.style.display = 'none'
      this.firestore
      .storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          this.fileUrl = url
          this.fileName = fileName
          console.log(this.fileUrl)

        })
    } else { 
      theLast.style.display = 'block'
      this.document.querySelector(`input[data-testid="file"]`).value = ''
      this.fileUrl = ''
      this.fileName = ''
    } 
  }
  handleSubmit = (e) => {
    e.preventDefault()
    if (this.fileUrl != null) {
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.createBill(bill)
    } else {
      return false
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
      .bills()
      .add(bill)
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => error)
    }
  }
}