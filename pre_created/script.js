document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-call-chat");
  const chatSection = document.querySelector(".chat");
  const videoCallSection = document.querySelector(".video-call");
  const currentUserLabel = document.getElementById("current-user");
  const chatBody = document.getElementById("chat-body");
  const sendButton = document.getElementById("send-btn");
  const messageInput = document.getElementById("message-input");
  const chatContainer = document.getElementById("chat-container");

  let selectedUser = null;

  // Sample users with predefined messages
  const users = [
    {
      id: 1,
      name: "Ram Senguta",
      messages: [
        { text: "Hello from User 1", sender: "user" },
        { text: "How are you? I am ok", sender: "me" },
        { text: "I am doing great!", sender: "user" },
      ],
    },
    {
      id: 2,
      name: "Rahul Singha",
      messages: [
        { text: "Hey there!", sender: "user" },
        { text: "Let's chat.", sender: "user" },
        { text: "Yes, let's!", sender: "me" },
      ],
    },
    {
      id: 3,
      name: "Bobby Roy",
      messages: [
        { text: "Hi!", sender: "user" },
        { text: "What's up?", sender: "user" },
        { text: "All good here!", sender: "me" },
      ],
    },
  ];

  // Populate the user list dynamically
  const userList = document.getElementById("user-list");
  users.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.classList.add("user");

    // Find the last message (either from the user or you)
    const lastMessage = user.messages[user.messages.length - 1];

    userElement.innerHTML = `
    <div class="user_img">
      <img src="https://via.placeholder.com/50" alt="${user.name}">
    </div>
    <div class="user_details">
      <div class="user_name">${user.name}</div>
      <span class="user_message ${lastMessage.sender === "me" ? "my_message" : "user_message"}">
        ${lastMessage.sender === "me" ? "You: " : ""}${lastMessage.text}
      </span>
    </div>`;
    userElement.addEventListener("click", () => openChat(user));
    userList.appendChild(userElement);
  });

  // Function to open chat with a specific user
  function openChat(user) {
    selectedUser = user;
    currentUserLabel.textContent = user.name;
    chatBody.innerHTML = ""; // Clear chat
    user.messages.forEach((message) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", message.sender === "me" ? "sent" : "received");
      messageElement.textContent = message.text;
      chatBody.appendChild(messageElement);
    });
    chatContainer.classList.remove("empty-screen"); // Remove empty screen class
    messageInput.disabled = false; // Enable input when user is selected
  }

  // Function to send a message
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message && selectedUser) {
      // Add sent message to chat UI
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "sent");
      messageElement.textContent = message;
      chatBody.appendChild(messageElement);
      messageInput.value = "";
      chatBody.scrollTop = chatBody.scrollHeight; // Auto scroll to bottom

      // Add message to the selected user's history
      selectedUser.messages.push({ text: message, sender: "me" });
    }
  }

  // Send message on button click
  sendButton.addEventListener("click", sendMessage);

  // Send message on "Enter" key press
  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
      event.preventDefault(); // Prevent default "Enter" key behavior (like form submission)
    }
  });


  // Default: show empty screen if no user is selected
  chatContainer.classList.add("empty-screen");
  messageInput.disabled = true; // Disable input until a user is selected

  // Toggle between chat and video call
  toggleButton.addEventListener("click", () => {
    if (!selectedUser) {
      alert("Please select a user first.");
      return;
    }

    if (chatSection.style.display === "flex") {
      chatSection.style.display = "none";
      videoCallSection.style.display = "flex";
      toggleButton.textContent = "Chat";
      currentUserLabel.textContent = `Calling ${selectedUser.name}...`;
      startVideoCall();
    } else {
      chatSection.style.display = "flex";
      videoCallSection.style.display = "none";
      toggleButton.textContent = "Video Call";
      currentUserLabel.textContent = selectedUser.name;
    }
  });

  // Dummy function to simulate video call behavior
  function startVideoCall() {
    console.log(`Starting video call with ${selectedUser.name}...`);
    // Implement WebRTC or any video call logic here.
  }
});
