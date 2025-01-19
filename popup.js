document.addEventListener("DOMContentLoaded", () => {
  // Load saved settings
  chrome.storage.sync.get(["githubToken", "repoOwner", "repoName"], (data) => {
    document.getElementById("githubToken").value = data.githubToken || "";
    document.getElementById("repoOwner").value = data.repoOwner || "";
    document.getElementById("repoName").value = data.repoName || "";
  });
  document.getElementById("saveSettings").addEventListener("click", () => {
    const settings = {
      githubToken: document.getElementById("githubToken").value,
      repoOwner: document.getElementById("repoOwner").value,
      repoName: document.getElementById("repoName").value,
    };

    chrome.storage.sync.set(settings, () => {
      document.getElementById("status").textContent = "Settings saved!";
      setTimeout(() => {
        document.getElementById("status").textContent = "";
      }, 2000);
    });
  });
  document
    .getElementById("saveSolution")
    .addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      chrome.tabs.sendMessage(tab.id, { action: "getSolution" });
    });
});
