const professorLinks = document.querySelectorAll('td[width="15%"] a');

professorLinks.forEach(link => {
  const professorName = link.textContent;
  console.log(professorName);
  
  chrome.runtime.sendMessage({ professorName }, (response) => {

    console.log(response);
       
      const avgRating = response;
      link.insertAdjacentHTML('afterend', `<div>${avgRating}</div>`);

  });
});
