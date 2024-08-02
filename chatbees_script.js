(function() {
  const getElementById = (id) => document.getElementById(id);

  const [aid, namespaceName, collectionName, logoUrl, brandName, thinkingHint = "Bees are thinking..."] = [
    "chatbeesAccountID",
    "chatbeesNamespaceName",
    "chatbeesCollectionName",
    "chatbeesLogoUrl",
    "chatbeesBrandName",
    "chatbeesThinkingHint"
  ]
    .map(getElementById)
    .map((element) => element?.value?.trim());
  if (!aid || !collectionName) {
    window.alert("Please set accountId and collection name.");
    return;
  }
  if (!namespaceName) {
    window.alert("The namespace name should not be empty.");
    return;
  }

  if (logoUrl) {
    getElementById("chatbees-logo-img").src = logoUrl;
  }

  if (brandName) {
    getElementById("chatbees-brand-name").text = brandName;
  }

  const [
    chatButtonElement,
    chatPopupElement,
    chatAreaElement,
    userMsgElement,
    clearBtnElement,
    closeBtnElement,
    sendMessageBtnElement,
  ] = [
    "chatbeesFloatBtn",
    "chatbeesPopup",
    "chatbeesChatArea",
    "chatbeesUserInput",
    "chatbeesClearBtn",
    "chatbeesCloseBtn",
    "chatbeesSendMessageBtn",
  ].map(getElementById);

  const [
    feedbackArea,
    feedbackCloseBtn,
    emailInput,
    feedbackTextarea,
    submitFeedbackBtn,
    feedbackMask,
  ] = [
    "chatbeesFeedbackArea",
    "chatbeesFeedbackCloseBtn",
    "chatbeesEmailInput",
    "chatbeesFeedbackTextArea",
    "chatbeesSubmitFeedbackButton",
    "chatbeesFeedbackMask",
  ].map(getElementById);

  const spinner = `<svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>`;

  if (!chatPopupElement || !chatAreaElement || !userMsgElement) {
    window.alert(
      "Please put chatbeesPopup, chatbeesChatArea and chatbeesUserInput elements in your HTML.",
    );
    return;
  }

  const localStorageConversationIdKey = "chatBeesConversationId";
  let conversationId = localStorage.getItem(localStorageConversationIdKey);

  const localStorageHistoryKey = "chatBeesHistoryMessages";
  let historyMessages;
  const resetMessageHistory = () => {
    conversationId = undefined;
    localStorage.removeItem(localStorageConversationIdKey);

    historyMessages = [];
    localStorage.setItem(localStorageHistoryKey, JSON.stringify([]));
  };

  try {
    historyMessages = JSON.parse(localStorage.getItem(localStorageHistoryKey));

    if (!Array.isArray(historyMessages)) {
      resetMessageHistory();
    }
  } catch {
    resetMessageHistory();
  }

  let requestId;

  const showFeedback = () => {
    feedbackArea.classList.remove("hidden");
    emailInput.focus();
  };

  const hideFeedback = () => {
    feedbackArea.classList.add("hidden");
    userMsgElement.focus();
  };

  const appendUserMessage = (userMsg) => {
    if (!userMsg) {
      return;
    }

    const userMsgDiv = document.createElement("div");
    userMsgDiv.textContent = userMsg;
    userMsgDiv.classList.add("chatbees-message", "chatbees-user");
    chatAreaElement.appendChild(userMsgDiv);

    chatAreaElement.scrollTop = chatAreaElement.scrollHeight;
  };

  const botMessages = {
    greeting: "Hello! How can I assist you?",
    generateEchoMessage(userMsg) {
      return `Test echo: ${userMsg}`;
    },
    generateErrorMessage({ message }) {
      return `Something went wrong: ${message}`;
    },
  };
  const createBotMsgDiv = ({ answer }, additionalClasses) => {
    const botMsgClasses = ["chatbees-message", "chatbees-bot"];
    const botMsgDiv = document.createElement("div");
    botMsgDiv.classList.add(...botMsgClasses, ...additionalClasses);
    const botMsgPlain = document.createElement("div");
    botMsgPlain.classList.add("text-justify");
    botMsgPlain.innerHTML = answer.replaceAll('\n', '<br/>');
    botMsgDiv.appendChild(botMsgPlain);
    return botMsgDiv;
  };

  const createBotMsgSources = ({ refs }) => {
    const botMsgSources = document.createElement("div");
    _.uniqBy(
      refs?.filter((ref) => ref.doc_name?.match(/https?:\/\//)),
      "doc_name",
    )
      .slice(0, 3)
      .forEach(({ doc_name, sample_text }) => {
        const linkDiv = document.createElement("div");
        linkDiv.classList.add("chatbees-link");
        const link = document.createElement("a");
        link.classList.add("flex");
        link.href = doc_name;
        link.target = "_blank";
        link.innerHTML = `<span class="truncate" title="${sample_text}">${doc_name}</span><img src="images/pop-out-outline.svg" alt="Link" class="chatbees-btn-icon inline">`;
        linkDiv.appendChild(link);
        botMsgSources.appendChild(linkDiv);
      });
    return botMsgSources;
  };

  const createFeedbackSender = ({ request_id, thumb_down, text_feedback, email }) =>
    () => {
      const feedbackUrl = `https://${aid}.us-west-2.aws.chatbees.ai/feedback/create_or_update`;
      const feedbackData = {
        namespace_name: namespaceName,
        collection_name: collectionName,
        request_id,
        thumb_down,
        text_feedback,
        unregistered_user: {
          source: "WEBSITE",
          email: email,
        },
      };

      return fetch(feedbackUrl, {
        method: "POST",
        headers: {
          // If the collection does not allow public read, please add your api-key here.
          // "api-key": "Replace with your API Key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });
    };

  const createReactionButtons = ({ request_id }) => {
    const botReactionButtons = document.createElement("div");
    const buttonClasses = ("inline-flex items-center justify-center bg-white text-gray-500 " +
      "shadow ring-1 ring-inset ring-gray-300 transition-all duration-150 rounded-lg p-1 " +
      "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500").split(" ");

    const buttonDefinitions = [
      {
        icon: "images/thumbs-up-outline.svg",
        ariaLabel: "Thumbs up",
        action: createFeedbackSender({
          request_id,
          thumb_down: false,
        }),
      },
      {
        icon: "images/thumbs-down-outline.svg",
        ariaLabel: "Thumbs down",
        action: createFeedbackSender({
          request_id,
          thumb_down: true,
        }),
      },
      {
        icon: "images/envelope-outline.svg",
        ariaLabel: "Leave your email and feedback",
        action: () => {
          if (feedbackArea.classList.contains("hidden")) {
            requestId = request_id;
            showFeedback();
          } else {
            hideFeedback();
          }
        },
      },
    ];
    buttonDefinitions.forEach(({ icon, ariaLabel, action }) => {
      const button = document.createElement("button");
      button.classList.add(...buttonClasses);
      button.type = "button";
      button.innerHTML = `<img src="${icon}" alt="${ariaLabel}" aria-label="${ariaLabel}" class="chatbees-btn-icon inline">`;
      button.addEventListener("click", action);
      botReactionButtons.appendChild(button);
    });
    return botReactionButtons;
  };

  const appendBotMessage = (
    botMsg,
    addReactionButtons = false,
    ...additionalClasses
  ) => {
    const botMsgDiv = createBotMsgDiv(botMsg, additionalClasses);
    chatAreaElement.appendChild(botMsgDiv);

    if (botMsg.refs?.length) {
      const botSourceDiv = document.createElement("div");
      botSourceDiv.classList.add("py-4");
      botSourceDiv.innerHTML = `<div><label class="chatbees-section-label">Sources: </label></div>`;
      botSourceDiv.appendChild(createBotMsgSources(botMsg));

      botMsgDiv.appendChild(botSourceDiv);
    }

    if (addReactionButtons) {
      const botReactionButtons = createReactionButtons(botMsg);
      botMsgDiv.appendChild(botReactionButtons);
    }

    chatAreaElement.scrollTop = chatAreaElement.scrollHeight;
  };

  const restoreHistoryMessagesAndGreet = () => {
    historyMessages.forEach(({ userMsg, botMsg }) => {
      appendUserMessage(userMsg);
      appendBotMessage(botMsg, true);
    });

    appendBotMessage({ answer: botMessages.greeting });
    hideFeedback();
  };

  restoreHistoryMessagesAndGreet();

  const addItemToHistory = (historyItem) => {
    const maxMessages = 10;

    historyMessages.push(historyItem);
    if (historyMessages.length > maxMessages) {
      historyMessages = historyMessages.slice(-maxMessages);
    }

    localStorage.setItem(
      localStorageHistoryKey,
      JSON.stringify(historyMessages),
    );
  };

  const chatbeesSendMessage = () => {
    const userMsg = userMsgElement.value.trim();

    if (!userMsg) {
      return;
    }

    appendUserMessage(userMsg);

    userMsgElement.value = "";
    userMsgElement.focus();

    const thinkMsg = document.createElement("div");
    thinkMsg.classList.add("chatbees-message", "chatbees-bot");
    thinkMsg.innerHTML = `<span class="inline-flex items-center">${spinner}<span class="ml-2">${thinkingHint}</span></span>`;
    chatAreaElement.appendChild(thinkMsg);
    chatAreaElement.scrollTop = chatAreaElement.scrollHeight;

    if (collectionName === "collectionName") {
      chatAreaElement.removeChild(thinkMsg);

      appendBotMessage({ answer: botMessages.generateEchoMessage(userMsg) }, true);
      return;
    }

    const apiUrl = "https://" + aid + ".us-west-2.aws.chatbees.ai/docs/ask";
    const data = {
      namespace_name: namespaceName,
      collection_name: collectionName,
      question: userMsg,
    };
    if (conversationId) {
      data.conversation_id = conversationId;
    }
    if (historyMessages.length > 0) {
      data.history_messages = historyMessages.reduce(
        (acc, { userMsg, botMsg }) => [...acc, [userMsg, botMsg.answer]],
        [],
      );
    }
    const jsonData = JSON.stringify(data);

    fetch(apiUrl, {
      method: "POST",
      headers: {
        // If the collection does not allow public read, please add your api-key here.
        // "api-key": "Replace with your API Key",
        "Content-Type": "application/json",
      },
      body: jsonData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(
          `status: ${response.status}, error: ${response.statusText}`,
        );
      })
      .then((botMsg) => {
        chatAreaElement.removeChild(thinkMsg);

        if (
          botMsg.conversation_id &&
          conversationId !== botMsg.conversation_id
        ) {
          conversationId = botMsg.conversation_id;
          localStorage.setItem(localStorageConversationIdKey, conversationId);
        }

        appendBotMessage(botMsg, true);

        addItemToHistory({ userMsg, botMsg });
      })
      .catch((error) => {
        console.error("Error:", error);
        chatAreaElement.removeChild(thinkMsg);

        appendBotMessage(
          { answer: botMessages.generateErrorMessage(error) },
          false,
          "chatbees-error",
        );
      });
  };

  chatButtonElement?.addEventListener("click", () => {
    chatPopupElement.style.display = "flex";

    userMsgElement.focus();
  });

  clearBtnElement?.addEventListener("click", () => {
    chatAreaElement.innerHTML = "";
    userMsgElement.value = "";
    userMsgElement.focus();

    resetMessageHistory();
    restoreHistoryMessagesAndGreet();
  });

  closeBtnElement?.addEventListener("click", () => {
    chatPopupElement.style.display = "none";
  });

  feedbackCloseBtn.addEventListener("click", hideFeedback);

  submitFeedbackBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const text = feedbackTextarea.value.trim();

    const updateFormState = (sending) => {
      emailInput.disabled = sending;
      feedbackTextarea.disabled = sending;
      submitFeedbackBtn.disabled = sending;
      submitFeedbackBtn.innerHTML = sending ? spinner : "Submit";
      if (sending) {
        feedbackMask.classList.remove("hidden");
      } else {
        feedbackMask.classList.add("hidden");
      }
    };

    if (email) {
      updateFormState(true);

      await createFeedbackSender({
        request_id: requestId,
        thumb_down: false,
        text_feedback: text,
        email,
      })();

      updateFormState(false);
      hideFeedback();
    }
  });

  sendMessageBtnElement?.addEventListener("click", () => {
    chatbeesSendMessage();
  });

  userMsgElement.addEventListener("keyup", (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      chatbeesSendMessage();
    }
  });
})();
