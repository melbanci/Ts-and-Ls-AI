// Ts-and-Ls MAIN EXPERIMENT CODE
// set all CONFIG constants in experimentDesign.js

// =================================================
// Load or Generate subjectId and expStruct
// =================================================

const skipToDemographics = false; // for testing
const test = 0; // set to 1 to skip subject credentials

const preload = 1; // change to 1 if loading expStruct from json file
// const expStructId = Math.floor(Math.random() * 240) + 1; // Randomly generate an ID between 1 and 240
const expStructId = 2; // for testing purposes
const subjectId = Math.floor(1000000000 + Math.random() * 9000000000); // random subjectId;

// ======================================
// Initialization
// ======================================

//========AI variables=============
var numFalsePos= 0
var numFalseNeg= 0
let goal_falsePos= 2
let goal_falseNeg= 2

// Exp name and notes
const experimentName = "VSAI"; // identical to experiment folder name on server
const version = "prolific_V2"; // change version to save data to separate data folder

// Start time and duration
let startDate, startTime, experimentStartTime, expTrialsStartTime, expTrialsEndTime;
let firstExperimentBlockStarted = false; // flag for logging start time of first block
let experimentDuration = null; // total time in experiment
let expTrialsDuration = null; // total time in experimental trials
let expStruct;

let workerId = null; // Equals PROLIFIC_PID
let SONAId=null;
let assignmentId = null; // Equals STUDY_ID
let hitId = null; // Equals SESSION_ID

// canvas
let canvas = document.getElementById('canvas'); // canvas size in .html
let ctx = canvas.getContext('2d');

// data output
let data = {}; // all data
let trialDataLog = []; // trial by trial data log 
let thisTrial;

// record time before hover
let centerHintStartTime = null;
let centerHintEndTime = null;
let centerHintDuration = null;
let centerHintTimeOut = null;

// other variables
let logCounter = 0;
let iBlock = 0;
let iTrial = 0;
let currentTrial = null;
let currentStim = null;
let trialCorrect = null;
let previousTrialCorrect = null;
let clickedLocations = [];
let hintHovered = false;
let hoverStartTime = null; //when the user hovers on the circle
let lastMousePosition = null;
let mouseTrajectory = [];
// timestamp data
let stimulusStart;
let spacePress;
let hoverDrawn;
//let hoverStart;
let hoverMet;
let screenSizeWarnings=[]
let timestamps = [];

let trialStartTime = null;
let trialEndTime = null;
let validScreenSize = false; // default false until checkScreenSize is run
let searchTimer;
let prematurePresses = 0; // Track premature spacebar presses, i.e., attempts to terminate search before min_search_time
let timeoutReached;  // Track whether the timeout was reached
let screenSizeWarningTriggered; // Track whether screen size warning was triggered
let hasClicked = false; // Track if the user has clicked in the current trial
let trialEnded = false; // Track trial end (stop mouse recording and disable clicks)

let isAI;

//initialization for feedback
let mouseInterval;
let currentMousePosition = {x: 0, y: 0};

let lastFeedbackTrialTimer

