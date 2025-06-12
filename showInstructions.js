// functions for showing consent, instructions, demographics

// ==============================
// Consent
// ==============================
var participant_id= "00540ec7978f74724ae3f4ae262fb1eef7402003e09a95d002068c61d94bc784"
var old_accuracy
var old_speed
var old_score
var new_score

function show_consent() {
    console.log("in show consent")
    document.getElementById('instructions_page1').style.display = 'none';
    document.getElementById('consentFormSection').style.display = 'block';
}

document.getElementById('consentCheckbox').addEventListener('change', function() {
    document.getElementById('startInstructionsButton').disabled = !this.checked;
});

// ==============================
// get prior data
// ==============================

function getS2data() {
    // Path to your CSV file
    const csvFilePath = 'OLD_Ts-and-Ls/S2_participant_sums.csv';  // Replace with the actual path to your CSV

    // Use PapaParse to fetch and parse the CSV file
    Papa.parse(csvFilePath, {
        download: true,     // Fetch the CSV file from a URL
        header: true,       // Treat the first row as headers
        complete: function(results) {
            // Find the row where the 'id' matches the participant ID
            const matchingRow = results.data.find(row => row.subId === participant_id);

            if (matchingRow) {
                console.log('Found row:', matchingRow);
                return matchingRow
            } else {
                console.log('No row found for participant ID:', participantId);
            }
        }
    });
}
// ==============================
// Instructions
// ==============================

function startInstructions() {
    // Hide consent form and show the first page of the experiment
    document.getElementById('consentFormSection').style.display = 'none';
    document.getElementById('instructions_page1').style.display = 'block';
}

function transitionInstructions(hideId, showId, imageUpdates = []) {
    if(hideId) document.querySelector(`#${hideId}`).style.display = 'none';
    if(showId) document.querySelector(`#${showId}`).style.display = 'block';

    imageUpdates.forEach(update => {
        document.querySelector(`#${update.id}`).src = update.src;
    });
}

function getPriorPerformance(){
    //=================================================
    // get stats for current user from CSV file
    //=================================================
    // Path to your CSV file
    const csvFilePath = 'S2_participant_sums.csv';  // Replace with the actual path to your CSV

    // Use PapaParse to fetch and parse the CSV file
    Papa.parse(csvFilePath, {
        download: true,     // Fetch the CSV file from a URL
        header: true,       // Treat the first row as headers
        complete: function(results) {
            // Find the row where the 'id' matches the participant ID
            const matchingRow = results.data.find(row => row.subId === participant_id);

            if (matchingRow) {
                console.log('Found row:', matchingRow);
                old_accuracy = Number(matchingRow.accuracy_rate) * 100
                old_speed = Number(matchingRow.totalSearchTime) / 1000
                old_score= Number(matchingRow.inverse_efficiency)
                let past_performance_text= "On the previous task, you were asked to be as accurate and fast as possible. Your overall performance score (computed using both your speed and accuracy) was therefore "+ old_score.toFixed(2) +" points."
                document.getElementById('past_performance').textContent = past_performance_text
            } else {
                console.log('No row found for participant ID:', participantId);
            }
        }
    });
}

function getPriorTaskDate(){
    //get date on which prior task was conducted
        // Path to your CSV file
        const csvFilePath = 'S2_participant_sums.csv';  // Replace with the actual path to your CSV

        // Use PapaParse to fetch and parse the CSV file
        Papa.parse(csvFilePath, {
            download: true,     // Fetch the CSV file from a URL
            header: true,       // Treat the first row as headers
            complete: function(results) {
                // Find the row where the 'id' matches the participant ID
                const matchingRow = results.data.find(row => row.subId === participant_id);
    
                if (matchingRow) {
                    console.log('Found row:', matchingRow);
                    let start_date = matchingRow.expTrialsStartDate
                    let prior_task_date= "On "+start_date+", you completed a Visual Search Task where you were asked to identify a target out of an array of distractors."
                    document.getElementById('prior_task_date').textContent = prior_task_date
                } else {
                    console.log('No row found for participant ID:', participantId);
                }
            }
        });
}

function show_instructions1() {
    transitionInstructions(null, 'instructions_page1');
}

