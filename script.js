// High-accuracy stopwatch with laps and keyboard shortcuts

const display = document.getElementById("display");
const lapsEl  = document.getElementById("laps");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const lapBtn   = document.getElementById("lapBtn");
const clearLapsBtn = document.getElementById("clearLaps");

let startEpoch = 0;     // performance.now() when (re)started
let elapsedMs  = 0;     // accumulated ms while paused/running
let intervalId = null;  // setInterval id
let laps = [];          // {totalMs, lapMs}
let lastLapTotal = 0;   // total time at previous lap

function pad2(n){ return n.toString().padStart(2,"0"); }

function format(ms){
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const cs = Math.floor((ms % 1_000) / 10); // centiseconds
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

function render(timeMs = elapsedMs){
  display.textContent = format(timeMs);

  // render laps
  lapsEl.innerHTML = "";
  if(laps.length){
    // find best/worst lap by lapMs
    const lapTimes = laps.map(l => l.lapMs);
    const best = Math.min(...lapTimes);
    const worst = Math.max(...lapTimes);

    laps.forEach((l, i) => {
      const li = document.createElement("li");
      if(l.lapMs === best) li.classList.add("best");
      if(l.lapMs === worst) li.classList.add("worst");
      li.innerHTML = `
        <span>${i+1}</span>
        <span>${format(l.lapMs)}</span>
        <span>${format(l.totalMs)}</span>
      `;
      lapsEl.appendChild(li);
    });
  }
}

function start(){
  if(intervalId) return;                        // already running
  startEpoch = performance.now() - elapsedMs;   // continue from current elapsed
  intervalId = setInterval(() => {
    elapsedMs = performance.now() - startEpoch;
    render();
  }, 10); // update every 10ms (centiseconds)
}

function pause(){
  if(!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
  elapsedMs = performance.now() - startEpoch;
  render();
}

function reset(){
  clearInterval(intervalId);
  intervalId = null;
  elapsedMs = 0;
  laps = [];
  lastLapTotal = 0;
  render(0);
}

function addLap(){
  const total = elapsedMs;
  const lapMs = total - lastLapTotal;
  lastLapTotal = total;
  laps.unshift({ totalMs: total, lapMs }); // newest on top
  render();
}

// Buttons
startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", addLap);
clearLapsBtn.addEventListener("click", () => { laps=[]; lastLapTotal=elapsedMs; render(); });

// Keyboard: Space=start/pause, L=lap, R=reset
document.addEventListener("keydown", (e) => {
  if(e.code === "Space"){ e.preventDefault(); intervalId ? pause() : start(); }
  if(e.key.toLowerCase() === "l") addLap();
  if(e.key.toLowerCase() === "r") reset();
});

// initial paint
render(0);