document.addEventListener('DOMContentLoaded', (event) => {

    // Start time and duration
    const start = new Date;
    const month = start.getMonth() + 1;  // Adding 1 to convert from default 0-based index (jan = 0) to 1-based index
    const pad = num => num.toString().padStart(2, '0'); // adds padding to makes '1' into '01' for example
    
    startTime = pad(start.getHours()) + "-" + pad(start.getMinutes()) + "-" + pad(start.getSeconds());
    startDate = pad(month) + "-" + pad(start.getDate()) + "-" + start.getFullYear();
    experimentStartTime = Date.now(); // time in miliseconds for ease of duration calculation
    
    if (preload === 0) {
        expStruct = makeExpStruct();
        initializeData();
        updateDisplayWithTrialInfo();
    } else {
        loadExpStruct(getURLParameter('PROLIFIC_PID'))
            .then(loadedExpStruct => {
                expStruct = loadedExpStruct;
                // Initialize the data object after expStruct is loaded
                initializeData();
                updateDisplayWithTrialInfo();
                // console.log("condition load success");
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
    
    if (test == 0) {
        workerId = getURLParameter('PROLIFIC_PID');
        assignmentId = getURLParameter('STUDY_ID');
        hitId = getURLParameter('SESSION_ID');

        console.log("prolific id is ",workerId)
        console.log("assignmentId id is ",assignmentId)
        console.log("hitId id is ",hitId)

        // Construct the URL dynamically
        var qualtricsSurveyURL = `https://columbiangwu.co1.qualtrics.com/jfe/form/SV_6fKBabByvQqaFKu?PROLIFIC_PID=${workerId}&STUDY_ID=${assignmentId}&SESSION_ID=${hitId}`;

        // Update the href attribute of the link
        document.getElementById("surveyLink").href = qualtricsSurveyURL;
        //error message if mTurk credentials are not found
       // if (!workerId || !assignmentId || !hitId) {
       //     document.body.innerHTML = '<div style="color: red; text-align: center; margin-top: 20px;">Error: Unable to retrieve Prolific credentials. Please access the experiment through Prolific.</div>';
       //     return;
       // }

        //TO DO: check if prolific id exists in previous study data
        // Path to your CSV file
        // const csvFilePath = 'S2_participant_sums.csv';  // Replace with the actual path to your CSV
    
        // // Use PapaParse to fetch and parse the CSV file
        // Papa.parse(csvFilePath, {
        //     download: true,     // Fetch the CSV file from a URL
        //     header: true,       // Treat the first row as headers
        //     complete: function(results) {
        //         // Find the row where the 'id' matches the participant ID
        //         const matchingRow = results.data.find(row => row.subId === workerId);
    
        //         if (matchingRow) {
        //             console.log('Found row:', matchingRow);
        //         } else {
        //             console.log('No row found for participant ID:', workerId);
        //             document.body.innerHTML = '<div style="color: red; text-align: center; margin-top: 20px;">Error: You are not eligible to complete this experiment.</div>';
        //             return;
        //         }
        //     }
        // });

    }

    // kickstart experiment with instructions
    if (skipToDemographics) {
        // Hide all other elements
        document.querySelector('.instructionsDiv').style.display = 'none';
        // document.querySelector('.AI-container').style.display = 'none';
        document.querySelector('.canvas-container').style.display = 'none';
        // Add more selectors as needed to hide other elements

        // Show the demographics survey
        document.querySelector('.demoInfoDiv').style.display = 'block';
    } else {
        show_consent();
        //startInstructions();
    }
});

// ==============================
// Helper Functions
// ==============================

function getURLParameter(name) {
    // for getting MTurk URL elements
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    //return name ? name.substring(1).match(/^[a-zA-Z0-9]+$/)?.[0] : null; // Extract alphanumeric value
}

async function loadExpStruct(prolific_id) {
    console.log("in loadExpStruct");
    console.log("prolific id is", prolific_id);

    let filePath = null;
    let expStruct = null;

    try {
        // First fetch: get assigned filename
        const assignResponse = await fetch(`http://52.0.147.87/experiments/VSAI_prolific_V3/getExpStruct.php?PROLIFIC_PID=${prolific_id}`);
        if (!assignResponse.ok) {
            throw new Error('Error fetching assignment file: ' + assignResponse.statusText);
        }

        const assignData = await assignResponse.json();
        expStruct = assignData;

        return expStruct;

    } catch (error) {
        console.error('Error loading the experiment structure:', error);
    }
}
function initializeData() {
    data = {
        subjectId: subjectId,
        startDate: startDate,
        startTime: startTime,
        expTrialsStartTime: expTrialsStartTime,
        experimentName: experimentName,
        version: version,
        assignmentId: assignmentId,
        workerId: workerId,
        SONAId: SONAId,
        hitId: hitId,
        experimentDuration: experimentDuration,
        expTrialsDuration: expTrialsDuration,
        // demographics: {}, //fill later
        // original_task_survey: {}, //fill later
        qualtricsCode: null,
        // AI_task_survey: {}, //fill later
        config: CONFIG,
        expStructId: expStructId,
        expStruct: expStruct,
        trialDataLog: trialDataLog
    };
}

function updateDisplayWithTrialInfo() {
    const totalTrials = expStruct.reduce((total, block) => total + block.trials.length, 0);
    const estimatedTime = 35; //Math.ceil((totalTrials * 9.5) / 60 + 3);
    const maxSearchTimeInSeconds = CONFIG.display.MAX_SEARCH_TIME / 1000;    
    document.querySelector('#total-trials').textContent = totalTrials;
    document.querySelector('#estimated-time').textContent = estimatedTime;
    document.querySelector('#time-limit').textContent = `${maxSearchTimeInSeconds} seconds`;
}

function isWithinBounds(x, y, targetX, targetY) {
    // checks whether mouse click coordinates is within the bounds of stimulus
    let reducedSize = CONFIG.stimuli.SQUARE_SIZE * CONFIG.stimuli.REDUCTION_FACTOR / 2;
    
    return x >= targetX - reducedSize &&
        x <= targetX + reducedSize &&
        y >= targetY - reducedSize &&
        y <= targetY + reducedSize;
}

function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}

function logTrialData() {
    // transformations for data logging; constants grabbed from expStruct
    const trialID = currentTrial.trialID;
    const trialType = currentTrial.trialType;
    const isPractice = expStruct[iBlock].isPractice;
    const setSize = currentTrial.setSize;
    // const centerHintDuration= currentTrial.centerHintDuration;
    // const centerHintTimeOut = currentTrial.centerHintTimeOut;
    const totalSearchTime = trialEndTime - trialStartTime;

    let hitCount=0
    let missCount=0
    let faCount=0
    let crCount=0

    if (trialType == "target_present"){
        // hit: if the user clicked on the target
        hitCount = currentTrial.stimuli.filter(stim => stim.clickCount > 0 && stim.targetCond === 1).length;
        //miss: if the user did not click on the target
        missCount = currentTrial.stimuli.filter(stim => stim.clickCount === 0 && stim.targetCond === 1).length;
    }
    else if (trialType == "target_absent"){
        //false alarm: if the user clicked on a non target
        faCount = currentTrial.stimuli.filter(stim => stim.clickCount > 0 && stim.targetCond === 0).length;

        const isTargetAbsent = currentTrial.stimuli.every(stim => stim.targetCond === 0);
        const noClicksMade = currentTrial.stimuli.every(stim => stim.clickCount === 0);
        // correct reject: if the user did not click on a non target
        crCount = isTargetAbsent && noClicksMade ? 1 : 0;
    }

    //wrong target: if the trial is target present and the user clicked on the wrong thing
    //const wrongTargetCount = currentTrial.stimuli.filter(stim => stim.clickCount === 0 && stim.targetCond === 1).length;

    //new variables
    const AISuggestion= currentTrial.AISuggestion;

    //timestamps
    timestamps = {
        stimulusStart: stimulusStart,
        spacePress: spacePress,
        hoverDrawn: centerHintStartTime,
        hoverStart: hoverStartTime,
        screenSizeWarnings: screenSizeWarnings
    }

    const allClicks = clickedLocations.map((click, index) => {
        return {
            x: click.x,
            y: click.y,
            correct: click.correct,
            time: click.time,
            clickCount: click.clickCount, //nth time this stim was clicked
            stimIndex: click.stimIndex,
            targetCond: click.targetCond,
            salience: click.salience,
            offset: click.offset,
            rotation: click.rotation
        };
    });
    
    // Convert into to a JSON-compatible strings
    const stimuliJSON = JSON.stringify(currentTrial.stimuli);  
    const allClicksJSON = JSON.stringify(allClicks);
    const mouseTrajectoryJSON = JSON.stringify(mouseTrajectory);
    const timestampsJSON = JSON.stringify(timestamps);

    const trialData = {
        logCounter,
        iBlock,
        iTrial,
        trialID,
        trialType,
        isPractice,
        setSize,
        AISuggestion,
        centerHintDuration,
        centerHintTimeOut,
        trialStartTime,
        trialEndTime,
        totalSearchTime,
        timeoutReached,
        prematurePresses,
        screenSizeWarningTriggered,
        hitCount,
        faCount,
        missCount,
        crCount, //add correct reject here
        trialCorrect,
        previousTrialCorrect,
        stimuli: stimuliJSON,
        allClicks: allClicksJSON,
        mouseTrajectory: mouseTrajectoryJSON,
        timestamps: timestampsJSON
    };

    //console.log(trialData);
    return trialData;
}

function collectDemographicData() {
    // Collecting gender
    var genderElement = document.getElementById('genderList');
    var gender = genderElement.value;

    // Collecting age
    var ageElement = document.getElementById('ageList');
    var age = ageElement.value;

    // Collecting race
    var raceElements = document.getElementsByName('race');
    var races = [];
    for (var i = 0; i < raceElements.length; i++) {
        if (raceElements[i].checked) {
            races.push(raceElements[i].value);
        }
    }
    // Collecting ethnicity
    var ethnicityElement = document.getElementById('ethnicity');
    var ethnicity = ethnicityElement.value;

    // Collecting device information
    var deviceElement = document.getElementById('deviceList');
    var device = deviceElement.value;

    // Collecting general feedback
    var feedbackElement = document.getElementById('feedback');
    var feedback = feedbackElement.value; // Retrieve the feedback from the textarea

    // Adding the collected information to the data object
    data.demographics = {
        gender: gender,
        yearOfBirth: age,
        race: races,
        ethnicity: ethnicity,
        device: device,
        feedback: feedback
    };
}

// Routing to prolific submission page
function sendData(data) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://52.0.147.87/experiments/VSAI_experiment/saveData.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // Check the response text from the PHP script
            const responseStatus = xhr.responseText;

            // Log a message indicating success or failure
            console.log("Data sent response: " + responseStatus);
            //window.location.href = "https://gwu.sona-systems.com/services/SonaAPI.svc/WebstudyCredit?experiment_id=1197&credit_token=d27a2d8bc84b4bc5bbf4119aa0e40dd8&survey_code="+SONAId
            window.location.href = "https://app.prolific.com/submissions/complete?cc=CEVSCYN0" // replace with appropriate redirect url
        }
    };
    // console.log("data is ",data)
    xhr.send(JSON.stringify(data));
}

