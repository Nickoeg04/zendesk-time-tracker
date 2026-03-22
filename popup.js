async function haalTicketsOp(){
    const tabs = await browser.tabs.query({currentWindow: true, active: true})
    const url = tabs[0].url;
    const ticketNummer = url.split("/").pop();
    document.getElementById("ticketNummer").textContent = ticketNummer;
    return ticketNummer
    
    /* await new Promise(r=>setTimeout(r,100));
    const response = await browser.tabs.sendMessage(tabs[0].id, {action: "getTicket"})
    document.getElementById("ticketNummer").textContent = response.ticket;
    return response.ticket;*/
}

const timer = async () => {
    let running = false;
    let startedAt = 0;
    let elapsed = 0;
    let interval = null;
    let ticketNummer = await haalTicketsOp();
    let date = new Date().toISOString().slice(0,10);

    async function laden(){
        const data = await browser.storage.local.get("timers");
        if (data.timers && data.timers[date] && data.timers[date][ticketNummer]){
            elapsed = data.timers[date][ticketNummer].elapsed;
            running = data.timers[date][ticketNummer].running;
            startedAt = data.timers[date][ticketNummer].startedAt;
        }
    }
    
    await laden()


    if(running === true){
        document.getElementById("startStopKnop").textContent = "Stop";
        interval = setInterval(() => {
        document.getElementById("timer").textContent = timeToString(elapsed + Date.now() - startedAt)
        },1000)
    }

    async function opslaan(){
        const data = await browser.storage.local.get("timers");
        if (!data.timers){
            data.timers = {}
        }

        if (!data.timers[date]){
            data.timers[date] = {}
        }

        data.timers[date][ticketNummer] = {
            elapsed: elapsed,
            running: running,
            startedAt: startedAt  
        }

        await browser.storage.local.set({timers: data.timers});
    }
    
    document.getElementById("startStopKnop").addEventListener("click", () => {
        if (running === false){
            document.getElementById("startStopKnop").textContent = "Stop";
            running = true;
            startedAt = Date.now()
            interval = setInterval(() => {
                document.getElementById("timer").textContent = timeToString(elapsed + Date.now() - startedAt)},1000) 
                opslaan()
        }
         else {
            running = false;
            elapsed += Date.now() - startedAt;
            clearInterval(interval);
            document.getElementById("startStopKnop").textContent = "Start";
            opslaan()
        }
    })


    document.getElementById("reset").addEventListener("click", () => {
        running = false;
        elapsed = 0;
        startedAt = 0;
        clearInterval(interval);
        interval = null;
        document.getElementById("timer").textContent = "00:00:00";
        document.getElementById("startStopKnop").textContent = "Start";
        opslaan();
    })

}

function timeToString(ms){
    let s = Math.floor((ms / 1000) % 60);
    let secondesToString = s.toString().padStart(2,"0")
    let m = Math.floor((ms / 1000) % 3600 / 60);
    let minutenToString = m.toString().padStart(2,"0");
    let u = Math.floor((ms/1000 ) / 3600);
    let urenToString = u.toString().padStart(2,"0");
    return `${urenToString}:${minutenToString}:${secondesToString}`
}




document.addEventListener("DOMContentLoaded", timer);
