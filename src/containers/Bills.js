import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
import BigBilledIcon from '../assets/svg/big_billed.js'


export default class Bills {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    this.localStorage = localStorage
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) {
      buttonNewBill.addEventListener('click', this.handleClickNewBill)
    } 
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) {
      iconEye.forEach(icon => {
        icon.addEventListener('click', () => this.handleClickIconEye(icon))
      })
    } 
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = (e) => {
    e.preventDefault()
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    if (billUrl === 'null') {
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'>${BigBilledIcon}<p>Aucun justificatif fourni</p></div>`)
      $('#modaleFile').modal('show')
    } else {
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
      $('#modaleFile').modal('show')
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  getBills = () => {
    const userEmail = localStorage.getItem('user') ?
      JSON.parse(localStorage.getItem('user')).email : ""
    if (this.firestore) {
      return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        const bills = snapshot.docs
          .map(doc => {return {...doc.data()}})
          .filter(bill => bill.email === userEmail)
        return bills
      })
      .catch(error => error)
    }
  }
}
