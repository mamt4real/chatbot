import { greetings, queAns, micellaneous } from './staticAnswers.js'

let caseSummary = {}
//get the current world cases summary of covid-19

const getCountrySummary = (country) => {
  let data
  const slug = country?.toLocaleLowerCase().replace(' ', '-')
  if (country) data = caseSummary.Countries.find((x) => x.Slug === slug)
  else data = caseSummary.Global
  if (!data)
    return `
  <h3>Invalid Country!!</h3>
  `
  const html = `
  <h3>${data.Country || 'Global'} Cases Summary</h3>
  <div class='row'>
  <span class='key'>New Confirmed Cases</span>
  <span class='value'>${data.NewConfirmed}</span>
  </div>
  <div class='row'>
  <span class='key'>Total Confirmed Cases</span>
  <span class='value'>${data.TotalConfirmed}</span>
  </div>
  <div class='row'>
  <span class='key'>New Deaths</span>
  <span class='value'>${data.NewDeaths}</span>
  </div>
  <div class='row'>
  <span class='key'>Total Deaths</span>
  <span class='value'>${data.TotalDeaths}</span>
  </div>
  <div class='row'>
  <span class='key'>New Recovered Cases</span>
  <span class='value'>${data.NewRecovered}</span>
  </div>
  <div class='row'>
  <span class='key'>Total Recovered Cases</span>
  <span class='value'>${data.TotalRecovered}</span>
  </div>
  <div class='row'>
  <span class='key'>Date</span>
  <span class='value'>${new Date(data.Date).toUTCString()}</span>
  </div>
  `
  return html
}

const faq = document.getElementById('faq')
const chatContainer = document.getElementById('chat__container')
const typing = document.getElementById('loading')
let isCountryStats = false

const faqHandler = (que, ans) => (e) => {
  chatContainer.appendChild(getChatElement(que))
  appendChild(getChatElement(ans, true))
  e.target.remove()
}

const random = (array) => array[Math.round(Math.random() * array.length)]

const getAnswer = (question) => {
  if (greetings.includes(question))
    if (chatContainer.children.length === 1)
      return `
  <p>
  <h3>Hello, I'am Droid</h3>
  <p>I am here to help you refresh your basic Knowledge about Covid19</p>
  `
    else return random(greetings)
  else if (Object.keys(queAns).includes(question)) return queAns[question]
  else return random(micellaneous)
}

const appendChild = (child) => {
  typing.innerHTML = 'typing'
  setTimeout(() => {
    chatContainer.append(child)
    typing.innerHTML = ''
    window.scrollTo(0, document.body.scrollHeight)
    chatContainer.scrollTo(
      chatContainer.scrollWidth,
      chatContainer.scrollHeight
    )
  }, 500)
}

const handleSubmit = (e) => {
  e.preventDefault()
  const { message } = e.target
  const msg = getChatElement(message.value)
  chatContainer.append(msg)

  if (isCountryStats) {
    appendChild(getChatElement(getCountrySummary(message.value), true))
    isCountryStats = false
  } else {
    appendChild(getChatElement(getAnswer(message.value.toLowerCase()), true))
  }

  e.target.reset()
}

const getChatElement = (message, isBot = false) => {
  const msg = document.createElement('div')
  msg.className = `chats ${!isBot && 'user'}`
  msg.innerHTML = `
  <span class='chats__name'>${isBot ? 'Droid' : 'You'}</span>
    <p>${message}</p>
    <span class='chats__timestamp'>${new Date().toUTCString()}</span>
    `
  return msg
}

const reset = () => {
  chatContainer.innerHTML = ''
  faq.innerHTML = ''
  initialLoad()
}

document.getElementById('chat__form').addEventListener('submit', handleSubmit)
document.getElementById('reset').addEventListener('click', reset)

const initialLoad = () => {
  for (const [key, value] of Object.entries(queAns)) {
    const q = document.createElement('li')
    q.innerHTML = key
    q.addEventListener('click', faqHandler(key, value))
    faq.append(q)
  }
  fetch('https://api.covid19api.com/summary')
    .then((response) => response.json())
    .then((response) => {
      caseSummary = response
      const handleCountry = (e) => {
        chatContainer.appendChild(getChatElement('Get Country Stats'))
        appendChild(getChatElement('Enter your Country', true))
        isCountryStats = true
      }

      const country = document.createElement('li')
      country.textContent = 'Get Country Cases Stats'
      country.addEventListener('click', handleCountry)

      const global = document.createElement('li')
      global.textContent = 'Global Cases Summary'
      global.addEventListener(
        'click',
        faqHandler('Global Cases Summary', getCountrySummary())
      )

      faq.appendChild(country)
      faq.appendChild(global)
    })
    .catch((err) => console.error(err))
}

initialLoad()
