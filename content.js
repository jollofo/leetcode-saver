chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getSolution") {
    // Get problem details
    const problemTitle = document.querySelector(
      'div[data-cy="question-title"]'
    ).textContent;
    const problemDifficulty = document
      .querySelector("div[data-difficulty]")
      .getAttribute("data-difficulty");

    // Get solution code (this selector might need updating based on LeetCode's structure)
    const editor = document.querySelector(".monaco-editor");
    const solution = editor ? editor.textContent : "";

    // Format the solution file
    const formattedSolution = `/*
  Problem: ${problemTitle}
  Difficulty: ${problemDifficulty}
  Link: ${window.location.href}
  */
  
  ${solution}`;

    // Get GitHub settings
    chrome.storage.sync.get(
      ["githubToken", "repoOwner", "repoName"],
      async (data) => {
        try {
          // Create file name from problem title
          const fileName = `${problemTitle
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")}.js`;

          // Get existing file (if any) to get its SHA
          const fileUrl = `https://api.github.com/repos/${data.repoOwner}/${data.repoName}/contents/solutions/${fileName}`;

          let existingFile;
          try {
            const response = await fetch(fileUrl, {
              headers: {
                Authorization: `token ${data.githubToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            });
            existingFile = await response.json();
          } catch (e) {
            existingFile = null;
          }

          // Prepare request body
          const body = {
            message: `Add/Update solution for ${problemTitle}`,
            content: btoa(formattedSolution),
            branch: "main",
          };

          if (existingFile && existingFile.sha) {
            body.sha = existingFile.sha;
          }

          // Create or update file
          const response = await fetch(fileUrl, {
            method: "PUT",
            headers: {
              Authorization: `token ${data.githubToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            alert("Solution saved successfully!");
          } else {
            throw new Error("Failed to save solution");
          }
        } catch (error) {
          alert(`Error saving solution: ${error.message}`);
        }
      }
    );
  }
});
