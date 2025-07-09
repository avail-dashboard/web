import React from 'react'
import Link from 'next/link'

export const Footer = React.memo(function Footer() {
  return (
    <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Built by Vineet Kumar. Check out my resume:{' '}
              <a
                href="https://vineetk1998.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-avail-600 transition-colors hover:underline"
              >
                vineetk1998.github.io
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Exploring the Avail blockchain network
            </p>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/blocks"
              className="text-muted-foreground hover:text-avail-600 transition-colors"
            >
              Blocks
            </Link>
            <Link
              href="/extrinsics"
              className="text-muted-foreground hover:text-avail-600 transition-colors"
            >
              Transactions
            </Link>
            <Link
              href="/data-submissions"
              className="text-muted-foreground hover:text-avail-600 transition-colors"
            >
              Data Submissions
            </Link>
            <a
              href="https://docs.availproject.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-avail-600 transition-colors"
            >
              Docs
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Avail Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
})
