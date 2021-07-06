export const formatDate = (dateStr) => {
  let date
  const goodDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
  const wrongDate = /^[0-9]{2}(-|\/)[0-9]{2}(-|\/)[0-9]{4}$/
  if (goodDate.test(dateStr)) {
    date = new Date(dateStr)
  }
  if (wrongDate.test(dateStr)) {
    let dateArray
    if (dateStr.includes('/')) dateArray = dateStr.split('/')
    else dateArray = dateStr.split('-')
    const goodArray = dateArray.reverse()
    dateStr = goodArray.join('-')
    date = new Date(dateStr)
  }
  if (dateStr == '' || Date.parse(dateStr == NaN)) return 'Unformatted date'
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  if (ye < 1950) return 'Unformatted date'
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refusé"
  }
}