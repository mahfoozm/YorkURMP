const ratings = require('@mtucourses/rate-my-professors').default;
console.log("background script loaded");

(async () => {
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('received message from content script:', request)
    console.log(request.professorName);

    const profName = request.professorName;
    const basicProfInfo = await ratings.searchTeacher(profName, 'U2Nob29sLTE0OTU=');

    console.log(basicProfInfo);
    const id = basicProfInfo[0].id;

    //get the profs avg rating
    const profInfo = await ratings.getTeacher(id);
    const avgRating = profInfo.avgRating;
    
    console.log(avgRating);
    sendResponse({ message: 'test' });
    //}
  });
})();
