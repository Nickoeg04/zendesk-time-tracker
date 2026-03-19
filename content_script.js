browser.runtime.onMessage(ticket)
const ticket = () => window.location.pathname.split("/")[-1];

browser.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message.action === "getTicket"){
        sendResponse({ ticket: window.location.pathname.split("/").pop()})    
    };

    return true;
});