// ==============================
// Drawing Functions
// ==============================

function drawT(x, y, color, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.fillRect(-CONFIG.stimuli.BAR_WIDTH / 2, -CONFIG.stimuli.BAR_LENGTH / 2 + CONFIG.stimuli.BAR_GAP, CONFIG.stimuli.BAR_WIDTH, CONFIG.stimuli.BAR_LENGTH); // Vertical bar
    ctx.fillRect(-CONFIG.stimuli.BAR_LENGTH / 2, -CONFIG.stimuli.BAR_LENGTH / 2, CONFIG.stimuli.BAR_LENGTH, CONFIG.stimuli.BAR_WIDTH); // Horizontal bar
    ctx.restore();
}

function drawL(x, y, color, rotation, offset) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.fillRect(-CONFIG.stimuli.BAR_LENGTH / 2 + offset, -CONFIG.stimuli.BAR_LENGTH / 2 - CONFIG.stimuli.BAR_GAP, CONFIG.stimuli.BAR_WIDTH, CONFIG.stimuli.BAR_LENGTH);  //vertical bar
    ctx.fillRect(-CONFIG.stimuli.BAR_LENGTH / 2, CONFIG.stimuli.BAR_LENGTH / 2 - CONFIG.stimuli.BAR_WIDTH, CONFIG.stimuli.BAR_LENGTH, CONFIG.stimuli.BAR_WIDTH); // Horizontal bar
    ctx.restore();
}
//this is the next button for the AI practice round (with feedback)
function handleNextButtonClick(event) {
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonX = (canvas.width - buttonWidth) / 2;  // Center the button horizontally
    // const buttonY = feedbackY + 80;  // Position the button below the feedback text
    const buttonY = canvas.height/ 2 ;  // Position the button below the feedback text

    // Get the canvas position and the mouse click coordinates
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click is within the bounds of the "Next" button
    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        drawCenterHint("AI");  // Call the function when the "Next" button is clicked
        // drawFeedback("AI");  // Call the function when the "Next" button is clicked
    }
}

