/**
 * bubble-view_main.js
 * Kyoung Whan Choe (https://github.com/kywch/)
 *
 * main javascript for showing images with bubble view
 *
 * For the bubble view paper, see http://bubbleview.namwkim.org/
 * For the original bubble view code, see https://github.com/namwkim/bubbleview
 *
 **/

/*
 * Generic task variables
 */
var sbjId = ""; // mturk id
var task_id = ""; // the prefix for the save file -- the main seq
var data_dir = "";
var flag_debug = false;
if (flag_debug) {
  var trial_dur = 1000;
} else {
  var trial_dur = 12000;
}

var viewrt_history = [];
var descrt_history = [];
var desc_content = [];
var maximum_click = 10;

// activity tracking
var focus = "focus"; // tracks if the current tab/window is the active tab/window, initially the current tab should be focused
var fullscr_ON = "no"; // tracks fullscreen activity, initially not activated
var fullscr_history = [];

/*
 * Helper functions
 */
function shuffle(array) {
  let counter = array.length;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

/*
 * Practice block
 */
function generate_practice_block(
  prac_img_src,
  prac_seq,
  img_ext,
  img_attn = []
) {
  var block_sequence = [];
  var num_trial = prac_seq.length;

  var practice_instructions_page = {
    type: "instructions",
    pages: [
      '<div class="centerbox"><p class="block-text">Click next to begin the practice trials</p></div>',
    ],
    allow_keys: false,
    show_clickable_nav: true,
    allow_backward: false,
    show_page_number: false,
    data: {
      exp_stage: "practice_instructions",
      sbj_id: sbjId,
    },
  };
  block_sequence.push(practice_instructions_page);

  for (var ii = 0; ii < num_trial; ii++) {
    var start_trial = {
      type: "instructions",
      pages: [
        "<p class = block-text>" +
          "Click next to begin practice trial " +
          (ii + 1).toString() +
          "/" +
          num_trial.toString() +
          "</p></div>",
      ],
      allow_keys: false,
      show_clickable_nav: true,
      allow_backward: false,
      show_page_number: false,
      data: {
        exp_stage: "practice_trial_start_" + (ii + 1).toString(),
      },
    };
    block_sequence.push(start_trial);

    /*
        var gist_phase = {
            type: 'single-image',
            stimulus: prac_img_src + prac_seq[ii] + '_smt.' + img_ext, // blurry image
            image_size: [800, 450],
            stimulus_duration: 2000,
            data: {
                exp_stage: 'practice_trial_gist_' + (ii + 1).toString()
            }
        };
        block_sequence.push(gist_phase);

        var rating_gist_phase = {
            type: 'html-button-response',
            stimulus: '<p class = block-text>' +
                'Please rate how violent the picture was (1:none - 7:extremely).</p>',
            choices: ['1', '2', '3', '4', '5', '6', '7'],
            data: {
                exp_stage: 'practice_trial_rate_gist' + (ii + 1).toString()
            }
        };
        block_sequence.push(rating_gist_phase);
        */

    var bubble_phase = {
      type: "bubble-view",
      org_image: prac_img_src + prac_seq[ii] + "." + img_ext,
      blur_image: prac_img_src + prac_seq[ii] + "_30pxblur." + img_ext,
      prompt: null, //'<p class = block-text>Please inspect the image.</p>',
      trial_type: "fixed_viewing_duration", // or 'fixed_click_maximum'
      //maximum_click: maximum_click,
      viewing_duration: 12000,
      bubble_size: 50, // 50px bubble = best approximation for EMs in Kim et al. 
      image_size: [1024, 768],
      refractory_period: 50,
      data: {
        exp_stage: "practice_trial_bubble_" + (ii + 1).toString(),
      },
    };
    block_sequence.push(bubble_phase);

    // var rating_bubble_phase = {
    //   type: "html-button-response",
    //   stimulus:
    //     "<p class = block-text>" +
    //     "Please select whether you liked, felt neutral about, or disliked the image.</p>",
    //   choices: ["Like", "Neutral", "Dislike"],
    //   data: {
    //     exp_stage: "practice_trial_rate_bubble" + (ii + 1).toString(),
    //     image: prac_seq[ii],
    //   },
    // };
    // block_sequence.push(rating_bubble_phase); 

    // ATTN CHECK: we are only asking people to provide description of a scene, when its name is in img_attn
    /*if (img_attn.indexOf(prac_seq[ii]) > -1) {
            var describe_phase = {
                type: 'survey-text',
                questions: [{
                    prompt: '<p class = block-text>Please describe the interaction that you saw<br>(minimum 30 characters).</p>',
                    rows: 4,
                    columns: 50
                }],
                minimum_duration: trial_dur,
                required_character: 23,
                data: {
                    exp_stage: 'practice_trial_describe_' + (ii + 1).toString(),
                    image: prac_seq[ii]
                }
            };
            block_sequence.push(describe_phase);
        } */
  }

  return block_sequence;
}

/*
 * Main block
 */
function generate_main_block(main_img_src, main_seq, img_ext, img_attn = []) {
  var block_sequence = [];
  var num_trial = main_seq.length;

  var main_instructions_page = {
    type: "instructions",
    pages: [
      "<div class = centerbox><p class = block-text>You finshed the practice and are about to begin the main task.</p>" +
        "<p class = block-text>Please take the study seriously.</p>" +
        "<p class = block-text>We very much appreciate your participation!</p></div>",
      "<div class = centerbox><p class = block-text>Click next to continue</p>",
    ],
    allow_keys: false,
    show_clickable_nav: true,
    allow_backward: false,
    show_page_number: false,
    data: {
      exp_stage: "main_instructions",
      sbj_id: sbjId,
    },
    on_finish: function (data) {
    },
  };
  block_sequence.push(main_instructions_page);

  for (var ii = 0; ii < num_trial; ii++) {
    var start_trial = {
      type: "instructions",
      pages: [
        "<p class = block-text>" +
          "Click next to begin trial " +
          (ii + 1).toString() +
          "/" +
          num_trial.toString() +
          "</p></div>",
      ],
      allow_keys: false,
      show_clickable_nav: true,
      allow_backward: false,
      show_page_number: false,
      data: {
        exp_stage: "main_trial_start_" + (ii + 1).toString(),
      },
    };
    block_sequence.push(start_trial);

    /*
        var gist_phase = {
            type: 'single-image',
            stimulus: main_img_src + main_seq[ii] + '_smt.' + img_ext, // blurry image
            image_size: [800, 450],
            stimulus_duration: 2000,
            data: {
                exp_stage: 'main_trial_gist_' + (ii + 1).toString()
            }
        };
        block_sequence.push(gist_phase);

        var rating_gist_phase = {
            type: 'html-button-response',
            stimulus: '<p class = block-text>' +
                'Please rate how violent the picture was (1:none - 7:extremely).</p>',
            choices: ['1', '2', '3', '4', '5', '6', '7'],
            data: {
                exp_stage: 'main_trial_rate_gist' + (ii + 1).toString()
            }
        };
        block_sequence.push(rating_gist_phase);
        */

    var bubble_phase = {
      type: "bubble-view",
      org_image: main_img_src + main_seq[ii] + "." + img_ext,
      blur_image: main_img_src + main_seq[ii] + "_30pxblur." + img_ext,
      prompt: null, //'<p class = block-text>Please inspect the image.</p>', // using up to <b>' + maximum_click + '</font></b> bubbles.</p>',
      trial_type: "fixed_viewing_duration", // or 'fixed_click_maximum'
      viewing_duration: 12000,
      //maximum_click: maximum_click,
      bubble_size: 50, //50px + 30px sigma blur = best approximation for eye movements in Kim et al.
      image_size: [1024, 768],
      refractory_period: 50,
      data: {
        exp_stage: "main_trial_bubble_" + (ii + 1).toString(),
      },
      on_finish: function (data) {
        viewrt_history.push(data.viewing_duration);
      },
    };
    block_sequence.push(bubble_phase);

    // var rating_bubble_phase = {
    //   type: "html-button-response",
    //   stimulus:
    //     "<p class = block-text>" +
    //     "Please select whether you liked, felt neutral about, or disliked the image. </p>",
    //   choices: ["Like", "Neutral", "Dislike"],
    //   data: {
    //     exp_stage: "main_trial_rate_bubble_" + (ii + 1).toString(),
    //     image: main_seq[ii],
    //   },
    // };
    // block_sequence.push(rating_bubble_phase);

    // ATTN CHECK: we are only asking people to provide description of a scene, when its name is in img_attn
    /*if (img_attn.indexOf(main_seq[ii]) > -1) {
            var describe_phase = {
                type: 'survey-text',
                questions: [{
                    prompt: '<p class = block-text>Please describe the interaction that you saw<br>(minimum 40 characters).</p>',
                    rows: 5,
                    columns: 50
                }],
                minimum_duration: trial_dur,
                required_character: 30,
                data: {
                    exp_stage: 'main_trial_describe_' + (ii + 1).toString(),
                    image: main_seq[ii]
                },
                on_finish: function (data) {
                    descrt_history.push(data.rt);
                    desc_content.push(data.responses);
                }
            };
            block_sequence.push(describe_phase);
        } */

    if (ii % 10 == 9 && !(ii == num_trial - 1)) {
      var break_page = {
        type: "instructions",
        pages: [
          "<div class = centerbox><p class = block-text>You can take a short break. Click next to continue</p>",
        ],
        allow_keys: false,
        show_clickable_nav: true,
        allow_backward: false,
        show_page_number: false,
        data: {
          exp_stage: "main_break",
        },
        on_finish: function (data) {
        },
      };
      block_sequence.push(break_page);
    }
  }

  return block_sequence;
}

/*
 * Test block
 */

function generate_test_block(test_img_src, test_seq, img_ext) {
  var block_sequence = [];
  var num_trial = test_seq.length; //edit for test seq

  var test_instructions_page = {
    type: "instructions",
    pages: [
      "<div class='centerbox'><p class='block-text'> You finished viewing the images! Now we will test your memory.\
      You will see a series of images. Some of the images are new and some are the same images you saw earlier \
      in the study. If you recognize an image, press 'Yes', if you do not recognize an image, press 'No'.</p>" +
      "<p class='block-text'>Click next to continue</p></div>",
       /* "<p class='block-text'>You will see a series of images, some of which you saw earlier in this study.</p>" +
        "<p class='block-text'>If you recognize the image, press the LEFT ARROW.</p>" +
        "<p class='block-text'>If you do not recognize the image, press the RIGHT ARROW.</p></div>",*/
    ],
    allow_keys: false,
    show_clickable_nav: true,
    allow_backward: false,
    show_page_number: false,
    data: {
      exp_stage: "test_instructions",
      sbj_id: sbjId,
    },
    on_finish: function (data) {
      fetch('https://glacial-citadel-67877.herokuapp.com')
    },
  };
  block_sequence.push(test_instructions_page);

  for (var ii = 0; ii < num_trial; ii++) {
    var memory_phase = {
      type: "image-button-response",
      stimulus: test_img_src + test_seq[ii] + "." + img_ext,
      stimulus_height: 576,
      stimulus_width: 768,
      choices: ["Yes", "No"],
      prompt:
        "<p class = block-text>Do you remember seeing this image?</p>",
      data: {
        exp_stage: "memory_test_" + (ii + 1).toString(),
        image: test_seq[ii],
        subjID: sbjId,
      },
      on_finish: function (data) {
      },
    };
    block_sequence.push(memory_phase);
  }

  var toMongo = function(data){
    fetch('https://glacial-citadel-67877.herokuapp.com/bv01mem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data.json()
    })
  }

  var uploadData = {
    type: 'call-function',
    func: function(){ toMongo(jsPsych.data.get())}
}
block_sequence.push(uploadData)

var uploadWait = {
  type: "html-button-response",
  choices: [],
  stimulus:
    "<p class = block-text>" +
    "Please wait while we receive your data. You will be automatically redirected to Sona when complete. </p>",
  trial_duration: 10000,
  response_ends_trial: false,
};
block_sequence.push(uploadWait);

  return block_sequence;
}
