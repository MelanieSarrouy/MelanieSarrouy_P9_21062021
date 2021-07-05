import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
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
        icon.addEventListener('click', (e) => {
          e.preventDefault()
          this.handleClickIconEye(icon)
        })
      })
    } 
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = e => {
    e.preventDefault()
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")

    if (billUrl === 'null') {
      $('#modaleFile').find(".modal-body").html(`<p style='text-align: center;'>Aucun justificatif fourni</p>`)
      $('#modaleFile').modal('show')
  
    } else {
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
      $('#modaleFile').modal('show')
    }
  }
  // not need to cover this function by tests
  getBills = () => {
    const userEmail = localStorage.getItem('user') ?
      JSON.parse(localStorage.getItem('user')).email : ""
    if (this.firestore) {
      return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        const bills = snapshot.docs
        // console.log(bills)
          .map(doc => {
            try {
              let dateStr = doc.data().date
              let goodDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
              let wrongDate = /^[0-9]{2}(-|\/)[0-9]{2}(-|\/)[0-9]{4}$/
              // console.log(doc.data())--MAILS ?
              
              if (goodDate.test(dateStr)) {
                dateStr = doc.data().date
                return {
                  ...doc.data(),
                  date: formatDate(dateStr),
                  status: formatStatus(doc.data().status)
                } 
              } 
              if (wrongDate.test(dateStr)) {
                let dateArray
                if (dateStr.includes('/')) {
                  dateArray = dateStr.split('/')
                } else {
                  dateArray = dateStr.split('-')
                }
                let goodArray = dateArray.reverse()
                dateStr = goodArray.join('-')
                return {
                  ...doc.data(),
                  date: formatDate(dateStr),
                  status: formatStatus(doc.data().status)
                } 
              } else {
                console.log('NOOOON !!!' + dateStr )
                return {
                  ...doc.data(),
                  date: 'unformatted date',
                  status: formatStatus(doc.data().status)
                }
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc.data())
              return {
                ...doc.data(),
                date: 'unformatted date',
                status: formatStatus(doc.data().status)
              }
            }
          })
          .filter(bill => bill.email === userEmail)
          console.log('length', bills.length)
        return bills
      })
      .catch(error => error)
    }
  }
}