function drawFeedback(AICondition) {
    canvas.removeEventListener('mousemove', handleCircleHover);
    canvas.removeEventListener('mousemove', handleCircleHoverEndBlock);

    //remove AI suggestion
    // document.querySelector('.AI-container').style.display = 'none';

    ctx.save();

    // Define position for feedback text and background
    // const feedbackY = canvas.height / 2 - 50; // Adjust this value to move the feedback higher or lower
    const feedbackY = 20; // Adjust this value to move the feedback higher or lower
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonX = (canvas.width - buttonWidth) / 2;  // Center the button horizontally
    // const buttonY = feedbackY + 80;  // Position the button below the feedback text
    const buttonY = canvas.height/ 2 ;  // Position the button below the feedback text

    if (previousTrialCorrect == null) { //first trial
        if (expStruct[iBlock].isAI==true){
            drawCenterHint("AI");
        }
        else{
            drawCenterHint("NoAI");
        }
    }
    else{   // Draw feedback background and text only if this is not the first trial

        if (AICondition == "AI"){ //draw next button only in AI practice condition

            canvas.removeEventListener('mouseover', handleCircleHoverEndBlock);

            // Draw "Next" button
            function drawRoundedRect(x, y, width, height, radius) {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.arcTo(x + width, y, x + width, y + radius, radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
                ctx.lineTo(x + radius, y + height);
                ctx.arcTo(x, y + height, x, y + height - radius, radius);
                ctx.lineTo(x, y + radius);
                ctx.arcTo(x, y, x + radius, y, radius);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = "rgba(105, 105, 105, 0.5)";  // Button background color with 50% transparency
            // ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);  // Draw the button
        
            //round button corners
            drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);  // Adjust 10 for more or less rounded corners

            // Draw button text ("Next")
            ctx.fillStyle = "#FFFFFF";  // Button text color (white)
            ctx.font = "20px Arial";  // Font size for the button text
            ctx.fillText("Next", canvas.width / 2, buttonY + (buttonHeight / 2+7) );  // Center the text within the button

            //check if next button has been clicked
            canvas.removeEventListener('click', handleNextButtonClick);
            canvas.addEventListener('click', handleNextButtonClick);
        }
        else{ //draw the center hint if in the no AI condition
            drawCenterHint("NoAI");
        }
    }

    ctx.restore();

}
function showDuringAIRecommendation(){
    // console.log(currentTrial.trialType)

    //TO DO: create AI suggestion label based on expStruct
    if (currentTrial.AISuggestion=="correct"){ 
        if (currentTrial.trialType=="target_present"){ 
            document.querySelector('.AI-container').innerHTML = "AI Suggestion: T present";
        }
        else{ 
            document.querySelector('.AI-container').innerHTML = "AI Suggestion: T NOT present";
        }
    }
    else if ((currentTrial.AISuggestion=="false_pos")){ 
        document.querySelector('.AI-container').innerHTML = "AI Suggestion: T present";
    }
    else if ((currentTrial.AISuggestion=="false_neg")){ 
        document.querySelector('.AI-container').innerHTML = "AI Suggestion: T NOT present";
    }
    document.querySelector('.AI-container').style.display = 'flex';
}   

function drawLastFeedbackTrialCenterMessage(){

    ctx.save();

    // ====Hover instructions====
    ctx.font = "12px Arial";  // Font size for the text
    ctx.fillStyle = '#818589';  // Text color
    let hoverCircleInstructions = "End of practice round";
    ctx.textAlign = "center"; // Ensure text is centered
    ctx.fillText(hoverCircleInstructions, canvas.width / 2, canvas.height / 2 - 15); // Position the text over the circle

    ctx.restore();

}
function drawCenterHint(AICondition) {
    centerHintStartTime = new Date().getTime()

    canvas.addEventListener('mousemove', handleCircleHover);

    //remove AI-during suggestion
    // document.querySelector('.AI-container').style.display = 'none';
    ctx.save();

    //reset border to black
    canvas.style.border='2px solid black'

    // Define position for feedback text and background
    const feedbackY = canvas.height / 2 - 50; // Adjust this value to move the feedback higher or lower

    //TO DO: only show AI recommendation if NOT last center hint
    if (AICondition == "AI"){
        //clear canvas i.e remove ts and ls screen 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //=====Display AI recommendations====
        let AI_recommendation = getAIRecommendation()
        ctx.font = "14px Arial";  // Font size for the text
        ctx.fillStyle = "Black";  // Text color
        let textAI = "AI prediction for next trial: " + AI_recommendation;
        ctx.textAlign = "center"; // Ensure text is centered

        // Calculate text width
        let textWidth = ctx.measureText(textAI).width;

        // Coordinates for text
        let x = canvas.width / 2;
        let y = canvas.height / 2 - 90;
        // Draw the text
        ctx.fillText(textAI, x, y);

        // Draw a box around the text
        let padding = 10; // Add some padding around the text

        if (AI_recommendation == "T present"){
            ctx.strokeStyle = "#1E86E2"; // change color with recommendation
        }
        else{
            ctx.strokeStyle = "#808080"; // change color with recommendation
        }
        ctx.lineWidth = 2; // Box border width
        ctx.strokeRect(x - textWidth / 2 - padding, y - 14 - padding, textWidth + 2 * padding, 14 + 2 * padding);
    // ctx.fillText(textAI, canvas.width / 2, canvas.height / 2 - 60); // Position the text over the circle
    }

    // ====Draw hover instructions=====
    ctx.fillStyle = 'rgb(0, 0, 0)'; // black
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, CONFIG.display.HINT_CIRCLE_RADIUS * 2, 0, 2 * Math.PI); // Diameter of the circle
    ctx.fill();

    // ====Hover instructions====
    ctx.font = "12px Arial";  // Font size for the text
    ctx.fillStyle = '#818589';  // Text color
    let hoverCircleInstructions = "Hover cursor over circle to start next trial";
    ctx.textAlign = "center"; // Ensure text is centered
    ctx.fillText(hoverCircleInstructions, canvas.width / 2, canvas.height / 2 - 15); // Position the text over the circle

    ctx.restore();
}


// ==============================
// Feedback and Event Handlers
// ==============================

// listen for canvas clicks
canvas.addEventListener('click', handleClick);

// prevents screen touches from triggering click events
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    alert('Touch input is not allowed in this experiment. Please use a mouse or trackpad.');
}, { passive: false });

document.querySelector('#startExperimentButton').addEventListener('click', function() {
    // Check screen size when experiment starts
    checkScreenSize();
    // Now that instructions have been viewed, start listening for resize events
    window.addEventListener('resize', checkScreenSize);
});

function checkScreenSize() {
    // Shows HTML element that obstructs canvas if window is too small
    const warningDiv = document.getElementById('resizeWarning');

    if (window.innerWidth < canvas.width || window.innerHeight < canvas.height) {
        warningDiv.style.display = 'block';
        validScreenSize = false;
        screenSizeWarningTriggered = true; // Set to true when the warning is triggered
        screenSizeWarnings.push(Date.now())
    } else {
        warningDiv.style.display = 'none';
        validScreenSize = true;
    }
}
// ==============================
// Submit surveys
// ==============================

document.querySelector('#startSurveys form').addEventListener('submit', function (event) {
    event.preventDefault(); // 

    // Clear previous error messages
    const previousErrors = document.querySelectorAll('.error-message');
    previousErrors.forEach(error => error.remove());

    // Initialize a variable to keep track of the form validity
    let formValid = true;

    const completionCode = document.getElementById('qualtrics-completion-code');

    // Validate the input field
    if (completionCode.value.trim() === '') { // Check if input is empty
        formValid = false;
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Please enter your qualtrics completion code';
        completionCode.parentNode.appendChild(errorMessage); // Append error below input box
    }

    // If form is not valid, return early
    if (!formValid) {
        return;
    }
    // If form is valid, collect data and send it
    // collectDemographicData();
    data.qualtricsCode=completionCode.value
    // console.log("qualtrics code is ",data.qualtricsCode)

    // If form is valid, collect demographic data and send it
    let experimentEndTime = Date.now();
    data.experimentDuration= experimentEndTime - experimentStartTime;
    // showBonusForm()
    showEndExperiment()
    sendData(data);
})

// ==============================
// Feedback and Event Handlers: Mouse Tracking
// ==============================

function updateCurrentMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    currentMousePosition.x = event.clientX - rect.left;
    currentMousePosition.y = event.clientY - rect.top;
}

