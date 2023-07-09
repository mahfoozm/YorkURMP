// complete disgusting mess might clean it up in another 6 months

// css mostly for vsb tooltip and fixing vsb nasty css
const style = document.createElement("style");
style.innerHTML = `
  .rating {
    margin-top: 7px;
  }
  .vsb-rating {
    margin-top: 5px;
  }
  .prof-tooltip {
    position: relative;
    display: inline-block;
    cursor: pointer;
    z-index: 9999;
  }
  .prof-tooltip .tooltip-text {
    visibility: hidden;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 5px;
    position: absolute;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s;
    width: 200px;
    pointer-events: none;
    left: -200px;
    top: -50px;
  }
  .prof-tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }
  .rightnclear {
    float: inherit;
    clear: both;
  }
`;

document.head.appendChild(style);

// map to keep track of processed data-selkey elements
const processedElements = new Map();

// YU Course page logic
async function handleYUProfessorInfo(link, professorName) {
  try {
    const port = chrome.runtime.connect({ name: "professor-rating" });
    port.postMessage({ professorName });
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
}

function positionTooltip(tooltipElement) {
  const tooltipHeight = tooltipElement.offsetHeight;
  tooltipElement.style.position = "absolute";
  tooltipElement.style.top = `-${tooltipHeight}px`;
  tooltipElement.style.left = "-150px";
}

// VSB logic
async function handleVSBProfessorInfo(element, professorName) {
  if (!/[a-zA-Z]/.test(professorName)) {
    return;
  }
  try {
    const port = chrome.runtime.connect({ name: "professor-rating" });
    port.postMessage({ professorName });
    port.onMessage.addListener((teacher) => {

      if (teacher.error) {
        insertVSBNoProfError(element);
        insertNoProfTooltip(element);

      } else {
        const avgRating = teacher.avgRating;
        const numRatings = teacher.numRatings;
        const avgDifficulty = teacher.avgDifficulty;
        const wouldTakeAgainPercent = parseInt(teacher.wouldTakeAgainPercent);
        const legacyId = teacher.legacyId;

        if (wouldTakeAgainPercent === -1) {
          insertVSBNoRatingsError(element, legacyId);
          insertNoRatingsTooltip(element, legacyId);
          return;
        }

        insertNumRatings(element, numRatings, legacyId);
        insertWouldTakeAgainPercent(element, wouldTakeAgainPercent);
        insertAvgDifficulty(element, avgDifficulty);
        insertVSBRating(element, avgRating);

        const tooltipContent = `
          <div><b>Rating:</b> ${avgRating}/5</div>
          <div><b>Difficulty:</b> ${avgDifficulty}/5</div>
          <div><b>${wouldTakeAgainPercent}%</b> of students would take this professor again.</div>
          <div><a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>${numRatings} ratings</a></div>
        `;

        const tooltip = document.createElement("div");
        tooltip.className = "tooltip-text";
        tooltip.innerHTML = tooltipContent;

        const tooltipContainer = document.createElement("span");
        tooltipContainer.className = "prof-tooltip";
        tooltipContainer.appendChild(element.cloneNode(true));
        tooltipContainer.appendChild(tooltip);
        element.parentNode.appendChild(tooltipContainer);
        positionTooltip(element);

        element.replaceWith(tooltipContainer);

        tooltipContainer.addEventListener("mouseenter", () => {
          tooltip.style.visibility = "visible";
        });

        tooltipContainer.addEventListener("mouseleave", () => {
        tooltip.style.visibility = "hidden";
        });
      }
    });
  } catch (error) {
    insertVSBNoProfError(element);
    insertNoProfTooltip(element);
  }
}

// monitor VSB prof names
function monitorProfessorNames() {
  const professorElements = document.querySelectorAll(
    '.rightnclear[title="Instructor(s)"]'
  );
  professorElements.forEach((element) => {
    const professorName = element.textContent.trim();
    const selkey = getSelkey(element);
    if (selkey && !processedElements.has(selkey)) {
      handleVSBProfessorInfo(element, professorName);
      processedElements.set(selkey, true);
    }
  });
}

// (sort of) avoid spamming the RMP API
function getSelkey(element) {
  const parent = element.closest(".selection_row");
  if (parent) {
    return parent.getAttribute("data-selkey");
  }
  return null;
}

// YU course page logic
const professorLinks = document.querySelectorAll('td[width="15%"] a');
professorLinks.forEach((element) => {
  const professorName = element.textContent.trim();
  handleYUProfessorInfo(element, professorName);
});


// observer stuff
const observer = new MutationObserver(() => {
  monitorProfessorNames();
});

const professorElements = document.querySelectorAll(
  '.rightnclear[title="Instructor(s)"]'
);

const handleProfessorElement = (element) => {
  if (element.classList.contains("prof-info-added")) {
    return;
  }

  const professorName = element.textContent.trim();
  handleVSBProfessorInfo(element, professorName);
  element.classList.add("prof-info-added");
};

professorElements.forEach(handleProfessorElement);

const legendBoxElement = document.querySelector(".legend_box");
const legendBoxObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const addedProfessorElements = document.querySelectorAll(
        '.rightnclear[title="Instructor(s)"]:not(.prof-info-added)'
      );
      addedProfessorElements.forEach(handleProfessorElement);
      break;
    }
  }
});

