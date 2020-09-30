# jsPsych_Qualtrics

This code runs a simple BubbleView (http://bubbleview.namwkim.org/) experiment with jsPsych (https://www.jspsych.org/). The code was modified from
Kyoung Whan Choe's (https://kywch.github.io/) jsPsych BubbleView plugin. The code to put the experiment in Qualtrics was developed using 
Kyoung's jsPsych + Qualtrics tutorial. 

index_DAC.html will run the experiment in a browser. To put code on qualtrics, the entire text of lib/for_qualtrics.js needs to be pasted into 
the JS editor for a survey question on Qualtrics. In addition, bubble-view.css needs to be linked in the Qualtrics html editor for the same quesiton.
See Kyoung Choe's jsPsych -> Qualtrics tutorial for more information.

To collect BubbleView data, you will need to set up a server and a database. The server passes the data to the database, which stores the results of the experiment.
