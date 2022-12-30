const style = document.createElement('style');
style.innerHTML = `
  .rating {
    margin-top: 5px;
  }
`;
document.head.appendChild(style);


// Send a message to the background script to retrieve the average rating for each professor
const professorLinks = document.querySelectorAll('td[width="15%"] a');

professorLinks.forEach(async (link) => {
  const professorName = link.textContent;
  console.log('content.js: ', professorName);

  try {
    // Connect to the background script
    const port = chrome.runtime.connect({name: 'professor-rating'});

    // Send a message to the background script to retrieve the teacher object
    port.postMessage({professorName});

    // When a message is received from the background script...
    port.onMessage.addListener((teacher) => {
      if (teacher.error) {
        // Insert the error message instead of the average rating
        insertNoProfError(link);
      } else {
        
        console.log('received teacher object: ', teacher);
        console.log('content.js listener: ', teacher.avgRating);

        const avgRating = teacher.avgRating;
        const numRatings = teacher.numRatings;
        const avgDifficulty = teacher.avgDifficulty;
        const wouldTakeAgainPercent = parseInt(teacher.wouldTakeAgainPercent);
        const legacyId = teacher.legacyId;
        console.log('content.js listener: ', avgRating);
        console.log('content.js listener: ', numRatings);
        console.log('content.js listener: ', legacyId);

        // if the professor has no ratings, RMP will return -1 for this field
        if (wouldTakeAgainPercent === -1) {
          insertNoRatingsError(link, legacyId);
          return;
        }

      // Insert the average rating next to the link
      insertNumRatings(link, numRatings, legacyId);
      insertWouldTakeAgainPercent(link, wouldTakeAgainPercent);
      insertAvgDifficulty(link, avgDifficulty);
      insertRating(link, avgRating);
    }
    });
  } catch (error) {
    // Insert an error message if the request fails
    insertError(link, error);
  }
});

function insertRating(link, avgRating) {
  console.log('insertRating: ', avgRating);
  link.insertAdjacentHTML('afterend', `<div class="rating">Rating: ${avgRating}/5</div>`);
}

function insertAvgDifficulty(link, avgDifficulty) {
  console.log('insertAvgDifficulty: ', avgDifficulty);
  link.insertAdjacentHTML('afterend', `<div>Difficulty: ${avgDifficulty}/5</div>`);
}

function insertWouldTakeAgainPercent(link, wouldTakeAgainPercent) {
  console.log('insertWouldTakeAgainPercent: ', wouldTakeAgainPercent);
  link.insertAdjacentHTML('afterend', `<div class="rating">${wouldTakeAgainPercent}% of students would take again.</div>`);
}

function insertNumRatings(link, numRatings, legacyId) {
  const profLink = `<a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>${numRatings} ratings</a>`;
  console.log('insertNumRatings: ', numRatings);
  link.insertAdjacentHTML('afterend', `<div>${profLink}</div>`);
}

function insertNoRatingsError(link, legacyId) {
  link.insertAdjacentHTML('afterend', `<div class="rating">Error: this professor has <a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>no ratings on RateMyProfessors.</a></div>`);
}

function insertNoProfError(link) {
  link.insertAdjacentHTML('afterend', `<div class="rating">Error: this professor is not registered on RateMyProfessors.</div>`);
}