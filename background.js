// lots of annoying stuff to get around CORS and MV3 restrictions

// publicly available token, yorkU school ID
const AUTH_TOKEN = 'dGVzdDp0ZXN0';

// currently saerching for profs at:
// YorkU (Keele and Glendon), TMU, and UofT (SG)
const SCHOOL_IDS = [
  "U2Nob29sLTE0OTU=",
  "U2Nob29sLTEyMTI1",
  "U2Nob29sLTE0NzE=",
  "U2Nob29sLTE0ODQ=",
];

// for searchProfessor and getProfessor, use a self hosted proxy to bypass CORS restrictions
const searchProfessor = async (name, schoolIDs) => {
  for (const schoolID of schoolIDs) {
    const response = await fetch(
      // self hosted proxy
      `https://www.ratemyprofessors.com/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          query: `query NewSearchTeachersQuery($text: String!, $schoolID: ID!) {
          newSearch {
            teachers(query: {text: $text, schoolID: $schoolID}) {
              edges {
                cursor
                node {
                  id
                  firstName
                  lastName
                  school {
                    name
                    id
                  }
                }
              }
            }
          }
        }`,
          variables: {
            text: name,
            schoolID,
          },
        }),
      }
    );
    const json = await response.json();
    if (json.data.newSearch.teachers.edges.length > 0) {
      return json.data.newSearch.teachers.edges.map((edge) => edge.node);
    }
  }
  return [];
};


const getProfessor = async (id) => {
  const response = await fetch(
    // self hosted proxy
    `https://www.ratemyprofessors.com/graphql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        query: `query TeacherRatingsPageQuery($id: ID!) {
        node(id: $id) {
          ... on Teacher {
            id
            firstName
            lastName
            school {
              name
              id
              city
              state
            }
            avgDifficulty
            avgRating
            department
            numRatings
            legacyId
            wouldTakeAgainPercent
          }
          id
        }
      }`,
        variables: {
          id,
        },
      }),
    }
  );
  const json = await response.json();
  return json.data.node;
};


async function sendProfessorInfo(professorName) {
  // normalize the prof's name before sending to RMP API
  // (the source of all of my pain)
  const normalizedName = professorName.normalize("NFKD");
  const professors = await searchProfessor(normalizedName, SCHOOL_IDS);

  if (professors.length === 0) {
    // try searching without the middle name/initial
    const names = normalizedName.split(" ");
    if (names.length >= 2) {
      const modifiedName = `${names[0]} ${names[names.length - 1]}`;
      const modifiedProfessors = await searchProfessor(modifiedName, SCHOOL_IDS);

      if (modifiedProfessors.length === 0) {
        return { error: "Professor not found" };
      }

      const professorID = modifiedProfessors[0].id;
      const professor = await getProfessor(professorID);
      return professor;
    }

    return { error: "Professor not found" };
  }

  const professorID = professors[0].id;
  const professor = await getProfessor(professorID);
  return professor;
}

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((request) => {
    sendProfessorInfo(request.professorName).then((professor) => {
      port.postMessage(professor);
    }).catch((error) => {
      console.log('Error:', error);
      port.postMessage({error});
    });
  });
});