function startRecordingMousePosition() {
    canvas.addEventListener('mousemove', updateCurrentMousePosition);
    mouseInterval = setInterval(recordAtInterval, CONFIG.display.MOUSE_TRACKING_INTERVAL);
}

function stopRecordingMousePosition() {
    canvas.removeEventListener('mousemove', updateCurrentMousePosition);
    clearInterval(mouseInterval);
}

function getMousePosition(event) {
    return currentMousePosition;
}

function recordAtInterval() {
    const mousePos = getMousePosition();
    
    const timeSinceTrialStart = new Date().getTime() - trialStartTime;
    
    if (lastMousePosition) {
        const dx = mousePos.x - lastMousePosition.x;
        const dy = mousePos.y - lastMousePosition.y;
        const dt = timeSinceTrialStart - lastMousePosition.time;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = dt > 0 ? distance / dt : 0; // speed in pixels per millisecond
        
        mouseTrajectory.push({x: mousePos.x, y: mousePos.y, time: timeSinceTrialStart, speed});
    } else {
        mouseTrajectory.push({x: mousePos.x, y: mousePos.y, time: timeSinceTrialStart, speed: 0});
    }
    
    lastMousePosition = {x: mousePos.x, y: mousePos.y, time: timeSinceTrialStart};
}

// function showReminderMessage() {
//     var modal = document.getElementById("reminderModal");
//     var span = document.getElementsByClassName("close")[0]; // Get the <span> element that closes the modal

//     // When the user clicks the button, open the modal 
//     modal.style.display = "block";

//     // When the user clicks on <span> (x), close the modal
//     span.onclick = function() {
//         modal.style.display = "none";
//     }

//     // Optionally, close the modal when the user presses the spacebar
//     window.addEventListener('keydown', function(event) {
//         if (event.code === "Space") {
//             modal.style.display = "none";
//         }
//     }, {once: true}); // Use {once: true} to ensure the listener is auto-removed after firing
// }

function showReminderMessage() {
    trialEndTime = new Date().getTime();

    const message = "You have reached the 15 seconds search time limit! Remember: both speed and accuracy are important. Try to complete each trial as quickly as possible: press the spacebar as soon as you are done searching or have determined there are no T's. <br><br>You can no longer make any clicks on this trial. Press spacebar to dismiss this message and move on.";
    const maxWidth = canvas.width - 40;  // Set maximum line width with padding
    const lineHeight = 24;  // Line height in pixels
    const x = canvas.width / 2;  // X position (centered)
    const startY = canvas.height / 3;  // Starting Y position moved up

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '18px Arial'; // Smaller font size for better fitting
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Function to handle text wrapping
    function wrapText(context, text, x, startY, maxWidth, lineHeight) {
        // Split text on explicit new line characters or your own new line marker, such as <br>
        const sections = text.split(/<br>/i);
        let y = startY;

        sections.forEach(function (section) {
            const words = section.split(' ');
            let line = '';

            words.forEach(function (word) {
                const testLine = line + word + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > maxWidth && line !== '') {
                    context.fillText(line, x, y);
                    line = word + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            });

            context.fillText(line, x, y);
            y += lineHeight;  // Add an extra line height for each section
        });
    }

    // Call the wrapText function to draw the text
    wrapText(ctx, message, x, startY, maxWidth, lineHeight);

    ctx.restore();
}

function clearReminderMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentSetSize = currentTrial.setSize;

    // draw all stimuli
    for (let i = 0; i < currentSetSize; i++) {
        currentStim = currentTrial.stimuli[i];

        // Get stim properties
        const { stimIndex, xpos, ypos, rgb, salience, offset, rotation, targetCond } = currentStim; // Destructuring to get all properties

        stimulusStart = new Date().getTime()

        if (targetCond == 1) { // Is target
            drawT(xpos, ypos, rgb, rotation);
        } else {
            drawL(xpos, ypos, rgb, rotation, offset);
        }
    }
}

// =============================================
// AI functions
// =============================================

function getAIRecommendation(){
    //TO DO: create AI suggestion label based on expStruct
    if (currentTrial.AISuggestion=="correct"){ 
        if (currentTrial.trialType=="target_present"){ 
            return("T present")
            // document.querySelector('.AI-container').innerHTML = "AI Suggestion: T present";
        }
        else{ 
            return("T NOT present")
            // document.querySelector('.AI-container').innerHTML = "AI Suggestion: T NOT present";
        }
    }
    else if ((currentTrial.AISuggestion=="false_pos")){ 
        return("T present")
        // document.querySelector('.AI-container').innerHTML = "AI Suggestion: T present";
    }
    else if ((currentTrial.AISuggestion=="false_neg")){ 
        return ("T NOT present")
        // document.querySelector('.AI-container').innerHTML = "AI Suggestion: T NOT present";
    }
    // document.querySelector('.AI-container').style.display = 'flex';
}   

// =============================================
// Feedback and Event Handlers: Trial Components
// =============================================

function handleCircleHover(event) {
    // draws starting hover circle, then renders stimuli when hover condition is met

    // Get the canvas boundaries
    const rect = canvas.getBoundingClientRect();

    // Calculate the current mouse position relative to the canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Define the center of the circle and its radius
    // The radius is twice the size of the displayed circle for a more forgiving hover detection area
    const circleCenterX = canvas.width / 2;
    const circleCenterY = canvas.height / 2;
    const circleRadius = CONFIG.display.HINT_CIRCLE_RADIUS * 2; 

    // Calculate the distance between the mouse pointer and the center of the circle
    const distanceFromCenter = Math.sqrt((mouseX - circleCenterX) ** 2 + (mouseY - circleCenterY) ** 2);
    
    // Check if the distance calculated is less than or equal to the circle's radius
    if (distanceFromCenter <= circleRadius) {
        // If it is the first time the mouse has hovered over the circle during this check
        if (!hintHovered) {
            hintHovered = true;
            hoverStartTime = new Date().getTime(); // Record the hover start time

            //record end of center hint time
            centerHintEndTime = new Date().getTime()
            centerHintDuration = centerHintEndTime - centerHintStartTime
            centerHintTimeOut = 0
        } 
        // If the mouse has been hovering over the circle
        else {
            centerHintTimeOut = 1

            const currentTime = new Date().getTime();
            
            // Calculate the total hover time
            const elapsed = currentTime - hoverStartTime;    
            
            // If the hover time exceeds the specified duration, render stimuli
            if (elapsed >= CONFIG.display.HOVER_DURATION) {
                canvas.removeEventListener('mousemove', handleCircleHover);
                canvas.removeEventListener('mousemove', handleCircleHoverEndBlock);
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                setTimeout(() => {
                    renderStimuli(); // Call the function to render stimuli
                }, CONFIG.display.DELAY_BEFORE_TRIAL);
            }
        }
    } 
    // If the mouse is outside the circle, reset the hovered state
    else {
        hintHovered = false;
    }
}

