// Notes:
// Only black stimuli, no salience variation
// Varying set size: 1, 12, 18, 24

//----------------------------------
// EXPERIMENT CONFIG
//----------------------------------

const CONFIG = {
	stimuli:{
		// stimuli display properties
		BAR_WIDTH: 10, // only used in VS.js when drawing stim
		BAR_LENGTH: 30,
		BAR_GAP: 12, // gap between horizontal and vertical bars
		L_MAX_JITTER: 6, // the larger this number and closer it is to BAR_LENGTH/2, the more Ls look like Ts
		MIN_STIM_GAP: 8, // for best results make sure that this is more than BAR_GAP/2
        //SET_SIZE: [1, 12, 18, 24],
        //SET_SIZE: [12, 18, 24, 30],
        SET_SIZE: [24],
		GRID_ROWS: 6, // even numbers are better to make sure hover circle doesn't cover stimulus
		GRID_COLS: 8,
		SQUARE_SIZE: 80,
		POSSIBLE_ROTATIONS: [0, 90, 180, 270],
		RANGE_SALIENCE: [100, 100], // No salience variation in this version
        REDUCTION_FACTOR: 0.70 // Reducing the bounding box (from the stim grid) for counting a click as a stimulus selection; 60% of original size
	},
	experimentDesign:{
		// num of practice and experiment blocks
		N_PRACTICE_BLOCKS: 1,
        //TOTAL_PRACTICE_BLOCKS: 2,
		N_NO_CAD_BLOCKS: 1,
        N_CAD_BLOCKS: 1,
        TOTAL_BLOCKS: 3,
        AI_accuracy:0.8
	},
	practiceTrialsConditions: {
		// total num of trials in each condition across all practice blocks
		// N_TARGET_PRESENT: 4,
		// N_TARGET_ABSENT: 4
        N_TARGET_PRESENT: 2,
		N_TARGET_ABSENT: 2
	},
    practiceTrialsConditionsNoAI: {
		// total num of trials in each condition across all practice blocks
		// N_TARGET_PRESENT: 4,
		// N_TARGET_ABSENT: 4
        N_TARGET_PRESENT: 1,
		N_TARGET_ABSENT: 1
	},
    practiceTrialsConditionsAI: {
		// total num of trials in each condition across all practice blocks
		// N_TARGET_PRESENT: 4,
		// N_TARGET_ABSENT: 4
        N_TARGET_PRESENT: 1,
		N_TARGET_ABSENT: 1
	},
    experimentTrialsConditions: {
		// total num of trials in all conditions across all experiment blocks
		// N_TARGET_PRESENT: 5,
		// N_TARGET_ABSENT: 5
        N_TARGET_PRESENT: 25,
		N_TARGET_ABSENT: 25
	},
	AIRandom40Conditions: {
		// total num of trials in all conditions across all experiment blocks
		// N_TARGET_PRESENT: 5,
		// N_TARGET_ABSENT: 5
        N_TARGET_PRESENT: 20,
		N_TARGET_ABSENT: 20
	},
	display: {
		// other vars not relevant to constructing expStruct
		// DELAY_BEFORE_TRIAL: 300, // in exp trials the total ITI is this plus MIN_FEEDBACK_DURATION
        DELAY_BEFORE_TRIAL: 0, // in exp trials the total ITI is this plus MIN_FEEDBACK_DURATION
		HINT_CIRCLE_RADIUS: 2.5,
		HOVER_DURATION: 130,
		MIN_FEEDBACK_DURATION: 500, // delay between drawing feedback and showing hover
		// MIN_SEARCH_TIME: 500,
        MIN_SEARCH_TIME:0,
		MAX_SEARCH_TIME: 15000,
        MOUSE_TRACKING_INTERVAL: 25 // time in milliseconds, adjust as needed
	},
	canvasDimensions: {
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
	}
};

//----------------------------------
// GRID SETUP
//----------------------------------

