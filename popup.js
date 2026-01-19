// when the user clicks the Summarize button
document.getElementById("summarize").addEventListener("click", () => {
    // it will show a temporary message while we fetch the content...
    const result = document.getElementById("result");
    result.textContent = "Extracting text...";

    // get the currently active tab in the current window
    chrome.tabs.query({active:true, currentWindow:true}, ([tab]) => {
        // it will ask the content script to extract article text from the page
        chrome.tabs.sendMessage(
            tab.id,
            {type: "GET_ARTICLE_TEXT"},
            ({text}) => {
                // if text is found, show a short preview
                // otherwise, show a fallback message...
                result.textContent = text
                ? text.slice(0, 300) + "..."
                : "No article text found"
            }
        );
    });
});