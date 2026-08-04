# Project Diary

---

## 📅 02 August 2026

### Objective

Finalize the project idea, set up the development environment, and prepare the repository for collaborative development.

### Work Completed

* Finalized the EPICS project idea: Civic Complaint Management Platform.
* Defined the project scope for Version 1.
* Planned AI features:

  * Complaint description generation
  * Language translation
  * Severity detection
  * Duplicate complaint detection
* Decided to develop the web application first, followed by a mobile application.
* Planned separate dashboards for Citizens and Authorities.
* Finalized the initial project folder structure.
* Created the GitHub repository.
* Created the development branch `yash-dev`.
* Installed Node.js.
* Resolved the PowerShell execution policy issue affecting npm.
* Created the React application using Vite.
* Successfully started the development server.

### Outcome

The project idea has been finalized, the development environment is fully configured, and the frontend project is ready for implementation.

### Next Steps

* Create the design system.
* Set up the frontend architecture.
* Design the Login, OTP, and Home screens.
* Prepare a prototype for the supervisor review.

---

## 📅 03 August 2026

### Objective

Build the frontend foundation and establish a collaborative development workflow.

### Work Completed

* Moved the complete project from OneDrive (C: drive) to `D:\projects\civic-connect` to avoid file locking and Git issues.
* Renamed the project branding from **Civic App** to **Civic Connect**.
* Configured Tailwind CSS v4.
* Installed and configured React Router.
* Created the frontend folder structure for scalable development.
* Added reusable layout components:

  * Navbar
  * Footer
  * Layout
* Created initial pages:

  * Landing
  * Login
  * Citizen Dashboard
  * Authority Dashboard
  * Not Found
* Removed the default Vite starter code.
* Created the first development milestone.
* Committed the initial frontend setup to the `yash-dev` branch.
* Created the first Pull Request.
* Resolved the README merge conflict.
* Successfully merged the Pull Request into the `main` branch.
* Established the Git workflow for future team collaboration using feature branches and Pull Requests.

### Outcome

A clean frontend foundation has been established. The project now follows a professional Git workflow and is ready for UI development.

### Next Steps

* Finalize the design system.
* Build responsive Login and OTP screens.
* Develop the Citizen Home page.
* Create the Report Issue page.
* Prepare an interactive prototype for supervisor review.

---

## Current Project Status

### Frontend

* React + Vite configured
* Tailwind CSS v4 configured
* React Router configured
* Initial folder structure created
* Layout components added
* Placeholder pages created

### Version 1 Features

* Citizen Dashboard
* Authority Dashboard
* Complaint Reporting
* AI-assisted complaint description
* AI language translation
* AI severity detection
* Duplicate complaint detection
* Leaderboard and digital certificates
* Leaflet map integration (planned)
* Email and OTP authentication

### Upcoming Milestone

Develop a clickable prototype demonstrating the complete user journey before the supervisor meeting.

**04 August 2026**

**Work Completed**

* Configured React Router and completed application routing.
* Connected Landing, Login, Citizen Dashboard, Authority Dashboard, and Not Found pages.
* Fixed routing issues caused by an empty `AppRoutes.jsx` file.
* Renamed React component files using PascalCase and updated imports.
* Verified the application runs successfully after routing integration.
* Committed and pushed the latest frontend changes to the `yash-dev` branch.

**Next Steps**

* Review and test Rudra's authentication module.
* Merge approved changes into the `main` branch.
* Continue developing the Citizen Complaint Reporting module.
