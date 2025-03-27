import { Providers } from './providers'
import ThemeRegistry from '@/components/ThemeRegistry'

export const metadata = {
  title: "FaceChat App",
  description: "A secure chat application with face recognition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </Providers>
      </body>
    </html>
  );
}