const observerConfig = {
  childList: true,
  subtree: true,
};

observer.observe(document.body, observerConfig);
legendBoxObserver.observe(legendBoxElement, observerConfig);


// helper functions to insert the prof info into the page (gross)
function insertRating(link, avgRating) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="rating"><b>Rating:</b> ${avgRating}/5</div>`
  );
}

function insertVSBRating(link, avgRating) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="vsb-rating"><b>Rating:</b> ${avgRating}/5</div>`
  );
}

function insertAvgDifficulty(link, avgDifficulty) {
  link.insertAdjacentHTML(
    "afterend",
    `<div><b>Difficulty:</b> ${avgDifficulty}/5</div>`
  );
}

function insertWouldTakeAgainPercent(link, wouldTakeAgainPercent) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="rating"><b>${wouldTakeAgainPercent}%</b> of students would take this professor again.</div>`
  );
}

function insertNumRatings(link, numRatings, legacyId) {
  const profLink = `<a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>${numRatings} ratings</a>`;
  link.insertAdjacentHTML("afterend", `<div>${profLink}</div>`);
}

function insertNoRatingsError(link, legacyId) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="rating"><b>Error:</b> this professor has <a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>no ratings on RateMyProfessors.</a></div>`
  );
}

function insertNoProfError(link) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="rating"><b>Error:</b> this professor is not registered on RateMyProfessors.</div>`
  );
}

function insertVSBNoRatingsError(link, legacyId) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="vsb-rating"><b>Error:</b> this professor has <a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>no ratings on RateMyProfessors.</a></div>`
  );
}

function insertVSBNoProfError(link) {
  link.insertAdjacentHTML(
    "afterend",
    `<div class="vsb-rating"><b>Error:</b> this professor is not registered on RateMyProfessors.</div>`
  );
}

function insertNoProfTooltip(element) {
  const tooltipContent = `<div><b>Error:</b> this professor is not registered on RateMyProfessors.</div>`;

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip-text error-tooltip";
  tooltip.innerHTML = tooltipContent;

  const tooltipContainer = document.createElement("span");
  tooltipContainer.className = "prof-tooltip";
  tooltipContainer.appendChild(element.cloneNode(true));
  tooltipContainer.appendChild(tooltip);
  element.parentNode.appendChild(tooltipContainer);
  positionTooltip(element);

  element.replaceWith(tooltipContainer);

  tooltipContainer.addEventListener("mouseenter", () => {
    tooltip.style.visibility = "visible";
    clearTimeout(timeoutId);
  });

  tooltipContainer.addEventListener("mouseleave", () => {
    timeoutId = setTimeout(() => {
      tooltip.style.visibility = "hidden";
    }, 1000);
  });
}

function insertNoRatingsTooltip(element, legacyId) {
  const tooltipContent = `
    <div><b>Error:</b> this professor has <a href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>no ratings on RateMyProfessors.</a></div>
  `;

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip-text error-tooltip";
  tooltip.innerHTML = tooltipContent;

  const tooltipContainer = document.createElement("span");
  tooltipContainer.className = "prof-tooltip";
  tooltipContainer.appendChild(element.cloneNode(true));
  tooltipContainer.appendChild(tooltip);
  element.parentNode.appendChild(tooltipContainer);
  positionTooltip(element);

  element.replaceWith(tooltipContainer);

  tooltipContainer.addEventListener("mouseenter", () => {
    tooltip.style.visibility = "visible";
    clearTimeout(timeoutId);
  });

  tooltipContainer.addEventListener("mouseleave", () => {
    timeoutId = setTimeout(() => {
      tooltip.style.visibility = "hidden";
    }, 1000);
  });
}
