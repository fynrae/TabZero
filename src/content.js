let shellInput = null;

function createCommandBar() {
  const existingBar = document.getElementById("tab-shell-bar");
  if (existingBar) {
    existingBar.focus();
    return;
  }

  shellInput = document.createElement("input");
  shellInput.id = "tab-shell-bar";
  shellInput.type = "text";
  shellInput.placeholder = "Enter command...";
  Object.assign(shellInput.style, {
    position: "fixed",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10000,
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    color: "#fff",
    border: "2px solid #444",
    borderRadius: "8px",
    outline: "none",
    width: "300px",
    boxShadow: "0 0 10px #000",
    opacity: "0",
    transition: "opacity 0.4s ease-in-out"
  });

  document.body.appendChild(shellInput);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shellInput.style.opacity = "1";
      shellInput.focus();
    });
  });

  const removeBar = () => {
    if (!shellInput) return;

    shellInput.style.opacity = "0";

    shellInput.addEventListener('transitionend', () => {
      if (shellInput) {
        shellInput.remove();
        shellInput = null;
      }
    }, { once: true });
  };

  shellInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const value = shellInput.value.trim();
      const parts = value.split(' ');
      const command = parts[0];
      const argument1 = parts[1];
      const argument2 = parts[2];

      if (command === "n") {
        chrome.runtime.sendMessage({ command: "new_tab_silent", url: argument1 || null });
      } else if (command === "nf") {
        chrome.runtime.sendMessage({ command: "new_tab", url: argument1 || null });

      } else if (command === "c" && argument1) {
        const tabIndex = parseInt(argument1, 10);
        if (!isNaN(tabIndex) && tabIndex > 0) {
          chrome.runtime.sendMessage({ command: "close_tab", index: tabIndex });
        } else {
          console.log("Invalid tab number provided.");
        }

      } if (command === "f" && argument1) {
        if (argument1.toLowerCase() === 'last') {
          chrome.runtime.sendMessage({ command: "focus_tab", index: "last" });
        } else {
          const tabIndex = parseInt(argument1, 10);
          if (!isNaN(tabIndex) && tabIndex > 0) {
            chrome.runtime.sendMessage({ command: "focus_tab", index: tabIndex });
          } else {
            chrome.runtime.sendMessage({ command: "focus_tab", query: argument1 });
          }
        }

      } else if (command === "m" && argument1 && argument2) {
        const fromIndex = parseInt(argument1, 10);
        const toIndex = parseInt(argument2, 10);

        if (!isNaN(fromIndex) && fromIndex > 0 && !isNaN(toIndex) && toIndex > 0) {
          chrome.runtime.sendMessage({
            command: "move_tab",
            from: fromIndex,
            to: toIndex
          });
        } else {
          console.log("Invalid 'from' or 'to' index provided for 'm' command.");
        }
      }

      removeBar();

    } else if (e.key === "Escape") {
      removeBar();
    }
  });

  shellInput.addEventListener("blur", removeBar);
}

window.addEventListener("keydown", (e) => {
  if (e.altKey && e.code === "Space") {
    e.preventDefault();
    e.stopPropagation();
    createCommandBar();
  }
});