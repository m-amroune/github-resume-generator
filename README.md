# GitHub Resume Generator

GitHub profile to resume-style page generator built with Next.js.

## Live Demo

[View the application](https://m-a-github-resume-generator.vercel.app/)

![GitHub Resume Generator preview](./public/assets/github_resume.png)

---

## About the Project

### Objective

Build an application that generates a resume-style layout from a public GitHub profile.

The project focuses on:

- API data fetching
- Data selection logic
- Error handling
- Responsive design
- Print-friendly layout
- Unit and component testing

---

## Project Overview

The application includes the following features:

- **Profile Fetching**  
  Retrieve public profile data from the GitHub API.

- **Repository Selection**  
  Fetch public repositories and automatically select up to 6 projects.  
  The primary selection keeps non-fork repositories with a description and at least one star, sorted by star count.  
  If no repository matches these conditions, the application falls back to non-fork repositories with a description, sorted by last update.

- **Skills Computation**  
  Compute up to 5 top languages based on the repositories displayed in the resume.

- **Username Validation**  
  Validate GitHub usernames before sending the request.

- **Error Handling**  
  Handle user not found, repository fetch failure and GitHub rate limit.

- **Responsive Layout**  
  Adapt the generator and generated resume to smaller screen sizes.

- **Print to PDF**  
  Generate a print-friendly resume layout using the browser print function.

- **Testing**  
  Unit and component tests with Jest and React Testing Library.

---

## Built With

![Next.js](https://img.shields.io/badge/Next.js-000000.png?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=flat&logo=testinglibrary&logoColor=white)

![npm](https://img.shields.io/badge/npm-CB3837?style=flat&logo=npm&logoColor=white)

---

## Features

- Fetch GitHub profile data
- Fetch and filter repositories
- Automatic repository selection with fallback logic
- Display up to 6 repositories
- Compute up to 5 top languages
- Validate GitHub usernames
- Loading state handling
- Error handling (404, rate limit, fetch errors)
- Responsive resume layout
- Print to PDF functionality
- Unit and component tests

---


---

## Installation

```bash
git clone https://github.com/m-amroune/github-resume-generator.git
cd github-resume-generator
npm install
npm run dev
```
