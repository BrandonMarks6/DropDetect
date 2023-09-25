/**
 * Displays the prediction sent from service worker
 * @param {string} prediction  
 */
function dislayPrediction(prediction: string) {
  alert("The prediction is " + prediction)
}

// Add a listener to hear from the content.js page when the image is through
// processing.  The message should contin an action and a prediction 
//
// message: {action, prediction}
chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  if (!message) {
    console.log("No message found in content")
    return;
  }
  console.log("message reecieved")


  switch (message.action) {
    case 'OPTION_CLICKED':
      scrapeInfoAndSend(message.url, sendResponse);
      // This is needed to make sendResponse work properly.
      return true;
    case 'OPTION_CLICK_PROCESSED':
      if (message.prediction_label) {
        dislayPrediction(message.prediction_label)
      }
      break;
    default:
      break;
  }
});


/**
 * Calls a function to get data from current site. 
 * Sends that data in a response to the service worker
 */
function scrapeInfoAndSend(src: any, sendResponse: any) {
  const rawData: Array<number> = extractData()
  sendResponse({
    rawInputData: rawData,
  })
}

/**
 * Extracts most valuble data points from the current website
 * Returns them in an array
 */
function extractData() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
  );
  const words = [];
  let emojiCount = 0;

  //gets a count of emojis on the site
  while (walker.nextNode()) {
    const node = walker.currentNode;
    let nodeText = node.textContent
    // Check if nodeText is not null or undefined
    if (nodeText !== null) {
      const trimmedText = nodeText.trim();
      const nodeWords = trimmedText.split(/\s+/);
      words.push(...nodeWords);

      const emojiRegex = /[\u{1F000}-\u{1FFFF}]/gu;
      const emojis = trimmedText.match(emojiRegex);
      if (emojis) {
        emojiCount += emojis.length;
      }
    }
  }

  const totalWords = words.length;
  const shopifyCount = words.filter((word) => word.toLowerCase().includes('shopify')).length;
  const sellerCount = words.filter((word) => word.toLowerCase().includes('seller')).length;
  const collectionsCount = words.filter((word) => word.toLowerCase().includes('collections')).length;
  const images = document.querySelectorAll('img');
  const imageCount = images.length;

  // array must be ordered in this way for TF model to predict
  const extractedData = [
    shopifyCount,
    sellerCount,
    totalWords,
    emojiCount,
    collectionsCount,
    imageCount,
  ];

  return extractedData

}
