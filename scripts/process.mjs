import { spawn } from "node:child_process";

// npm/Next spawn descendants. Give each command its own group so cancelling
// verification stops only that command tree, never another lane's server.
export function spawnManaged(command, args, options) {
  const grouped = process.platform !== "win32";
  const child = spawn(command, args, { ...options, detached: grouped });
  let escalation;
  const stop = (signal) => {
    child.interruptedSignal = signal;
    process.exitCode = 1;
    const send = (value) => {
      try {
        if (grouped && child.pid) process.kill(-child.pid, value);
        else child.kill(value);
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    };
    send(signal);
    escalation = setTimeout(() => send("SIGKILL"), 5000);
    escalation.unref();
  };
  const interrupt = () => stop("SIGINT");
  const terminate = () => stop("SIGTERM");
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", terminate);
  child.once("close", () => {
    // A group leader may exit while a detached-output grandchild ignores TERM.
    // Reap any remaining members of our group before clearing escalation.
    if (child.interruptedSignal && grouped && child.pid) {
      try { process.kill(-child.pid, "SIGKILL"); }
      catch (error) { if (error.code !== "ESRCH") throw error; }
    }
    clearTimeout(escalation);
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
  });
  return child;
}
