const ratings = require('@mtucourses/rate-my-professors').default;
console.log("background.js loaded");

async function getAvgRating(profName) {

  const basicProfInfo = await ratings.searchTeacher(profName, 'U2Nob29sLTE0OTU=');
  
  console.log(basicProfInfo);
  if (!basicProfInfo || basicProfInfo.length === 0) {
    return { error: 'Professor not found' };
  }

  const id = basicProfInfo[0].id;
  const profInfo = await ratings.getTeacher(id);
  const avgRating = profInfo.avgRating;
  console.log(avgRating);
  
  return avgRating;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received message from content script:', request);
  console.log(request.professorName);

  getAvgRating(request.professorName).then(response => {
    sendResponse(response);
  });
  return true;
});
