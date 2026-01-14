import { NotificationBell } from '../shared/NotificationBell'
import { UserAvatar } from '../shared/UserAvatar'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {/* Logo Fapps SVG */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="80" height="80" rx="8" transform="rotate(45 50 50)" fill="#1a1a4e"/>
              <line x1="25" y1="55" x2="50" y2="30" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="25" y1="70" x2="60" y2="35" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="35" y1="80" x2="70" y2="45" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <span className="ml-2 text-xl font-bold text-primary">fapps</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserAvatar />
        </div>
      </div>
    </header>
  )
}
