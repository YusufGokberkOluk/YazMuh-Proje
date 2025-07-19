"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8faf8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#13262F',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(121, 183, 145, 0.1)',
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: '#79B791',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '50%',
              marginRight: '8px'
            }}>é</span>
            tude
          </div>
          <nav style={{
            display: 'flex',
            gap: '16px'
          }}>
            <Link 
              href="/sign-in"
              style={{
                color: '#EDF4ED',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(121, 183, 145, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#79B791',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              backgroundColor: '#79B791',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '50%',
              marginRight: '8px'
            }}>é</span>
            <span style={{ color: '#13262F' }}>tude</span>
          </div>
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: '500',
          color: '#13262F',
          marginBottom: '8px'
        }}>
          Welcome to étude
        </h1>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          A beautiful and minimal note-taking application
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link
            href="/sign-in"
            style={{
              width: '100%',
              padding: '10px 16px',
              color: 'white',
              backgroundColor: '#79B791',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-block',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ABD1B5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#79B791'}
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            style={{
              width: '100%',
              padding: '10px 16px',
              color: '#13262F',
              backgroundColor: 'white',
              border: '1px solid #ABD1B5',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
              display: 'inline-block',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#EDF4ED'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            Create Account
          </Link>

          <Link
            href="/app"
            style={{
              width: '100%',
              padding: '10px 16px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
              display: 'inline-block',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#EDF4ED'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Try Demo
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid rgba(171, 209, 181, 0.2)',
        padding: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(19, 38, 47, 0.5)'
        }}>
          © 2025 étude. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
