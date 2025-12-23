DataViz Pro

DataViz Pro is a frontend-heavy data analytics application that converts Excel and CSV files into interactive dashboards with explainable insights, running entirely in the browser.

Live Demo

URL: 

Version: v1.0.0 (Launch Edition)

Overview

DataViz Pro enables fast exploratory data analysis without BI tools or backend setup.

After uploading a dataset, the app automatically:

Detects column types and relationships

Generates interactive charts

Evaluates data quality

Surfaces explainable AI insights

Allows exporting and sharing results

All processing happens client-side. No data is stored or sent to a server.

Features
Data Upload & Parsing

Excel (.xlsx, .xls) and CSV support

Drag-and-drop upload

File validation (≤10MB, ≤100K rows, ≤100 columns)

Multi-sheet Excel handling

Real-time parsing feedback and errors

Dashboards & Visualization

Responsive grid layout

Bar, Line, Pie, Area, Scatter charts

Configurable axes and aggregations (sum, avg, count, min, max)

Analyst, Business, and Executive view modes

Data Quality & Profiling

Overall data quality score (0–100)

Detection of missing values, duplicates, and outliers

Column-level health metrics

Statistical summaries and correlation analysis

AI Insights

Automatic detection of trends, anomalies, and correlations

Confidence scores with explainability

Graceful fallback to local analysis if AI is unavailable

Clear messaging for weak or inconclusive insights

Export & Trust

Export dashboards as PNG or PDF

Download dashboard configuration as JSON

Built-in sample datasets for quick demos

Privacy-first design: data never leaves the browser

Use Cases

Exploratory data analysis

Dataset validation before modeling

Executive-level summaries from raw data

Not intended to replace enterprise BI platforms (e.g., Power BI, Tableau).

Tech Stack

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Recharts

Framer Motion

Lovable AI (Edge Functions)

Getting Started
Run Locally
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev

Edit with Lovable

Edit the project directly using Lovable:

https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

Changes made via Lovable are automatically committed to this repository.

Deployment

Deploy directly from Lovable:

Share → Publish

Custom domains can be configured through project settings.

Author

Kirankumar Vasala
Full Stack Software Engineer