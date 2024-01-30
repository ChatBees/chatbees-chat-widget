// Open chat popup when floating button is clicked
document.getElementById('chatbeesFloatBtn').addEventListener('click', function() {
  const chatPopup = document.getElementById('chatbeesPopup');
  chatPopup.style.display = 'flex';

  // Display hello message as the first message
  chatArea = document.getElementById('chatbeesChatArea');
  chatArea.innerHTML = '<div class="chatbees-message chatbees-bot">Hello! How can I assist you?</div>';
});

// Global chat history, a list of questions and answers.
// Currently only the last 10 history questions and answers will be remembered.
var historyMessages = [];
var maxMessages = 10;

// Clear all messages
function chatbeesClearChat() {
  var chatArea = document.getElementById("chatbeesChatArea");
  chatArea.innerHTML = '<div class="chatbees-message chatbees-bot">Hello! How can I assist you?</div>';
  document.getElementById('chatbeesUserInput').value = '';
  // clear the historyMessages
  historyMessages = [];
}

// Close chat popup
function chatbeesClosePopup() {
  document.getElementById('chatbeesPopup').style.display = 'none';
  historyMessages = [];
}

// Function to send question to ChatBees service
function chatbeesSendMessage() {
  const userInput = document.getElementById('chatbeesUserInput').value.trim();

  if (userInput == "") {
    return;
  }

  const aid = document.getElementById('chatbeesAccountID').value.trim();
  const collectionName = document.getElementById('chatbeesCollectionName').value.trim();
  console.log(aid, collectionName);
  
  const chatArea = document.getElementById('chatbeesChatArea');
  // Display user's message
  var userMsg = document.createElement('div');
  userMsg.textContent = userInput;
  userMsg.classList.add('chatbees-message', 'chatbees-user');
  chatArea.appendChild(userMsg);

  if (collectionName == "collectionName") {
    // Test bot, simply echo the userInput
    var botMsg = document.createElement('div');
    botMsg.textContent = "Test echo: " + userInput;
    botMsg.classList.add('chatbees-message', 'chatbees-bot');
    chatArea.appendChild(botMsg);

    historyMessages.push([userInput, botMsg.textContent]);
    if (historyMessages.length > maxMessages) {
      historyMessages = historyMessages.slice(-maxMessages);
    }
    //console.log(historyMessages);

    // Scroll chat area to the bottom
    chatArea.scrollTop = chatArea.scrollHeight;

    // clear user input
    document.getElementById('chatbeesUserInput').value = '';
    return;
  }

  // get the answer from the service
  const apiUrl = 'https://' + aid + '.us-west-2.aws.chatbees.ai/docs/ask';
  jsonData = JSON.stringify({namespace_name: 'public', collection_name: collectionName, question: userInput});
  if (historyMessages.length > 0) {
    jsonData = JSON.stringify({namespace_name: 'public', collection_name: collectionName, question: userInput, history_messages: historyMessages});
  }

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Please replace the api-key with a valid API Key you created.
	  // This is not required soon. Publishing a collection will be supported soon.
	  'api-key': 'Replace with your API Key',
    },
    body: jsonData,
  })
  .then(response => response.json())
  .then(data => {
      // Display the response in the chat area
      var botMsg = document.createElement('div');
      botMsg.textContent = data.answer;
      botMsg.classList.add('chatbees-message', 'chatbees-bot');
      chatArea.appendChild(botMsg);
      // add to the historyMessages
      historyMessages.push([userInput, data.answer]);
      if (historyMessages.length > maxMessages) {
          historyMessages = historyMessages.slice(-maxMessages);
      }
      //console.log(historyMessages);
  })
  .catch(error => {
      console.error('Error:', error);
      // Display the error in the chat area
      var botMsg = document.createElement('div');
      botMsg.textContent = error;
      botMsg.classList.add('chatbees-message', 'chatbees-bot');
      chatArea.appendChild(botMsg);
  });

  // Scroll chat area to the bottom
  chatArea.scrollTop = chatArea.scrollHeight;

  // clear user input
  document.getElementById('chatbeesUserInput').value = '';
}

// Send question when Enter key is pressed
const userInput = document.getElementById('chatbeesUserInput');
userInput.addEventListener("keyup", function (event) {
    if (event.key == "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        chatbeesSendMessage();
    }
});
