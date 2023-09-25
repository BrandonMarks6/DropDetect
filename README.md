# DropDetect

This program applies a trained TensorFlow model to predict whether a site operates as a dropshipping front. Utilizing a Chrome extension to extract data points, the program achieves predictions with an average processing time of 45ms.



## Installation and Setup Instructions


Clone down this repository. You will need `yarn` installed globally on your machine.

To install required packages to run the program:

`yarn`

To build project into a dist folder:

`yarn build`

To install the unpacked extension in chrome, follow the [instructions here](https://developer.chrome.com/extensions/getstarted).  Briefly, navigate to `chrome://extensions`, make sure that the `Developer mode` switch is turned on in the upper right, and click `Load Unpacked`.  Then select the appropriate directory (the `dist` directory containing `manifest.json`);

## Reflection

This was a personal project built in an attempt to save people from overpaying for items they could find much cheaper on another website.


The primary objective was to develop a machine learning-driven solution capable of predicting the likelihood of a website operating as a front for dropshipping based on a variety of data points commonly used as indicators for dropshipping.

The biggest challenge I ran into was the restrictive nature of working with chrome extensions. With how much access to user data they allow, Chrome is very cautious about any imports that could use data maliciously. This lead to big setbacks with this project in an attempt to integrate Tensorflow in the ways necessary for this project. After about many days of research consisting of testing countless outdated programs and reaching out to individuals in online communities with whom I had no prior connections, I was finally able to build the project in a way that complied with their strict rules without having to give up any of the functionality.



The reason I chose to apply this project with a Chrome Extension is the ease of access associated with it. While someone who is comfortable with computers might could use a few different programs to extract the data then plug it in elsewhere in the correct format, buindling all functionality together in an extension requires nothing from the user other than a click of a button. I used Python to build the model due to ease of use and later converted it to TFJS. I first built the project in Javascript but in order to more fully understand the TFJS library I changed the project to Typescript so I would be required to deeper understand how it works.