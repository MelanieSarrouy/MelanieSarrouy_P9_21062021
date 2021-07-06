import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

describe("Given I am connected as an employee", () => {
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
})
function tri(a,b) {
  let dateA = new Date(a)
  let dateB = new Date(b)
  return ((dateA < dateB) ? -1 : (dateA == dateB) ? 0 : 1)
}
