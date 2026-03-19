async function haalTicketsOp(){
    const tabs = await browser.tabs.query({currentWindow: true, active: true})
    const response = await browser.tabs.sendMessage(tabs[0].id, {action: "getTicket"})
    document.getElementById("ticketNummer").textContent = response.ticket;
    return response.ticket;
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
        const totaal = (elapsed + Date.now() - startedAt) / 1000;
        const uren = Math.floor(totaal / 3600);
        const minuten = Math.floor(totaal % 3600 / 60);
        const secondes = Math.floor(totaal % 60);
        document.getElementById("timer").textContent = `${uren.toString().padStart(2,"0")}:${minuten.toString().padStart(2,"0")}:${secondes.toString().padStart(2,"0")}`;
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
                const totaal = (elapsed + Date.now() - startedAt) / 1000;
                const uren = Math.floor(totaal / 3600);
                const minuten = Math.floor(totaal % 3600 / 60);
                const secondes = Math.floor(totaal % 60);
                document.getElementById("timer").textContent = `${uren.toString().padStart(2,"0")}:${minuten.toString().padStart(2,"0")}:${secondes.toString().padStart(2,"0")}`;
            },1000)
            opslaan()
        } else {
            running = false;
            elapsed += (Date.now() - startedAt) / 1000;
            clearInterval(interval);
            document.getElementById("startStopKnop").textContent = "Start";
            opslaan()
        }
    })
}






document.addEventListener("DOMContentLoaded", timer)