# GitHub Resume Generator

GitHub profile to resume-style page generator built with Next.js.

---

## About the Project

### Objective

Build an application that generates a resume-style layout from a public GitHub profile.

The project focuses on:

- API data fetching
- Data selection logic
- Error handling

---

## Project Overview

The application includes the following features:

- **Profile Fetching**  
  Retrieve public profile data from the GitHub API.

- **Repository Selection**  
  Fetch up to 100 public repositories.  
  Primary selection: non-fork repositories with description and stars.  
  Fallback selection: non-fork repositories sorted by last update.

- **Skills Computation**  
  Compute top languages based on repository usage.

- **Error Handling**  
  Handle user not found, repository fetch failure and GitHub rate limit.

- **Print to PDF**  
  Generate a printable resume layout using the browser print function.

---

## Built With

![Next.js](https://img.shields.io/badge/Next.js-000000.png?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

![npm](https://img.shields.io/badge/npm-CB3837?style=flat&logo=npm&logoColor=white)

---

## Features

- Fetch GitHub profile data
- Fetch and filter repositories
- Intelligent repository selection with fallback logic
- Compute top languages
- Loading state handling
- Error handling (404, rate limit, fetch errors)
- Print to PDF functionality

---

## Installation

```bash
git clone https://github.com/m-amroune/github-resume-generator.git
cd github-resume-generator
npm install
npm run dev
```
