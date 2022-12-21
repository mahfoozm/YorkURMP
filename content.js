// listen for messages from background script
chrome.runtime.onMessage.addListener(function(message) {
  if (message.type == 'find-text') {
    // make an HTTP request to the RMp (THIS DOESNT WORK RN)
    fetch('https://www.ratemyprofessors.com/professor?tid=2225176')
      .then(response => response.text())
      .then(html => {
        // parse HTML to create DOM tree
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // get div element with specified class
        const div = doc.querySelector('.RatingValue__Numerator-qw8sqy-2.liyUjw');

        // get text inside div element
        const text = div.textContent;

        // get all a tags on YU page
        const links = document.querySelectorAll('a');

        // loop through a tags
        links.forEach(link => {
          // get the text inside the a tag
          const linkText = link.textContent;

          // create new element to hold text from RMP
          const textElement = document.createElement('div');
          textElement.textContent = text;

          // append text to page
          link.appendChild(textElement);
        });
      })
      .catch(error => console.error(error));
  }
});