# PTT Translation Proofreading Workbench

This is a full-stack web application designed to analyze the translation quality of PTT (a popular Taiwanese forum) articles. The application scrapes a given PTT article, uses the Google Gemini API to perform a detailed linguistic analysis, and presents the results in a user-friendly, interactive "Annotated Post" view.

This tool is perfect for users who want to quickly proofread and verify the accuracy of community-translated content, such as foreign news or articles.

## Core Features

* **PTT Article Scraping**: Fetches the full text content from any PTT article URL.
* **Intelligent Source Detection**: Automatically finds external source links (e.g., to news sites) within the PTT post and uses that as the ground truth for the original text, ensuring higher accuracy.
* **Advanced AI Analysis**: Leverages the Gemini API with a fine-tuned prompt to act as a meticulous localization editor, identifying not just grammatical errors but also subtle issues in tone, nuance, and style.
* **Annotated Post UI**: A streamlined single-view interface that displays the full post and highlights potential errors directly in the text.
* **"Super Tooltip"**: Hovering over an error reveals a detailed tooltip with the original source sentence for context, the AI's suggested correction, and a clear explanation.
* **Persistent Local Storage**: All analyses are saved directly in your browser, allowing you to close the tab and return to your work later.
* **Responsive Design**: A clean, modern UI built with Tailwind CSS that works seamlessly on desktop and mobile devices.

## Technology Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **UI Library**: [React](https://reactjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Backend API**: Next.js API Routes
* **Web Scraping**: [Cheerio](https://cheerio.js.org/)
* **AI Model**: [Google Gemini API](https://ai.google.dev/)

## Setup and Installation

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ptt-workbench
```

### 2. Install Dependencies

Install the necessary Node.js packages 
```bash
using npm.
npm install
```

### 3. Set Up Environment Variables

Create a new file named .env.local in the root directory of your project. This file will hold your secret API key.
```bash
GEMINI_API_KEY=your_actual_api_key_here

```
Replace `your_actual_api_key_here` with your real Google Gemini API key.

## Running the Application

```bash
npm run dev

```
This will start the application with Turbopack for fast development. Open your browser and navigate to the following URL to see the application in action:  

http://localhost:3000
