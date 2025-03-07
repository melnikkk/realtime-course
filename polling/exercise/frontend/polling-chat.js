const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

const INTERVAL = 3000;
const BACKOFF = 500;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user, 
    text,
  }
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  }

  try {
    await fetch("/poll", options);
  } catch(e) {
    console.error("Polling error. ", e)
  }
}

async function getNewMsgs() {
  let json;

  try {
    const res = await fetch("/poll")
    json = await res.json();

    if (res.status >= 400) {
      throw new Error("Request failed: " + res.statusText);
    }

    allChat = json.msg;

    render();

    failedTries = 0;
  } catch(e) {
    console.error("Polling error. ", e)
    failedTries++
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeTomakeNextRequest = 0;
let failedTries = 0;

async function rafTimer(time) {
  if (timeTomakeNextRequest <= time) {
    await getNewMsgs();

    timeTomakeNextRequest = time + INTERVAL + failedTries * BACKOFF;
  }

  requestAnimationFrame(rafTimer)
}

requestAnimationFrame(rafTimer)