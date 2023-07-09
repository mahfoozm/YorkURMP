# YorkURMP
Rate My Professors extension for the YorkU course portal and VSB

Pulls data from the Rate My Professors GraphQL API (https://www.ratemyprofessors.com/graphql)

[Chrome Web Store](https://chrome.google.com/webstore/detail/yorkurmp/cdhfogbjpedkpmapnddalehbjdjahfmp?hl=en)

## Screenshots

Currently, the extension will display the professors RMP rating, avg difficulty, percentage of students that would take again, and num of ratings with a hyperlink to the prof's RMP page.

![Normal response](https://i.imgur.com/dO7FgVe.png)

If a professor is not found, the following error will be displayed.

![No prof found](https://i.imgur.com/JasZgiI.png)

If a professor is found, but they have no ratings, the following error will be displayed.

![No ratings](https://i.imgur.com/wieXkVR.png)

RMP info is now shown in Visual Schedule Builder (VSB).

![vsbss3 (1)](https://github.com/mahfoozm/YorkURMP/assets/95328615/cef40c34-0d81-45aa-8110-95cb980c2e40)

Tooltips are also shown when hovering over the professors name.

![image](https://github.com/mahfoozm/YorkURMP/assets/95328615/7d50f11b-2e08-431c-804a-c54625208fd2)


## Safari support

Safari support was recently added, however Apple requires that developers purchase a $99 license to publish Safari extensions (no thanks). I've built the extension for Safari anyways and added it to the latest release in case it's possible to install Safari extensions outside of the app store, but I'm not sure if this is possible.

## Releases vs Chrome Web Store

I have recently updated the extension to include support for MV3 (see mv3 branch, background.js rewritten) which enables it to be published on the Chrome Web Store. This update involved several modifications, such as the implementation of a self-hosted CORS proxy. For those who prefer it, I will continue to host the Manifest V2 extension in the releases tab. Note that there is no significant difference in performance between the two versions.

## Privacy Policy

Chrome Web Store extensions require a privacy policy. I am not collecting or storing any of your data.

## Modifying to use with other university course portals

Adapting this extension for use with other universities should be easy-- just change SCHOOL_ID to match your school's unique ID, and then modify the document.querySelectorAll() method to work with your course portal (find the element in which professor names are stored on your universities course portal, and modify querySelectorAll to look for this element). You might need to change the way professor info is displayed on the course portal. Remember to update permissions in manifest.json to match your course portals URL. 
