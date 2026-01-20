import { NotificationBell } from '../shared/NotificationBell'
import { UserAvatar } from '../shared/UserAvatar'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo-fapps.svg"
            alt="Fapps"
            className="h-10"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserAvatar />
        </div>
      </div>
    </header>
  )
}