function renderStimuli() {
    //remove old listener to click on next button after feedback
    canvas.removeEventListener('click', handleNextButtonClick);
    // Add listeners for clicks and spaces
    canvas.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleSpaceBar);

    const currentSetSize = currentTrial.setSize;
    // console.log(currentTrial.trialType)

    let isTargetTrial;
    // draw all stimuli
    for (let i = 0; i < currentSetSize; i++) {
        currentStim = currentTrial.stimuli[i];

        // Get stim properties
        const { stimIndex, xpos, ypos, rgb, salience, offset, rotation, targetCond } = currentStim; // Destructuring to get all properties

        stimulusStart = new Date().getTime()

        if (targetCond == 1) { // Is target
            isTargetTrial=1 //there is a target in this trial
            drawT(xpos, ypos, rgb, rotation);
        } else {
            drawL(xpos, ypos, rgb, rotation, offset);
        }
    }

    trialStartTime = new Date().getTime(); // define trialStartTime
    // start recording mouse position
    startRecordingMousePosition();

    // Set a timer for the timeout
    searchTimer = setTimeout(() => {
        timeoutReached = true;

        // Disable further clicks and stop mouse tracking
        canvas.removeEventListener('click', handleClick);
        stopRecordingMousePosition();

        // Show the timeout reminder message
        showReminderMessage();
    }, CONFIG.display.MAX_SEARCH_TIME);

    //=======Stimuli rendering for AI recommendation (AI-during)=======
    if (isAI == true){ 
        //showDuringAIRecommendation()
        //make border color match AI recommendation
        let AI_recommendation = getAIRecommendation()

        if (AI_recommendation == "T present"){
            canvas.style.border='4px solid #1E86E2'
        }
        else{
            canvas.style.border='4px solid #808080'
        }
    }
    else{
        canvas.style.border='2px solid black'
    }
}

function handleClick(event) {

    if (!hasClicked && !trialEnded) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let clickOnStimulus = false; // Flag to check if click is on a stimulus

        // Check if click is within bounds of any stimulus
        for (let stimulus of currentTrial.stimuli) {
            if (isWithinBounds(x, y, stimulus.xpos, stimulus.ypos)) {
                // Process the click only if it's on a stimulus

                clickedLocations.push({
                    x,
                    y,
                    correct: stimulus.targetCond === 1, // True if stimulus is a target
                    time: new Date().getTime() - trialStartTime,
                    clickCount: null,
                    stimIndex: null,
                    targetCond: null,
                    salience: null,
                    offset: null,
                    rotation: null,
                });

                // Display an empty grey circle where clicked
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.strokeStyle = '#A9A9A9'; 
                ctx.lineWidth = 2;
                ctx.stroke();

                hasClicked = true; // Prevent further clicks
                break; // Exit loop once a valid click is found
            }
        }
    }
}

function handleSpaceBar(event) {
    // console.log("in handle space bar")
    if (event.code === 'Space' && validScreenSize) {
        const currentTime = new Date().getTime();
        
        spacePress=currentTime

        if (trialStartTime !== null) {
            // console.log("trialStartTime is ",trialStartTime)
            const elapsed = currentTime - trialStartTime;

            if (timeoutReached) {
                // Clear the timeout reminder message and reset related flags
                clearReminderMessage();
                giveFeedback();
                trialEnded = true; // Mark the trial as ended
            }
            else{
                // Normal trial completion
                trialEndTime = new Date().getTime();
                giveFeedback();
                trialEnded = true; // Mark the trial as ended
            }
        }
    }
}

