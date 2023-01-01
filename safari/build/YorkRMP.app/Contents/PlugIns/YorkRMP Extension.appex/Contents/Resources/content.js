// Description: This script is injected into the page when the extension is enabled.
// It sends a message to the background script to retrieve the professor's info from RMP.
// The background script then sends the info back to this script, which inserts it into the page.

// css to add space between prof name and rating
const style = document.createElement('style');
style.innerHTML = `
  .rating {
    margin-top: 7px;
  }
`;

document.head.appendChild(style);
const professorLinks = document.querySelectorAll('td[width="15%"] a');
professorLinks.forEach(async (link) => {
  const professorName = link.textContent;

  try {
    const port = chrome.runtime.connect({name: 'professor-rating'});
    port.postMessage({professorName});
    port.onMessage.addListener((teacher) => {

      // If the professor is not registered on RMP, the background script will return an error message
      if (teacher.error) {
        insertNoProfError(link);
      } else {
        // get the professor's info from the response
        const avgRating = teacher.avgRating;
        const numRatings = teacher.numRatings;
        const avgDifficulty = teacher.avgDifficulty;
        const wouldTakeAgainPercent = parseInt(teacher.wouldTakeAgainPercent);
        const legacyId = teacher.legacyId;

        // if the professor has no ratings, RMP will return -1 for this field
        if (wouldTakeAgainPercent === -1) {
          insertNoRatingsError(link, legacyId);
          return;
        }

      // insert the professor's info into the page
      insertNumRatings(link, numRatings, legacyId);
      insertWouldTakeAgainPercent(link, wouldTakeAgainPercent);
      insertAvgDifficulty(link, avgDifficulty);
      insertRating(link, avgRating);
    }
    });
  } catch (error) {
    // insert an error message if the request fails
    insertNoProfError(link);
  }
});

// helper functions to insert the professor's info into the page

function insertRating(link, avgRating) {
  link.insertAdjacentHTML('afterend', `<div class="rating"><b>Rating:</b> ${avgRating}/5</div>`);
}

function insertAvgDifficulty(link, avgDifficulty) {
  link.insertAdjacentHTML('afterend', `<div><b>Difficulty:</b> ${avgDifficulty}/5</div>`);
}

function insertWouldTakeAgainPercent(link, wouldTakeAgainPercent) {
  link.insertAdjacentHTML('afterend', `<div class="rating"><b>${wouldTakeAgainPercent}%</b> of students would take this professor again.</div>`);
}

function insertNumRatings(link, numRatings, legacyId) {
  const profLink = `<a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>${numRatings} ratings</a>`;
  link.insertAdjacentHTML('afterend', `<div>${profLink}</div>`);
}

function insertNoRatingsError(link, legacyId) {
  link.insertAdjacentHTML('afterend', `<div class="rating"><b>Error:</b> this professor has <a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>no ratings on RateMyProfessors.</a></div>`);
}

function insertNoProfError(link) {
  link.insertAdjacentHTML('afterend', `<div class="rating"><b>Error:</b> this professor is not registered on RateMyProfessors.</div>`);
}