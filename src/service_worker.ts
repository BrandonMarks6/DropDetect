//@ts-ignore
import * as tf from '@tensorflow/tfjs';

const THREE_SECONDS_IN_MS: number = 3000;

/**
 * What action will be called when someone clicks the menu option. 
 * Sends a message with OPTION_CLICKED action. and recieves a response with website data
 * uses data to analyze the website
 */
function clickMenuCallback(info: any, tab: any) {
  const message= { action: 'OPTION_CLICKED' };
  chrome.tabs.sendMessage(tab.id, message, async (resp: any) => {
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
chrome.runtime.onInstalled.addListener((): void => {
  chrome.contextMenus.create({
    id: 'contextMenu0',
    title: 'Use Drop Detect on site ',
    contexts: ['all'],
  });
});

//adds callback for menu option
chrome.contextMenus.onClicked.addListener(clickMenuCallback);


class SiteClassifier {
  model: tf.LayersModel | null;

  constructor() {
    this.model = null; // Initialize 'model' as null
    this.loadModel();
  }

  /**
   * Loads model and keeps a reference to it in the object.
   */
  async loadModel(): Promise<void> {
    console.log('Loading model...');
    const startTime = performance.now();
    try {
      this.model = await tf.loadLayersModel('../models/model.json');

      const totalTime: number = Math.floor(performance.now() - startTime);
      console.log(`Model loaded and initialized in ${totalTime} ms...`);

    } catch (e: any) {
      console.error('Unable to load model', e);
    }
  }

  /**
   * preprocesses data into a readable formate for Tensorflow
   * 
   * @param {Array<number>} rawInputData array of data from website in correct order
   */
  async preprocessData(rawInputData: Array<number>) {
    const inputTensor = tf.tensor2d([rawInputData])
    return inputTensor
  }

  /**
   * Triggers the model to make a prediction with the input data
   * Once prediction is made OPTION_CLICK_PROCESSED is sent along with prediction
   *
   * @param {Array<number>} rawInputData siteData of the image to analyze.
   * @param {number} tabId which tab the request comes from.
   */
  async analyzeSite(rawInputData: any, tabId: number): Promise<void> {
    if (!tabId) {
      console.error('No tab.  No prediction.');
      return;
    }
    if (!this.model) {
      console.log('Waiting for model to load...');
      setTimeout(
        () => { this.analyzeSite(rawInputData, tabId) }, THREE_SECONDS_IN_MS);
      return;
    }
    
    const startTime = performance.now();

    const preprocessed_input: tf.Tensor2D = await this.preprocessData(rawInputData)

    const predictions = await this.model.predict(preprocessed_input)

    const predicted_prob = await predictions.dataSync()[0]

    // For binary classification(yes or no)
    let prediction_label: string = "No prediction found"
    if(predicted_prob > 0.5){
        prediction_label = "Yes"
    }
    else{
        prediction_label = "No"
    }



    const totalTime= performance.now() - startTime;
    console.log(`Done in ${totalTime.toFixed(1)} ms `);
    const message = { action: 'OPTION_CLICK_PROCESSED', prediction_label };
    chrome.tabs.sendMessage(tabId, message);
  }
}


const siteClassifier = new SiteClassifier();
