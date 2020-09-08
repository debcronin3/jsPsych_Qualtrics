// This code is pasted into the JS editor for the survey 'question' that will run BubbleView

Qualtrics.SurveyEngine.addOnload(function () {

    /*Place your JavaScript here to run when the page loads*/

    /* Change 2: Hiding the Next button */
    // Retrieve Qualtrics object and save in qthis
    var qthis = this;

    // Hide buttons
    qthis.hideNextButton();

    /* Change 3: Defining and load required resources */
    var jslib_url = "https://debcronin3.github.io/jsPsych_Qualtrics/";

    // the below urls must be accessible with your browser
    // for example, https://kywch.github.io/jsPsych/jspsych.js
    var requiredResources = [
		"https://code.jquery.com/jquery-2.2.4.min.js",
        jslib_url + "lib/jspsych.js",
		jslib_url + "lib/jspsych-bubble-view.js",
        jslib_url + "lib/jspsych-instructions.js",
		jslib_url + "lib/jspsych-fullscreen.js",
		jslib_url + "lib/jspsych-survey-text.js",
		jslib_url + "lib/jspsych-single-image.js",
		jslib_url + "lib/jspsych-html-button-response.js",
		jslib_url + "lib/bubble-view_main_DAC.js",
    ];

    function loadScript(idx) {
        console.log("Loading ", requiredResources[idx]);
        jQuery.getScript(requiredResources[idx], function () {
            if ((idx + 1) < requiredResources.length) {
                loadScript(idx + 1);
            } else {
                initExp();
            }
        });
    }

    if (window.Qualtrics && (!window.frameElement || window.frameElement.id !== "mobile-preview-view")) {
        loadScript(0);
    }

    /* Change 4: Appending the display_stage Div using jQuery */
    // jQuery is loaded in Qualtrics by default
    jQuery("<div id = 'display_stage_background'></div>").appendTo('body');
    jQuery("<div id = 'display_stage'></div>").appendTo('body');


    /* Change 5: Wrapping jsPsych.init() in a function */
    function initExp() {
		sbjId = Date.now().toString();
  	data_dir = "data01";

  /* ************************************ */
  /* Instruction-related scripts */
  /* ************************************ */
  var instr_url = 'https://debcronin3.github.io/jsPsych_Qualtrics/instructions/';
  var instr_imglist = [];
  for (var ii = 0; ii < 3; ii++) {
    instr_imglist.push(instr_url + 'Slide' + (ii + 1).toString() + '.PNG');
  }

  function generate_instruction_page(imglist) {
    var instructions_page = {
      type: 'instructions',
      pages: function () {
        var pages = [];
        for (var ii = 0; ii < imglist.length; ii++) {
          pages.push('<img class="resize" src="' + imglist[ii] + '">');
        }
        pages.push(
          '<div class = centerbox><p class = block-text>You can read the instructions again by clicking the <strong>Previous</strong> button.</p>' +
          '<p class = block-text>Clicking the <strong>Next</strong> button will start the practice trials.</p></div>'
        );
        return pages;
      },
      data: {
        exp_stage: 'task_instructions_page'
      },
      allow_keys: false,
      show_clickable_nav: true,
      show_page_number: true
    };
    return instructions_page;
  }

  // stimulus definition
  // for the images that have 'a' in the fourth place, we will ask Ps to describe those
  var pracImg_src = 'https://debcronin3.github.io/jsPsych_Qualtrics/images_prac/';
  var pracImg_ext = 'png';
  var pracImg_set = ["blue_river","brick_apartment"]; /*, "airport"]; */
  var pracImg_attn = ["airport"];
  var mainImg_src = 'https://debcronin3.github.io/jsPsych_Qualtrics/images_main/';
  var mainImg_ext = 'jpg';
  var mainImg_set = [
    "basketball_net" , "bell", "bin"] /*, "blender", "boat", "calculator", "cap", "CD",
    "chair", "clock", "coffeemaker", "coke_can", "cracker", "dice", "disco_ball", "dog",
    "duck", "dustpan", "fire_hydrant", "flowers", "gnome", "bongo_drums", "book", "bowl",
    "briefcase", "broom", "bucket", "bust", "car", "cat", "chainsaw", "computer",
    "elephant", "fan", "fire_extinguisher", "flag", "fruit_bowl", "funnel", "glass", "globe"
  ]; */
  var mainImg_attn = ["basketball_net"];

  var jspsych_session = [];

  // use the full screen
  jspsych_session.push({
    type: 'fullscreen',
    fullscreen_mode: true
  });

  jspsych_session.push(generate_instruction_page(instr_imglist));

  jspsych_session.push({
    timeline: generate_practice_block(pracImg_src, shuffle(pracImg_set), pracImg_ext, pracImg_attn)
  });

  jspsych_session.push({
    timeline: generate_main_block(mainImg_src, shuffle(mainImg_set), mainImg_ext, mainImg_attn)
  });

  // exit the full screen
  jspsych_session.push({
    type: 'fullscreen',
    fullscreen_mode: false
  });

         jsPsych.init({
    timeline: jspsych_session,
    preload_images: instr_imglist,

    display_element: document.querySelector('#display_stage'),

    on_data_update: function (data) { // each time the data is updated:
      // write the current window resolution to the data
      data.win_res = window.innerWidth + 'x' + window.innerHeight;
      data.fullscr = fullscr_ON;
    },

    on_interaction_data_update: function (data) {
      //interaction data logs if participants leaves the browser window or exits full screen mode
      interaction = data.event;
      if (interaction.includes("fullscreen")) {
        // some unhandy coding to circumvent a bug in jspsych that logs fullscreenexit when actually entering
        if (fullscr_ON == 'no') {
          fullscr_ON = 'yes';
          return fullscr_ON;
        } else if (fullscr_ON == 'yes') {
          fullscr_ON = 'no';
          return fullscr_ON;
        }
      } else if (interaction == 'blur' || interaction == 'focus') {
        focus = interaction;
        return focus;
      }
    },
    
    exclusions: { // browser window needs to have these dimensions, if not, participants get the chance to maximize their window, if they don't support this resolution when maximized they can't particiate.
        min_width: 1024,
        min_height: 768
    },


            /* Change 6: Adding the clean up and continue functions.*/
            on_finish: function () {
				fetch('https://glacial-citadel-67877.herokuapp.com/data', {
        			method: 'POST',
         			headers: {
          				'Content-Type': 'application/json'
        			},
         			body: jsPsych.data.get().json()
				})
			 // save to qualtrics embedded data
        	//Qualtrics.SurveyEngine.setEmbeddedData("trials", trials);
				
                // clear the stage
                jQuery('display_stage').remove();
                jQuery('display_stage_background').remove();

                // simulate click on Qualtrics "next" button, making use of the Qualtrics JS API
                qthis.clickNextButton();
            }
        });
    }
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/

});