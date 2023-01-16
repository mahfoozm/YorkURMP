// This file is responsible for handling the communication between the extension and the website
// It sends a message to the background script to retrieve the professor's info from RMP
// The background script then sends the info back to this script, which inserts it into the page
// The background script is necessary because the website is not allowed to make requests to RMP
// due to CORS restrictions.

// publicly available token, yorkU school ID
const AUTH_TOKEN = 'dGVzdDp0ZXN0';
const SCHOOL_ID = 'U2Nob29sLTE0OTU=';

// for searchProfessor and getProfessor, use a self hosted proxy to bypass CORS restrictions
const searchProfessor = async (name, schoolID) => {
  const response = await fetch(
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
  if (json.data.newSearch.teachers === null) {
    return [];
  }

  return json.data.newSearch.teachers.edges.map((edge) => edge.node);
};


const getProfessor = async (id) => {
  const response = await fetch(
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
  // normalize the professor's name to match the format used by RMP's GraphQL API
  // (the source of all of my pain)
  const normalizedName = professorName.normalize('NFKD');
  const professors = await searchProfessor(normalizedName, SCHOOL_ID);

  if (professors.length === 0) {
    return { error: 'Professor not found' };
  }
  
  const professorID = professors[0].id;
  const professor = await getProfessor(professorID);
  console.log(professor);
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