// Calculate dimensions and starting positions
const GRID_WIDTH = CONFIG.stimuli.GRID_COLS * CONFIG.stimuli.SQUARE_SIZE;
const GRID_HEIGHT = CONFIG.stimuli.GRID_ROWS * CONFIG.stimuli.SQUARE_SIZE;
const START_X = (canvas.width - CONFIG.stimuli.GRID_COLS * CONFIG.stimuli.SQUARE_SIZE) / 2 + CONFIG.stimuli.SQUARE_SIZE / 2;
const START_Y = (canvas.height - CONFIG.stimuli.GRID_ROWS * CONFIG.stimuli.SQUARE_SIZE) / 2 + CONFIG.stimuli.SQUARE_SIZE / 2;
const XY_MAX_JITTER = (CONFIG.stimuli.SQUARE_SIZE - CONFIG.stimuli.BAR_LENGTH - CONFIG.stimuli.BAR_GAP)/2 - CONFIG.stimuli.MIN_STIM_GAP;

// Generate preset locations based on the grid parameters
const presetLocations = [];
for (let row = 0; row < CONFIG.stimuli.GRID_ROWS; row++) {
    for (let col = 0; col < CONFIG.stimuli.GRID_COLS; col++) {
        presetLocations.push({
            x: START_X + col * CONFIG.stimuli.SQUARE_SIZE,
            y: START_Y + row * CONFIG.stimuli.SQUARE_SIZE
        });
    }
}

//--------------------------------
// GLOBAL VARIABLES
//--------------------------------

let trialID
// These will store the fixed positions for all participants
const hardCodedIndices = [8,12,18,20,25,36,39,40,45,48]

const FIXED_AI_SUGGESTION_INDICES = [
    { index: 8, AISuggestion: "false_neg",trialType:"target_absent" },
    { index: 12, AISuggestion: "false_neg",trialType:"target_absent" },
    { index: 18, AISuggestion: "false_pos",trialType:"target_present"},
    { index: 20, AISuggestion: "false_neg",trialType:"target_absent"  },
    { index: 25, AISuggestion: "false_pos",trialType:"target_present" },
    { index: 36, AISuggestion: "false_pos",trialType:"target_present" },
    { index: 39, AISuggestion: "false_pos",trialType:"target_present" },
    { index: 40, AISuggestion: "false_neg",trialType:"target_absent" },
    { index: 45, AISuggestion: "false_neg",trialType:"target_absent" },
    { index: 48, AISuggestion: "false_pos",trialType:"target_present" }
];
//--------------------------------
// BLOCK, TRIAL, STIMULUS CLASSES
//--------------------------------

class Block {
	constructor(isPractice, isAI, trials) {
	  this.isPractice = isPractice;
      this.isAI = isAI;
	  this.trials = trials;
	}
}
  
class Trial {
	constructor(trialType, trialID, setSize, stimuli, AISuggestion) {
      this.trialID = trialID; // target condition
	  this.trialType = trialType; // target condition
	  this.stimuli = stimuli; // stimulus array
	  this.setSize = setSize;
      this.AISuggestion= AISuggestion
	}
}

// Define the Stimulus class
class Stimulus {
	constructor(stimIndex,xpos, ypos, rgb, salience, offset, rotation, targetCond){
	  this.stimIndex = stimIndex;
	  this.xpos = xpos;
	  this.ypos = ypos;
	  this.rgb = rgb;
	  this.salience = salience
	  this.offset = offset;
	  this.rotation = rotation;
	  this.targetCond = targetCond;
	  this.clickCount = 0; //track click count
	}
}

//---------------------------
// STIMULUS CLASS FUNCTIONS
//---------------------------
// unless otherwise noted all stim class functions 
// take stimulus index as an input &
// returns stimulus properties as an output

// structural function to generate a stimulus object
const generateStimuli = (xpos, ypos, rgb, salience, offset, rotation, targetCondition, clickCount) => {
return new Stimulus(xpos, ypos, rgb, salience, offset, rotation, targetCondition, clickCount);
}

// xpos with jitter
const jitteredX = (index,shuffledLocations) => {
	// input index and array of shuffled starting locations
	const jitterX = Math.floor((Math.random() * 2 - 1) * XY_MAX_JITTER);
	return shuffledLocations[index].x + jitterX;
}

// ypos with jitter
const jitteredY = (index,shuffledLocations) => {
	const jitterY = Math.floor((Math.random() * 2 - 1) * XY_MAX_JITTER);
	return shuffledLocations[index].y + jitterY;
}

// rgb value and salience
const generateColorSalience = (index) => {
	// outputs object with two values:
	// 1. rgb value of stim color (grey of varying % black)
	// 2. label whether this color is high or low salience

	let rgb, salience;
	rgb = generateGreyColor(CONFIG.stimuli.RANGE_SALIENCE);
	salience = 'high'; // always high
  
	return { rgb, salience };
}

