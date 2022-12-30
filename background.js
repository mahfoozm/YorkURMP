// This file is responsible for handling the communication between the extension and the website
// It sends a message to the background script to retrieve the professor's info from RMP
// The background script then sends the info back to this script, which inserts it into the page
// The background script is necessary because the website is not allowed to make requests to RMP
// due to CORS restrictions.

const {GraphQLClient, gql} = require('graphql-request');

// GraphQL queries to get the professor's info from RMP
const searchProfessorQuery = gql`
query NewSearchTeachersQuery($text: String!, $schoolID: ID!)
{
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
}
`;


const getProfessorQuery = gql`
query TeacherRatingsPageQuery(
  $id: ID!
) {
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
}
`;

// publicly available token, yorkU school ID
const AUTH_TOKEN = 'dGVzdDp0ZXN0';
const SCHOOL_ID = 'U2Nob29sLTE0OTU=';

const client = new GraphQLClient('https://www.ratemyprofessors.com/graphql', {
  headers: {
    authorization: `Basic ${AUTH_TOKEN}`
  }
});

const searchProfessor = async (name, schoolID) => {
  const response = await client.request(searchProfessorQuery, {
    text: name,
    schoolID
  });

  if (response.newSearch.teachers === null) {
    return [];
  }

  return response.newSearch.teachers.edges.map((edge) => edge.node);
};

const getProfessor = async (id) => {
  const response = await client.request(getProfessorQuery, {id});
  return response.node;
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