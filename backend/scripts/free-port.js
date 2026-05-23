require("dotenv").config();

const { execSync } = require("child_process");

const port = Number(process.env.PORT || 8000);

function freePortOnWindows(targetPort) {
  let output = "";
  try {
    output = execSync(`netstat -ano | findstr :${targetPort}`, {
      encoding: "utf8",
    });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of output.split("\n")) {
    if (!line.includes("LISTENING")) continue;
    const pid = line.trim().split(/\s+/).pop();
    if (pid && pid !== "0") pids.add(pid);
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Freed port ${targetPort} (stopped PID ${pid})`);
    } catch {
      // Process may have already exited
    }
  }
}

function freePortOnUnix(targetPort) {
  try {
    execSync(`npx --yes kill-port ${targetPort}`, { stdio: "inherit" });
  } catch {
    // Port already free
  }
}

if (process.platform === "win32") {
  freePortOnWindows(port);
} else {
  freePortOnUnix(port);
}