// L-offset
const generateOffset = (index) => {
	// used to jitter L bar rightwards, this stim property is only used in main functions if targ = 0
	return Math.floor(Math.random() * (CONFIG.stimuli.L_MAX_JITTER + 1)); 
}
  
// rotation
const generateRotation = (index) => {
	return CONFIG.stimuli.POSSIBLE_ROTATIONS[Math.floor(Math.random() * CONFIG.stimuli.POSSIBLE_ROTATIONS.length)];
}

// target condition
const generateTarget = (index, trialType) => {
	// input: index and trialType (experiment conditions: target present or target absent)
	if (trialType === "target_present") {
		return index === 0 ? 1 : 0;
	} else { // no target
		return 0
	}
}
  
//----------------------------------
// MAIN FUNCTIONS
//----------------------------------
function initializeFixedAISuggestionIndices(trials) {
    if (fixedIndicesInitialized) return;

    const desiredFalseNegCount = 5;
    const desiredFalsePosCount = 5;

    const targetPresentIndices = trials
        .map((t, i) => (i > 1 && t.trialType === "target_present") ? i : -1)
        .filter(i => i !== -1);

    const targetAbsentIndices = trials
        .map((t, i) => (i > 1 && t.trialType === "target_absent") ? i : -1)
        .filter(i => i !== -1);

    const shuffledPresent = shuffle([...targetPresentIndices]);
    const shuffledAbsent = shuffle([...targetAbsentIndices]);

    const selectedFalseNegs = shuffledPresent.slice(0, desiredFalseNegCount).map(i => ({ index: i, type: "false_neg" }));
    const selectedFalsePos = shuffledAbsent.slice(0, desiredFalsePosCount).map(i => ({ index: i, type: "false_pos" }));

    FIXED_ERROR_INDICES = shuffle([...selectedFalseNegs, ...selectedFalsePos]);

    fixedIndicesInitialized = true;
}

function generateTrialID(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // console.log("trial ID is ",result)
    return result;
}

// input: 1) num of trials to create 2) which target condition 3) what set size
// output: trial object with properties: 1) trial condition 2) stimulus array

function createTrials(nTrials, trialType, trialID, setSize) {

    let trials = [];
    setSize=24

    for (let i = 0; i < nTrials; i++) {
        const shuffledLocations = shuffle([...presetLocations]); // shuffle preset locations for each trial
        //stimuli loop
        const stimuli = Array.from({ length: setSize }, (_, index) => {
            const stimIndex = index;
            const xpos = jitteredX(index, shuffledLocations);
            const ypos = jitteredY(index, shuffledLocations);
            const { rgb, salience } = generateColorSalience(index);
            const offset = generateOffset(index);
            const rotation = generateRotation(index);
            const targetCondition = generateTarget(index, trialType); // is T or L
            return new Stimulus(stimIndex, xpos, ypos, rgb, salience, offset, rotation, targetCondition);
        });
        trialID=generateTrialID()
        //console.log("trialID is ",trialID)
        trials.push(new Trial(trialType, trialID, setSize, stimuli));
    }
    return trials;
}
function generateAISuggestionsPractice(trials){
    //practice does not contain any errors
    trials.forEach(function(trial) {
        trial.AISuggestion="correct"
    });
    return trials
}
function applyFixedAISuggestions(trials) {
    // Default all to correct
    trials.forEach(t => t.AISuggestion = "correct");
    trials[0].AISuggestion = "correct";
    trials[1].AISuggestion = "correct";

    // Make a map of valid indices by type
    const available = {
        false_neg: trials
            .map((t, i) => ({ i, valid: t.trialType === "target_present" }))
            .filter(x => x.valid)
            .map(x => x.i),
        false_pos: trials
            .map((t, i) => ({ i, valid: t.trialType === "target_absent" }))
            .filter(x => x.valid)
            .map(x => x.i)
    };

    FIXED_AI_SUGGESTION_INDICES.forEach(({ index, type }) => {
        const requiredTrialType = type === "false_neg" ? "target_present" : "target_absent";

        if (trials[index] && trials[index].trialType === requiredTrialType) {
            trials[index].AISuggestion = type;
        } else {
            // Find a valid trial of the required type to swap in
            const pool = available[type].filter(i => i > 1 && trials[i].AISuggestion === "correct");
            if (pool.length === 0) {
                console.warn(`No valid trial to assign ${type}`);
                return;
            }

            const swapIndex = pool[0];

            // Swap trials[index] with trials[swapIndex]
            const temp = trials[index];
            trials[index] = trials[swapIndex];
            trials[swapIndex] = temp;

            trials[index].AISuggestion = type;
        }
    });

    return trials;
}

