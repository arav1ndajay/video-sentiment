import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-900 text-gray-200`} suppressHydrationWarning>
          <div>
            <header className="bg-gray-800 shadow">
              <div className="max-w-7xl mx-auto py-6 px-6 sm:px-6 lg:px-8 flex justify-center items-center">
                <h1 className="text-3xl font-bold text-white">
                  Product Review Sentiment Analyzer
                </h1>
              </div>
            </header>
            <main>
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            {/* <footer className="bg-gray-800 shadow mt-10">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
                <p>© 2025 Product Review Sentiment Analyzer</p>
              </div>
            </footer> */}
          </div>
      </body>
    </html>
  );
}