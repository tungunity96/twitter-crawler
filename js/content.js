let users = []

function removeUnicode(alias) {
  var str = alias
  str = str.toLowerCase()
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' '
  )
  str = str.replace(/ + /g, ' ')
  str = str.trim().split(' ').join('-')
  return str
}

function escape(value) {
  if (!['"', '\r', '\n', ','].some((e) => value.indexOf(e) !== -1)) {
    return value
  }
  return '"' + value.replace(/"/g, '""') + '"'
}

function getFormattedDate(dateISOString) {
  let date = new Date(dateISOString)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let dt = date.getDate()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  return `${formatTime(dt)}/${formatTime(month)}/${year} ${formatTime(
    hours
  )}:${formatTime(minutes)}:${formatTime(seconds)}`
}
function formatTime(time) {
  return time < 10 ? '0' + time : time
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

$(document).ready(function () {
  let toolContent = $('#twitter-crawler')
  let overlay = $('#overlay-crawler')
  let minimizedBtn = $('#minimized-button')
  if (minimizedBtn.length === 0) {
    minimizedBtn = $(
      "<button id='minimized-button' type='button' style='position:fixed; bottom:24px; right: 24px'><img width='64' height='64' src='https://i.ibb.co/vJ8z8mm/logo.png'/></button>"
    )
    minimizedBtn.css({
      // 'box-shadow': '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      display: 'none',
      'background-color': 'Transparent',
      'background-repeat': 'no-repeat',
      border: 'none',
      cursor: 'pointer',
      overflow: 'hidden',
      outline: 'none',
      'z-index': 99999,
    })
    $('body').append(minimizedBtn)
  }
  if (toolContent.length === 0) {
    toolContent = $(
      "<div id='#twitter-crawler'><button id='minimize-button' type='button' width='64px' style='position: absolute; top: 8px; right: 8px; background-color: Transparent; background-repeat:no-repeat; border: none; cursor:pointer; overflow: hidden; outline:none;' alt='Frame-4' border='0'><img width='24' height='24' src='https://i.ibb.co/TMMnkPS/minimize-2.png'/></button><img width='175px' src='https://i.ibb.co/rb8RT4j/Frame-4.png' style='margin: 12px 0px' alt='Frame-4' border='0'><div style='font-size: 24px; text-align: center; padding: 12px'>Tool lấy dữ liệu từ Twitter</div><div id='crawling-status' style='padding: 12px; margin-bottom: 12px'>Trạng thái: Chưa bắt đầu</div><button type='button' id='download-btn' style='padding: 8px 12px; background: white; text-align: center'>Bắt đầu lấy dữ liệu</button><div id='crawling-log' style='color: red; padding: 12px; text-align: center; line-height: 20px; margin-top: 12px'>Xin vui lòng không tắt trang khi đang lấy dữ liệu!</div></div>"
    )
    toolContent.css({
      'z-index': '99999',
      position: 'fixed',
      padding: '12px',
      'font-family': "'Roboto', sans-serif",
      width: '400px',
      height: '300px',
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'center',
      'border-radius': '5px',
      margin: '-150px auto 0px',
      left: 0,
      right: 0,
      top: '50%',
      'box-shadow': '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      background: 'linear-gradient(107.15deg,#6AC9CE 0,#087CCE 100%)',
      color: 'white',
    })
    $('body').append(toolContent)
  }

  if (overlay.length === 0) {
    overlay = $("<div id='overlay-crawler'></div>")
    overlay.css({
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      'background-color': 'rgba(0, 0, 0, 0.75)',
      'z-index': 99998,
      cursor: 'pointer',
    })
    $('body').append(overlay)
  }
  const minimizeBtn = $('#minimize-button')
  const startBtn = $('#download-btn')
  const log = $('#crawling-log')
  const status = $('#crawling-status')

  minimizeBtn.click(function (event) {
    event.preventDefault()
    overlay.css('display', 'none')
    toolContent.css('display', 'none')
    minimizedBtn.css('display', 'block')
  })
  minimizedBtn.click(function (event) {
    event.preventDefault()
    overlay.css('display', 'block')
    toolContent.css('display', 'flex')
    minimizedBtn.css('display', 'none')
  })

  startBtn.click(async function (event) {
    event.preventDefault()
    if (!/^https:\/\/twitter.com\/.+\/status\/.+/.test(window.location.href)) {
      status.text('Trạng thái: Lỗi khi lấy dữ liệu')
      log.text('Chỉ lấy được dữ liệu từ trang chi tiết Tweet...')
      return
    }
    status.text('Trạng thái: Đang lấy dữ liệu...')
    log.text('Bắt đầu lấy dữ liệu...')
    log.css('color', 'white')
    startBtn.attr('disabled', true)
    await scrapData()
  })

  async function scrapData() {
    await getFullPageHTML()
    await sleep(5000)
    writeToCSVFile()
  }

  function writeToCSVFile() {
    log.text('Đang ghi toàn bộ dữ liệu ra file CSV...')
    const headers =
      'Index,Name,Username,User Page,Tweet Link,Timestamp,Tweet Content,Tag Detected\r\n'
    let fileContent = headers
    if (users && users.length > 0) {
      users.forEach((user, index) => {
        fileContent += `${index + 1},${user.name},${user.user},${user.page},${
          user.tweet
        },${user.timestamp},${user.tweetContent},${user.detectedTags}\r\n`
      })
      var blob = new Blob([fileContent], {
        type: 'text/plain;charset=utf-8',
      })
      saveAs(blob, `${removeUnicode(window.location.href)}.csv`)
      log.text('Ghi dữ liệu vào file CVS thành công')
      status.text('Lấy và ghi dữ liệu thành công')
    }
  }

  function recordData() {
    return new Promise(async function (resolve, reject) {
      const articles = $('[role=article]', $('body'))
      articles.each(function (index) {
        if (index !== 0) {
          //get user name + username by span
          let user = {}
          const spanTags = $('span', this)
          const existingUser = users.find(
            (user) => user.name === $(spanTags[0]).text()
          )
          if (existingUser) return
          user.name = $(spanTags[0]).text()
          user.user = $(spanTags[2]).text()

          //get user page + user tweet link
          const aTagsWithHref = $('a[href]', this)
          user.page = `https://twitter.com${$(aTagsWithHref[0]).attr('href')}`
          user.tweet = `https://twitter.com${$(aTagsWithHref[2]).attr('href')}`

          //get timestamp
          const timeTags = $('time[datetime]', this)
          user.timestamp = getFormattedDate($(timeTags[0]).attr('datetime'))

          //get tweet content and tag detected
          const content = $('div[lang]', this)
          const contentSpanTags = $('span', content)
          let tweetContent = ''
          let detectedTags = ''
          contentSpanTags.each(function (index) {
            let spanContent = $(this).text()
            tweetContent += spanContent
            if (
              spanContent.trim().startsWith('@') ||
              spanContent.trim().startsWith('#') ||
              spanContent.trim().startsWith('$')
            )
              detectedTags += ' ' + escape(spanContent.trim().replace('\n', ''))
          })
          user.tweetContent = escape(tweetContent.trim())
          user.detectedTags = detectedTags
          users.push(user)
        }
      })
      const lastArticleSpans = $('span', articles[articles.length - 1])
      const existingUser = users.find(
        (user) => user.user === $(lastArticleSpans[2]).text()
      )
      if (existingUser) resolve()
    })
  }

  async function getFullPageHTML() {
    log.text('Đang lấy HTML từ nguồn, xin vui lòng đợi trong ít phút!')
    let lastDocumentHeight = $(document).height()
    let currentDocumentHeight = lastDocumentHeight
    do {
      lastDocumentHeight = currentDocumentHeight
      scrollToBottom()
      await sleep(2000)
      await recordData()
      currentDocumentHeight = $(document).height()
    } while (currentDocumentHeight !== lastDocumentHeight)
  }

  function scrollToBottom() {
    $('html, body').animate({
      scrollTop: $(document).height() - $(window).height(),
    })
  }
})