// function generateAISuggestionsTrial(trials) {
//     console.log("in generate AI Suggestions");
//     console.log(trials);
//     const numTrials = trials.length;  // Length of the list
//     const numErrors = Math.round((1-(CONFIG.experimentDesign.AI_accuracy)) * numTrials)
//     let numFalsePositives = Math.round(numErrors / 2)
//     let numFalseNegatives = Math.round(numErrors / 2)
//     let numCorrect = numTrials - numErrors
//     let falsePositiveCount = 0
//     let falseNegativeCount = 0
//     let correctCount = 0 

//     console.log("numTrials is ",numTrials)
//     console.log("num errors is ",numErrors)
//     console.log("num false positive is ",numFalsePositives)
//     console.log("num false negatives is ",numFalseNegatives)
//     console.log("num correct is ",numCorrect)

//     // Group trials by setSize
//     trials.forEach(function(trial) {
//         if (trial.trialType == "target_absent"){
//             if (falsePositiveCount != numFalsePositives){
//                 trial.AISuggestion= "false_pos"
//                 falsePositiveCount++
//             }
//             else{
//                 if (correctCount != numCorrect){
//                     trial.AISuggestion="correct"
//                     correctCount++
//                 }
//             }
//         }
//         if (trial.trialType == "target_present"){
//             if (falseNegativeCount != numFalseNegatives){
//                 trial.AISuggestion= "false_neg"
//                 falseNegativeCount++
//             }
//             else{
//                 if (correctCount != numCorrect){
//                     trial.AISuggestion="correct"
//                     correctCount++
//                 }
//             }
//         }
//     });

//     //shuffle + make sure that the first two trials are always correct
//     function shuffleArray(array) {

//         // Separate "correct" trials to ensure two are first
//         let correctTrials = array.filter(trial => trial.AISuggestion === "correct");
//         let notCorrectTrials = array.filter(trial => trial.AISuggestion !== "correct");

//         // Ensure at least two "correct" trials exist
//         if (correctTrials.length >= 2) {
//             // Place two "correct" trials at the start
//             let firstTwoCorrect = correctTrials.slice(0, 2);
//             let remainingCorrect = correctTrials.slice(2);

//             let remainingTrials = remainingCorrect.concat(notCorrectTrials)
//             // Shuffle the rest
//             remainingTrials.sort(() => Math.random() - 0.5);

//             // Combine into a new shuffled order
//             array = firstTwoCorrect.concat(remainingTrials);
//         }
//         return array;
//     }
//     // Shuffle all trials after assigning AISuggestion
//     trials = shuffleArray(trials);
//     return trials;
// }

