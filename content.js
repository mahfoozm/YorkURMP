const professorLinks = document.querySelectorAll('td[width="15%"] a');

professorLinks.forEach(link => {
  const professorName = link.textContent;
  console.log(professorName);
  
  chrome.runtime.sendMessage({ professorName }, (response) => {

    console.log(response);

    if (response.error) {
      link.insertAdjacentHTML('afterend', `<div>Error: ${response.error}</div>`);
    } else {
      link.insertAdjacentHTML('afterend', `<div>${response}/5</div>`);
    }

  });
});