function giveFeedback() {
    // trialEndTime = new Date().getTime();
    clearTimeout(searchTimer);  // Clear the timer when feedback is shown to prevent it from triggering again

    // disable clicks and keydown
    canvas.removeEventListener('click', handleClick);
    window.removeEventListener('keydown', handleSpaceBar);
    // stop recording mouse position
    stopRecordingMousePosition();

    trialCorrect = true;

    // If timeout was reached, mark the trial as incorrect
    if (timeoutReached) {
        trialCorrect = false;
    }

    // Check each click
    for (let clicked of clickedLocations) {
        for (let stimulus of currentTrial.stimuli) {
            if (isWithinBounds(clicked.x, clicked.y, stimulus.xpos, stimulus.ypos)) {
                stimulus.clickCount += 1; // adding to the clickCount
                clicked.clickCount = stimulus.clickCount;
                clicked.stimIndex = stimulus.stimIndex;
                clicked.targetCond = stimulus.targetCond;
                clicked.salience = stimulus.salience;
                clicked.offset = stimulus.offset; // only meaningful for targetCond = 1
                clicked.rotation = stimulus.rotation;
                if (stimulus.targetCond === 1) { // only fill if target
                    clicked.correct = true;
                    if (expStruct[iBlock].isPractice) {
                        //drawing check mark at correctly clicked location
                        // Draw the check mark
                        const size = 8; // Size scaling for the check mark

                        ctx.save(); // Save the current context state
                        ctx.translate(clicked.x - 1, clicked.y); // Move to the clicked position

                        // Draw the outer border
                        ctx.beginPath();
                        ctx.moveTo(-2.5, 0); // Starting point of the check mark
                        ctx.lineTo(size, size); // Downward stroke of the check
                        ctx.lineTo((size) * 2.5, -size * 1.5); // Upward stroke of the check
                        ctx.strokeStyle = 'darkgrey'; // Set the color of the check mark
                        ctx.lineWidth = 9; // Set the thickness of the check mark
                        ctx.stroke();
                        
                        // Draw the check mark (inner)
                        ctx.beginPath();
                        ctx.moveTo(-2.5, 0); // Starting point of the check mark
                        ctx.lineTo(size, size); // Downward stroke of the check
                        ctx.lineTo(size * 2.5, -size * 1.5); // Upward stroke of the check
                        ctx.strokeStyle = 'white'; // Set the color of the check mark
                        ctx.lineWidth = 3; // Set the thickness of the check mark
                        ctx.stroke();

                        ctx.restore(); // Restore the context to its original state

                        // drawing filled green circle at clicked location
                        // ctx.beginPath();
                        // ctx.arc(clicked.x, clicked.y, 9, 0, 2 * Math.PI);
                        // ctx.fillStyle = 'green';
                        // ctx.fill();
                        break;
                    }
                }
            }
        }
        if (!clicked.correct) {
            trialCorrect = false;
            if (expStruct[iBlock].isPractice) {
                //remove circle

                // Drawing grey cross for incorrect locations
                const size = 12; // Size of the cross arm length
                const angle = 45 * (Math.PI / 180); // Convert 45 degrees to radians

                ctx.save(); // Save the current context state
                ctx.translate(clicked.x, clicked.y); // Move to the clicked position
                ctx.rotate(angle); // Rotate the context by 45 degrees

                // Draw the border (draws the same cross but slightly thicker to create a border)
                ctx.beginPath();
                ctx.moveTo(-size, 0); // Left arm of the cross
                ctx.lineTo(size, 0); // Right arm of the cross
                ctx.moveTo(0, -size); // Top arm of the cross
                ctx.lineTo(0, size); // Bottom arm of the cross
                ctx.strokeStyle = 'darkgrey'; // Border color
                ctx.lineWidth = 9; // Slightly thicker for border
                ctx.stroke();

                // Draw the cross
                ctx.beginPath();
                ctx.moveTo(-size, 0); // Left arm of the cross
                ctx.lineTo(size, 0); // Right arm of the cross
                ctx.moveTo(0, -size); // Top arm of the cross
                ctx.lineTo(0, size); // Bottom arm of the cross
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3; // Thickness of the cross lines
                ctx.stroke();

                ctx.restore()

                // // Drawing red triangle for incorrect locations
                // const size = 13; // Size of the triangle
                // ctx.beginPath();
                // ctx.moveTo(clicked.x, clicked.y - size); // Top of the triangle
                // ctx.lineTo(clicked.x - size, clicked.y + size / 2); // Bottom left of the triangle
                // ctx.lineTo(clicked.x + size, clicked.y + size / 2); // Bottom right of the triangle
                // ctx.closePath(); // Completes the path of the triangle
                // ctx.fillStyle = 'red';
                // ctx.fill();
            }
        }
    }

    // Highlight missed Ts
    for (let stimulus of currentTrial.stimuli) {
        if (stimulus.targetCond === 1 && !clickedLocations.find(clicked => isWithinBounds(clicked.x, clicked.y, stimulus.xpos, stimulus.ypos))) { //not found
            trialCorrect = false;
            if (expStruct[iBlock].isPractice){
                // drawing large empty circle around missed target
                ctx.beginPath();
                ctx.arc(stimulus.xpos, stimulus.ypos, 30, 0, 2 * Math.PI);
                //ctx.strokeStyle = 'red';
                ctx.strokeStyle = 'darkgrey';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }
    // Update previous trial feedback
    previousTrialCorrect = trialCorrect;


    // ==== draw feedback text ====
    if (expStruct[iBlock].isPractice){
        const feedbackY = 20; // Adjust this value to move the feedback higher or lower

        let feedbackText = previousTrialCorrect ? "Trial Result: Correct" : "Trial Result: Incorrect";
        ctx.font = "24px Arial";  // Larger font size for feedback
        ctx.fillStyle = "darkgrey"
        // ctx.fillStyle = previousTrialCorrect ? 'green' : 'red';  // Green for correct, red for incorrect
        ctx.textAlign = "center";
        ctx.fillText(feedbackText, canvas.width / 2, feedbackY); // Position the feedback text
    }

    setTimeout(() => {
        canvas.removeEventListener('mousemove', handleCircleHover);
        canvas.removeEventListener('mousemove', handleCircleHoverEndBlock);
        startBlock(); // initialize next trial

        //startTrial(); // initialize next trial
    // }, CONFIG.display.MIN_FEEDBACK_DURATION + 1000);    
    }, CONFIG.display.MIN_FEEDBACK_DURATION);    

    // logging data
    thisTrial = logTrialData();
    // console.log("this trial is ",thisTrial)
    trialDataLog.push(thisTrial);
    logCounter++;
}

// ==============================
// Experiment Loop
// ==============================

function startBlock() {
    //show canvas
    document.getElementById('canvas').style.display = 'block';

    // initializes blocks and calls startTrial
    // document.querySelector('.AI-container').style.display = 'flex';
    document.querySelector('.canvas-container').style.display = 'flex';
    // hide all other divs
    hideAllInstructionDivs();

    if (iBlock < expStruct.length) {
        if (iTrial < expStruct[iBlock].trials.length) {
            startTrial();  // Start the trial
            iTrial++;  // Increment trial counter
        } else { //end of block. 

            iBlock++;  // Increment block counter
            iTrial = 0;  // Reset trial counter for the new block
            // Clear previous trial result at the start of each block
            previousTrialCorrect = null;

            //if practice, delay moving on to next block to see the feedback first
            if (expStruct[iBlock-1].isPractice == true){
                drawLastFeedbackTrialCenterMessage()
                lastFeedbackTrialTimer = setTimeout(() => {
                    showEndBlockMessage();
                }, 1500);
            }
            else{
                showEndBlockMessage();
            }

        }
    }
}

function handleCircleHoverEndBlock(event) {
    // Get the canvas boundaries
    const rect = canvas.getBoundingClientRect();

    // Calculate the current mouse position relative to the canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Define the center of the circle and its radius
    const circleCenterX = canvas.width / 2;
    const circleCenterY = canvas.height / 2;
    const circleRadius = CONFIG.display.HINT_CIRCLE_RADIUS * 2; 

    // Calculate the distance between the mouse pointer and the center of the circle
    const distanceFromCenter = Math.sqrt((mouseX - circleCenterX) ** 2 + (mouseY - circleCenterY) ** 2);
    
    // Check if the distance calculated is less than or equal to the circle's radius
    if (distanceFromCenter <= circleRadius) {
        // If it is the first time the mouse has hovered over the circle during this check
        if (!hintHovered) {
            hintHovered = true;
            hoverStartTime = new Date().getTime(); // Record the hover start time
        } 
        // If the mouse has been hovering over the circle
        else {
            const currentTime = new Date().getTime();
            
            // Calculate the total hover time
            const elapsed = currentTime - hoverStartTime;    
            
            // If the hover time exceeds the specified duration, show the end-of-block message
            if (elapsed >= CONFIG.display.HOVER_DURATION) {
                canvas.removeEventListener('mousemove', handleCircleHoverEndBlock);
                canvas.removeEventListener('mousemove', handleCircleHover); // Remove event listeners
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                
                // Show the end-of-block message
                showEndBlockMessage();
            }
        }
    } 
    // If the mouse is outside the circle, reset the hovered state
    else {
        hintHovered = false;
    }
}

function showEndBlockMessage() {
    clearTimeout(showEndBlockMessage)

    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('mousemove', handleCircleHover);
    canvas.removeEventListener('click', handleNextButtonClick);

    // Clear the canvas for the new message
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // canvas reset border
    canvas.style.border='2px solid black'

    // Prepare the message
    let message = ``;
    if (iBlock < expStruct.length) { //this is not the last block
        // end of Practice Block / Start of Block 1
        if (iBlock == 1){  
                // if this block is AI block 
                if (expStruct[iBlock].isAI ==true){  
                    document.getElementById('canvas').style.display = 'none';
                    show_AI_instructions1()
                }
                // if this block is not AI block 
                else if (expStruct[iBlock].isAI ==false){  
                    document.getElementById('canvas').style.display = 'none';
                    show_noAI_instructions1()
                }
        }
        // end of Block 2 / start of Block 3
        else if (iBlock == 2){
            message += `Practice block completed!`
            if (expStruct[iBlock].isPractice == 0) {
                message += `\n\n*** IMPORTANT: The next block is an experimental block. ***`;
                message += `\n*** You will not receive feedback for your clicks anymore. ***`;
                message += `\n*** Both speed and accuracy matter for your performance in this task. ***\n\n`;
            }
            message += `\nBlocks left: ${expStruct.length - iBlock}.`;
            message += `\nPress any key to continue.`;

            window.addEventListener('keypress', function onKeypress() {
                window.removeEventListener('keypress', onKeypress);
                startBlock();
            });
        }
        //end of Block 3 / start of Block 4
        else if (iBlock == 3){
            // if block 4 is AI block 
            if (expStruct[iBlock].isAI ==true){ 
                document.getElementById('canvas').style.display = 'none';
                show_AI_instructions1()
            }
            // if block 4 is no-AI block 
            else if (expStruct[iBlock].isAI ==false){ 
                document.getElementById('canvas').style.display = 'none';
                show_noAI_block4() //"you will no longer have AI assistance"
            }
        } 
        //end of Block 4 / start of Block 5
        else if (iBlock == 4){
            message += `Practice block completed!`
            if (expStruct[iBlock].isPractice == 0) {
                message += `\n\n*** IMPORTANT: The next block is an experimental block. ***`;
                message += `\n*** You will not receive feedback for your clicks anymore. ***`;
                message += `\n*** Both speed and accuracy matter for your performance in this task. ***\n\n`;
            }
            message += `\nBlocks left: ${expStruct.length - iBlock}.`;
            message += `\nPress any key to continue.`;

            window.addEventListener('keypress', function onKeypress() {
                window.removeEventListener('keypress', onKeypress);
                startBlock();
            });
        }    
    } else { //end of block 4
        message += `\nNo more blocks left!`;
        message += `\nPress the next button to continue.`;

        expTrialsEndTime = Date.now();
        expTrialsDuration = expTrialsEndTime - expTrialsStartTime;
        data.expTrialsDuration = expTrialsDuration;

        // Show the demographics button
        //show_startDemosButton();
        showStartSurveys();
        //sendData(data);  // Sending data after demos submission instead
    }

    // Set the default font options
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Split the message by newline and draw each line separately
    const lines = message.split('\n');
    lines.forEach((line, index) => {
        // Check if the line is the special message and apply styles accordingly
        if (line.includes('***')) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'red';
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
        }
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index - (lines.length - 1) / 2) * 20);
        // Reset font and color back to defaults
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
    });

    // Listen for a keypress event to continue
    // window.addEventListener('keypress', function onKeypress() {
    //     window.removeEventListener('keypress', onKeypress);
    //     console.log("keypress event triggered")
    //     startBlock();
    // });
}
function startTrial() {
    // Initializes trial
    if (!expStruct[iBlock].isPractice) {
        // clear feedback for experiment blocks
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!firstExperimentBlockStarted) {
            expTrialsStartTime = Date.now(); // time in milliseconds for ease of duration calculation
            data.expTrialsStartTime = expTrialsStartTime;
            firstExperimentBlockStarted = true;
        }
    }
    currentTrial = expStruct[iBlock].trials[iTrial]; 
    // Reset trial flags
    hasClicked = false; // Allow clicking for the new trial
    trialEnded = false;
    timeoutReached = false; // Reset the timeout flag at the start of each trial
    clearTimeout(searchTimer);
    prematurePresses = 0; // Reset premature spacebar press count
    screenSizeWarningTriggered = false; // Reset screensize warning flag
    clickedLocations = [];
    mouseTrajectory = [];

    timestamps=[]
    screenSizeWarnings=[]

    // Draw the hover circle and wait for hover condition to be met before rendering stimuli
    //drawCenterHint("AI")();

    if (expStruct[iBlock].isPractice) {
        if (expStruct[iBlock].isAI==true) {
            drawFeedback("AI");
            isAI=true
        }
        else{
            drawFeedback("NoAI");
            isAI=false
        }
    }
    else{
        if (expStruct[iBlock].isAI==true) {
            drawCenterHint("AI");
            isAI=true            
        }
        else{
            drawCenterHint("NoAI");
            isAI=false
        }
    }
    // canvas.addEventListener('mousemove', handleCircleHover);
}