function makeExpStruct() {

    //===========================================
    //  Create initial practice trials no AI and shuffle them
    //===========================================
    let practiceTrials = [];
	for (let trialType in CONFIG.practiceTrialsConditions) {
        let readableTrialType;
        if (trialType === 'N_TARGET_PRESENT') readableTrialType = 'target_present';
        else if (trialType === 'N_TARGET_ABSENT') readableTrialType = 'target_absent';
        const totalTrialsForType = CONFIG.practiceTrialsConditions[trialType];
        const trialsPerSetSize = totalTrialsForType / CONFIG.stimuli.SET_SIZE.length; 	// trials of different set sizes are evenly distributed across trial types
        for (const setSize of CONFIG.stimuli.SET_SIZE) {
            practiceTrials.push(...createTrials(trialsPerSetSize, readableTrialType, trialID, setSize));
        }
    }

    //===========================================
    //  Create practice trials no AI and shuffle them
    //===========================================
    let practiceTrialsNoAI = [];
	for (let trialType in CONFIG.practiceTrialsConditionsNoAI) {
        let readableTrialType;
        if (trialType === 'N_TARGET_PRESENT') readableTrialType = 'target_present';
        else if (trialType === 'N_TARGET_ABSENT') readableTrialType = 'target_absent';
        const totalTrialsForType = CONFIG.practiceTrialsConditionsNoAI[trialType];
        const trialsPerSetSize = totalTrialsForType / CONFIG.stimuli.SET_SIZE.length; 	// trials of different set sizes are evenly distributed across trial types
        for (const setSize of CONFIG.stimuli.SET_SIZE) {
            practiceTrialsNoAI.push(...createTrials(trialsPerSetSize, readableTrialType, trialID, setSize));
        }
    }

    //===========================================
    //  Create practice trials AI and shuffle them
    //===========================================
    let practiceTrialsAI = [];
	for (let trialType in CONFIG.practiceTrialsConditionsAI) {
        let readableTrialType;
        if (trialType === 'N_TARGET_PRESENT') readableTrialType = 'target_present';
        else if (trialType === 'N_TARGET_ABSENT') readableTrialType = 'target_absent';
        const totalTrialsForType = CONFIG.practiceTrialsConditionsAI[trialType];
        const trialsPerSetSize = totalTrialsForType / CONFIG.stimuli.SET_SIZE.length; 	// trials of different set sizes are evenly distributed across trial types
        for (const setSize of CONFIG.stimuli.SET_SIZE) {
            practiceTrialsAI.push(...createTrials(trialsPerSetSize, readableTrialType, setSize));
        }
    }
    // //ADD AI Suggestion
    practiceTrialsAI = generateAISuggestionsPractice(practiceTrialsAI)

    //===========================================
    // Create no AI experimental trials 
    //===========================================
	let experimentTrialsNoAI = [];
    for (let trialType in CONFIG.experimentTrialsConditions) {
        let readableTrialType;
        if (trialType === 'N_TARGET_PRESENT') readableTrialType = 'target_present';
        else if (trialType === 'N_TARGET_ABSENT') readableTrialType = 'target_absent';
        const totalTrialsForType = CONFIG.experimentTrialsConditions[trialType];
        const trialsPerSetSize = totalTrialsForType / CONFIG.stimuli.SET_SIZE.length; 	// trials of different set sizes are evenly distributed across trial types
        for (const setSize of CONFIG.stimuli.SET_SIZE) {
            experimentTrialsNoAI.push(...createTrials(trialsPerSetSize, readableTrialType, trialID,setSize));
        }
    }
    experimentTrialsNoAI=shuffle(experimentTrialsNoAI)

    //===========================================
    // Create random 40 AI experimental trials
    //===========================================
	let random40AITrials = [];
    for (let trialType in CONFIG.AIRandom40Conditions) {
        let readableTrialType;
        if (trialType === 'N_TARGET_PRESENT') readableTrialType = 'target_present';
        else if (trialType === 'N_TARGET_ABSENT') readableTrialType = 'target_absent';
        const totalTrialsForType = CONFIG.AIRandom40Conditions[trialType];
        const trialsPerSetSize = totalTrialsForType / CONFIG.stimuli.SET_SIZE.length; 	// trials of different set sizes are evenly distributed across trial types
        for (const setSize of CONFIG.stimuli.SET_SIZE) {
            random40AITrials.push(...createTrials(trialsPerSetSize, readableTrialType, trialID, setSize));
        }
    }
    random40AITrials = shuffle(random40AITrials);
    //console.log("random40AITrials is ",random40AITrials)

    //===========================================
    // Add 10 AI errors to AI trials
    //===========================================
    let randomItemIndex = 0;  // pointer to the current random40 item

    function grabRandomAITrial() {
        if (randomItemIndex >= random40AITrials.length) {
            throw new Error("No more random items available");
        }
        return random40AITrials[randomItemIndex++];
    }

    let experimentTrialsAI=[]

    Array(50).fill('').map((_, index) => {
        // if (hardCodedIndices.includes(index)) {
        if (FIXED_AI_SUGGESTION_INDICES.some(trial => trial.index === index)){ //FIXED_AI_SUGGESTION_INDICES includes index
            let matchingTrial = FIXED_AI_SUGGESTION_INDICES.find(trial => trial.index === index);
            let AISuggestion =matchingTrial.AISuggestion
            let trialType = matchingTrial.trialType
            let trial= createTrials(1,trialType,generateTrialID(),24)[0]
            trial.AISuggestion=AISuggestion
            experimentTrialsAI.push(trial)
        } else {
            let randomAITrial= grabRandomAITrial() // the random 40
            randomAITrial.AISuggestion="correct"
            experimentTrialsAI.push(randomAITrial)
        }
    })
    console.log("experimenTrialsAI is ",experimentTrialsAI)

    // Convert arrays of trial arrays into Block objects and push to expStruct
    const expStruct = [];

    if (Math.random() < 0.5) {
        // NO AI TRIALS FIRST
        for (const practiceBlockTrials of [practiceTrials]) {
            const block = new Block(true, false, practiceBlockTrials);
            expStruct.push(block);
        }
        // Add practice blocks noAI to expStruct
        for (const practiceBlockTrialsNoAI of [practiceTrialsNoAI]) {
            const block = new Block(true, false, practiceBlockTrialsNoAI);
            expStruct.push(block);
        }
        //Add experiment blocks no AI Block 1to expStruct
        for (const experimentBlocksNoAITrials of [experimentTrialsNoAI]) {
            const block = new Block(false, false, experimentBlocksNoAITrials);
            expStruct.push(block);
        }
        // Add practice blocks AI to expStruct
        for (const practiceBlockTrialsAI of [practiceTrialsAI]) {
            const block = new Block(true, true, practiceBlockTrialsAI);
            expStruct.push(block);
        }
        // Add experiment blocks AI to expStruct
        for (const experimentBlocksAITrials of [experimentTrialsAI]) {
            const block = new Block(false, true, experimentBlocksAITrials);
            expStruct.push(block);
        }
    }
    else{
        for (const practiceBlockTrials of [practiceTrials]) {
            const block = new Block(true, false, practiceBlockTrials);
            expStruct.push(block);
        }
        // Add practice blocks AI to expStruct
        for (const practiceBlockTrialsAI of [practiceTrialsAI]) {
            const block = new Block(true, true, practiceBlockTrialsAI);
            expStruct.push(block);
        }
        // Add experiment blocks AI to expStruct
        for (const experimentBlocksAITrials of [experimentTrialsAI]) {
            const block = new Block(false, true, experimentBlocksAITrials);
            expStruct.push(block);
        }
        // Add practice blocks noAI to expStruct
        for (const practiceBlockTrialsNoAI of [practiceTrialsNoAI]) {
            const block = new Block(true, false, practiceBlockTrialsNoAI);
            expStruct.push(block);
        }
        //Add experiment blocks no AI Block 1to expStruct
        for (const experimentBlocksNoAITrials of [experimentTrialsNoAI]) {
            const block = new Block(false, false, experimentBlocksNoAITrials);
            expStruct.push(block);
        }
    }

    console.log("expStruct is ",expStruct)
    return expStruct;
}
  
