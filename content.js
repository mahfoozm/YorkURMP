const professorLinks = document.querySelectorAll('td[width="15%"] a');

professorLinks.forEach(link => {
  const professorName = link.textContent;
  console.log(professorName)
  chrome.runtime.sendMessage({
    type: 'fetch-rating',
    professorName: professorName
  }, response => {
    if (response.error) {
      console.error(response.error);
    } else {
      const rating = response.rating;
      link.insertAdjacentHTML('afterend', `<div>${rating}</div>`);
    }
  });
});
