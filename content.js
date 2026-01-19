// tries to extract readable text from the current page
function getArticleText(){

    // my first preference... if the page has an <article> tag,
    // it usually contains the main content
    const article = document.querySelector("article");
    if(article){
        return article.innerText
    }

    // and if the pages don't use <article> tage 
    // then i collect text from all <p> tags
    const paragraphs = Array.from(document.querySelectorAll("p"));
    // join all paragraphs text into a single string
    return paragraphs.map((p) => p.innerText).join("\n");
}

// listen for messages coming from background or popup scripts
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    // when it is requested... send back the extracted article text
    if((req.type == "GET_ARTICLE_TEXT")){
        const text = getArticleText();
        sendResponse({text});
    }
})