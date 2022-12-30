// background.js

const {GraphQLClient, gql} = require('graphql-request');
console.log("background.js loaded");

const searchTeacherQuery = gql`
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


const getTeacherQuery = gql`
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

const AUTH_TOKEN = 'dGVzdDp0ZXN0';

const client = new GraphQLClient('https://www.ratemyprofessors.com/graphql', {
  headers: {
    authorization: `Basic ${AUTH_TOKEN}`
  }
});

const searchTeacher = async (name, schoolID) => {
  console.log('searchTeacher called');
  console.log('searchTeacher: ', name);
  console.log('searchTeacher: ', schoolID);
  expected = 'Hossein Kassiri';
  console.log('searchTeacher: ', expected);
  const normalizedName = name.normalize('NFKD');
  console.log(expected.localeCompare(normalizedName));
  console.log('searchTeacher: ', name);
  const response = await client.request(searchTeacherQuery, {
    text: normalizedName,
    schoolID
  });

  console.log('response: ', response);
  if (response.newSearch.teachers === null) {
    return [];
  }

  return response.newSearch.teachers.edges.map((edge) => edge.node);
};

const getTeacher = async (id) => {
  const response = await client.request(getTeacherQuery, {id});

  return response.node;
};

async function sendTeacherInfo(professorName) {
  console.log('sendTeacherInfo func: ', professorName);
  const teachers = await searchTeacher(professorName, 'U2Nob29sLTE0OTU=');
  console.log('sendTeacherInfo func: ', teachers);

  if (teachers.length === 0) {
    return { error: 'Professor not found' };
  }
  
  const teacherID = teachers[0].id;
  const teacher = await getTeacher(teacherID);
  console.log('sendTeacherInfo func: ', teacher);

  return teacher;
}

// Wait for a connection from the content script
chrome.runtime.onConnect.addListener((port) => {
  console.log('received connection from content script');

  // When a message is received from the content script...
  port.onMessage.addListener((request) => {
    console.log('received message from content script:', request);

    // Retrieve the teacher object for the specified professor
    sendTeacherInfo(request.professorName).then((teacher) => {
      console.log('received teacher object: ', teacher);

      // Send the teacher object back to the content script
      port.postMessage(teacher);
    }).catch((error) => {
      console.log('error:', error);

      // Send the error message back to the content script
      port.postMessage({error});
    });
  });
});
