import * as tf from '@tensorflow/tfjs';

const THREE_SECONDS_IN_MS = 3000;

/**
 * What action will be called when someone clicks the menu option. 
 * Sends a message with OPTION_CLICKED action. and recieves a response with website data
 * uses data to analyze the website
 */
function clickMenuCallback(info, tab) {
  const message = { action: 'OPTION_CLICKED' };
  chrome.tabs.sendMessage(tab.id, message, async (resp) => {
    if (!resp.rawInputData) {
      console.error(
        'Site data not recieved ' +
        'See console logs for errors.');
      return;
    }
    await siteClassifier.analyzeSite(resp.rawInputData, tab.id);
  });
}

/**
 * Adds a right-click menu option for dropDetect
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'contextMenu0',
    title: 'Use Drop Detect on site ',
    contexts: ['all'],
  });
});

//adds callback for menu option
chrome.contextMenus.onClicked.addListener(clickMenuCallback);


class SiteClassifier {
  constructor() {
    this.loadModel();
  }

  /**
   * Loads model and keeps a reference to it in the object.
   */
  async loadModel() {
    console.log('Loading model...');
    const startTime = performance.now();
    try {
      this.model =  await tf.loadLayersModel('../models/model.json');

      const totalTime = Math.floor(performance.now() - startTime);
      console.log(`Model loaded and initialized in ${totalTime} ms...`);

    } catch (e) {
      console.error('Unable to load model', e);
    }
  }

  /**
   * preprocesses data into a readable formate for Tensorflow
   * 
   * @param {array} rawInputData array of data from website in correct order
   */
  async preprocessData(rawInputData) {
    const inputTensor = tf.tensor2d([rawInputData])
    return inputTensor
  }

  /**
   * Triggers the model to make a prediction with the input data
   * Once prediction is made OPTION_CLICK_PROCESSED is sent along with prediction
   *
   * @param {preprocessed_input} rawInputData siteData of the image to analyze.
   * @param {number} tabId which tab the request comes from.
   */
  async analyzeSite(rawInputData, tabId) {
    if (!tabId) {
      console.error('No tab.  No prediction.');
      return;
    }
    if (!this.model) {
      console.log('Waiting for model to load...');
      setTimeout(
        () => { this.analyzeSite(preprocessed_input, tabId) }, THREE_SECONDS_IN_MS);
      return;
    }
    
    const startTime = performance.now();

    const preprocessed_input = await this.preprocessData(rawInputData)

    const predictions = await this.model.predict(preprocessed_input)

    const predictionData = await predictions.array();
    
    // For binary classification(yes or no)
    const predicted_prob = predictionData[0][0]
    let prediction_label = "NULL"
    if(predicted_prob > 0.5){
        prediction_label = "Yes"
    }
    else{
        prediction_label = "No"
    }

    const totalTime = performance.now() - startTime;
    console.log(`Done in ${totalTime.toFixed(1)} ms `);
    const message = { action: 'OPTION_CLICK_PROCESSED', prediction_label };
    chrome.tabs.sendMessage(tabId, message);
  }
}


const siteClassifier = new SiteClassifier();