# GitHub Resume Generator

GitHub profile to resume-style page generator built with Next.js.

[Live Demo](https://m-a-github-resume-generator.vercel.app/)

![GitHub Resume Generator preview](./public/assets/github_resume.png)

---

## About the Project

### Objective

Build an application that generates a resume-style layout from a public GitHub profile.

The project focuses on:

- GitHub API integration
- Repository selection and ordering
- Client-side data caching
- Error handling
- Printable resume generation

---

## Features

- Fetch public GitHub profile data and up to 100 repositories
- Automatically select the most relevant non-fork repositories
- Choose how many repositories to display: 6, 10, 15 or 20
- Manually include, exclude and reorder repositories
- Display GitHub activity metrics: public repositories, total stars, total forks and repositories updated in the last 12 months
- Compute global language percentages from all retrieved non-fork repositories
- Display repository stars, forks, main language and last update date
- Cache recent profile searches with TanStack Query
- Handle invalid usernames, API errors and GitHub rate limits
- Generate a printable resume using the browser print function

---

## Built With

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/m-amroune/github-resume-generator.git
cd github-resume-generator