function show_instructions2() {
    // transitionInstructions('instructions_page1', 'instructions_page2', [
    //     {id: 'Example_Ls', src: 'instrAIPics/Example_Lstim.png'},
    //     {id: 'Example_Ts', src: 'instrAIPics/Example_Tstim.png'}
    // ]);
    document.getElementById('instructions_page1').style.display = 'none';
    document.getElementById('instructions_page2').style.display = 'block';
}
function show_instructions3() {
    // transitionInstructions('instructions_page2', 'instructions_page3', [
    //     {id: 'Example_TargetPresent', src: 'instrAIPics/Example_TargetPresent.png'},
    //     {id: 'Example_TargetAbsent', src: 'instrAIPics/Example_TargetAbsent.png'}
    // ]);
    // Hide the canvas
    // Show the instructions page
    document.getElementById('instructions_page2').style.display = 'none';
    document.getElementById('instructions_page3').style.display = 'block';
}

function show_instructions4() {
    document.getElementById('instructions_page3').style.display = 'none';
    document.getElementById('instructions_page4').style.display = 'block';
}

function show_instructions5() {
    document.getElementById('instructions_page4').style.display = 'none';
    document.getElementById('instructions_page5').style.display = 'block';
}

function show_instructions6() {
    document.getElementById('instructions_page5').style.display = 'none';
    document.getElementById('instructions_page6').style.display = 'block';
}

function show_instructions7() {
    document.getElementById('instructions_page6').style.display = 'none';
    document.getElementById('instructions_page7').style.display = 'block';
}

function show_instructions8() {
    document.getElementById('instructions_page7').style.display = 'none';
    document.getElementById('instructions_page8').style.display = 'block';
}
function show_instructions9() {
    document.getElementById('instructions_page8').style.display = 'none';
    document.getElementById('instructions_page9').style.display = 'block';
}

function hideAllInstructionDivs() {
    const instructionDivs = document.querySelectorAll('.instructionsDiv');
    instructionDivs.forEach(div => div.style.display = 'none');
}
// ==============================
// no-AI block 1
// ==============================
function show_noAI_instructions1() {
    transitionInstructions(null, 'instructions_noAI_page1');
}

// ==============================
// no-AI block 4
// ==============================
function show_noAI_block4() {
    document.getElementById('instructions_noAI').style.display = 'block';
    document.getElementById('instructions_AI_page4').style.display = 'none';
}

// ==============================
// AI Instructions
// ==============================
function show_AI_instructions1() {
    transitionInstructions(null, 'instructions_AI_page1');
}
function show_AI_instructions2() {
    document.getElementById('instructions_AI_page1').style.display = 'none';
    document.getElementById('instructions_AI_page2').style.display = 'block';
}
function show_AI_instructions3() {
    document.getElementById('instructions_AI_page2').style.display = 'none';
    document.getElementById('instructions_AI_page3').style.display = 'block';
}
function show_AI_instructions4() {
    console.log("iBlock is ",iBlock)
    // if AI is the second block
    if (iBlock == 3){
        document.getElementById('instructions_AI_page3').style.display = 'none';
        document.getElementById('instructions_AI_page4').style.display = 'none';
        document.getElementById('instructions_AI_page4_block3').style.display = 'block';
    }
    // if AI is the third block
    else{
        document.getElementById('instructions_AI_page3').style.display = 'none';
        document.getElementById('instructions_AI_page4').style.display = 'block';
        document.getElementById('instructions_AI_page4_block3').style.display = 'none';
    }
}

// ==============================
// Start qualtrics survey
// ==============================

function showStartSurveys() {
    // Hide the canvas
    document.getElementById('canvas').style.display = 'none';
    // Hide the demographics form
    document.getElementById('demoInfo').style.display = 'none';
    // Hide the "next" button
    document.getElementById('startDemosButton').style.display = 'none';
    //display start surveys page
    document.getElementById('startSurveys').style.display = 'block';
}

// ==============================
// AI use survey
// ==============================

function showAISurvey() {
    // Hide the canvas
    document.getElementById('canvas').style.display = 'none';
    // Hide the demographics form
    document.getElementById('demoInfo').style.display = 'none';
    // Show the AI form
    document.getElementById('AISurvey').style.display = 'block';
    // Hide the "next" button
    document.getElementById('startDemosButton').style.display = 'none';
}

// ==============================
// Demographics
// ==============================

function show_startDemosButton() {
    document.getElementById('startDemosButton').style.display = 'block';
}

function showDemographicForm() {
    // Hide the canvas
    document.getElementById('canvas').style.display = 'none';
    // Hide the AI form
    document.getElementById('AISurvey').style.display = 'none';
    // Hide the bonus form
    document.getElementById('bonusForm').style.display = 'none';
    // Show the demographics form
    document.getElementById('demoInfo').style.display = 'block';
    //hide nasa-tlx
    document.getElementById('nasa_tlx').style.display = 'none';
    // Hide the "next" button
    document.getElementById('startDemosButton').style.display = 'none';
}

