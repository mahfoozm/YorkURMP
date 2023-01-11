# YorkURMP
Rate My Professors extension for the YorkU course portal

Pulls data from the Rate My Professors GraphQL API (https://www.ratemyprofessors.com/graphql)

## Screenshots

Currently, the extension will display the professors RMP rating, avg difficulty, percentage of students that would take again, and num of ratings with a hyperlink to the prof's RMP page.

![Normal response](https://i.imgur.com/dO7FgVe.png)

If a professor is not found, the following error will be displayed.

![No prof found](https://i.imgur.com/JasZgiI.png)

If a professor is found, but they have no ratings, the following error will be displayed.

![No ratings](https://i.imgur.com/wieXkVR.png)

This extension can only be added as an unpacked extension (on chrome) for the time being, as it needs to be converted from MV2 to MV3 to be uploaded on the Chrome Web Store. See the releases tab for an easier download & installation instructions. 

Safari support was recently added, however Apple requires that developers purchase a $99 license to publish Safari extensions (no thanks). I've built the extension for Safari anyways and added it to the latest release in case it's possible to install Safari extensions outside of the app store, but I'm not sure if this is possible.

## Modifying to use with other university course portals

Adapting this extension for use with other universities should be easy-- just change SCHOOL_ID to match your school's unique ID, and then modify the document.querySelectorAll() method to work with your course portal (find the element in which professor names are stored on your universities course portal, and modify querySelectorAll to look for this element). You might need to change the way professor info is displayed on the course portal. Remember to update permissions in manifest.json to match your course portals URL. 
