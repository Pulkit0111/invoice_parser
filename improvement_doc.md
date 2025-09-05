# Improvement Required in the current Implementation

## General
- Entire frontend should be built using react and tailwind css. For creating the react project use vite, Do not use create-react-app as that is deprecated.
- Refer some document processing web applications and product over the web to understnd what kind of design language would be perfect for the project to place this at a level of production ready invoice processing application.
- Use `perplexity-ask` MCP to do the reserach over the internet.
- Use `Playwright` MCP to interact with the webpages to understnd the design of document processing applications and also for validating and testing the current implementation.
- Use `Context7` MCP to look for latest documentations where-ever required.
- Do not over complicate the implementations as i need to teach these to a bunch of beginners, all the frontend implementation should be beginner friendly.
- Persistance should be there over all the components even if i am refreshing the browser.

## Landing Page
- Currently as soon as a user lands on the product, the registration page is shown, Instead of this create a market and production ready Landing page such that if someone looks at it, Should be ready to use the product and pay money for it.
- The landing page should have some catchy hero sections and sample invoice images, these sample images can be document icons or processing icons whatever suits the best, as per your research.
- The landing page can be a single page with scrolling capability to showcase what can be done and all.
- There should be a button in the hero section saying "Try for Free", that should lead the user to registration page.
- Think hardest and do reseach over the internet.

## Specific Improvements

### Navbar
- There should be a navbar with following:
    - There can be the current invoice processing logo and text on the left side.
    - On the right side there can be two sections `Process` & `Dashboard` like the cureent implementation.
    - A user icon, when hovered over should be a drop down section with the option to `logout` for the user.

- The Navbar should be visible over `Process` & `Dashboard` section but not on the landing page and the registration & login page.

- Even the user is scrolling on certain sections of the application where navbar is visible it should always be on top.

### Resgitration
- In current implementation there is a button for registration, that button should be convverted into a loader while registering.
- Once the registration is done should give a notification and take user to the dahsboard or process section based on the following rules:
    - If the user has just registered, it shopuld take user to the process section.
    - If user has already processed few documents then it should take the user ti dashboard.

- Use modern elements for the registration form as per your research from the internet.

### Login
- The loading component should be a modal.
- While logging in , the login button should change to a laoder.
- There should be only one button `login`, no need of cancel button as an user can opt out of logging in by just pressing `esc` and closing the modal.

### Process Page
- Upload invoce and processed data sections hould be side by side not one below the other like the current implementation.
- Also once an image has been selcted or dragged and dropped in the section, it should only show the previes of the image, as in current implementation it is still showing the option to drag and drop.
- Till the time image is being processed, the section where the processed data is going to be showcased should have some loading animation like it's on all modern dat web applications.
- Once the data has been saved after clickig on the save to db button, that button should be diabled and should say saved.

### Dashboard
- Should show the processed image in a tabular form.
- A small thumbnail of the invoice preview should be there.
- There should be following things to showcase for each processed invoice:
    - Thumbnail of the processed invoice.
    - Invoice number
    - Processing confidence.
    - Delete icon tpo delete the invoice.
- once deleted the storage metric should also be adjusted accordingly on the dashboard.



