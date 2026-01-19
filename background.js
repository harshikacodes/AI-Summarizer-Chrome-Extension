// it will only run once when the extension is istalled or updated
chrome.runtime.onInstalled.addListener(() => {
    // here i am checking if the Gemini API key is already saved
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
        // if the API key is missing, open the options page
        // so the user can add it
        if(!result.geminiApiKey){
            chrome.tabs.create({url: "options.html"});
        }
    })
})