function show_nasa_tlx(){
    console.log("in show nasa-tlx")
    // Hide the canvas
    document.getElementById('canvas').style.display = 'none';
    // Hide the bonus form
    document.getElementById('bonusForm').style.display = 'none';
    // Hide the AI form
    document.getElementById('AISurvey').style.display = 'none';
    // Hide the "next" button
    document.getElementById('startDemosButton').style.display = 'none';
    //show nasa-tlx
    document.getElementById('nasa_tlx').style.display = 'block';
}

function showBonusForm(){
    console.log("in show bonus form")
    // Hide the canvas
    document.getElementById('canvas').style.display = 'none';
    // Show the bonus form
    document.getElementById('bonusForm').style.display = 'block';
    // Hide the AI form
    document.getElementById('AISurvey').style.display = 'none';
    // Hide the "next" button
    document.getElementById('startDemosButton').style.display = 'none';
    //hide start surveys page
    document.getElementById('startSurveys').style.display = 'none';


    console.log("trialDataLog is ",trialDataLog)

    let nonPracticeTrialCount = trialDataLog.filter(obj => obj.isPractice === false).length;

    let newTotalTime = (trialDataLog.reduce((sum, obj) => {
        return obj.isPractice === false ? sum + (obj.totalSearchTime || 0) : sum;
    }, 0)) / 1000;

    let newTotalHits = trialDataLog.reduce((sum, obj) => {
        return obj.isPractice === false ? sum + (obj.hitCount || 0) : sum;
    }, 0);

    let newCorrectRejects = trialDataLog.reduce((sum, obj) => {
        return obj.isPractice === false ? sum + (obj.crCount || 0) : sum;
    }, 0);

    let new_accuracy = ((newTotalHits + newCorrectRejects) / nonPracticeTrialCount) * 100
    let new_average_time = newTotalTime / nonPracticeTrialCount

    console.log("old totaltime is",old_speed)
    console.log("old accuracy is",old_accuracy)
    console.log("old score is",old_score)

    console.log("nonPracticeTrialCount is ",nonPracticeTrialCount)
    console.log("new newTotalTime is ",newTotalTime)
    console.log("newTotalHits is ",newTotalHits)
    console.log("new accuracy is ",new_accuracy)
    console.log("new_average_time is ",new_average_time)

    new_score = (new_average_time*1000) / new_accuracy

    let accuracy_diff= new_accuracy - old_accuracy
    let speed_diff=new_average_time - old_speed 

    let accuracy_diff_text = ""
    let speed_diff_text = ""
    if (accuracy_diff > 0){
        accuracy_diff_text= "increased by "+ accuracy_diff + "%"
    }
    else if (accuracy_diff == 0){
        accuracy_diff_text= "is the same as the previous task" 
    }
    else if (accuracy_diff < 0){
        accuracy_diff_text= "decreased by "+ Math.abs(accuracy_diff) + "%"
    }

    if (speed_diff > 0){
        speed_diff_text= "increased by "+ accuracy_diff + " seconds."
    }
    else if (speed_diff == 0){
        speed_diff_text= "is the same as the previous task" 
    }
    else if (speed_diff < 0){
        speed_diff_text= "decreased by "+ Math.abs(accuracy_diff) + " seconds."
    }
    // document.getElementById('newScoreText').textContent = "Your new score is: " + new_score+ ". Your accuracy "+ accuracy_diff_text + " and your average speed per trial "+ speed_diff_text
    document.getElementById('newScoreText').textContent = "You had a total of " + new_accuracy+ "% correct trials in a total time of "+newTotalTime+ " seconds."

}

// ==============================
// End experiment survey
// ==============================
function showEndExperiment(){
    console.log("in show end experiment")
    // Hide the canvas
    document.getElementById('canvas').style.display = 'none';
    // Hide the bonus form
    document.getElementById('bonusForm').style.display = 'none';
    // Hide the AI form
    document.getElementById('AISurvey').style.display = 'none';
    // Hide the "next" button
    document.getElementById('startDemosButton').style.display = 'none';
    //hide nasa-tlx
    document.getElementById('nasa_tlx').style.display = 'none';
    //hide start surveys page
    document.getElementById('startSurveys').style.display = 'none';
    //show end page
    document.getElementById('endExperimentPage').style.display = 'block'; 
}