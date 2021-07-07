
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", (e) => this.handleSubmit(e))
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", (e) => this.handleChangeFile(e))
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    console.log(file)
    const fileName = file.name
    const fileType = file.type
    const divInput = this.document.getElementById('input-file')
    const theLast = this.document.getElementById('fileError');
    if (theLast !== null) theLast.remove();
    const extensions = /(jpg|jpeg|png)$/i; 

    this.firestore
    .storage
    .ref(`justificatifs/${fileName}`)
    .put(file)
    .then(snapshot => snapshot.ref.getDownloadURL())
    .then(url => {
      this.fileUrl = url
      this.fileName = fileName
    })


    if (extensions.exec(fileType)) { 
      console.log('Format de fichier valide');
      return true
    } else { 
      console.log('Format de fichier non valide'); 
      const para = this.document.createElement('p')
      para.id = 'fileError'
      para.style.color ='red'
      divInput.append(para)
      para.innerHTML = 'format de fichier non valide</br>Accepté : jpeg, jpeg ou png'
      return false; 
    } 
  }
  handleSubmit = e => {
    e.preventDefault()
    if (this.handleChangeFile) {
      console.log(this.firestore)
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.createBill(bill)
      // this.onNavigate(ROUTES_PATH['Bills'])
  
    } else {
      return false
    }
  }

  // not need to cover this function by tests
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