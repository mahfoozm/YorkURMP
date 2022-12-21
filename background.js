// rework this, graphql is deprecated

const rateMyProfessors = require('@mtucourses/rate-my-professors').default;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetch-rating') {
    const professorName = request.professorName;
    rateMyProfessors.searchTeacher(professorName)
      .then(rating => {
        sendResponse({ rating });
      })
      .catch(error => {
        sendResponse({ error });
      });
    return true;  // Required for sendResponse to work
  }
});