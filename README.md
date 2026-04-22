LexAI: AI-Powered Legal Intelligence

LexAI is a sophisticated Senior Corporate Legal Risk Advisor platform built to analyze complex legal documents. It leverages state-of-the-art AI models to identify risks, provide prescriptive solutions, and summarize contracts in plain English.

🚀 Key Features

Deep Clause Extraction: Automatically decomposes complex PDF documents into individual, searchable clauses for granular analysis.

Automated Risk Scoring: Uses a specialized legal-tuned model to assign risk levels (HIGH, MEDIUM, LOW) to each identified clause based on industry standards.

Prescriptive Solutions: Beyond simple identification, the platform provides actionable "Proposed Solutions" and "Replacement Clauses" to help mitigate legal liabilities.

Visual Intelligence Suite: Interactive UI for reviewing highlights and expert recommendations within a unified document view.

Multi-Category Analysis: Categorizes risks into domains such as Liability, Termination, Intellectual Property, and Confidentiality.

🛠️ Tech Stack

Frontend

Framework: Next.js 16.1.6 (App Router)

Library: React 19.2.3

Styling: Tailwind CSS 4 with @tailwindcss/postcss

Animations: Framer Motion 12

Icons: Lucide React

Backend & AI

Database & Backend: Convex 1.32.0

Authentication: Clerk Next.js 7.0.1

AI Engine: OpenAI gpt-4o-mini via AI SDK

PDF Processing: pdfjs-dist, pdf-parse, and react-pdf

🏗️ Core Architecture & Logic

Document Analysis Workflow

The analysis process follows a strict pipeline defined in the analyze API route:

PDF Fetching: Retrieves the document from Convex storage.

Text Extraction: Extracts full text and precise coordinate items for bounding-box mapping.

Clause Splitting: Breaks the document into manageable legal clauses.

AI Analysis: Each clause is analyzed by analyzeClause, which uses a system prompt characterizing the AI as a "Senior Corporate Legal Risk Advisor".

Annotation Mapping: Matches AI results back to document coordinates to generate interactive visual overlays.

Data Model

The schema is managed via Convex and consists of two primary tables:

documents: Stores metadata including userId, fileName, fileUrl, and the current processing status (uploading, processing, ready, or error).

annotations: Stores the AI-generated insights, including riskLevel, explanation, proposedSolution, replacementClause, and boundingBox coordinates for UI highlighting.

🚦 Getting Started

Prerequisites

Node.js 20+

A Convex account for the backend.

A Clerk account for authentication.

An OpenAI API key.

Environment Setup

Create a .env.local file with the following keys:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
OPENAI_API_KEY=


Installation

Clone the repository:

git clone [repository-url]
cd lexai


Install dependencies:

npm install


Run the development server:

npm run dev


Deploy Convex:

npx convex dev


📖 Deployment

The easiest way to deploy LexAI is via the Vercel Platform. Ensure all environment variables and the Convex production deployment are configured.
