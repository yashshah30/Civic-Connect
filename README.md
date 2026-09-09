# Civic Connect

Civic Connect is a civic complaint management platform that allows citizens to report complaints, track their status, receive notifications, and interact with civic authorities.

## Installation Instructions

### Prerequisites

Before setting up the project, make sure you have the following installed:

- Node.js
- npm
- Git
- A code editor such as Visual Studio Code

### Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/yashshah30/Civic-Connect.git
```

Move into the project directory:

```bash
cd Civic-Connect
```

### Install Frontend Dependencies

Move to the frontend directory:

```bash
cd apps/web
```

Install the required packages:

```bash
npm install
```

### Install Backend Dependencies

From the project root, move to the backend directory:

```bash
cd apps/server
```

Install the required packages:

```bash
npm install
```

## Environment Variables

The project requires environment variables for both the frontend and backend.

Environment files contain configuration values and sensitive credentials. Do not commit actual `.env` files or secret keys to GitHub.

### Frontend Environment Variables

Create a `.env` file inside:

```text
apps/web/
```

Add the following variables:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

Description:

- `VITE_API_URL` - URL of the Civic Connect backend API.
- `VITE_SUPABASE_URL` - Supabase project URL used by the frontend.
- `VITE_SUPABASE_KEY` - Supabase key used by the frontend.

### Backend Environment Variables

Create a `.env` file inside:

```text
apps/server/
```

Add:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=5000
```

Description:

- `SUPABASE_URL` - Supabase project URL used by the backend.
- `SUPABASE_KEY` - Supabase key used by the backend.
- `PORT` - Port on which the backend server runs.

> Do not add real Supabase credentials to the repository.

## Local Setup

The frontend and backend need to run at the same time. Use two separate terminals.

### Start the Backend

Open the first terminal:

```bash
cd apps/server
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

Keep this terminal running.

### Start the Frontend

Open a second terminal:

```bash
cd apps/web
npm run dev
```

Vite will display the local development URL in the terminal, typically:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

## Project Structure

```text
Civic-Connect/
├── apps/
│   ├── server/       # Backend application
│   └── web/          # Frontend application
├── LICENSE
├── PROJECT_DIARY.md
└── README.md
```

## Development

Frontend development server:

```bash
cd apps/web
npm run dev
```

Backend development server:

```bash
cd apps/server
npm run dev
```

For Windows PowerShell systems where `npm` execution is blocked, the commands can also be run using:

```powershell
npm.cmd install
npm.cmd run dev
```