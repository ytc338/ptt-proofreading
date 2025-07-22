# PTT Translation Proofreading Workbench

This is a full-stack web application designed to analyze the translation quality of PTT (a popular Taiwanese forum) articles. The application scrapes a given PTT article, uses the Google Gemini API to perform a detailed linguistic analysis, and presents the results in a user-friendly, interactive "Annotated Post" view.

This tool is perfect for users who want to quickly proofread and verify the accuracy of community-translated content, such as foreign news or articles.

## Core Features

* **PTT Article Scraping**: Fetches the full text content from any PTT article URL.
* **Unique Article ID**: Utilizes the native PTT article ID for persistent and unique identification of analyses, preventing duplicates.
* **Intelligent Source Detection**: Automatically finds external source links (e.g., to news sites) within the PTT post and uses that as the ground truth for the original text, ensuring higher accuracy.
* **Advanced AI Analysis**: Leverages the Gemini API with a fine-tuned prompt to act as a meticulous localization editor, identifying not just grammatical errors but also subtle issues in tone, nuance, and style.
* **Annotated Post UI**: A streamlined single-view interface that displays the full post and highlights potential errors directly in the text.
* **"Super Tooltip"**: Hovering over an error reveals a detailed tooltip with the original source sentence for context, the AI's suggested correction, and a clear explanation.
* **Persistent Local Storage**: All analyses are saved directly in your browser, allowing you to close the tab and return to your work later.
* **Enhanced UI for Readability**: Improved layout for article titles, allowing full titles to wrap without truncation, ensuring a clean and readable interface.
* **Robust Title Handling**: Implemented fallback mechanisms to ensure article titles are always displayed, even if AI extraction fails.
* **Responsive Design**: A clean, modern UI built with Tailwind CSS that works seamlessly on desktop and mobile devices.

## Technology Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **UI Library**: [React](https://reactjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Backend API**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Web Scraping**: [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) (Python)
* **AI Model**: [Google Gemini API](https://ai.google.dev/)

## Setup and Installation

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ptt-workbench
```

### 2. Set Up Environment Variables

Create a new file named `.env` in the root directory of your project. This file will hold your secret API key.

```
GEMINI_API_KEY=your_actual_api_key_here
```
Replace `your_actual_api_key_here` with your real Google Gemini API key.

## Running the Application

### Using Docker Compose (Recommended)

This is the easiest way to get both the frontend and backend running.

1.  Ensure you have Docker and Docker Compose installed.
2.  From the project root directory, run:
    ```bash
    docker-compose up --build
    ```
3.  Open your browser and navigate to `http://localhost:3000` to see the application in action.

### Manual Setup (for Development)

If you prefer to run the services manually for development purposes:

**Install Dependencies:**

Install the necessary Node.js packages for the frontend and Python packages for the backend.

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

**Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload
cd ..
```

**Start Frontend:**
```bash
cd frontend
npm run dev
cd ..
```
Open your browser and navigate to `http://localhost:3000` to see the application in action.
