import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "ExpenseIQ – Smart Expense Tracker",
  description: "Track, analyze, and manage your expenses intelligently",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{margin:0,padding:0}}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1120',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0f1120' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f1120' } },
          }}
        />
      </body>
    </html>
  );
}
