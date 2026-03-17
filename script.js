// DOM Elements
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const chatTab = document.getElementById("chat-tab");
const historyTab = document.getElementById("history-tab");
const chatContainer = document.getElementById("chat-container");
const historyContainer = document.getElementById("history-container");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

// Gemini API
let GEMINI_API_KEY = "AIzaSyAp8fdRBapj4P4TRg2s-X6Nr6foiiWfxWQ";
let GEMINI_MODEL = "gemini-2.5-flash";

let chatHistory = [];

// Blood Groups
const bloodGroups = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

// Emergency Keywords
const emergencyWords = [
"urgent",
"emergency",
"need blood",
"blood needed",
"help",
"asap",
"khoon",
"blood chahiye"
];


// LOCATION DETECTION

function detectLocation(message){

if(message.toLowerCase().includes("lucknow")){

return `
🚨 BLOOD EMERGENCY – LUCKNOW

Agar patient ko turant blood chahiye to seedha in hospitals ke blood bank par jayein:

1️⃣ King George's Medical University (KGMU) Blood Bank  
Address: Shah Mina Rd, Chowk, Lucknow

2️⃣ SGPGI Blood Bank  
Address: Raebareli Road, Lucknow

3️⃣ Dr Ram Manohar Lohia Institute Blood Bank  
Address: Vibhuti Khand, Gomti Nagar, Lucknow

4️⃣ Indian Red Cross Blood Bank  
Address: Hazratganj, Lucknow

ONLINE BLOOD AVAILABILITY CHECK:
https://eraktkosh.in

Emergency Steps:

• Patient ko turant nearest hospital le jayein  
• Doctor ko required blood group batayein  
• Hospital blood bank se availability confirm karein  
• Agar hospital me available na ho to e-RaktKosh par search karein
`;
}

return null;

}


// EMERGENCY DETECTION

function detectEmergency(message){

let detectedGroup = null;

for(let group of bloodGroups){
if(message.toUpperCase().includes(group)){
detectedGroup = group;
break;
}
}

let emergencyDetected = emergencyWords.some(word =>
message.toLowerCase().includes(word)
);

if(emergencyDetected){

return `
🚨 BLOOD EMERGENCY GUIDANCE

Agar aapko blood ki zaroorat hai to turant ye steps follow karein:

1️⃣ Nearest hospital ya blood bank par turant jayein

2️⃣ Blood availability check karein:
https://eraktkosh.in

3️⃣ Indian Red Cross se contact karein:
https://indianredcross.org

4️⃣ Apna blood group doctor ko batayein

${detectedGroup ? `Required Blood Group: ${detectedGroup}` : ""}

⚠️ Agar situation emergency hai to patient ko turant hospital le jayein.
`;
}

return null;

}


// GEMINI AI RESPONSE

async function getGeminiReply(userMessage){

const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const prompt = `
You are BloodBridge AI.

You ONLY answer questions related to blood donation.

Provide helpful guidance about:
- blood donation
- blood compatibility
- finding blood banks
- emergency blood help
- myths about blood donation

Important blood resources in India:

e-RaktKosh:
https://eraktkosh.in

Indian Red Cross:
https://indianredcross.org

If the question is unrelated reply:
"I can only help with blood donation related questions."

User Question:
${userMessage}
`;

try{

const response = await fetch(url,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
contents:[{ parts:[{ text:prompt }] }]
})
});

const data = await response.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text ||
"⚠️ Sorry, I could not understand.";

}catch(error){

return "❌ Server error occurred.";

}

}


// SEND MESSAGE

async function sendMessage(){

const message = userInput.value.trim();

if(!message) return;


// USER MESSAGE

const userMsgDiv = document.createElement("div");

userMsgDiv.classList.add("user-message");

userMsgDiv.innerHTML = `
<div class="message">${message}</div>
<img src="user.png" class="user-icon">
`;

chatBox.appendChild(userMsgDiv);

userInput.value="";

chatBox.scrollTop = chatBox.scrollHeight;


// BOT THINKING MESSAGE

const botMsgDiv = document.createElement("div");

botMsgDiv.classList.add("bot-message");

botMsgDiv.innerHTML = `
<img src="ai.png" class="bot-icon">
<div class="message">⏳ Thinking...</div>
`;

chatBox.appendChild(botMsgDiv);

chatBox.scrollTop = chatBox.scrollHeight;


// LOCATION CHECK

let locationResponse = detectLocation(message);

let emergencyResponse = detectEmergency(message);

let reply;

if(locationResponse){

reply = locationResponse;

}else if(emergencyResponse){

reply = emergencyResponse;

}else{

reply = await getGeminiReply(message);

}


// SHOW BOT MESSAGE

botMsgDiv.querySelector(".message").innerText = reply;


// SAVE HISTORY

saveHistory(message,reply);

}


// SAVE CHAT HISTORY

function saveHistory(userMessage,botReply){

const item = document.createElement("div");

item.classList.add("history-item");

item.innerHTML = `
<p><strong>You:</strong> ${userMessage}</p>
<p><strong>Bot:</strong> ${botReply}</p>
`;

historyList.appendChild(item);

chatHistory.push({user:userMessage,bot:botReply});

}


// CLEAR HISTORY

clearHistoryBtn.addEventListener("click",()=>{

historyList.innerHTML="";
chatHistory=[];

});


// TAB SWITCH

chatTab.addEventListener("click",()=>{

chatTab.classList.add("active");
historyTab.classList.remove("active");

chatContainer.style.display="flex";
historyContainer.style.display="none";

});

historyTab.addEventListener("click",()=>{

historyTab.classList.add("active");
chatTab.classList.remove("active");

chatContainer.style.display="none";
historyContainer.style.display="flex";

});


// SEND BUTTON

sendBtn.addEventListener("click",sendMessage);


// ENTER KEY

userInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter") sendMessage();

});