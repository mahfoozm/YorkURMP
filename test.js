const ratings = require('@mtucourses/rate-my-professors').default;

(async () => {

    const profName = 'Hossein Kassiri';
    const basicProfInfo = await ratings.searchTeacher(profName, 'U2Nob29sLTE0OTU=');

    const id = basicProfInfo[0].id;
    console.log(basicProfInfo);
    //console.log(id);

    // get the profs avg rating
    const profInfo = await ratings.getTeacher(id);
    const avgRating = profInfo.avgRating;

    //console.log(profInfo);
    console.log(avgRating);
    console.log("https://www.ratemyprofessors.com/professor?tid=" + profInfo.legacyId);

})();