//----------------------------------
// UTILITY FUNCTIONS
//----------------------------------

function shuffle(array) {
    let currentIndex = array.length, randomIndex, tempValue;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
    }
    return array;
}

// takes [min percent black, max percent black] and outputs a random rgb value within this percentage black range
function generateGreyColor(percentBlackRange) {
	// Extract the min and max percentage from the array
	const [minPercentBlack, maxPercentBlack] = percentBlackRange;
	// Generate a random percentage within the specified range
	const randomPercentBlack = Math.random() * (maxPercentBlack - minPercentBlack) + minPercentBlack;
	// Convert this percentage to an integer between 0 and 255
	const greyValue = Math.floor((1 - (randomPercentBlack / 100)) * 255);
	// Create the RGB color string
	const rgbColor = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
	return rgbColor;
}

// distributes an array of trials evenly across nBlocks according to specified grouping properties (i.e., IVs to counterbalance)
function distributeTrialsEqually(trials, nBlocks, properties) {
    const groups = new Map();
    
    // 1. Group by provided properties
    for (const trial of trials) {
        let key = "";
        for (const prop of properties) {
            key += `${trial[prop]}_`;
        }
        key = key.slice(0, -1); // Remove the trailing underscore

        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(trial);
    }

    const blocks = Array.from({ length: nBlocks }, () => []);
    
    // 2. Distribute trials from each group evenly across the blocks
    for (const [key, groupTrials] of groups.entries()) {
        const trialsPerBlock = groupTrials.length / nBlocks;
        for (let i = 0; i < nBlocks; i++) {
            const startIdx = i * trialsPerBlock;
            const endIdx = startIdx + trialsPerBlock;
            blocks[i].push(...groupTrials.slice(startIdx, endIdx));
        }
    }

    // // 3. Shuffle the trials within each block
    // for (const block of blocks) {
    //     shuffle(block);
    // }
    return blocks;
}