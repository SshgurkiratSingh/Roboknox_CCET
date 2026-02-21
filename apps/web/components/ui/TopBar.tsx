import { Badge } from './Badge'

export function TopBar() {
    return (
        <header className="h-12 shrink-0 border-b border-neon-25 flex items-center justify-between px-4 bg-black/80 backdrop-blur-md relative z-50">
            <div className="flex items-center gap-4">
                <img src="/logo.png" alt="logo" className="h-12" />
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline">[HEAD]</Badge>
            </div>
        </header>
    )
}
